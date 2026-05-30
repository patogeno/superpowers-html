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
