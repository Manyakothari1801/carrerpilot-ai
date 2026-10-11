# Career plans, skill gaps, and placement readiness

## Curated taxonomy

`career-skill-taxonomy-v1` covers the same eight labels supported by the M5 model: Backend Developer, Frontend Developer, Data Analyst, Data Scientist, Cloud DevOps Engineer, Cybersecurity Analyst, QA Automation Engineer, and Business Analyst. It reuses canonical names and aliases from the existing Job Match normalizer and the explicit M5 archetype skills.

The taxonomy is a small, versioned project taxonomy. It is not live labour-market data and makes no claim about demand, salary, hiring likelihood, or universal role requirements. Each career has five core and three supporting skills.

## Selection and skill-gap rules

A plan can be created only when the student explicitly selects a career contained in one of their owned M5 recommendation results. Rank number one is never selected automatically.

Only saved profile skills are used as skill ownership evidence. Aliases are normalized through the same canonicalizer used by Job Match. A core skill at `BEGINNER` receives half its core weight and appears under **Needs improvement**; an adequate present core skill receives its full two-point weight. Supporting skills require presence and receive one point. Missing skills receive zero. Parsed resume prose and ML predictions never grant skill ownership.

## Deterministic roadmap

The roadmap is generated in four ordered stages: Foundation, Core Role Skills, Practical Application, and Placement Preparation. Taxonomy skills create role-specific items; a portfolio task, deterministic resume-analysis task, and assessment-practice task complete the plan. Existing profile/system evidence may initialize an item as `READY` or `IN_PROGRESS`; absent evidence remains `NOT_STARTED`.

Manual status changes are persisted with `USER_REPORTED` as their source. They are personal tracking statements, not independently verified mastery, certification, or achievement.

## Placement Readiness formula

Version: `placement-readiness-rules-v1`.

| Component | Configured weight | Evidence |
| --- | ---: | --- |
| Profile | 20% | Existing tracked profile-completion percentage |
| Career skills | 40% | Deterministic weighted taxonomy coverage |
| Resume ATS | 20% | Latest deterministic ATS score for the active resume |
| Assessment | 20% | Latest submitted assessment score |

When resume or assessment evidence is unavailable, that component is shown as `UNAVAILABLE`, receives zero effective weight, and is excluded from the denominator. Remaining configured weights are proportionally redistributed and the API returns both configured and effective weights. An unavailable component is never silently scored as zero.

**Placement Readiness is a deterministic preparation indicator. It is not a prediction of hiring or placement probability.** It does not use Gemini, the M5 probability, Job Match scores, private resume text, or invented achievements.

## Persistence and ownership

Flyway V15 adds one current `career_plans` record per student plus ordered `career_roadmap_items`. The plan retains the selected owned recommendation, taxonomy/readiness versions, and status-source metadata. All reads and updates are authenticated and owner-scoped.

