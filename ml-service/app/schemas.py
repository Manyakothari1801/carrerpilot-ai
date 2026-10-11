from pydantic import BaseModel, Field, field_validator


class SkillInput(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    proficiency: str = Field(min_length=1, max_length=30)

    @field_validator("name", "proficiency")
    @classmethod
    def clean(cls, value: str) -> str:
        return " ".join(value.split())


class PredictionRequest(BaseModel):
    degree: str | None = Field(default=None, max_length=120)
    graduationYear: int | None = Field(default=None, ge=1950, le=2200)
    experienceLevel: str | None = Field(default=None, max_length=30)
    targetRole: str | None = Field(default=None, max_length=120)
    skills: list[SkillInput] = Field(min_length=2, max_length=50)
    topN: int = Field(default=3, ge=1, le=8)


class Recommendation(BaseModel):
    career: str
    confidence: float = Field(ge=0, le=1)
    profileSignals: list[str]


class PredictionResponse(BaseModel):
    modelVersion: str
    featureSchemaVersion: str
    recommendations: list[Recommendation]


class FeatureContribution(BaseModel):
    feature: str
    contribution: float


class ExplainedRecommendation(Recommendation):
    supportingSignals: list[FeatureContribution]
    limitingSignals: list[FeatureContribution]


class ExplainResponse(BaseModel):
    modelVersion: str
    featureSchemaVersion: str
    disclaimer: str
    recommendations: list[ExplainedRecommendation]


class SimulationRequest(PredictionRequest):
    hypotheticalSkills: list[SkillInput] = Field(default_factory=list, max_length=20)


class SimulationResponse(BaseModel):
    modelVersion: str
    featureSchemaVersion: str
    before: list[Recommendation]
    simulated: list[Recommendation]
    appliedSkills: list[SkillInput]
    disclaimer: str


class CounterfactualRequest(PredictionRequest):
    targetCareer: str = Field(min_length=1, max_length=120)
    maxChanges: int = Field(default=3, ge=1, le=3)


class CounterfactualResponse(BaseModel):
    modelVersion: str
    featureSchemaVersion: str
    targetCareer: str
    found: bool
    currentRank: int
    simulatedRank: int | None = None
    currentConfidence: float
    simulatedConfidence: float | None = None
    confidenceDelta: float | None = None
    rankDelta: int | None = None
    proposedSkills: list[SkillInput]
    disclaimer: str

