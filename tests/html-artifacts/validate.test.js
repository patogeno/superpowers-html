import test from 'node:test';
import assert from 'node:assert/strict';
import {
  findExternalRefs,
  inlineStylesheet, findUnreplacedMarkers,
  findSpecDeficiencies,
  findResponsiveDeficiencies, FIG_WIDE_THRESHOLD,
} from './validate.js';

const VIEWPORT = '<meta name="viewport" content="width=device-width, initial-scale=1">';

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

test('findExternalRefs: ignores refs inside HTML comments', () => {
  const html = `<!-- <script src="https://cdn.test/x.js"></script> -->
    <!-- <link rel="stylesheet" href="https://cdn.test/x.css"> -->
    <style>body{color:#000}</style>`;
  assert.deepEqual(findExternalRefs(html), []);
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

test('findResponsiveDeficiencies: a phone-ready artifact has none', () => {
  const html = `<!DOCTYPE html><html><head>${VIEWPORT}<style>
    .main{max-width:880px;min-width:0;} .app{width:100%;max-width:560px;}
    @media (max-width:900px){.layout{grid-template-columns:1fr;}}
    </style></head><body>
    <div class="fig"><svg viewBox="0 0 620 300" width="100%"><rect/></svg></div>
    </body></html>`;
  assert.deepEqual(findResponsiveDeficiencies(html), []);
});

test('findResponsiveDeficiencies: flags a missing viewport meta', () => {
  assert.deepEqual(findResponsiveDeficiencies('<html><head></head><body></body></html>'),
    ['no <meta name="viewport"> — phones render the page at 980px and shrink it']);
});

test('findResponsiveDeficiencies: flags a viewport meta that does not use device-width', () => {
  const html = '<meta name="viewport" content="width=1024, initial-scale=1">';
  assert.deepEqual(findResponsiveDeficiencies(html),
    ['viewport meta does not set width=device-width']);
});

test('findResponsiveDeficiencies: flags a hard-coded container width, not max/min-width', () => {
  const bad = `${VIEWPORT}<style>.wrap{width:900px}</style>`;
  assert.deepEqual(findResponsiveDeficiencies(bad),
    ['fixed CSS width: 900px — use max-width with a fluid width']);
  const ok = `${VIEWPORT}<style>.wrap{max-width:900px;width:100%}.fig.wide svg{min-width:640px}</style>`;
  assert.deepEqual(findResponsiveDeficiencies(ok), []);
});

test('findResponsiveDeficiencies: an svg needs a viewBox and no absolute size attribute', () => {
  assert.deepEqual(findResponsiveDeficiencies(`${VIEWPORT}<svg><rect/></svg>`),
    ['inline <svg> without a viewBox — it cannot scale to the column']);
  assert.deepEqual(findResponsiveDeficiencies(`${VIEWPORT}<svg viewBox="0 0 400 200" width="400"><rect/></svg>`),
    ['inline <svg> with a fixed width="400" attribute — use viewBox alone']);
  // width="100%" is exactly what the stylesheet does — not a deficiency.
  assert.deepEqual(findResponsiveDeficiencies(`${VIEWPORT}<svg viewBox="0 0 400 200" width="100%"><rect/></svg>`), []);
});

test(`findResponsiveDeficiencies: a diagram wider than ${FIG_WIDE_THRESHOLD} units must be a .fig.wide figure`, () => {
  const wide = `<svg viewBox="0 0 900 300"><rect/></svg>`;
  assert.deepEqual(findResponsiveDeficiencies(`${VIEWPORT}<div class="fig">${wide}</div>`),
    [`svg viewBox is 900 units wide (> ${FIG_WIDE_THRESHOLD}) but its figure is not <div class="fig wide">`]);
  assert.deepEqual(findResponsiveDeficiencies(`${VIEWPORT}<div class="fig wide">${wide}</div>`), []);
});

test('findResponsiveDeficiencies: each figure is judged against its own wrapper', () => {
  const html = `${VIEWPORT}
    <div class="fig wide"><svg viewBox="0 0 900 300"><rect/></svg></div>
    <div class="fig"><svg viewBox="0 0 900 300"><rect/></svg></div>`;
  assert.equal(findResponsiveDeficiencies(html).length, 1);
});
