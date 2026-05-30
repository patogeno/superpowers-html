---
name: html-artifacts
description: Use when producing a human-facing HTML artifact in the brainstorming or planning workflow — a design spec, an implementation plan view, a session roadmap, or a learnings log.
---

# Authoring HTML Artifacts

Produce **self-contained, zero-dependency HTML** that a human enjoys reading and navigating. Each artifact must be a single, sendable HTML file — no build step, no network dependencies.

**When NOT to use:** plain conversational replies or short Markdown snippets don't need a template — only formal spec/plan/roadmap/learnings artifacts do.

## Rules

1. **Start from the matching template:**
   - `templates/spec.html` — design spec (diagrams + tables)
   - `templates/plan.html` — implementation plan view (sidebar TOC, progress, collapsible tasks)
   - `templates/roadmap.html` — multi-session roadmap
   - `templates/learnings.html` — cross-session learnings log
2. **Inline the stylesheet.** Replace the `/* INLINE_STYLESHEET */` marker with the full contents of `stylesheet.css`. Never link it externally.
3. **Stay self-contained.** No external scripts, stylesheets, fonts, or images. No CDNs. Plain `<a href>` hyperlinks are fine; embed images as `data:` URIs only if essential.
4. **Diagrams are hand-authored inline SVG** (or CSS boxes), themed with the stylesheet's classes (`.fig`, `.nlabel`, `.edge`). Never use a diagram library. See `references/authoring.md`.
5. **Tables** use plain semantic `<table>` markup.
6. **Plan views carry a task-state mirror.** The `<script type="application/json" id="sp-task-state">` block must match the canonical Markdown checkboxes. Regenerate it whenever the Markdown changes.

## Reference

- Detailed conventions, diagram recipes, and the task-state contract: `references/authoring.md`
- Canonical styles: `stylesheet.css`
