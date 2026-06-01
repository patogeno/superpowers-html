---
name: html-artifacts
description: Use when producing a human-facing HTML design spec in the brainstorming workflow — a self-contained, navigable spec with inline SVG diagrams and tables.
---

# Authoring HTML Artifacts

Produce **self-contained, zero-dependency HTML** that a human enjoys reading and navigating. The artifact must be a single, sendable HTML file — no build step, no network dependencies.

**When NOT to use:** plain conversational replies or short Markdown snippets don't need a template — and implementation plans are authored as canonical **Markdown**, not HTML. Only the formal design **spec** is an HTML artifact.

## Rules

1. **Start from the spec template:** `templates/spec.html` — design spec (diagrams + tables).
2. **Inline the stylesheet.** Replace the `/* INLINE_STYLESHEET */` marker with the full contents of `stylesheet.css`. Never link it externally.
3. **Stay self-contained.** No external scripts, stylesheets, fonts, or images. No CDNs. Plain `<a href>` hyperlinks are fine; embed images as `data:` URIs only if essential.
4. **Diagrams are hand-authored inline SVG** (or CSS boxes), themed with the stylesheet's classes (`.fig`, `.nlabel`, `.edge`). Never use a diagram library. See `references/authoring.md`.
5. **Tables** use plain semantic `<table>` markup.

## Reference

- Detailed conventions and diagram recipes: `references/authoring.md`
- Canonical styles: `stylesheet.css`
