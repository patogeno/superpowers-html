// Zero-dependency validators for superpowers-html artifacts.
// "External ref" = a resource the browser would LOAD from off-document
// (script/img/iframe/source src, <link href>, CSS url()/@import) over
// http(s) or protocol-relative URLs. Plain <a href> hyperlinks and data:
// URIs are allowed — they do not break self-containment.
const EXTERNAL = [
  /\bsrc\s*=\s*["'](?:https?:\/\/|\/\/)[^"']*/gi,         // script/img/iframe/source
  /\bsrcset\s*=\s*["'][^"']*?(?:https?:\/\/|\/\/)[^"']*/gi,
  /<link\b[^>]*\bhref\s*=\s*["'](?:https?:\/\/|\/\/)[^"']*/gi,
  /@import\s+(?:url\()?["']?(?:https?:\/\/|\/\/)[^"')]*/gi,
  // The (?<!@import\s+) lookbehind assumes one or more spaces between @import
  // and url( (the normal/formatted case), so the prior @import rule already
  // counted it — this avoids double-counting that same ref here.
  /(?<!@import\s+)url\(\s*["']?(?:https?:\/\/|\/\/)[^"')]*/gi,
];

export function findExternalRefs(html) {
  // Strip HTML comments first — a ref inside <!-- ... --> is never loaded by
  // the browser, so counting it would be a false positive against self-containment.
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  const refs = [];
  for (const re of EXTERNAL) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(html)) !== null) refs.push(m[0]);
  }
  return refs;
}

const MARKER = '/* INLINE_STYLESHEET */';

export function inlineStylesheet(templateHtml, css) {
  return templateHtml.split(MARKER).join(css);
}

export function findUnreplacedMarkers(html) {
  return html.includes(MARKER) ? [MARKER] : [];
}

// Spec-quality check: a human-facing design spec should be visual — at least
// one hand-authored inline <svg> diagram and one semantic <table>. Returns a
// list of human-readable deficiencies; empty means it qualifies.
export function findSpecDeficiencies(html) {
  const out = [];
  if (!/<svg[\s>]/i.test(html)) out.push('no inline <svg> diagram');
  if (!/<table[\s>]/i.test(html)) out.push('no <table>');
  return out;
}

// A diagram this wide (in viewBox user units) is unreadable once it is scaled
// down to a phone column, so it must opt into the scrolling `.fig.wide` figure.
export const FIG_WIDE_THRESHOLD = 640;

// Responsiveness check — binds BOTH specs and mockups (SKILL.md rule 6). These
// are the mechanically checkable parts of "reads well on a phone"; returns a
// list of human-readable deficiencies, empty means it passes.
export function findResponsiveDeficiencies(html) {
  const out = [];
  const doc = html.replace(/<!--[\s\S]*?-->/g, '');

  const viewport = /<meta\b[^>]*\bname\s*=\s*["']?viewport["']?[\s>][^>]*>/i.exec(doc);
  if (!viewport) {
    out.push('no <meta name="viewport"> — phones render the page at 980px and shrink it');
  } else if (!/content\s*=\s*["']?[^"'>]*width\s*=\s*device-width/i.test(viewport[0])) {
    out.push('viewport meta does not set width=device-width');
  }

  // A hard-coded container width in CSS cannot shrink to a phone. max-width,
  // min-width, and the SVG floor (--fig-floor) are all fine; `width: 900px` is not.
  for (const m of doc.matchAll(/(^|[;{\s])width\s*:\s*(\d{3,})px/gi)) {
    if (Number(m[2]) >= 480) out.push(`fixed CSS width: ${m[2]}px — use max-width with a fluid width`);
  }

  // Every inline <svg> needs a viewBox to scale, and a wide one needs .fig.wide.
  for (const m of doc.matchAll(/<svg\b([^>]*)>/gi)) {
    const attrs = m[1];
    const vb = /viewBox\s*=\s*["']\s*[\d.eE+-]+[\s,]+[\d.eE+-]+[\s,]+([\d.eE+-]+)/i.exec(attrs);
    if (!vb) { out.push('inline <svg> without a viewBox — it cannot scale to the column'); continue; }
    // width="100%" is fine (it is what the stylesheet does anyway); an absolute
    // width="920" / height="320" pins the diagram and defeats the scaling.
    const abs = /\b(width|height)\s*=\s*["']?(\d+(?:\.\d+)?)(px|pt|cm|mm|in)?["'\s>]/i.exec(attrs);
    if (abs) {
      out.push(`inline <svg> with a fixed ${abs[1]}="${abs[2]}${abs[3] || ''}" attribute — use viewBox alone`);
    }
    if (Number(vb[1]) > FIG_WIDE_THRESHOLD) {
      // The figure wrapper is the nearest <div class="...fig..."> before this svg.
      const figs = [...doc.slice(0, m.index).matchAll(/<div\b[^>]*\bclass\s*=\s*["']([^"']*\bfig\b[^"']*)["']/gi)];
      const cls = figs.length ? figs[figs.length - 1][1] : '';
      if (!/\bwide\b/.test(cls)) {
        out.push(`svg viewBox is ${vb[1]} units wide (> ${FIG_WIDE_THRESHOLD}) but its figure is not <div class="fig wide">`);
      }
    }
  }
  return out;
}
