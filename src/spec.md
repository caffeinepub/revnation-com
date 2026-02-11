# Specification

## Summary
**Goal:** Add richer bike data support plus new pages for bike detail viewing, authenticated bike management, and brand browsing/search.

**Planned changes:**
- Extend the backend Bike model to include structured price fields, multiple image references (as text URLs/paths), and a long-form details field; add authenticated create/update and creator/admin delete operations while keeping public read operations.
- Add a safe backend state migration so existing bikes upgrade to the new schema with sensible default values for new fields.
- Add a Bike Detail page/route that shows brand + name, pricing, image gallery (or placeholder), specs, and details, including not-found and empty/placeholder states.
- Add authenticated bike management UI (e.g., “Manage Bikes”) to create/edit/delete bikes (specs, prices, images list, details) with confirmation on delete; hide or gate controls for unauthenticated users.
- Extend the React Query layer with bike create/update/delete mutations and query invalidation so bike lists, brand pages, and bike detail pages stay consistent; show an English unauthorized message when not signed in.
- Add Brands index and Brand detail pages (brands derived from existing bikes) with brand search/filtering, global navigation entry to Brands, and update Search Results so bike hits link to Bike Detail pages and brand terms discover relevant bikes.

**User-visible outcome:** Users can browse brands, view detailed bike pages with images/pricing/specs/details, and (when signed in) manage bikes by creating, editing, and deleting entries with immediate UI updates.
