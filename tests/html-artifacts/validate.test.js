import test from 'node:test';
import assert from 'node:assert/strict';
import { findExternalRefs } from './validate.js';

test('findExternalRefs: clean self-contained HTML has none', () => {
  const html = `<!DOCTYPE html><html><head><style>body{color:red}</style></head>
    <body><a href="#section">jump</a><a href="https://example.com">link text</a>
    <img src="data:image/png;base64,AAAA"></body></html>`;
  assert.deepEqual(findExternalRefs(html), []);
});

test('findExternalRefs: flags external script, stylesheet link, image, and css url', () => {
  const html = `<link rel="stylesheet" href="https://cdn.test/x.css">
    <script src="https://cdn.test/x.js"></script>
    <img src="//cdn.test/a.png">
    <style>@import url(https://cdn.test/f.css); body{background:url('http://cdn.test/b.png')}</style>`;
  const refs = findExternalRefs(html);
  assert.ok(refs.some(r => r.includes('https://cdn.test/x.css')));
  assert.ok(refs.some(r => r.includes('https://cdn.test/x.js')));
  assert.ok(refs.some(r => r.includes('//cdn.test/a.png')));
  assert.ok(refs.some(r => r.includes('https://cdn.test/f.css')));
  assert.ok(refs.some(r => r.includes('http://cdn.test/b.png')));
  assert.equal(refs.length, 5);
});

test('findExternalRefs: flags bare-string @import', () => {
  assert.equal(findExternalRefs(`<style>@import "https://cdn.test/x.css";</style>`).length, 1);
});
