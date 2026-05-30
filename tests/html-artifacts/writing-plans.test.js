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

test('writing-plans describes the agent-judged multi-session trigger', () => {
  assert.match(skill, /multi-session/i);
  assert.match(skill, /docs\/superpowers\/plans\/<feature>\//);
});

test('writing-plans references the roadmap and learnings templates', () => {
  assert.match(skill, /templates\/roadmap\.html/);
  assert.match(skill, /templates\/learnings\.html/);
});

test('writing-plans documents the four-part learnings log entry', () => {
  for (const part of ['What happened', 'Deviations', 'Surprises', 'Follow-ups']) {
    assert.ok(skill.includes(part), `missing learnings part: ${part}`);
  }
});

test('writing-plans requires session plans to be self-contained', () => {
  assert.match(skill, /Session plans are self-contained/);
});
