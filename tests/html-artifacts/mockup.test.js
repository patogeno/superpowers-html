import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { findExternalRefs, findUnreplacedMarkers, findSpecDeficiencies } from './validate.js';

const mockup = readFileSync(
  'skills/html-artifacts/references/mockup-example.html', 'utf8');

test('the example mockup is self-contained (the one html-artifacts rule mockups reuse)', () => {
  assert.deepEqual(findExternalRefs(mockup), []);
});

test('the example mockup carries its own product theme, not the canonical spec stylesheet', () => {
  // It must NOT be built from the spec template / canonical stylesheet...
  assert.deepEqual(findUnreplacedMarkers(mockup), []);
  assert.ok(!mockup.includes('superpowers-html · canonical artifact stylesheet'),
    'mockup must not inline the plugin stylesheet');
  assert.ok(!/class="layout"/.test(mockup),
    'mockup must not reuse the spec layout shell');
  // ...but it still brings its own inline styling.
  assert.ok(/<style[\s>]/i.test(mockup), 'mockup must carry its own inline <style>');
});

test('the spec-quality gate does not apply to mockups (single styled screen is valid)', () => {
  // findSpecDeficiencies is a SPEC rule (needs an inline svg + table). A mockup
  // legitimately has neither, so this gate is intentionally never run on mockups.
  // This test documents that contract by showing the gate would (wrongly) flag it.
  assert.notDeepEqual(findSpecDeficiencies(mockup), []);
});
