import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  inlineStylesheet, findUnreplacedMarkers, findExternalRefs, taskStateMatches,
} from './validate.js';

const css = readFileSync('skills/html-artifacts/stylesheet.css', 'utf8');
const tpl = readFileSync('skills/html-artifacts/templates/plan.html', 'utf8');

// Author a plan view the way writing-plans is supposed to: inline the
// stylesheet, then fill the empty sp-task-state mirror with the Markdown state.
function buildView(checkboxes) {
  return inlineStylesheet(tpl, css)
    .replace('{"checkboxes":[]}', JSON.stringify({ checkboxes }));
}

test('a plan view built from the template is self-contained and in sync with its Markdown', () => {
  const md = `- [x] **Step 1: write the failing test**\nsome prose\n- [ ] **Step 2: implement**`;
  const html = buildView([
    { checked: true, text: '**Step 1: write the failing test**' },
    { checked: false, text: '**Step 2: implement**' },
  ]);
  assert.deepEqual(findUnreplacedMarkers(html), []);
  assert.deepEqual(findExternalRefs(html), []);
  assert.equal(taskStateMatches(md, html), true);
});

test('taskStateMatches catches a plan view that has drifted from its Markdown', () => {
  const md = `- [ ] **Step 1: write the failing test**`;
  const html = buildView([
    { checked: true, text: '**Step 1: write the failing test**' },
  ]);
  assert.equal(taskStateMatches(md, html), false);
});
