# Specification

## Summary
**Goal:** Improve the existing RichTextEditor’s Tiptap image handling with preset sizing, inline captions stored in-document, better spacing, mobile-friendly rendering, and sanitizer compatibility.

**Planned changes:**
- Ensure the editor uses the existing Tiptap editor instance while keeping the current RichTextEditor component API (`content`, `onUpdate`), and enable the official Tiptap Image extension if missing (no other new libraries).
- Extend image node behavior to support a persisted resize preset (via CSS classes `img-small`, `img-medium`, `img-full`) and an optional caption stored inside the editor document, editable inline directly below the image.
- Add a lightweight contextual image menu on image selection with preset actions: Small, Medium, Full Width (no drag resizing).
- Add lightweight CSS-based spacing rules around images and responsive behavior for narrow/mobile screens to prevent overflow and keep images readable.
- Update the existing HTML sanitization rules so image sizing classes and caption markup produced by the editor are preserved while still removing unsafe tags/attributes.

**User-visible outcome:** Users can insert images, choose Small/Medium/Full Width via a simple image menu, add/edit an optional caption directly under the image, and see images render with consistent spacing and mobile-friendly sizing; saved content retains sizes and captions when reloaded.
