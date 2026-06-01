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
