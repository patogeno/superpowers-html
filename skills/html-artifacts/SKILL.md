---
name: html-artifacts
description: Use when producing a human-facing HTML artifact in the brainstorming workflow — a self-contained design spec (inline SVG diagrams and tables) or a product-styled mockup.
---

# Authoring HTML Artifacts

Produce **self-contained, zero-dependency HTML** that a human enjoys reading and navigating. The artifact must be a single, sendable HTML file — no build step, no network dependencies.

This skill covers two artifact kinds: the formal design **spec** (canonical theme, from `templates/spec.html`) and product-styled **mockups** authored during brainstorming (self-contained, but styled to look like the product — *not* the canonical theme). See the Mockups section of `references/authoring.md`.

**When NOT to use:** plain conversational replies or short Markdown snippets don't need a template — and implementation plans are authored as canonical **Markdown**, not HTML.

## Rules

Rules 1–2 and 4–5 are for the **spec**. Rules 3 and 6 (self-containment, responsiveness) bind **both** spec and mockups. Mockups carry the product's own theme — see the Mockups section of `references/authoring.md`.

1. **Start from the spec template:** `templates/spec.html` — design spec (diagrams + tables).
2. **Inline the stylesheet.** Replace the `/* INLINE_STYLESHEET */` marker with the full contents of `stylesheet.css`, unmodified. A linked stylesheet breaks when the file is sent on its own, and overriding its layout rules breaks the responsive breakpoints. (Mockups do **not** inline this stylesheet — they bring their own.)
3. **Stay self-contained.** No external scripts, stylesheets, fonts, or images. No CDNs. Plain `<a href>` hyperlinks are fine; embed images as `data:` URIs only if essential.
4. **Diagrams are hand-authored inline SVG** (or CSS boxes), themed with the stylesheet's classes (`.fig`, `.nlabel`, `.edge`) — a diagram library would be an external dependency. Give each `<svg>` a `viewBox` and no `width`/`height` attributes so it scales to the column; a diagram wider than 640 user units goes in `<div class="fig wide">`. See `references/authoring.md`.
5. **Tables** use plain semantic `<table>` markup.
6. **Read well on a phone, a tablet, and a desktop.** Keep the `<meta name="viewport" content="width=device-width, initial-scale=1">`, keep content from scrolling the page sideways, and size containers fluidly rather than in fixed pixels — your partner may review the spec on whatever device is at hand. The validator's `findResponsiveDeficiencies` must return empty.

## Reference

- Detailed conventions and diagram recipes: `references/authoring.md`
- Canonical styles: `stylesheet.css`
