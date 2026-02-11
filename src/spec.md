# Specification

## Summary
**Goal:** Let admins seed a predefined set of popular/sample bikes into the Bikes store from the app (no file uploads), and have the UI refresh to show them.

**Planned changes:**
- Add an admin-only backend shared method (e.g., `seedSampleBikes`) in `backend/main.mo` that inserts a predefined list of Bike records using the existing Bike schema.
- Ensure seeding is safe to run multiple times by preventing duplicates for the predefined entries (skip or otherwise avoid re-inserting the same bikes).
- Return a clear success response from the backend (e.g., number inserted and/or number skipped).
- Add a new React Query mutation to call the backend seeding method with English success/error messaging and unauthorized handling.
- Add an admin-only UI control (with a confirmation step) to trigger seeding (e.g., on the Manage Bikes page) and invalidate/refetch relevant bike queries after success.

**User-visible outcome:** Admin users can click a “Seed sample bikes” action (after confirming) to automatically add predefined popular bikes; the bike lists update immediately to include the new entries, while non-admin users never see the control.
