# HTML Artifact Authoring Reference

## Self-containment
The artifact must open correctly from `file://` with no network. Concretely: no
`<script src>`, `<link rel=stylesheet>`, `<img src=http...>`, `@import url(http...)`,
or `url(http...)`. The validator `tests/html-artifacts/validate.js` (`findExternalRefs`)
encodes this rule.

## Inlining the stylesheet
Read `stylesheet.css` and replace the template's `/* INLINE_STYLESHEET */` marker
with its full contents. After this, `findUnreplacedMarkers` must return empty.

## Diagrams (inline SVG)
Draw architecture/flow diagrams as inline `<svg>` inside a `<div class="fig">` with a
`<div class="fig-cap">` caption. Use `viewBox` for responsiveness. Theme nodes/edges
with the `.nlabel`, `.nsub`, and `.edge` classes plus CSS variables (`var(--accent)`,
`var(--success)`) so they adapt to light/dark. Define an arrowhead `<marker>` once per svg.

## Mockups
A mockup shows what a screen or layout looks like during brainstorming. It is the
same *kind* of artifact as the spec — a human opens it and looks; nothing parses it —
but with a different purpose, so it follows different rules:

- **Self-containment still binds.** One file, zero dependencies, no CDNs; it must open
  from `file://`. `findExternalRefs` must return empty. This is the only html-artifacts
  rule a mockup reuses.
- **Style it like the product, not the plugin.** A mockup represents the product being
  designed, so give it its own inline `<style>` — the product's colors, type, spacing.
  Do **not** inline `stylesheet.css` or start from `templates/spec.html`; the canonical
  theme is for the spec, not for representative product UI.
- **No spec-quality gate.** `findSpecDeficiencies` (the "needs an inline SVG and a table"
  check) is a spec rule. Do not apply it to mockups — a mockup may be a single styled
  screen with neither.
- **Inline vs. spun-out.** A schematic wireframe that fits the spec goes inline in the
  spec (using the diagram conventions above, canonical theme). A higher-fidelity,
  product-styled mockup is its own file, linked from the spec with a plain relative
  `<a href>`. Once a topic has a spec plus one or more mockups, put them together in a
  per-topic folder: `docs/superpowers/specs/YYYY-MM-DD-<topic>/` with `design.html` and
  `mockup-<name>.html`.

See `mockup-example.html` in this directory for a minimal, self-contained,
product-styled mockup (illustrative only — your mockup carries *its* product's look).
