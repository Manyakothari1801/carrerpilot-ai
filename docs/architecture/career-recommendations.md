# ML career recommendations

## Boundary and data flow

The authenticated mobile Careers screen calls Spring Boot only. Spring Boot resolves the current student, reads degree, graduation year, experience level, target role, and profile skills/proficiency, checks minimum readiness, and sends the feature contract to the private FastAPI service configured by `ML_SERVICE_URL`. It validates the versioned response and persists an immutable snapshot in `career_recommendations` and `career_recommendation_items`.

The feature schema is `profile-features-v1`; the current trained artifact is `career-rec-synthetic-v1`. Resume text, deterministic ATS scores, Job Match scores, Gemini output, protected attributes, and assessment answer keys are not model inputs.

## Model and explanation semantics

The training pipeline converts categorical/profile fields into tagged text features, applies TF-IDF unigrams/bigrams, compares multinomial logistic regression with multinomial naive Bayes, and selects by stratified five-fold macro F1. Ranked values are genuine `predict_proba` probabilities from the selected classifier.

Displayed explanations are deliberately labelled **Profile signals**. They list only skills, target role, or degree actually supplied by the student that align with the documented career archetype. They are not SHAP values or causal feature contributions and are never invented from unavailable resume content.

## Failure and security behavior

- At least two skills plus degree, experience level, and target role are required.
- The API is restricted to authenticated `STUDENT` users.
- History and detail queries are owner-scoped; a foreign ID returns not found.
- Unreachable ML service, timeout, malformed response, or missing model artifact produces an explicit service-unavailable response and stores no fabricated fallback.
- The mobile Job Match flow loads independently and remains usable when ML inference is down.

## Honest limitations

The bundled 240-row dataset is an explicitly synthetic/curated academic seed set, not real placement data. The eight career labels are limited, probabilities are not calibrated on real students, and fairness/generalization have not been established. See `ml-service/models/metrics.json` and `ml-service/README.md` for exact reproducible metrics and methodology.

