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

export function extractMarkdownCheckboxes(md) {
  const re = /^[ \t]*-[ \t]*\[([ xX])\][ \t]*(.*\S)[ \t]*$/gm;
  const out = [];
  let m;
  while ((m = re.exec(md)) !== null) {
    out.push({ checked: m[1].toLowerCase() === 'x', text: m[2] });
  }
  return out;
}

export function extractHtmlTaskState(html) {
  const m = html.match(
    /<script[^>]*id\s*=\s*["']sp-task-state["'][^>]*>([\s\S]*?)<\/script>/i
  );
  if (!m) return null;
  try {
    return JSON.parse(m[1]).checkboxes ?? null;
  } catch {
    return null;
  }
}

export function taskStateMatches(md, html) {
  const a = extractMarkdownCheckboxes(md);
  const b = extractHtmlTaskState(html);
  if (b === null || a.length !== b.length) return false;
  return a.every((x, i) =>
    x.checked === b[i].checked && x.text.trim() === b[i].text.trim());
}
