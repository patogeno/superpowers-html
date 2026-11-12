import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const DIR = 'skills/brainstorming';
const skill = readFileSync(`${DIR}/SKILL.md`, 'utf8');
const section = (heading) => {
  const start = skill.indexOf(heading);
  assert.ok(start >= 0, `missing section ${heading}`);
  const next = skill.indexOf('\n## ', start + heading.length);
  return skill.slice(start, next < 0 ? undefined : next);
};
const gate = skill.slice(skill.indexOf('<HARD-GATE>'), skill.indexOf('</HARD-GATE>'));

// Upstream's rebuilt brainstorming is the base. These tests pin the fork's
// edits on top of it: the design doc is a layered HTML page, visuals are
// shown (published on Claude Code), and approving it is the last gate.

test('the written design is HTML authored with html-artifacts, never Markdown', () => {
  const written = section('## The Written Design');
  assert.match(written, /REQUIRED SUB-SKILL[^\n]*html-artifacts/);
  assert.match(written, /specs\/YYYY-MM-DD-<topic>\/index\.html/);
  assert.match(written, /prototype\.html/);
  assert.match(written, /specs\/YYYY-MM-DD-<topic>-design\.html/);
  assert.ok(!/-design\.md\b/.test(skill), 'must not still instruct writing the spec as .md');
});

test('the written design leads with the experience and folds the technical design', () => {
  const written = section('## The Written Design');
  for (const part of [/what users can do/i, /screens/i, /flows?/i]) assert.match(written, part);
  assert.match(written, /technical design/i);
  assert.match(written, /folded|collapsed|closed/i);
  assert.match(written, /architecture/i);
});

test('a project with screens gets a clickable prototype of each key screen', () => {
  assert.match(skill, /prototype/i);
  assert.match(skill, /each key screen/i);
});

test('showing it publishes with the Artifact tool when present, else writes local files', () => {
  const showing = section('## Showing It');
  assert.match(showing, /Artifact tool/);
  assert.match(showing, /references\/claude-code-artifacts\.md/);
  assert.match(showing, /local file|on disk|their paths/i);
  assert.match(showing, /same link|same path/i);
});

test('visuals are shown without an offer; the visual companion is gone', () => {
  assert.ok(!/## Visual Companion/.test(skill), 'Visual Companion section must be replaced');
  assert.ok(!/Want me to open a browser tab/.test(skill), 'no companion offer message');
  assert.ok(!/start-server|visual-companion\.md/.test(skill), 'the companion server is never started');
});

test('feedback reads artifact comments together with the chat note', () => {
  const showing = section('## Showing It');
  assert.match(showing, /comment/i);
  assert.match(showing, /chat/i);
});

test('untouched parts count as approved only on a go-ahead', () => {
  assert.match(skill, /go-ahead/i);
  assert.match(skill, /comments[^.]*(by itself|alone)[^.]*feedback, not approval/i);
});

test('approving the design doc and prototype is the last human gate', () => {
  assert.match(gate, /last human gate|last gate/i);
  assert.match(gate, /prototype/i);
  assert.match(gate, /design issue/i);
  assert.match(gate, /superpowers:writing-plans/);
});

test('the builder check reads the HTML design, its technical section and the prototype', () => {
  const prompt = readFileSync(`${DIR}/builder-check-prompt.md`, 'utf8');
  assert.match(prompt, /HTML/);
  assert.match(prompt, /technical design/i);
  assert.match(prompt, /prototype/i);
});

test('the visual-companion stub points at artifacts', () => {
  const stub = readFileSync(`${DIR}/visual-companion.md`, 'utf8');
  assert.match(stub, /retired/i);
  assert.match(stub, /Artifact tool/);
});

test('mid-conversation mockups are scratch pages; only the design doc and prototype are committed', () => {
  const showing = section('## Showing It');
  assert.match(showing, /scratch/i);
  assert.match(showing, /not committed|aren't committed/i);
});

test('a small change still gets a short design file, without forcing diagrams onto it', () => {
  const written = section('## The Written Design');
  assert.ok(!/goes straight to your human partner in chat/.test(written),
    'the short design is written down, not only said in chat');
  assert.match(written, /short design[^.]*-design\.html/i);
});
