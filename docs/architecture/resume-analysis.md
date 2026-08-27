# Resume analysis and scoring

Phase 4 preserves two independent paths. Deterministic analysis runs locally for every request. Optional Gemini feedback adds writing suggestions but never changes the stored numeric scores.

Gemini uses the stable, configurable `gemini-3.6-flash` model by default and one batched `generateContent` request. This default was selected from the live Models API because `gemini-2.5-flash` returns `NOT_FOUND` for new users. The request requires `application/json` structured output containing titled strengths, severity-rated weaknesses, grammar suggestions, bullet rewrites, and summary recommendations. Provider output is length-checked, schema-validated, deduplicated, and persisted only as normalized findings. Rewrite `originalText` must occur in the minimized resume input, and numeric claims in suggested text are rejected unless already present in the resume.

The versioned `resume-analysis-v1` prompt treats delimited resume text as untrusted data, ignores embedded instructions, prohibits invented facts or metrics, and requires original text to be copied from the resume. Provider failures never alter or discard deterministic scores.

## Versioned formula

Scoring version: `ats-rules-v1`.

The ATS heuristic is a weighted average:

- section completeness: 30%
- keyword quality: 20%
- action verbs: 20%
- quantification: 15%
- readability: 15%

The overall score is:

- ATS heuristic: 40%
- section completeness: 20%
- keyword quality: 10%
- action verbs: 10%
- quantification: 10%
- readability: 10%

Weights and the action-verb dictionary are centralized under `careerpilot.analysis`. Scores are bounded from 0–100. They are application heuristics, not scientifically validated or official scores from an ATS vendor.

Section scoring prioritizes contact details, summary, education, skills, experience, and projects. Certifications are recognized and displayed but are not forced on every resume. Keyword checks use technical specificity, generic wording, and excessive repetition without using a job description. Quantification detects only existing counts, percentages, scale, time, cost, or performance wording. Readability uses extracted text length, line density, and repeated headings; it makes no claims about visual design that extraction cannot observe.

## AI feedback

`ResumeAiFeedbackService` isolates provider integration. Prompt version `resume-analysis-v1` sends one minimized, bounded request containing parsed non-contact sections. Resume data is delimited as untrusted data and cannot override prompt instructions. The provider must return the configured JSON schema. Response counts, required values, and lengths are validated before persistence.

AI-disabled analyses are `COMPLETED` with provider `DISABLED`. Provider errors, timeouts, rate limits, or malformed output produce `PARTIAL`; deterministic scores and findings remain available. No automatic retry loop is used. Historical analyses are immutable snapshots.
