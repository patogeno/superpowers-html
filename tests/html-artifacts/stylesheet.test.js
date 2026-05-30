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
