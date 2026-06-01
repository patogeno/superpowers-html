import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const skill = readFileSync('skills/writing-plans/SKILL.md', 'utf8');

test('writing-plans keeps the Markdown plan canonical and Markdown-only', () => {
  assert.match(skill, /canonical/i);
  assert.match(skill, /plans\/YYYY-MM-DD-<feature-name>\.md/);
  assert.ok(!/## HTML Plan View/.test(skill), 'HTML Plan View section should be removed');
  assert.ok(!/sp-task-state/.test(skill), 'sp-task-state mirror should be removed');
  assert.ok(!/templates\/plan\.html/.test(skill), 'plan.html reference should be removed');
});

test('writing-plans offers an up-front execution-model choice', () => {
  assert.match(skill, /## Execution Model/);
  assert.match(skill, /sequential/i);
  assert.match(skill, /team/i);
});

test('writing-plans documents the team plan structure with specialists and dependencies', () => {
  assert.match(skill, /## Team Plan Structure/);
  assert.match(skill, /Work-streams/);
  assert.match(skill, /Specialist/);
  assert.match(skill, /depend/i);
});

test('writing-plans branches the execution handoff to the right sub-skills', () => {
  assert.match(skill, /subagent-driven-development/);
  assert.match(skill, /executing-plans/);
  assert.match(skill, /dispatching-parallel-agents/);
});

test('writing-plans keeps the multi-session structure in Markdown', () => {
  assert.match(skill, /multi-session/i);
  assert.match(skill, /docs\/superpowers\/plans\/<feature>\//);
  assert.match(skill, /roadmap\.md/);
  assert.match(skill, /learnings\.md/);
  assert.ok(!/roadmap\.html/.test(skill), 'roadmap.html reference should be removed');
  assert.ok(!/learnings\.html/.test(skill), 'learnings.html reference should be removed');
});

test('writing-plans documents the four-part learnings log entry', () => {
  for (const part of ['What happened', 'Deviations', 'Surprises', 'Follow-ups']) {
    assert.ok(skill.includes(part), `missing learnings part: ${part}`);
  }
});

test('writing-plans requires session plans to be self-contained', () => {
  assert.match(skill, /Session plans are self-contained/);
});
