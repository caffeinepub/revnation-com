# Specification

## Summary
**Goal:** Add per-document support for news vs review content, with review-only Pros/Cons/Rating fields that are persisted and restored.

**Planned changes:**
- Extend the persisted document model to include `contentType: "news" | "review"`, plus `pros` (string array), `cons` (string array), and `rating` (number) for review documents.
- Update backend save/create and load/query flows to persist and return `contentType`, `pros`, `cons`, and `rating`, applying defaults when fields are missing (`news`, `[]`, `[]`, `0`).
- Add migration/upgrade handling to backfill existing stored documents with default values for the new fields while preserving existing data.
- Add a top-toolbar dropdown in the editor UI for `News` vs `Review` (default `News`) and wire it into per-document load/save.
- Conditionally render simple form fields outside the rich-text editor when `contentType` is `Review`: Pros (textarea), Cons (textarea), Rating (number input); hide for `News`.
- Serialize/deserialize Pros and Cons between textarea representation and backend array representation deterministically; persist/restore these values per document.

**User-visible outcome:** Users can choose whether a document is News or Review; when Review is selected, they can enter Pros/Cons/Rating and have those values saved with the document and restored when reopening it.
