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
