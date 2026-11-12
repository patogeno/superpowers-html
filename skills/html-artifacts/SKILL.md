---
name: html-artifacts
description: Use when producing a human-facing HTML page in the superpowers workflow — a layered design spec, a clickable product prototype, a mid-conversation mockup, or a multi-session run report — and when publishing one as a Claude artifact.
---

# Authoring HTML Artifacts

Produce **self-contained, zero-dependency HTML** that your human partner enjoys reading, clicking through, and reviewing on a PC or a phone. No build step, no network dependencies.

Four kinds of page, each with a template:

| Page | Template | Look |
|------|----------|------|
| **Design spec**: experience first, technical design folded | `templates/spec.html` (a page fragment) | canonical `stylesheet.css` |
| **Prototype**: the key screens, clickable | `templates/prototype.html` (full document) | the product's own |
| **Mockup**: one screen or a layout choice, mid-conversation | `references/mockup-example.html` | the product's own |
| **Run report** for a multi-session roadmap | `templates/report.html` (full document) | its own, as given |

**Publishing.** If your harness has the Artifact tool (Claude Code), publish these pages as claude.ai artifacts so your partner can open and comment on them anywhere. Read `references/claude-code-artifacts.md` before the first publish. Otherwise write the files and give your partner their paths. The files go in the repo either way.

**When NOT to use:** conversational replies and Markdown snippets don't need a template. Implementation plans are canonical **Markdown**, not HTML.

## Rules

Rules 1–5 are for the **spec**. Rules 6–7 bind **every** page.

1. **Start from the spec template:** `templates/spec.html`. Keep its section order: what it's for, what you can do, screens, how it flows, approaches, then the technical design inside the closed `<details class="tech">`. Your partner reviews the experience; the technical design is there when they open it.
2. **Inline the stylesheet.** Replace the `/* INLINE_STYLESHEET */` marker with the full contents of `stylesheet.css`, unmodified. Add page-specific classes after it if you need them; never override its layout rules, or the responsive breakpoints break.
3. **Keep the spec a fragment.** No `<!DOCTYPE>`, `<html>`, `<head>` or `<body>`: the artifact viewer wraps the main page itself, and browsers open the fragment from disk too. The prototype and report are full documents, because supporting pages aren't wrapped.
4. **Diagrams are hand-authored inline SVG** (or CSS boxes), themed with the stylesheet's classes (`.fig`, `.nlabel`, `.edge`). A diagram library would be an external dependency. Give each `<svg>` a `viewBox` and no `width`/`height` attributes; a diagram wider than 640 user units goes in `<div class="fig wide">`. See `references/authoring.md`.
5. **Tables** use plain semantic `<table>` markup.
6. **Stay self-contained.** No external scripts, stylesheets, fonts, or images. No CDNs. Plain `<a href>` links are fine; embed images as `data:` URIs only if essential. A prototype's navigation is a small inline script (the template has it).
7. **Read well on a phone, a tablet, and a desktop, in light and dark.** Keep the viewport meta, keep content from scrolling the page sideways, size containers fluidly, and define every color as a token with dark values under both guards (`:root:not([data-theme="light"])` inside the dark media query, and `:root[data-theme="dark"]`). The validator's `findResponsiveDeficiencies` must return empty.

## Reference

- Conventions, diagram recipes, prototypes and mockups: `references/authoring.md`
- Publishing and reading comments on Claude Code: `references/claude-code-artifacts.md`
- Canonical spec styles: `stylesheet.css`
