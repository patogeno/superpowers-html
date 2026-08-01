import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const DIR = 'skills/writing-plans';
const skill = readFileSync(`${DIR}/SKILL.md`, 'utf8');
const teamPlans = readFileSync(`${DIR}/team-plans.md`, 'utf8');
const multiSession = readFileSync(`${DIR}/multi-session-plans.md`, 'utf8');

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

test('writing-plans branches the execution handoff to the right sub-skills', () => {
  assert.match(skill, /subagent-driven-development/);
  assert.match(skill, /executing-plans/);
  assert.match(skill, /dispatching-parallel-agents/);
});

// Progressive disclosure: SKILL.md carries the decision, the reference file
// carries the mechanics. Both halves have to hold, or the pointer is a dead end.

test('SKILL.md states the team-plan decision and defers the mechanics', () => {
  assert.match(skill, /## Team Plan Structure/);
  assert.match(skill, /Work-streams/);
  assert.match(skill, /Specialist/);
  assert.match(skill, /depend/i);
  assert.match(skill, /team-plans\.md/, 'SKILL.md must point at the team-plan reference');
});

test('team-plans.md carries the work-stream format and the team handoff', () => {
  assert.match(teamPlans, /## Work-streams/);
  assert.match(teamPlans, /\*\*Specialist:\*\* <role>/);
  assert.match(teamPlans, /Depends on:/);
  assert.match(teamPlans, /dispatching-parallel-agents/);
  assert.match(teamPlans, /CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS/);
});

test('SKILL.md states the multi-session judgment and defers the layout', () => {
  assert.match(skill, /multi-session/i);
  assert.match(skill, /Judge the scope first/);
  assert.match(skill, /multi-session-plans\.md/, 'SKILL.md must point at the multi-session reference');
});

test('multi-session-plans.md keeps the structure in Markdown', () => {
  assert.match(multiSession, /docs\/superpowers\/plans\/<feature>\//);
  assert.match(multiSession, /roadmap\.md/);
  assert.match(multiSession, /learnings\.md/);
  assert.match(multiSession, /Session plans are self-contained/);
  assert.ok(!/roadmap\.html/.test(multiSession), 'roadmap.html reference should be removed');
  assert.ok(!/learnings\.html/.test(multiSession), 'learnings.html reference should be removed');
});

test('multi-session-plans.md documents the four-part learnings log entry', () => {
  for (const part of ['What happened', 'Deviations', 'Surprises', 'Follow-ups']) {
    assert.ok(multiSession.includes(part), `missing learnings part: ${part}`);
  }
});

test('every sibling Markdown file writing-plans points at exists', () => {
  const pointers = [...skill.matchAll(/`([a-z0-9-]+\.md)`/g)].map((m) => m[1]);
  assert.ok(pointers.length > 0, 'expected SKILL.md to reference sibling docs');
  for (const name of pointers) {
    assert.ok(existsSync(`${DIR}/${name}`), `SKILL.md points at missing file: ${name}`);
  }
});
