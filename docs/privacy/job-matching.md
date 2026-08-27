# Job matching privacy

Job descriptions, parsed resume text, profile data, prompts, and embedding payloads are never written to application logs. Skill extraction, TF-IDF, experience/education alignment, prioritization, and deterministic scoring run locally.

If a future embedding provider is enabled, only the minimized text required to create vectors may be sent to that configured provider. Provider credentials remain backend-only. Provider failure never discards local results: semantic similarity is marked unavailable and the overall score is reweighted across available deterministic components.

Users can access only matches tied to their authenticated account. Job descriptions remain stored to preserve user-requested match history and follow the application's data-retention policy.
