import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const skill = readFileSync('skills/html-artifacts/SKILL.md', 'utf8');

function frontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(m, 'SKILL.md must start with YAML frontmatter');
  return m[1];
}

test('frontmatter has name=html-artifacts and a "Use when" description', () => {
  const fm = frontmatter(skill);
  assert.match(fm, /name:\s*html-artifacts/);
  assert.match(fm, /description:\s*["']?Use when/i);
});

test('frontmatter stays within the 1024-char budget', () => {
  assert.ok(frontmatter(skill).length <= 1024);
});

test('SKILL.md references the stylesheet and the spec template', () => {
  assert.ok(skill.includes('stylesheet.css'));
  assert.ok(skill.includes('templates/spec.html'));
});

test('SKILL.md no longer references the reverted plan/roadmap/learnings templates', () => {
  for (const t of ['plan.html', 'roadmap.html', 'learnings.html']) {
    assert.ok(!skill.includes(`templates/${t}`), `should not reference ${t}`);
  }
});

test('SKILL.md documents the core conventions', () => {
  assert.match(skill, /self-contained/i);
  assert.match(skill, /INLINE_STYLESHEET/);
  assert.match(skill, /SVG/);
  assert.ok(skill.includes('references/authoring.md'));
});

test('authoring reference exists and no longer documents the task-state mirror', () => {
  const ref = readFileSync('skills/html-artifacts/references/authoring.md', 'utf8');
  assert.match(ref, /self-contain/i);
  assert.ok(!/sp-task-state/.test(ref), 'task-state mirror section should be removed');
});
