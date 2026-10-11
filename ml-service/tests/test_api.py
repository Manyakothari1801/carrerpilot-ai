from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def valid_request():
    return {"degree": "B.Tech Computer Science", "experienceLevel": "ENTRY_LEVEL", "targetRole": "Backend Developer", "topN": 3,
            "skills": [{"name": "Java", "proficiency": "ADVANCED"}, {"name": "Spring Boot", "proficiency": "INTERMEDIATE"}, {"name": "PostgreSQL", "proficiency": "INTERMEDIATE"}]}


def test_health_exposes_versions_not_secrets():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "UP"
    assert "modelVersion" in response.json()


def test_prediction_is_ranked_and_probabilities_are_real():
    response = client.post("/predict", json=valid_request())
    assert response.status_code == 200
    body = response.json()
    assert len(body["recommendations"]) == 3
    confidences = [item["confidence"] for item in body["recommendations"]]
    assert confidences == sorted(confidences, reverse=True)
    assert all(0 <= value <= 1 for value in confidences)
    assert body["recommendations"][0]["career"] == "Backend Developer"
    assert all(signal.startswith(("Profile skill:", "Target role:", "Degree supplied:")) for item in body["recommendations"] for signal in item["profileSignals"])


def test_requires_meaningful_skill_input():
    value = valid_request()
    value["skills"] = [{"name": "Java", "proficiency": "BEGINNER"}]
    assert client.post("/predict", json=value).status_code == 422


def test_explanation_uses_model_features_and_is_deterministic():
    first = client.post("/explain", json=valid_request())
    second = client.post("/explain", json=valid_request())
    assert first.status_code == 200
    assert first.json() == second.json()
    item = first.json()["recommendations"][0]
    assert item["supportingSignals"]
    assert all(signal["contribution"] > 0 for signal in item["supportingSignals"])
    assert first.json()["modelVersion"] == "career-rec-synthetic-v1"


def test_simulation_is_real_inference_and_does_not_mutate_input():
    request = valid_request()
    original = [dict(skill) for skill in request["skills"]]
    request["hypotheticalSkills"] = [{"name": "Docker", "proficiency": "INTERMEDIATE"}]
    response = client.post("/simulate", json=request)
    assert response.status_code == 200
    body = response.json()
    assert request["skills"] == original
    direct = valid_request()
    direct["skills"].append({"name": "Docker", "proficiency": "INTERMEDIATE"})
    assert body["simulated"] == client.post("/predict", json=direct).json()["recommendations"]


def test_counterfactual_is_sparse_actionable_and_reproducible():
    request = valid_request() | {"targetCareer": "Data Analyst", "maxChanges": 3}
    response = client.post("/counterfactual", json=request)
    assert response.status_code == 200
    body = response.json()
    if body["found"]:
        assert 1 <= len(body["proposedSkills"]) <= 3
        assert body["simulatedConfidence"] > body["currentConfidence"]
        simulated = valid_request()
        simulated["topN"] = 8
        simulated["skills"] += body["proposedSkills"]
        direct = client.post("/predict", json=simulated).json()["recommendations"]
        target = next(item for item in direct if item["career"] == "Data Analyst")
        assert abs(target["confidence"] - body["simulatedConfidence"]) < 1e-12


def test_counterfactual_rejects_unsupported_career():
    request = valid_request() | {"targetCareer": "Astronaut", "maxChanges": 2}
    assert client.post("/counterfactual", json=request).status_code == 422


def test_counterfactual_returns_explicit_no_result_when_no_actionable_skill_remains():
    request = valid_request() | {"targetCareer": "Backend Developer", "maxChanges": 3}
    request["skills"] = [{"name": name, "proficiency": "INTERMEDIATE"} for name in ["Java", "Spring Boot", "REST APIs", "PostgreSQL", "Docker", "Microservices", "Maven"]]
    response = client.post("/counterfactual", json=request)
    assert response.status_code == 200
    assert response.json()["found"] is False
    assert response.json()["proposedSkills"] == []

