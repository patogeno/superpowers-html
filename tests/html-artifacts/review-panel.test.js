import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const DIR = 'skills/subagent-driven-development';
const PANEL = `${DIR}/references/review-panel.md`;

test('SDD points at the review panel, read only when Review is panel', () => {
  const skill = readFileSync(`${DIR}/SKILL.md`, 'utf8');
  assert.match(skill, /references\/review-panel\.md/);
  assert.match(skill, /Review: panel|Review is panel/);
  assert.ok(Buffer.byteLength(skill) < 20000, 'SDD must stay under the compaction cut');
});

test('the panel covers distinct lenses, per task and for the final review, merged by the lead', () => {
  assert.ok(existsSync(PANEL));
  const panel = readFileSync(PANEL, 'utf8');
  for (const lens of [/user experience/i, /correctness/i, /security/i, /tests/i]) assert.match(panel, lens);
  assert.match(panel, /per task|each task/i);
  assert.match(panel, /final/i);
  assert.match(panel, /merge|dedupe|combine/i);
});
