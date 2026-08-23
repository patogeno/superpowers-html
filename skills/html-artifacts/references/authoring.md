# HTML Artifact Authoring Reference

## Self-containment
The artifact must open correctly from `file://` with no network. Concretely: no
`<script src>`, `<link rel=stylesheet>`, `<img src=http...>`, `@import url(http...)`,
or `url(http...)`. The validator `tests/html-artifacts/validate.js` (`findExternalRefs`)
encodes this rule.

## Inlining the stylesheet
Read `stylesheet.css` and replace the template's `/* INLINE_STYLESHEET */` marker
with its full contents. After this, `findUnreplacedMarkers` must return empty.

## Responsiveness
The reader opens the artifact on a desktop, a tablet, or a phone. It must read well on
all three. The validator `findResponsiveDeficiencies` encodes the mechanical parts.

- **Every artifact carries `<meta name="viewport" content="width=device-width, initial-scale=1">`.**
  Without it a phone renders the page at 980px and shrinks it to unreadable.
- **Nothing scrolls the page sideways.** Wide things scroll *inside themselves*:
  `pre` and `<table>` already do (the stylesheet handles tables below 900px), and
  `.table-wrap` is there for a table that needs a scroll container at any width.
- **The spec's canonical shell is already responsive.** The two-column layout collapses
  below 900px into a compact sticky bar whose TOC becomes a row of chips. Do not
  re-style `.layout`/`.sidebar`/`.main` in the document — inline `stylesheet.css`
  unmodified and let its breakpoints (1100px, 900px, 640px, 560px) do the work.
- **Never set a fixed pixel width** on a layout container (`width:900px`,
  `min-width:800px`). Use `max-width` plus a fluid width.

## Diagrams (inline SVG)
Draw architecture/flow diagrams as inline `<svg>` inside a `<div class="fig">` with a
`<div class="fig-cap">` caption. Theme nodes/edges with the `.nlabel`, `.nsub`, and
`.edge` classes plus CSS variables (`var(--accent)`, `var(--success)`) so they adapt to
light/dark. Define an arrowhead `<marker>` once per svg.

Diagram rules that keep a phone reader in mind:

- **Always give the `<svg>` a `viewBox`, and no `width`/`height` attributes.** The
  stylesheet scales it to the column; a fixed `width` attribute breaks that.
- **Prefer a viewBox no wider than 640 user units,** stacking nodes vertically rather
  than sprawling sideways. At 640 the 12.5px `.nlabel` text is still legible when the
  diagram is scaled down to a phone column.
- **A diagram wider than 640 units MUST be marked `<div class="fig wide">`.** That keeps
  it at a legible floor width and scrolls it horizontally inside the figure on a phone,
  instead of shrinking 12.5px labels to ~5px. `findResponsiveDeficiencies` flags a wide
  diagram that forgot the class.

## Mockups
A mockup shows what a screen or layout looks like during brainstorming. It is the
same *kind* of artifact as the spec — a human opens it and looks; nothing parses it —
but with a different purpose, so it follows different rules.

**A mockup is rendered HTML/SVG, never ASCII art.** Represent every UI, layout, screen,
or navigation structure as HTML (inline `<svg>` or CSS boxes) — not as a text/ASCII box
sketch. ASCII/plain-text diagrams belong only in inline terminal clarifying questions and
in Markdown files; they are never a mockup and never go in the spec.

- **Self-containment still binds.** One file, zero dependencies, no CDNs; it must open
  from `file://`. `findExternalRefs` must return empty.
- **Responsiveness still binds.** Self-containment and responsiveness are the two
  html-artifacts rules a mockup reuses. The mockup carries its own theme, so it must
  carry its own responsive behaviour: viewport meta, fluid widths (`width:100%` +
  `max-width`), wrapping flex rows, and a breakpoint where a multi-column layout stacks.
  A phone-sized mockup is a legitimate design — a *desktop* mockup that cannot be read
  on a phone is not. `findResponsiveDeficiencies` runs on mockups too.
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
