import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const DIR = 'skills/running-multi-session-plans';
const read = (p) => readFileSync(`${DIR}/${p}`, 'utf8');
const skill = existsSync(`${DIR}/SKILL.md`) ? read('SKILL.md') : '';
const fm = (skill.match(/^---\r?\n([\s\S]*?)\r?\n---/) || [])[1] || '';

test('frontmatter triggers on running a roadmap and on "continue the roadmap"', () => {
  assert.match(fm, /name:\s*running-multi-session-plans/);
  assert.match(fm, /description:\s*["']?Use when/);
  assert.match(fm, /roadmap/i);
  assert.match(fm, /continue/i);
  assert.ok(fm.length <= 1024);
});

test('a run starts staged and switches both ways on plain words', () => {
  assert.match(skill, /staged/);
  assert.match(skill, /autonomous/);
  assert.match(skill, /go autonomous until it's done/i);
  assert.match(skill, /stop after this session/i);
  assert.match(skill, /run log/i);
});

test('each session gets a fresh lead that reads only its listed learnings and the feedback', () => {
  assert.match(skill, /fresh/i);
  assert.match(skill, /references\/session-lead-prompt\.md/);
  assert.match(skill, /Read learnings/);
  assert.match(skill, /feedback\.md/);
});

test('a fresh session resumes at the first unfinished session from the run log', () => {
  assert.match(skill, /resume/i);
  assert.match(skill, /first (session|unfinished)[^.]*(not|un)finished|first unfinished/i);
});

test('outward or hard-to-undo actions are parked in either mode', () => {
  for (const action of [/push/i, /deploy/i, /delet/i, /publish/i, /send/i]) assert.match(skill, action);
  assert.match(skill, /park/i);
  assert.match(skill, /either mode|in both modes|staged or autonomous/i);
});

test('calls are the easiest to undo, flagged, with a second opinion when hard', () => {
  assert.match(skill, /easiest to undo/i);
  assert.match(skill, /references\/second-opinion\.md/);
  const second = read('references/second-opinion.md');
  assert.match(second, /two fresh agents/i);
  assert.match(second, /argue/i);
  assert.match(second, /undo/i);
});

test('one report per roadmap, republished after every session', () => {
  assert.match(skill, /templates\/report\.html/);
  assert.match(skill, /same (link|path)/i);
  assert.match(skill, /after every session|after each session/i);
});

test('works without subagents: run each session here, suggest a fresh session between them', () => {
  assert.match(skill, /without a subagent tool|no subagent tool/i);
});

test('the lead prompt never does outward actions and returns a fixed summary', () => {
  const lead = read('references/session-lead-prompt.md');
  assert.match(lead, /push/i);
  assert.match(lead, /Current truths/);
  for (const field of ['Built', 'Calls', 'Parked', 'Learnings', 'Next']) {
    assert.match(lead, new RegExp(`${field}:`), `summary field ${field}`);
  }
});

test('the skill stays under the compaction cut', () => {
  assert.ok(Buffer.byteLength(skill) < 20000);
});
