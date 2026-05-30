import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { findExternalRefs, findSpecDeficiencies } from './validate.js';

const spec = readFileSync(
  'docs/superpowers/specs/2026-05-30-html-output-design.html', 'utf8');

test('the committed example design spec is self-contained', () => {
  assert.deepEqual(findExternalRefs(spec), []);
});

test('the committed example design spec qualifies as visual (svg + table)', () => {
  assert.deepEqual(findSpecDeficiencies(spec), []);
});
