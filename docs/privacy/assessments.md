# Assessment privacy and retention

CareerPilot persists the selected assessment, student account reference, start/submission timestamps, attempt status, selected option keys, deterministic correctness, awarded points, aggregate score, and duration. This supports refresh-safe attempts, history, result review, ownership enforcement, and dashboard summaries.

The backend does not log full answers, question content, AI prompts, raw provider responses, API keys, or answer exports. Gemini receives generation inputs only when assessment AI generation is explicitly enabled; stored assessments and deterministic grading remain available when Gemini is disabled or unavailable.

Correct answers and explanations are disclosed only to the owner after successful submission. Cross-user access returns not found. Phase 6 includes no webcam, screen monitoring, tab tracking, email, notification, or other invasive proctoring data.
