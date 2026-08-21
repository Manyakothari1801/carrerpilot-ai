# Resume storage architecture

`ResumeStorageService` separates domain operations from object storage. `LocalResumeStorageService` is enabled for local/test profiles and stores generated UUID keys beneath one configured root. Keys are strictly validated and resolved paths must remain inside that root, preventing original-filename and path-traversal attacks.

Upload validation reads at most the configured multipart limit, verifies size, declared MIME type, and PDF/ZIP signatures, then parses with PDFBox or Apache POI. Resume sections are stored relationally. Downloads resolve only the storage key belonging to an authenticated user's database record.

Local filesystem storage is not suitable for horizontally scaled or ephemeral cloud deployments. A later S3-compatible implementation can replace the storage interface while preserving services and controllers.
