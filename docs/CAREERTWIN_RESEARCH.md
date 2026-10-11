# CareerTwin AI Research Layer

## 1. Problem statement

Conventional career recommenders return ranked roles without showing how the model produced them or what actionable changes would alter the result. CareerTwin AI extends Career Guidance AI with explainable, counterfactual, and evidence-grounded career intelligence.

## 2. Research motivation

The research question is: **Can an academic career recommender expose its active model evidence and identify sparse, actionable skill interventions without presenting model behavior as an employment outcome?** The intended loop is recommend → explain → counterfactual → simulate → intervene → collect evidence → explicitly re-evaluate.

## 3. Existing system

The platform retains its deterministic ATS, Job Match, Career Skill Gap, Placement Readiness, roadmap, assessment, authentication, and ownership rules. The ML service uses 240 synthetic/curated seed profiles, seed 497, TF-IDF unigrams/bigrams, and multiclass logistic regression. Its `predict_proba` output is labelled **Model confidence**, never hiring, placement, or career-success probability.

## 4. Architecture

Web/mobile clients call authenticated Spring Boot endpoints. Spring Boot constructs the profile input owned by the authenticated student and calls FastAPI. Clients never call FastAPI or Gemini directly. Explain, simulation, and counterfactual requests are stateless; no hypothetical profile is persisted.

## 5. Explainability algorithm

For each recommended class, the service transforms the actual versioned profile representation through the fitted vectorizer. Each active feature contribution is calculated as `TF-IDF feature value × logistic-regression class coefficient`. Positive active contributions are ranked as supporting signals; negative active contributions are shown separately as limiting active signals. The implementation does not treat an absent feature as a causal explanation.

## 6. Counterfactual algorithm

The target career's missing skills are taken from the existing career taxonomy. The deterministic search enumerates combinations of one to three missing skills, applies each combination to an in-memory profile copy at an explicit hypothetical proficiency, and reruns the same trained model. Only interventions that increase target confidence are eligible. Search prefers the smallest number of changes, then greater confidence improvement, better target rank, and deterministic lexical ordering. If no improving intervention exists, the API returns an explicit no-result state.

Evaluation-ready fields include validity, number of changes (sparsity), confidence delta, rank delta, and the actionable skill list. These are measurements of model behavior, not claims of human learning or real-world effectiveness.

## 7. Digital Twin simulation

The student selects hypothetical taxonomy skills. Spring Boot combines them with the authenticated profile only for the request, and FastAPI returns before/simulated rankings from the same model artifact. Resetting the UI discards local inputs. There is intentionally no Apply-to-profile action.

## 8. Adaptive interview design

The stateless AI Interview sends a minimized server-built evidence snapshot, selected career, mode, optional focus, prior question, and current answer to Gemini through Spring Boot. Gemini returns one next question and structured coaching strengths, improvement areas, and next focus. It is labelled AI coaching and does not affect assessment grading or Placement Readiness. Sessions are not persisted in this prototype.

## 9. Grounded Copilot architecture

The Copilot displays the exact structured evidence snapshot alongside AI guidance. The snapshot can include profile fields, saved skills, latest ATS, latest submitted assessment, selected plan, deterministic readiness, skill coverage, self-tracked roadmap status, and skill gaps. Unavailable values remain `Unavailable`. Gemini is instructed to explain this evidence rather than create scores or facts.

## 10. Evidence loop

Recommendations and simulations never silently mutate evidence. Students update the existing profile, submit existing assessments, or update self-tracked roadmap states through existing flows. They then explicitly rerun recommendation/readiness features. This preserves provenance between saved evidence, deterministic calculations, and hypothetical model analysis.

## 11. Limitations

- The dataset is small and synthetic/curated; synthetic evaluation metrics do not demonstrate real-world effectiveness.
- Feature-contribution explanations describe this linear model, not causal career suitability.
- Counterfactuals search a bounded taxonomy and at most three additions; they are not globally optimal outside that space.
- Hypothetical proficiency is a model input, not verified mastery.
- AI Interview and Copilot availability depends on Gemini and their sessions are not persisted.
- Evidence Freshness is future work because current timestamps do not consistently establish skill-specific evidence provenance.

## 12. Ethics and responsible AI

Counterfactual changes are restricted to mutable taxonomy skills. The system does not propose changes to protected or immutable characteristics. Model confidence is not employment probability. Simulations do not guarantee career suitability. AI interview feedback is coaching, not hiring evaluation. Roadmap statuses are user-tracked. Placement Readiness is a deterministic preparation indicator, not placement probability.

## 13. Evaluation plan

Future evaluation should measure counterfactual validity, sparsity, confidence and rank delta, actionability, reproducibility, and stability across similar profiles. Human evaluation should assess explanation usefulness and whether students correctly understand the non-causal disclaimers. No user-study or real-world effectiveness result is claimed at this stage.
