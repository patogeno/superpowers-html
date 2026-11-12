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
  assert.match(multiSession, /Session plans are self-contained/);
  assert.ok(!/roadmap\.html/.test(multiSession), 'roadmap.html reference should be removed');
  assert.ok(!/learnings\.html/.test(multiSession), 'learnings.html reference should be removed');
});

test('learnings are split by topic with an index, current truths, and a feedback file', () => {
  assert.match(multiSession, /learnings\/index\.md/);
  assert.match(multiSession, /Current truths/);
  assert.match(multiSession, /feedback\.md/);
  assert.match(multiSession, /\*\*Read learnings:\*\*/, 'each session plan names the topics its lead reads');
  assert.match(multiSession, /150 lines/, 'a long topic file is condensed');
  assert.ok(!/^\s*learnings\.md\s/m.test(multiSession), 'the single learnings.md log is gone');
});

test('the roadmap records Run / Build / Review and a run log', () => {
  assert.match(multiSession, /\*\*Run:\*\*/);
  assert.match(multiSession, /\*\*Build:\*\*/);
  assert.match(multiSession, /\*\*Review:\*\*/);
  assert.match(multiSession, /run log/i);
  assert.match(multiSession, /staged/);
  assert.match(multiSession, /autonomous/);
});

test('a multi-session plan is run by running-multi-session-plans, starting staged', () => {
  const handoff = skill.slice(skill.indexOf('## Execution Handoff'));
  assert.match(handoff, /superpowers:running-multi-session-plans/);
  assert.match(handoff, /staged/);
  assert.match(handoff, /Run: .*Build: .*Review: /);
});

test('Build maps onto the execution models and Review offers a panel', () => {
  assert.match(skill, /one at a time/);
  assert.match(skill, /parallel/);
  assert.match(skill, /panel/);
  assert.match(skill, /\*\*Review:\*\*/);
});

test('the plan links the design and points UI tasks at prototype screens', () => {
  assert.match(skill, /\*\*Design:\*\*/);
  assert.match(skill, /Prototype: `[^`]*prototype\.html#/);
  assert.ok(!/mockup-<name>\.html/.test(skill), 'old per-mockup file convention should be gone');
});

test('every sibling Markdown file writing-plans points at exists', () => {
  const pointers = [...skill.matchAll(/`([a-z0-9-]+\.md)`/g)].map((m) => m[1]);
  assert.ok(pointers.length > 0, 'expected SKILL.md to reference sibling docs');
  for (const name of pointers) {
    assert.ok(existsSync(`${DIR}/${name}`), `SKILL.md points at missing file: ${name}`);
  }
});

// Plans are accepted by default: the human partner's review time goes into the
// design (spec + mockups), not the plan. The plan stops only for design issues.

test('the agent chooses the execution model and records why, instead of asking', () => {
  assert.ok(!/ask your human partner which fits the work/.test(skill),
    'execution model should no longer be an up-front question');
  assert.match(skill, /\*\*Execution:\*\* \[Sequential subagents \| Team of specialists\]/);
  assert.match(skill, /one-line reason/);
});

test('the execution handoff accepts the plan by default and starts executing', () => {
  const handoff = skill.slice(skill.indexOf('## Execution Handoff'));
  assert.match(handoff, /accepted by default/i);
  assert.ok(!/Please review the plan/.test(handoff), 'handoff must not ask for plan review by default');
  assert.ok(!/Which execution approach would you prefer/.test(handoff),
    'handoff must not ask the partner to pick a method by default');
});

test('the handoff stops only for design issues, and names them', () => {
  const handoff = skill.slice(skill.indexOf('## Execution Handoff'));
  assert.match(handoff, /design issue/i);
  for (const kind of [/ambigu/i, /contradict/i, /cannot be met|can't be met/i, /spec never made|spec did not make/i]) {
    assert.match(handoff, kind);
  }
});

test('the partner can opt back into the plan review gate', () => {
  const handoff = skill.slice(skill.indexOf('## Execution Handoff'));
  assert.match(handoff, /review the plan first/i);
});
