# Job matching architecture

CareerPilot job matching is local and deterministic by default. The job description and parsed resume are normalized through one canonical skill dictionary. Skill coverage, TF-IDF similarity, experience alignment, education alignment, missing-skill priority, and the final weighted score are calculated locally.

The scoring formula is `sum(available component score × configured weight) / sum(available weights)`. Default weights are skill 40, TF-IDF keyword 20, semantic 25, experience 10, and education 5. Unavailable semantic or unknown/not-required alignment components are excluded and their weight is redistributed proportionally across available components. Scoring version: `job-match-rules-v1`.

Semantic similarity is meaning-level similarity: it compares the concepts expressed by the resume and job description rather than requiring the same literal keywords. It uses an `EmbeddingService` abstraction. When a configured provider returns vectors, cosine similarity is calculated explicitly as `dot(a,b) / (||a|| × ||b||)` and normalized to 0–100.

No embedding provider is enabled in Phase 5, so semantic similarity is currently marked `UNAVAILABLE`; this is expected and does not make the match fail. The overall score excludes unavailable components and proportionally redistributes their configured weight across the components that have numeric scores. An embedding provider is intentionally deferred to a later phase.

Historical matches are immutable snapshots. Creating a new match never overwrites an older result.
