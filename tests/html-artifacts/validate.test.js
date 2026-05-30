import test from 'node:test';
import assert from 'node:assert/strict';
import {
  findExternalRefs,
  inlineStylesheet, findUnreplacedMarkers,
  extractMarkdownCheckboxes, extractHtmlTaskState, taskStateMatches,
  findSpecDeficiencies,
} from './validate.js';

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

test('findExternalRefs: @import with multiple spaces before url() is counted once', () => {
  assert.equal(findExternalRefs(`<style>@import   url(https://cdn.test/x.css);</style>`).length, 1);
});

test('inlineStylesheet replaces the marker and removes it', () => {
  const tpl = `<style>/* INLINE_STYLESHEET */</style>`;
  const out = inlineStylesheet(tpl, 'body{color:#000}');
  assert.ok(out.includes('body{color:#000}'));
  assert.deepEqual(findUnreplacedMarkers(out), []);
});

test('findUnreplacedMarkers flags a leftover marker', () => {
  assert.equal(findUnreplacedMarkers('<style>/* INLINE_STYLESHEET */</style>').length, 1);
});

test('extractMarkdownCheckboxes reads checked state and text', () => {
  const md = `- [ ] **Step 1: a**\nsome prose\n- [x] **Step 2: b**`;
  assert.deepEqual(extractMarkdownCheckboxes(md), [
    { checked: false, text: '**Step 1: a**' },
    { checked: true, text: '**Step 2: b**' },
  ]);
});

test('taskStateMatches true when HTML JSON mirror equals Markdown checkboxes', () => {
  const md = `- [x] **Step 1: a**\n- [ ] **Step 2: b**`;
  const html = `<script type="application/json" id="sp-task-state">
    {"checkboxes":[{"checked":true,"text":"**Step 1: a**"},{"checked":false,"text":"**Step 2: b**"}]}
    </script>`;
  assert.equal(taskStateMatches(md, html), true);
});

test('extractHtmlTaskState returns null when no task-state block present', () => {
  assert.equal(extractHtmlTaskState('<html><body>no block</body></html>'), null);
});

test('taskStateMatches false when checked state diverges', () => {
  const md = `- [ ] **Step 1: a**`;
  const html = `<script type="application/json" id="sp-task-state">
    {"checkboxes":[{"checked":true,"text":"**Step 1: a**"}]}</script>`;
  assert.equal(taskStateMatches(md, html), false);
});

test('findSpecDeficiencies: a spec with an inline svg and a table has none', () => {
  const html = `<svg viewBox="0 0 10 10"><rect width="10" height="10"/></svg>
    <table><thead><tr><th>a</th></tr></thead><tbody><tr><td>b</td></tr></tbody></table>`;
  assert.deepEqual(findSpecDeficiencies(html), []);
});

test('findSpecDeficiencies: flags a missing diagram and a missing table', () => {
  assert.deepEqual(findSpecDeficiencies('<p>prose only, no visuals</p>'),
    ['no inline <svg> diagram', 'no <table>']);
});

test('findSpecDeficiencies: flags only the missing one', () => {
  assert.deepEqual(findSpecDeficiencies('<svg><rect/></svg><p>no table</p>'),
    ['no <table>']);
});
