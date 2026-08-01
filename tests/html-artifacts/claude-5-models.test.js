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
  for (const id of ['claude-haiku-4-5', 'claude-sonnet-5', 'claude-opus-5', 'claude-fable-5']) {
    assert.ok(tiers.includes(id), `missing model id: ${id}`);
  }
  assert.match(tiers, /Claude Opus 5 is the default "most capable" tier/);
});

test('the mapping keeps Fable 5 as an escalation, not the default', () => {
  assert.match(tiers, /only when Opus 5 has actually failed/);
  assert.match(tiers, /zero data retention/);
});

test('the mapping records the Claude 5 dispatch-prompt shifts', () => {
  assert.match(tiers, /Don't add verification instructions/);
  assert.match(tiers, /Don't add "delegate more" guidance/);
  assert.match(tiers, /Never tell a reviewer to report only high-severity findings/);
  assert.match(tiers, /too prescriptive/);
});
