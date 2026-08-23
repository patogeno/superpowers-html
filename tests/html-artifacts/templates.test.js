import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { findExternalRefs, inlineStylesheet, findUnreplacedMarkers,
         findResponsiveDeficiencies } from './validate.js';

const css = readFileSync('skills/html-artifacts/stylesheet.css', 'utf8');
const tpl = readFileSync('skills/html-artifacts/templates/spec.html', 'utf8');

test('spec template carries the stylesheet marker', () => {
  assert.equal(findUnreplacedMarkers(tpl).length, 1);
});

test('spec template has no external refs before or after inlining', () => {
  assert.deepEqual(findExternalRefs(tpl), []);
  const inlined = inlineStylesheet(tpl, css);
  assert.deepEqual(findExternalRefs(inlined), []);
  assert.deepEqual(findUnreplacedMarkers(inlined), []);
});

test('spec template is a full HTML document', () => {
  assert.match(tpl, /<!DOCTYPE html>/i);
  assert.match(tpl, /<html[ >]/i);
});

test('the reverted plan/roadmap/learnings templates are gone', () => {
  for (const name of ['plan', 'roadmap', 'learnings']) {
    assert.ok(!existsSync(`skills/html-artifacts/templates/${name}.html`),
      `${name}.html should have been removed`);
  }
});

test('spec template carries the viewport meta a phone needs', () => {
  assert.match(tpl, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
});

test('spec template is responsive before and after inlining', () => {
  assert.deepEqual(findResponsiveDeficiencies(tpl), []);
  assert.deepEqual(findResponsiveDeficiencies(inlineStylesheet(tpl, css)), []);
});
