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

test('SKILL.md references the stylesheet and all four templates', () => {
  assert.ok(skill.includes('stylesheet.css'));
  for (const t of ['spec.html', 'plan.html', 'roadmap.html', 'learnings.html']) {
    assert.ok(skill.includes(`templates/${t}`), `missing reference to ${t}`);
  }
});

test('SKILL.md documents the core conventions', () => {
  assert.match(skill, /self-contained/i);
  assert.match(skill, /INLINE_STYLESHEET/);
  assert.match(skill, /SVG/);
  assert.ok(skill.includes('references/authoring.md'));
});

test('authoring reference exists and explains the task-state mirror', () => {
  const ref = readFileSync('skills/html-artifacts/references/authoring.md', 'utf8');
  assert.match(ref, /sp-task-state/);
});
