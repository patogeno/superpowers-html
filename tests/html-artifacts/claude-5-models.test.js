import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const DIR = 'skills/subagent-driven-development';
const skill = readFileSync(`${DIR}/SKILL.md`, 'utf8');
const tiers = readFileSync(`${DIR}/claude-5-models.md`, 'utf8');

test('SKILL.md keeps Model Selection vendor-neutral and points at the mapping', () => {
  assert.match(skill, /## Model Selection/);
  // The neutral vocabulary is upstream's and must survive — other harnesses rely on it.
  for (const tier of ['cheap model', 'standard model', 'most capable model']) {
    assert.ok(skill.includes(tier), `Model Selection lost the neutral tier: ${tier}`);
  }
  assert.match(skill, /claude-5-models\.md/, 'SKILL.md must point at the tier mapping');
  assert.ok(existsSync(`${DIR}/claude-5-models.md`), 'the pointed-at mapping must exist');
});

test('the mapping covers every neutral tier with a current Claude model', () => {
  for (const id of ['claude-haiku-4-5', 'claude-sonnet-5-5', 'claude-opus-5-5', 'claude-fable-5-1']) {
    assert.ok(tiers.includes(id), `missing model id: ${id}`);
  }
  assert.match(tiers, /Claude Opus 5\.5 is the default "most capable" tier/);
});

test('the mapping keeps Fable 5.1 as an escalation, not the default', () => {
  assert.match(tiers, /only when Opus 5\.5 has actually failed/);
  assert.match(tiers, /zero data retention/);
});

test('the mapping records the Claude 5 dispatch-prompt shifts', () => {
  assert.match(tiers, /Don't add verification instructions/);
  assert.match(tiers, /Don't add "delegate more" guidance/);
  assert.match(tiers, /Never tell a reviewer to report only high-severity findings/);
  assert.match(tiers, /too prescriptive/);
});

test('the mapping says to steer thinking with effort, not prompt text', () => {
  assert.match(tiers, /effort/i);
  assert.match(tiers, /`medium`/);
  assert.match(tiers, /Haiku 4\.5.*effort/s);
});

const authoring = 'skills/writing-skills/claude-5-skill-authoring.md';

test('writing-skills points at the Claude 5 skill-authoring reference', () => {
  const ws = readFileSync('skills/writing-skills/SKILL.md', 'utf8');
  assert.match(ws, /claude-5-skill-authoring\.md/);
  assert.ok(existsSync(authoring), 'the pointed-at reference must exist');
});

test('the authoring reference cites official sources and covers the key shifts', () => {
  const ref = readFileSync(authoring, 'utf8');
  assert.match(ref, /platform\.claude\.com\/docs/);
  for (const topic of [/emphasis/i, /reason/i, /scope/i, /verif/i, /effort/i, /trigger text|description/i]) {
    assert.match(ref, topic);
  }
});
