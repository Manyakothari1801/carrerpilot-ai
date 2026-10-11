from __future__ import annotations

import os
from pathlib import Path

import joblib
import numpy as np

from itertools import combinations

from .schemas import (CounterfactualRequest, CounterfactualResponse, ExplainResponse,
                      ExplainedRecommendation, FeatureContribution, PredictionRequest,
                      PredictionResponse, Recommendation, SimulationRequest,
                      SimulationResponse, SkillInput)
from .features import feature_text

DEFAULT_MODEL = Path(__file__).resolve().parents[1] / "models" / "career_model.joblib"

SIGNALS = {
    "Backend Developer": {"java", "spring boot", "rest apis", "postgresql", "docker", "microservices", "maven"},
    "Frontend Developer": {"javascript", "typescript", "react", "html", "css", "vite"},
    "Data Analyst": {"sql", "excel", "power bi", "python", "statistics", "data visualization", "tableau"},
    "Data Scientist": {"python", "machine learning", "statistics", "scikit-learn", "pandas", "numpy"},
    "Cloud DevOps Engineer": {"aws", "docker", "kubernetes", "linux", "ci/cd", "terraform"},
    "Cybersecurity Analyst": {"network security", "linux", "siem", "incident response", "risk assessment", "cryptography"},
    "QA Automation Engineer": {"selenium", "java", "test automation", "api testing", "junit", "ci/cd"},
    "Business Analyst": {"requirements analysis", "sql", "excel", "stakeholder management", "agile", "business process"},
}


class ModelUnavailable(RuntimeError):
    pass


class Predictor:
    def __init__(self, model_path: str | Path | None = None):
        path = Path(model_path or os.getenv("CAREER_MODEL_PATH", DEFAULT_MODEL))
        if not path.is_file():
            raise ModelUnavailable(f"Model artifact is unavailable at {path}")
        artifact = joblib.load(path)
        self.pipeline = artifact["pipeline"]
        self.model_version = artifact["modelVersion"]
        self.feature_schema_version = artifact["featureSchemaVersion"]

    def predict(self, request: PredictionRequest) -> PredictionResponse:
        row = request.model_dump()
        probabilities = self.pipeline.predict_proba([feature_text(row)])[0]
        classes = self.pipeline.classes_
        ranked = np.argsort(probabilities)[::-1][:request.topN]
        return PredictionResponse(
            modelVersion=self.model_version,
            featureSchemaVersion=self.feature_schema_version,
            recommendations=[Recommendation(
                career=str(classes[index]),
                confidence=float(probabilities[index]),
                profileSignals=self._signals(str(classes[index]), request),
            ) for index in ranked],
        )

    def explain(self, request: PredictionRequest) -> ExplainResponse:
        predicted = self.predict(request)
        vectorizer = self.pipeline.named_steps["features"]
        classifier = self.pipeline.named_steps["classifier"]
        vector = vectorizer.transform([feature_text(request.model_dump())])
        names = vectorizer.get_feature_names_out()
        class_index = {str(value): index for index, value in enumerate(classifier.classes_)}
        explanations = []
        for item in predicted.recommendations:
            coefficients = classifier.coef_[class_index[item.career]]
            contributions = [(names[index], float(value * coefficients[index])) for index, value in zip(vector.indices, vector.data)]
            positive = sorted((value for value in contributions if value[1] > 0), key=lambda value: (-value[1], value[0]))[:5]
            negative = sorted((value for value in contributions if value[1] < 0), key=lambda value: (value[1], value[0]))[:3]
            explanations.append(ExplainedRecommendation(
                **item.model_dump(),
                supportingSignals=[FeatureContribution(feature=self._display_feature(name), contribution=score) for name, score in positive],
                limitingSignals=[FeatureContribution(feature=self._display_feature(name), contribution=score) for name, score in negative],
            ))
        return ExplainResponse(modelVersion=self.model_version, featureSchemaVersion=self.feature_schema_version,
            disclaimer="These signals describe how the trained model processed this profile. They do not guarantee career suitability or employment outcomes.",
            recommendations=explanations)

    def simulate(self, request: SimulationRequest) -> SimulationResponse:
        original = PredictionRequest(**request.model_dump(exclude={"hypotheticalSkills"}))
        merged = self._merged_skills(original.skills, request.hypotheticalSkills)
        simulated_request = original.model_copy(update={"skills": merged})
        return SimulationResponse(modelVersion=self.model_version, featureSchemaVersion=self.feature_schema_version,
            before=self.predict(original).recommendations, simulated=self.predict(simulated_request).recommendations,
            appliedSkills=request.hypotheticalSkills,
            disclaimer="Simulation only. Hypothetical skills do not modify the saved profile and model confidence is not employment probability.")

    def counterfactual(self, request: CounterfactualRequest) -> CounterfactualResponse:
        if request.targetCareer not in SIGNALS:
            raise ValueError("Unsupported target career")
        original = PredictionRequest(**request.model_dump(exclude={"targetCareer", "maxChanges", "topN"}), topN=8)
        current_all = self._rank_all(original)
        current_rank, current_confidence = self._target_state(current_all, request.targetCareer)
        existing = {skill.name.casefold() for skill in original.skills}
        candidates = sorted(skill for skill in SIGNALS[request.targetCareer] if skill.casefold() not in existing)
        best = None
        for size in range(1, request.maxChanges + 1):
            for values in combinations(candidates, size):
                additions = [SkillInput(name=value.title(), proficiency="INTERMEDIATE") for value in values]
                modified = original.model_copy(update={"skills": self._merged_skills(original.skills, additions)})
                ranked = self._rank_all(modified)
                rank, confidence = self._target_state(ranked, request.targetCareer)
                delta = confidence - current_confidence
                if delta <= 1e-12:
                    continue
                candidate = (size, -delta, rank, tuple(values), additions, confidence)
                if best is None or candidate[:4] < best[:4]:
                    best = candidate
            if best is not None:
                break
        if best is None:
            return CounterfactualResponse(modelVersion=self.model_version, featureSchemaVersion=self.feature_schema_version,
                targetCareer=request.targetCareer, found=False, currentRank=current_rank, currentConfidence=current_confidence,
                proposedSkills=[], disclaimer="No meaningful actionable counterfactual was found within the configured search constraints.")
        _, _, simulated_rank, _, additions, simulated_confidence = best
        return CounterfactualResponse(modelVersion=self.model_version, featureSchemaVersion=self.feature_schema_version,
            targetCareer=request.targetCareer, found=True, currentRank=current_rank, simulatedRank=simulated_rank,
            currentConfidence=current_confidence, simulatedConfidence=simulated_confidence,
            confidenceDelta=simulated_confidence-current_confidence, rankDelta=current_rank-simulated_rank,
            proposedSkills=additions,
            disclaimer="This is a sparse simulation of model behavior using actionable skills only. It does not modify the profile or predict employment outcomes.")

    def _rank_all(self, request: PredictionRequest) -> list[Recommendation]:
        return self.predict(request.model_copy(update={"topN": 8})).recommendations

    @staticmethod
    def _target_state(ranked: list[Recommendation], target: str) -> tuple[int, float]:
        for index, item in enumerate(ranked, 1):
            if item.career == target:
                return index, item.confidence
        return len(ranked) + 1, 0.0

    @staticmethod
    def _merged_skills(original: list[SkillInput], hypothetical: list[SkillInput]) -> list[SkillInput]:
        merged = {skill.name.casefold(): skill.model_copy() for skill in original}
        for skill in hypothetical:
            merged[skill.name.casefold()] = skill.model_copy()
        return list(merged.values())

    @staticmethod
    def _display_feature(value: str) -> str:
        return value.replace("skill_", "Skill: ").replace("target_", "Target role: ").replace("degree_", "Degree: ").replace("experience_", "Experience: ").replace("_", " ")

    @staticmethod
    def _signals(career: str, request: PredictionRequest) -> list[str]:
        available = {skill.name.lower(): skill.name for skill in request.skills}
        matched = [available[name] for name in sorted(SIGNALS.get(career, set())) if name in available]
        signals = [f"Profile skill: {name}" for name in matched[:3]]
        if request.targetRole and career.lower() in request.targetRole.lower():
            signals.append(f"Target role: {request.targetRole}")
        if not signals and request.degree:
            signals.append(f"Degree supplied: {request.degree}")
        return signals[:4]

