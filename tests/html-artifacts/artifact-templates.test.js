import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { findExternalRefs, inlineStylesheet, findResponsiveDeficiencies } from './validate.js';

const DIR = 'skills/html-artifacts';
const css = readFileSync(`${DIR}/stylesheet.css`, 'utf8');
const read = (p) => readFileSync(`${DIR}/${p}`, 'utf8');

// claude.ai reserves these hash names for its own viewer UI.
const RESERVED = ['settings', 'sidebar', 'customize', 'upgrade', 'downloads'];

const darkGuards = (src) => {
  assert.match(src, /@media\s*\(prefers-color-scheme:\s*dark\)\s*\{\s*:root:not\(\[data-theme="light"\]\)/,
    'dark tokens must be guarded so an explicit light choice wins');
  assert.match(src, /:root\[data-theme="dark"\]\s*\{/, 'an explicit dark choice must also apply the dark tokens');
};

test('stylesheet guards dark mode for the artifact viewer theme toggle', () => {
  darkGuards(css);
});

test('stylesheet styles the layered spec: feature list, screen cards, folded technical design', () => {
  for (const sel of ['.feat', '.cards', '.card', '.thumb', 'details.tech', '.yours']) {
    assert.ok(css.includes(sel), `missing selector ${sel}`);
  }
});

test('stylesheet offsets the sticky bar by the phone safe-area inset', () => {
  assert.match(css, /\.sidebar\{position:sticky;top:env\(safe-area-inset-top,0px\)/);
});

test('spec template is a page fragment the artifact viewer can wrap', () => {
  const tpl = read('templates/spec.html');
  assert.ok(!/<!DOCTYPE/i.test(tpl) && !/<html[\s>]/i.test(tpl) && !/<body[\s>]/i.test(tpl),
    'the published main page must not carry its own html/head/body');
  assert.match(tpl, /^<meta charset="utf-8">/);
  assert.match(tpl, /<title>/);
});

test('spec template leads with the experience and folds the technical design', () => {
  const tpl = read('templates/spec.html');
  const ids = ['purpose', 'features', 'screens', 'flows', 'approaches', 'technical'];
  const at = ids.map((id) => tpl.indexOf(`<h2 id="${id}"`));
  at.forEach((i, n) => assert.ok(i > 0, `missing section ${ids[n]}`));
  assert.deepEqual([...at].sort((a, b) => a - b), at, 'sections must appear in experience-first order');
  const tech = tpl.slice(at[5]);
  assert.match(tech, /<details class="tech">/, 'technical design must be folded (closed <details>)');
  assert.ok(!/<details class="tech" open/.test(tech), 'technical design must start closed');
  assert.match(tech, /architecture/i);
  assert.match(tech, /Claude's call/);
});

for (const name of ['prototype', 'report']) {
  test(`${name} template is a full, self-contained, responsive, theme-aware document`, () => {
    assert.ok(existsSync(`${DIR}/templates/${name}.html`), `${name}.html must exist`);
    const tpl = read(`templates/${name}.html`);
    assert.match(tpl, /^<!doctype html>/i, 'supporting pages are not wrapped, so they need their own doctype');
    assert.deepEqual(findExternalRefs(tpl), []);
    assert.deepEqual(findResponsiveDeficiencies(tpl), []);
    darkGuards(tpl);
    assert.match(tpl, /body\s*\{[^}]*background/, 'body needs an explicit background');
  });
}

test('prototype template routes screens on the hash and links back to the spec', () => {
  const tpl = read('templates/prototype.html');
  assert.match(tpl, /data-screen/);
  assert.match(tpl, /hashchange/);
  assert.match(tpl, /href="index\.html"/, 'Back to spec must target index.html (works in the artifact and locally)');
});

test('prototype template uses no screen id claude.ai reserves', () => {
  const tpl = read('templates/prototype.html');
  const ids = [...tpl.matchAll(/<section[^>]*\bid="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(ids.length >= 2, 'template should show at least two example screens');
  for (const id of ids) {
    assert.ok(!RESERVED.includes(id) && !id.startsWith('comment-'), `reserved screen id: ${id}`);
    assert.match(id, /^[a-z0-9-]+$/, `screen ids are plain ASCII letters, digits and hyphens: ${id}`);
  }
});

test('report template carries the run report sections', () => {
  const tpl = read('templates/report.html');
  for (const id of ['done', 'calls', 'waiting', 'try', 'learnings', 'history']) {
    assert.match(tpl, new RegExp(`id="${id}"`), `missing report section ${id}`);
  }
});

test('Claude Code publishing reference covers publish, republish, comments and reserved names', () => {
  const p = `${DIR}/references/claude-code-artifacts.md`;
  assert.ok(existsSync(p));
  const ref = readFileSync(p, 'utf8');
  assert.match(ref, /`files`/);
  assert.match(ref, /same (file )?path/i);
  assert.match(ref, /ArtifactComments/);
  assert.match(ref, /comment-/);
  assert.match(ref, /no Artifact tool|without the Artifact tool|other harness/i,
    'must say what to do when the harness has no Artifact tool');
});

test('html-artifacts SKILL.md points at the new templates and the publishing reference', () => {
  const skill = read('SKILL.md');
  for (const ref of ['templates/prototype.html', 'templates/report.html', 'references/claude-code-artifacts.md']) {
    assert.ok(skill.includes(ref), `SKILL.md must mention ${ref}`);
  }
});

test('the inlined spec template stays self-contained and responsive', () => {
  const html = inlineStylesheet(read('templates/spec.html'), css);
  assert.deepEqual(findExternalRefs(html), []);
  assert.deepEqual(findResponsiveDeficiencies(html), []);
});
