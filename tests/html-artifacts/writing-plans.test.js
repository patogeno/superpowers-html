import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const skill = readFileSync('skills/writing-plans/SKILL.md', 'utf8');

test('writing-plans references html-artifacts as a REQUIRED SUB-SKILL', () => {
  assert.match(skill, /## HTML Plan View/);
  assert.match(skill, /REQUIRED SUB-SKILL/);
  assert.match(skill, /superpowers:html-artifacts/);
});

test('writing-plans keeps Markdown canonical and emits an HTML view', () => {
  assert.match(skill, /canonical/i);
  assert.match(skill, /templates\/plan\.html/);
  assert.match(skill, /plans\/YYYY-MM-DD-<feature-name>\.html/);
});

test('writing-plans documents the sp-task-state sync contract', () => {
  assert.match(skill, /sp-task-state/);
  assert.match(skill, /taskStateMatches/);
});
