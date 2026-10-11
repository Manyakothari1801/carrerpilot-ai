# Career recommendation ML service

This private FastAPI service serves a trained multiclass career classifier. Spring Boot is the public API and the mobile app never calls this service directly.

## Data provenance and limitations

`training/data/career_profiles.csv` contains 240 explicitly synthetic/curated academic seed profiles: 30 examples for each of eight authored career archetypes. It is reproducibly generated with seed `497` by `training/generate_curated_dataset.py`. It contains no real users, resumes, hiring decisions, placement outcomes, or scraped data.

The seed set is suitable only for demonstrating a real training/inference pipeline. Its holdout and cross-validation metrics measure how well a classifier separates the authored archetypes; they do not validate employability, labour-market fit, fairness, or real-world career outcomes. Confidence is the selected classifier's `predict_proba` output, not a guarantee.

## Reproduce training

From `ml-service` in PowerShell:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python training/generate_curated_dataset.py
python -m training.train
python -m pytest -q
```

Training compares multinomial logistic regression and multinomial naive Bayes using stratified five-fold macro F1 on the training split, selects the higher score (with an explicit tie preference for the discriminative logistic-regression baseline), evaluates once on a 25% stratified holdout, and saves `models/career_model.joblib` plus `models/metrics.json`. The fixed random seed makes the split and generated data reproducible.

The current generated artifact selected logistic regression. Its synthetic holdout accuracy, macro precision, macro recall, and macro F1 are all `1.0`. This perfect result is expected because the authored archetypes are strongly separable and must not be represented as real-world performance.

## Run

```powershell
cd ml-service
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Health: `GET http://localhost:8000/health`. Prediction: `POST /predict`. If the artifact is missing, health and inference return HTTP 503; no rule-based recommendations are fabricated.

