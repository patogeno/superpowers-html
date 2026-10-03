import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const skill = readFileSync('skills/brainstorming/SKILL.md', 'utf8');

test('brainstorming references html-artifacts as a REQUIRED SUB-SKILL', () => {
  assert.match(skill, /REQUIRED SUB-SKILL/);
  assert.match(skill, /html-artifacts/);
});

test('brainstorming writes the spec as HTML, not Markdown', () => {
  assert.match(skill, /specs\/YYYY-MM-DD-<topic>-design\.html/);
  assert.ok(!/-design\.md\b/.test(skill),
    'must not still instruct writing the spec as .md');
});

test('brainstorming references the spec template and self-containment', () => {
  assert.match(skill, /templates\/spec\.html/);
  assert.match(skill, /self-contained/i);
});

test('brainstorming emphasizes inline SVG diagrams and tables in the spec', () => {
  assert.match(skill, /<svg>/);
  assert.match(skill, /<table>/);
});

// The written spec is the last human gate before implementation; the plan is
// accepted by default. So the design stage carries the visual weight.

test('architectural path: spec approval is the last gate, plan review is not required', () => {
  const gate = skill.slice(skill.indexOf('<HARD-GATE>'), skill.indexOf('</HARD-GATE>'));
  assert.ok(!/reviews the written implementation plan/.test(gate),
    'plan review should no longer be a gate');
  assert.match(gate, /last human gate|last gate/i);
  assert.match(gate, /design issue/i);
});

test('the spec review request tells the partner it is the last checkpoint', () => {
  assert.match(skill, /last checkpoint before implementation/i);
});

test('every spec carries an architecture diagram and a data-flow diagram', () => {
  assert.match(skill, /architecture diagram/i);
  assert.match(skill, /data-flow diagram/i);
});

test('UI-facing architectural work gets a mockup per key screen by default', () => {
  assert.match(skill, /mockup for each key screen/i);
});
