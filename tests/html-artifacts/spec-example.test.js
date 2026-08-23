import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { findExternalRefs, findSpecDeficiencies, findResponsiveDeficiencies } from './validate.js';

const spec = readFileSync(
  'docs/superpowers/specs/2026-05-30-html-output-design.html', 'utf8');

const COMMITTED_SPECS = [
  'docs/superpowers/specs/2026-05-30-html-output-design.html',
  'docs/superpowers/specs/2026-06-01-md-plans-subagents-vs-team-design.html',
  'docs/superpowers/specs/2026-06-17-mockups-replace-visual-companion-design.html',
];

test('the committed example design spec is self-contained', () => {
  assert.deepEqual(findExternalRefs(spec), []);
});

test('the committed example design spec qualifies as visual (svg + table)', () => {
  assert.deepEqual(findSpecDeficiencies(spec), []);
});

test('every committed design spec reads on a phone as well as a desktop', () => {
  for (const file of COMMITTED_SPECS) {
    const html = readFileSync(file, 'utf8');
    assert.deepEqual(findResponsiveDeficiencies(html), [], file);
    // They inline the current stylesheet, so they carry its responsive shell.
    assert.ok(html.includes('@media (max-width:900px)'), `${file} predates the responsive shell`);
    assert.ok(html.includes('<body class="layout">'), `${file} does not use the canonical shell`);
  }
});
