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

## Task-state mirror (plan views only)
The plan HTML view embeds the canonical Markdown checkbox state as JSON:

    <script type="application/json" id="sp-task-state">
    {"checkboxes":[{"checked":false,"text":"**Step 1: ...**"}, ...]}
    </script>

`checkboxes` is the ordered list of every `- [ ]`/`- [x]` step in the Markdown plan,
with `checked` and the raw step `text`. `taskStateMatches(md, html)` in the validator
verifies the view is in sync. Regenerate the HTML view (and this block) whenever the
Markdown plan changes — including when execution skills tick a checkbox.
