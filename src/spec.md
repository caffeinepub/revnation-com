# Specification

## Summary
**Goal:** Improve BikeForm Markdown spec ingestion so MSRP prices auto-fill reliably, and allow editing existing section palette color swatches after creation.

**Planned changes:**
- Update Markdown table parsing to detect MSRP/price rows even when the left-column label includes additional text (e.g., “MSRP (Global Est.)”), and extract min/max prices from currency ranges like “$19,500 – $21,000 USD”.
- Ensure price parsing supports commas, currency symbols, en-dashes/em-dashes, and trailing currency codes, and does not overwrite existing price inputs when no price row is found.
- Enable editing of an existing per-section palette color by clicking a swatch to open an edit UI and saving a new validated/normalized 6-digit hex value, without regenerating the rest of the palette.
- Keep existing per-color remove controls working for palette entries.

**User-visible outcome:** Pasting a Markdown table into BikeForm “Paste Specs” and applying it correctly fills Min Price and Max Price from MSRP ranges, and users can click any existing section palette swatch to edit its hex color while leaving the rest of the palette unchanged.
