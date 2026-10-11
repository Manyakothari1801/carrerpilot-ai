"""Generate a small, transparent synthetic/curated seed dataset for academic prototyping.

This is not placement, hiring, or labour-market data. Each row is assembled from the
explicit career archetypes below with a fixed random seed. It must not be used to make
high-stakes decisions or described as real-world model validation.
"""
from __future__ import annotations

import csv
import random
from pathlib import Path

SEED = 497
ROWS_PER_CLASS = 30
OUTPUT = Path(__file__).parent / "data" / "career_profiles.csv"

ARCHETYPES = {
    "Backend Developer": {
        "degrees": ["B.Tech Computer Science", "BCA", "MCA"],
        "roles": ["backend developer", "java developer", "api engineer"],
        "skills": ["Java", "Spring Boot", "REST APIs", "PostgreSQL", "Git", "Docker", "Microservices", "Maven"],
    },
    "Frontend Developer": {
        "degrees": ["B.Tech Computer Science", "BCA", "B.Sc Information Technology"],
        "roles": ["frontend developer", "react developer", "web developer"],
        "skills": ["JavaScript", "TypeScript", "React", "HTML", "CSS", "Git", "REST APIs", "Vite"],
    },
    "Data Analyst": {
        "degrees": ["B.Sc Statistics", "B.Tech Computer Science", "BBA Analytics"],
        "roles": ["data analyst", "business intelligence analyst", "reporting analyst"],
        "skills": ["SQL", "Excel", "Power BI", "Python", "Statistics", "Data Visualization", "Pandas", "Tableau"],
    },
    "Data Scientist": {
        "degrees": ["M.Sc Data Science", "B.Tech Computer Science", "M.Sc Statistics"],
        "roles": ["data scientist", "machine learning engineer", "applied scientist"],
        "skills": ["Python", "Machine Learning", "Statistics", "Scikit-learn", "Pandas", "NumPy", "SQL", "Data Visualization"],
    },
    "Cloud DevOps Engineer": {
        "degrees": ["B.Tech Computer Science", "B.Tech Information Technology", "MCA"],
        "roles": ["devops engineer", "cloud engineer", "site reliability engineer"],
        "skills": ["AWS", "Docker", "Kubernetes", "Linux", "CI/CD", "Terraform", "Git", "Python"],
    },
    "Cybersecurity Analyst": {
        "degrees": ["B.Tech Cybersecurity", "B.Tech Computer Science", "B.Sc Information Technology"],
        "roles": ["cybersecurity analyst", "security analyst", "soc analyst"],
        "skills": ["Network Security", "Linux", "SIEM", "Incident Response", "Python", "Risk Assessment", "Firewalls", "Cryptography"],
    },
    "QA Automation Engineer": {
        "degrees": ["B.Tech Computer Science", "BCA", "B.Sc Information Technology"],
        "roles": ["qa automation engineer", "software test engineer", "quality engineer"],
        "skills": ["Selenium", "Java", "Test Automation", "API Testing", "JUnit", "Git", "SQL", "CI/CD"],
    },
    "Business Analyst": {
        "degrees": ["BBA", "MBA", "B.Tech Information Technology"],
        "roles": ["business analyst", "product analyst", "systems analyst"],
        "skills": ["Requirements Analysis", "SQL", "Excel", "Stakeholder Management", "Agile", "Business Process", "Power BI", "Communication"],
    },
}

LEVELS = ["STUDENT", "ENTRY_LEVEL", "JUNIOR"]
PROFICIENCIES = ["BEGINNER", "INTERMEDIATE", "ADVANCED"]


def generate() -> list[dict[str, str]]:
    rng = random.Random(SEED)
    rows: list[dict[str, str]] = []
    for career, values in ARCHETYPES.items():
        for _ in range(ROWS_PER_CLASS):
            skill_count = rng.randint(4, 7)
            chosen = rng.sample(values["skills"], skill_count)
            skills = ";".join(f"{skill}|{rng.choice(PROFICIENCIES)}" for skill in chosen)
            rows.append({
                "degree": rng.choice(values["degrees"]),
                "experience_level": rng.choice(LEVELS),
                "target_role": rng.choice(values["roles"]),
                "skills": skills,
                "career": career,
            })
    rng.shuffle(rows)
    return rows


def main() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    rows = generate()
    with OUTPUT.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=["degree", "experience_level", "target_role", "skills", "career"])
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {len(rows)} explicitly synthetic/curated rows to {OUTPUT}")


if __name__ == "__main__":
    main()

