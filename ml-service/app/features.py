def feature_text(row: dict) -> str:
    """Build the versioned profile-features-v1 tagged text representation."""
    degree = row.get("degree") or "unknown"
    experience = row.get("experience_level") or row.get("experienceLevel") or "unknown"
    role = row.get("target_role") or row.get("targetRole") or "unknown"
    raw_skills = row.get("skills") or ""
    if isinstance(raw_skills, list):
        skill_pairs = [(item["name"], item.get("proficiency", "UNKNOWN")) for item in raw_skills]
    else:
        skill_pairs = [tuple(item.split("|", 1)) for item in raw_skills.split(";") if "|" in item]
    skills = " ".join(f"skill_{name} skill_{name}_{level}" for name, level in skill_pairs)
    return f"degree_{degree} experience_{experience} target_{role} {skills}".lower()

