# Proctoring principles

Proctoring is not implemented in Phase 1. Its eventual design must follow these constraints.

- Obtain explicit, understandable consent before camera access.
- Explain what is detected, stored, retained, and reviewed.
- Perform face and landmark inference in the browser where practical.
- Do not use facial identity recognition.
- Do not continuously record or upload raw video by default.
- Store timestamped event metadata; snapshots require a separate explicit policy and consent.
- Debounce transient detections and expose the reason behind every risk contribution.
- Use “suspicious event”, “proctoring flag”, and “risk indicator”. Never claim a flag proves cheating.
- Recommend manual review for elevated indicators.
- Provide an accessible alternative and a process for camera or disability accommodations.

Access to proctoring records must be role-restricted and audited. Transport and stored evidence must be encrypted.

