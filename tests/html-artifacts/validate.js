// Zero-dependency validators for superpowers-html artifacts.
// "External ref" = a resource the browser would LOAD from off-document
// (script/img/iframe/source src, <link href>, CSS url()/@import) over
// http(s) or protocol-relative URLs. Plain <a href> hyperlinks and data:
// URIs are allowed — they do not break self-containment.
const EXTERNAL = [
  /\bsrc\s*=\s*["'](?:https?:\/\/|\/\/)[^"']*/gi,         // script/img/iframe/source
  /\bsrcset\s*=\s*["'][^"']*(?:https?:\/\/|\/\/)[^"']*/gi,
  /<link\b[^>]*\bhref\s*=\s*["'](?:https?:\/\/|\/\/)[^"']*/gi,
  /@import\s+(?:url\()?["']?(?:https?:\/\/|\/\/)[^"')]*/gi,
  /(?<!@import\s)url\(\s*["']?(?:https?:\/\/|\/\/)[^"')]*/gi,
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
