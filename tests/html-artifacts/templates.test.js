import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { findExternalRefs, inlineStylesheet, findUnreplacedMarkers } from './validate.js';

const css = readFileSync('skills/html-artifacts/stylesheet.css', 'utf8');
const TEMPLATES = ['spec', 'plan', 'roadmap', 'learnings'];

for (const name of ['spec', 'plan']) {
  const tpl = readFileSync(`skills/html-artifacts/templates/${name}.html`, 'utf8');

  test(`${name} template carries the stylesheet marker`, () => {
    assert.equal(findUnreplacedMarkers(tpl).length, 1);
  });

  test(`${name} template has no external refs before or after inlining`, () => {
    assert.deepEqual(findExternalRefs(tpl), []);
    const inlined = inlineStylesheet(tpl, css);
    assert.deepEqual(findExternalRefs(inlined), []);
    assert.deepEqual(findUnreplacedMarkers(inlined), []);
  });

  test(`${name} template is a full HTML document`, () => {
    assert.match(tpl, /<!DOCTYPE html>/i);
    assert.match(tpl, /<html[ >]/i);
  });
}

test('plan template embeds the machine-readable task-state block', () => {
  const tpl = readFileSync('skills/html-artifacts/templates/plan.html', 'utf8');
  assert.match(tpl, /id\s*=\s*["']sp-task-state["']/);
});

for (const name of ['roadmap', 'learnings']) {
  const tpl = readFileSync(`skills/html-artifacts/templates/${name}.html`, 'utf8');
  test(`${name} template carries the marker and is self-contained`, () => {
    assert.equal(findUnreplacedMarkers(tpl).length, 1);
    assert.deepEqual(findExternalRefs(tpl), []);
    const inlined = inlineStylesheet(tpl, css);
    assert.deepEqual(findExternalRefs(inlined), []);
    assert.deepEqual(findUnreplacedMarkers(inlined), []);
    assert.match(tpl, /<!DOCTYPE html>/i);
  });
}

test('all four templates exist', () => {
  for (const name of TEMPLATES) {
    assert.ok(readFileSync(`skills/html-artifacts/templates/${name}.html`, 'utf8').length > 0);
  }
});
