# Data retention policy

This document establishes design defaults; exact periods must be approved before production launch and aligned with applicable law and institutional policy.

| Data | Proposed default | Deletion behavior |
|---|---:|---|
| Account and profile | Until account deletion | Delete or irreversibly anonymize |
| Refresh/reset tokens | Until expiry plus short audit window | Purge automatically |
| Resumes and extracted content | Until user deletes or closes account | Remove database records and object-storage files |
| Analyses and job matches | Until user deletes or closes account | Delete with owning artifacts |
| Exam answers and results | 12 months | Delete or anonymize unless institution requires retention |
| Proctoring event metadata | 90 days | Purge automatically |
| Optional proctoring snapshots | 30 days maximum | Securely delete from object storage |
| Notification delivery logs | 90 days | Remove message bodies and addresses when no longer required |
| Operational security logs | 30–90 days | Rotate and redact personal content |

Account deletion should use a tracked workflow covering PostgreSQL, object storage, derived embeddings, reports, chat content, and provider-side data where supported. Legal holds must be explicit, limited, and auditable.

