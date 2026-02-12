# Specification

## Summary
**Goal:** Make the Create Bike submission work reliably and remove the global/top-of-site palette UI while keeping the BikeForm palette features intact.

**Planned changes:**
- Fix the Create Bike submit flow so form submission triggers a successful backend `createBike` call, returns a new bike id, and handles failure states with a clear, specific error message (not “action not available”).
- Refresh the Manage Bikes list after successful creation so the newly created bike appears immediately without a manual page reload.
- Remove the palette detection bar/UI element from the site-wide header/top-of-page area across pages, without changing the palette functionality inside BikeForm.

**User-visible outcome:** Authenticated users can create a bike from /manage-bikes without seeing an “action not available” error, the new bike shows up immediately in their list, and the global palette bar is no longer shown while BikeForm palette features still work.
