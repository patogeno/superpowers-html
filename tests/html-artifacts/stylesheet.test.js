import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync('skills/html-artifacts/stylesheet.css', 'utf8');

test('stylesheet declares light + dark theme tokens', () => {
  assert.match(css, /:root\s*\{/);
  assert.match(css, /@media\s*\(prefers-color-scheme:\s*dark\)/);
  for (const v of ['--bg-primary', '--text-primary', '--accent', '--border', '--success']) {
    assert.ok(css.includes(v), `missing token ${v}`);
  }
});

test('stylesheet defines the artifact layout + component classes', () => {
  for (const sel of ['.sidebar', '.toc', '.progress', 'details.task',
                     'summary', '.badge', '.fig', 'table', '.callout', '.pill']) {
    assert.ok(css.includes(sel), `missing selector ${sel}`);
  }
});

test('stylesheet contains no external resource references', async () => {
  const { findExternalRefs } = await import('./validate.js');
  assert.deepEqual(findExternalRefs(css), []);
});

test('stylesheet is responsive: phone/tablet breakpoints for the two-column shell', () => {
  // The shell collapses for tablet portrait and phones, and tightens again on a small phone.
  for (const bp of ['@media (max-width:1100px)', '@media (max-width:900px)', '@media (max-width:560px)']) {
    assert.ok(css.includes(bp), `missing breakpoint ${bp}`);
  }
  // Sidebar becomes a horizontally scrollable chip row rather than a full-height column.
  assert.match(css, /\.sidebar\{position:sticky;top:0;z-index:20;height:auto/);
  assert.match(css, /\.toc\{display:flex;[^}]*overflow-x:auto/);
});

test('stylesheet never lets content scroll the page sideways', () => {
  // minmax(0,…) on both grid tracks is what stops a wide table/pre/svg from
  // stretching the layout — the bug that made specs unreadable on a phone.
  assert.match(css, /\.layout\{display:grid;grid-template-columns:minmax\(0,var\(--side-w\)\) minmax\(0,1fr\)/);
  assert.ok(css.includes('.main{padding:2.5rem 3rem;max-width:880px;min-width:0;}'));
  assert.match(css, /pre\{[^}]*overflow-x:auto/);
  assert.match(css, /table\{display:block;width:100%;max-width:100%;overflow-x:auto/);
  assert.ok(css.includes('.table-wrap{overflow-x:auto'));
  assert.ok(css.includes('html{-webkit-text-size-adjust:100%;}'));
});

test('stylesheet scales diagrams to the column and floors the wide ones', () => {
  assert.match(css, /\.fig svg\{display:block;width:100%;height:auto/);
  assert.match(css, /\.fig\.wide svg\{width:100%;max-width:none;min-width:var\(--fig-floor\)/);
  assert.ok(css.includes('--fig-floor:640px'), 'the wide-figure floor is a token');
});
