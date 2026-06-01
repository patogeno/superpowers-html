# Markdown Plans + Subagents-vs-Team Execution Model — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Revert the `writing-plans` HTML plan view back to canonical Markdown (keeping brainstorming's HTML spec), express the kept multi-session triage as Markdown files, and add an up-front execution-model choice between sequential subagents and a team of per-plan-inferred specialists.

**Architecture:** Five sequential file-level changes. First strip the now-unsupported plan-view validators and templates and their tests (the `sp-task-state` sync contract that execution skills never honored), then trim `html-artifacts` to the design-spec path only, then rewrite `writing-plans/SKILL.md` to the new behavior guarded by a rewritten content test, then fix the README. Each task leaves `npm run test:html` green and ends in a commit.

**Tech Stack:** Markdown skill content, a zero-dependency Node ES-module validator (`tests/html-artifacts/validate.js`), and `node --test` (`npm run test:html`).

**Execution:** Sequential subagents.

**Reference spec:** `docs/superpowers/specs/2026-06-01-md-plans-subagents-vs-team-design.html`

---

## Context every task needs

- Run all tests from the repo root with: `npm run test:html` (which runs `node --test tests/html-artifacts/*.test.js`).
- The validator module is an ES module; `tests/*.test.js` import **named** exports from it. In ES modules, importing a name the module does not export is a load-time `SyntaxError` — so whenever you remove an exported function, you must remove its imports in the same task, or the whole suite fails to load.
- **Kept and must stay green, do not touch:** `tests/html-artifacts/brainstorming.test.js`, `spec-example.test.js`, `stylesheet.test.js`, and `skills/html-artifacts/stylesheet.css`, `skills/html-artifacts/templates/spec.html`, `skills/brainstorming/SKILL.md`.
- Commit messages use Conventional Commits. End each commit message body with the trailer:
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`

---

## File Structure

| File | Responsibility | Change |
|---|---|---|
| `tests/html-artifacts/validate.js` | Zero-dep validators | Remove the 3 plan-view-only helpers |
| `tests/html-artifacts/validate.test.js` | Unit tests for validators | Remove tests for the 3 removed helpers |
| `tests/html-artifacts/plan-view.test.js` | Plan-view sync test | Delete |
| `skills/html-artifacts/templates/plan.html`, `roadmap.html`, `learnings.html` | Plan/multi-session HTML templates | Delete |
| `tests/html-artifacts/templates.test.js` | Template self-containment tests | Rewrite to spec-only + assert others gone |
| `skills/html-artifacts/SKILL.md` | html-artifacts skill | Trim to design-spec only |
| `skills/html-artifacts/references/authoring.md` | Authoring reference | Remove task-state mirror section |
| `tests/html-artifacts/skill.test.js` | html-artifacts content test | Update template + authoring assertions |
| `skills/writing-plans/SKILL.md` | writing-plans skill | Revert to MD + add execution model |
| `tests/html-artifacts/writing-plans.test.js` | writing-plans content test | Rewrite to new contract |
| `README.md` | Project README | Correct plan/multi-session claims |

---

### Task 1: Remove the plan-view validators and their tests

**Files:**
- Delete: `tests/html-artifacts/plan-view.test.js`
- Modify: `tests/html-artifacts/validate.test.js`
- Modify: `tests/html-artifacts/validate.js`

The `extractMarkdownCheckboxes` / `extractHtmlTaskState` / `taskStateMatches` helpers exist only to keep the HTML plan view in sync with the Markdown — a contract being reverted. Remove the tests that reference them (and the file that only tests the plan view) before removing the helpers, so the suite never imports a missing export.

- [ ] **Step 1: Delete the plan-view test file**

```bash
git rm tests/html-artifacts/plan-view.test.js
```

- [ ] **Step 2: Trim `validate.test.js` to drop the removed helpers**

Replace the entire contents of `tests/html-artifacts/validate.test.js` with:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  findExternalRefs,
  inlineStylesheet, findUnreplacedMarkers,
  findSpecDeficiencies,
} from './validate.js';

test('findExternalRefs: clean self-contained HTML has none', () => {
  const html = `<!DOCTYPE html><html><head><style>body{color:red}</style></head>
    <body><a href="#section">jump</a><a href="https://example.com">link text</a>
    <img src="data:image/png;base64,AAAA"></body></html>`;
  assert.deepEqual(findExternalRefs(html), []);
});

test('findExternalRefs: flags external script, stylesheet link, image, and css url', () => {
  const html = `<link rel="stylesheet" href="https://cdn.test/x.css">
    <script src="https://cdn.test/x.js"></script>
    <img src="//cdn.test/a.png">
    <style>@import url(https://cdn.test/f.css); body{background:url('http://cdn.test/b.png')}</style>`;
  const refs = findExternalRefs(html);
  assert.ok(refs.some(r => r.includes('https://cdn.test/x.css')));
  assert.ok(refs.some(r => r.includes('https://cdn.test/x.js')));
  assert.ok(refs.some(r => r.includes('//cdn.test/a.png')));
  assert.ok(refs.some(r => r.includes('https://cdn.test/f.css')));
  assert.ok(refs.some(r => r.includes('http://cdn.test/b.png')));
  assert.equal(refs.length, 5);
});

test('findExternalRefs: flags bare-string @import', () => {
  assert.equal(findExternalRefs(`<style>@import "https://cdn.test/x.css";</style>`).length, 1);
});

test('findExternalRefs: @import with multiple spaces before url() is counted once', () => {
  assert.equal(findExternalRefs(`<style>@import   url(https://cdn.test/x.css);</style>`).length, 1);
});

test('inlineStylesheet replaces the marker and removes it', () => {
  const tpl = `<style>/* INLINE_STYLESHEET */</style>`;
  const out = inlineStylesheet(tpl, 'body{color:#000}');
  assert.ok(out.includes('body{color:#000}'));
  assert.deepEqual(findUnreplacedMarkers(out), []);
});

test('findUnreplacedMarkers flags a leftover marker', () => {
  assert.equal(findUnreplacedMarkers('<style>/* INLINE_STYLESHEET */</style>').length, 1);
});

test('findSpecDeficiencies: a spec with an inline svg and a table has none', () => {
  const html = `<svg viewBox="0 0 10 10"><rect width="10" height="10"/></svg>
    <table><thead><tr><th>a</th></tr></thead><tbody><tr><td>b</td></tr></tbody></table>`;
  assert.deepEqual(findSpecDeficiencies(html), []);
});

test('findSpecDeficiencies: flags a missing diagram and a missing table', () => {
  assert.deepEqual(findSpecDeficiencies('<p>prose only, no visuals</p>'),
    ['no inline <svg> diagram', 'no <table>']);
});

test('findSpecDeficiencies: flags only the missing one', () => {
  assert.deepEqual(findSpecDeficiencies('<svg><rect/></svg><p>no table</p>'),
    ['no <table>']);
});
```

- [ ] **Step 3: Run the suite to confirm it is green with the helpers still defined but no longer tested**

Run: `npm run test:html`
Expected: PASS (the `extractMarkdownCheckboxes` / `taskStateMatches` / `extractHtmlTaskState` tests are gone; no test imports them anymore).

- [ ] **Step 4: Remove the three plan-view helpers from `validate.js`**

Replace the entire contents of `tests/html-artifacts/validate.js` with:

```javascript
// Zero-dependency validators for superpowers-html artifacts.
// "External ref" = a resource the browser would LOAD from off-document
// (script/img/iframe/source src, <link href>, CSS url()/@import) over
// http(s) or protocol-relative URLs. Plain <a href> hyperlinks and data:
// URIs are allowed — they do not break self-containment.
const EXTERNAL = [
  /\bsrc\s*=\s*["'](?:https?:\/\/|\/\/)[^"']*/gi,         // script/img/iframe/source
  /\bsrcset\s*=\s*["'][^"']*?(?:https?:\/\/|\/\/)[^"']*/gi,
  /<link\b[^>]*\bhref\s*=\s*["'](?:https?:\/\/|\/\/)[^"']*/gi,
  /@import\s+(?:url\()?["']?(?:https?:\/\/|\/\/)[^"')]*/gi,
  // The (?<!@import\s+) lookbehind assumes one or more spaces between @import
  // and url( (the normal/formatted case), so the prior @import rule already
  // counted it — this avoids double-counting that same ref here.
  /(?<!@import\s+)url\(\s*["']?(?:https?:\/\/|\/\/)[^"')]*/gi,
];

export function findExternalRefs(html) {
  const refs = [];
  for (const re of EXTERNAL) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(html)) !== null) refs.push(m[0]);
  }
  return refs;
}

const MARKER = '/* INLINE_STYLESHEET */';

export function inlineStylesheet(templateHtml, css) {
  return templateHtml.split(MARKER).join(css);
}

export function findUnreplacedMarkers(html) {
  return html.includes(MARKER) ? [MARKER] : [];
}

// Spec-quality check: a human-facing design spec should be visual — at least
// one hand-authored inline <svg> diagram and one semantic <table>. Returns a
// list of human-readable deficiencies; empty means it qualifies.
export function findSpecDeficiencies(html) {
  const out = [];
  if (!/<svg[\s>]/i.test(html)) out.push('no inline <svg> diagram');
  if (!/<table[\s>]/i.test(html)) out.push('no <table>');
  return out;
}
```

- [ ] **Step 5: Run the suite to confirm it is still green**

Run: `npm run test:html`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add tests/html-artifacts/validate.js tests/html-artifacts/validate.test.js
git commit -m "$(cat <<'EOF'
refactor(html-artifacts): drop plan-view task-state validators

Remove extractMarkdownCheckboxes/extractHtmlTaskState/taskStateMatches and
their tests; the HTML plan view they enforced is being reverted to Markdown.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Delete the plan/roadmap/learnings templates and update the template test

**Files:**
- Delete: `skills/html-artifacts/templates/plan.html`, `skills/html-artifacts/templates/roadmap.html`, `skills/html-artifacts/templates/learnings.html`
- Modify: `tests/html-artifacts/templates.test.js`

`templates.test.js` reads those template files directly, so it must be rewritten in the same task as the deletion. The spec template (`spec.html`) stays.

- [ ] **Step 1: Delete the three orphaned templates**

```bash
git rm skills/html-artifacts/templates/plan.html skills/html-artifacts/templates/roadmap.html skills/html-artifacts/templates/learnings.html
```

- [ ] **Step 2: Rewrite `templates.test.js` to cover only the spec template and assert the others are gone**

Replace the entire contents of `tests/html-artifacts/templates.test.js` with:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { findExternalRefs, inlineStylesheet, findUnreplacedMarkers } from './validate.js';

const css = readFileSync('skills/html-artifacts/stylesheet.css', 'utf8');
const tpl = readFileSync('skills/html-artifacts/templates/spec.html', 'utf8');

test('spec template carries the stylesheet marker', () => {
  assert.equal(findUnreplacedMarkers(tpl).length, 1);
});

test('spec template has no external refs before or after inlining', () => {
  assert.deepEqual(findExternalRefs(tpl), []);
  const inlined = inlineStylesheet(tpl, css);
  assert.deepEqual(findExternalRefs(inlined), []);
  assert.deepEqual(findUnreplacedMarkers(inlined), []);
});

test('spec template is a full HTML document', () => {
  assert.match(tpl, /<!DOCTYPE html>/i);
  assert.match(tpl, /<html[ >]/i);
});

test('the reverted plan/roadmap/learnings templates are gone', () => {
  for (const name of ['plan', 'roadmap', 'learnings']) {
    assert.ok(!existsSync(`skills/html-artifacts/templates/${name}.html`),
      `${name}.html should have been removed`);
  }
});
```

- [ ] **Step 3: Run the suite to confirm green**

Run: `npm run test:html`
Expected: PASS. (`skill.test.js` still passes here: it asserts SKILL.md *text* references the templates, which is still true until Task 3.)

- [ ] **Step 4: Commit**

```bash
git add tests/html-artifacts/templates.test.js
git commit -m "$(cat <<'EOF'
refactor(html-artifacts): remove plan/roadmap/learnings HTML templates

These backed the reverted plan view and HTML multi-session structure. Keep
spec.html; templates.test.js now covers the spec template and asserts the
removed templates are gone.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Trim the html-artifacts skill to the design-spec path

**Files:**
- Modify: `skills/html-artifacts/SKILL.md`
- Modify: `skills/html-artifacts/references/authoring.md`
- Modify: `tests/html-artifacts/skill.test.js`

The skill now only produces the brainstorming design spec. Drop the plan/roadmap/learnings template rules, the task-state mirror rule, and the task-state mirror section of the authoring reference. Keep self-containment, inlining, and diagram guidance.

- [ ] **Step 1: Replace `skills/html-artifacts/SKILL.md` with the spec-only version**

Replace the entire contents of `skills/html-artifacts/SKILL.md` with:

````markdown
---
name: html-artifacts
description: Use when producing a human-facing HTML design spec in the brainstorming workflow — a self-contained, navigable spec with inline SVG diagrams and tables.
---

# Authoring HTML Artifacts

Produce **self-contained, zero-dependency HTML** that a human enjoys reading and navigating. The artifact must be a single, sendable HTML file — no build step, no network dependencies.

**When NOT to use:** plain conversational replies or short Markdown snippets don't need a template — and implementation plans are authored as canonical **Markdown**, not HTML. Only the formal design **spec** is an HTML artifact.

## Rules

1. **Start from the spec template:** `templates/spec.html` — design spec (diagrams + tables).
2. **Inline the stylesheet.** Replace the `/* INLINE_STYLESHEET */` marker with the full contents of `stylesheet.css`. Never link it externally.
3. **Stay self-contained.** No external scripts, stylesheets, fonts, or images. No CDNs. Plain `<a href>` hyperlinks are fine; embed images as `data:` URIs only if essential.
4. **Diagrams are hand-authored inline SVG** (or CSS boxes), themed with the stylesheet's classes (`.fig`, `.nlabel`, `.edge`). Never use a diagram library. See `references/authoring.md`.
5. **Tables** use plain semantic `<table>` markup.

## Reference

- Detailed conventions and diagram recipes: `references/authoring.md`
- Canonical styles: `stylesheet.css`
````

- [ ] **Step 2: Replace `skills/html-artifacts/references/authoring.md` with the version without the task-state mirror**

Replace the entire contents of `skills/html-artifacts/references/authoring.md` with:

```markdown
# HTML Artifact Authoring Reference

## Self-containment
The artifact must open correctly from `file://` with no network. Concretely: no
`<script src>`, `<link rel=stylesheet>`, `<img src=http...>`, `@import url(http...)`,
or `url(http...)`. The validator `tests/html-artifacts/validate.js` (`findExternalRefs`)
encodes this rule.

## Inlining the stylesheet
Read `stylesheet.css` and replace the template's `/* INLINE_STYLESHEET */` marker
with its full contents. After this, `findUnreplacedMarkers` must return empty.

## Diagrams (inline SVG)
Draw architecture/flow diagrams as inline `<svg>` inside a `<div class="fig">` with a
`<div class="fig-cap">` caption. Use `viewBox` for responsiveness. Theme nodes/edges
with the `.nlabel`, `.nsub`, and `.edge` classes plus CSS variables (`var(--accent)`,
`var(--success)`) so they adapt to light/dark. Define an arrowhead `<marker>` once per svg.
```

- [ ] **Step 3: Update `skill.test.js` for the spec-only skill**

Replace the entire contents of `tests/html-artifacts/skill.test.js` with:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const skill = readFileSync('skills/html-artifacts/SKILL.md', 'utf8');

function frontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(m, 'SKILL.md must start with YAML frontmatter');
  return m[1];
}

test('frontmatter has name=html-artifacts and a "Use when" description', () => {
  const fm = frontmatter(skill);
  assert.match(fm, /name:\s*html-artifacts/);
  assert.match(fm, /description:\s*["']?Use when/i);
});

test('frontmatter stays within the 1024-char budget', () => {
  assert.ok(frontmatter(skill).length <= 1024);
});

test('SKILL.md references the stylesheet and the spec template', () => {
  assert.ok(skill.includes('stylesheet.css'));
  assert.ok(skill.includes('templates/spec.html'));
});

test('SKILL.md no longer references the reverted plan/roadmap/learnings templates', () => {
  for (const t of ['plan.html', 'roadmap.html', 'learnings.html']) {
    assert.ok(!skill.includes(`templates/${t}`), `should not reference ${t}`);
  }
});

test('SKILL.md documents the core conventions', () => {
  assert.match(skill, /self-contained/i);
  assert.match(skill, /INLINE_STYLESHEET/);
  assert.match(skill, /SVG/);
  assert.ok(skill.includes('references/authoring.md'));
});

test('authoring reference exists and no longer documents the task-state mirror', () => {
  const ref = readFileSync('skills/html-artifacts/references/authoring.md', 'utf8');
  assert.match(ref, /self-contain/i);
  assert.ok(!/sp-task-state/.test(ref), 'task-state mirror section should be removed');
});
```

- [ ] **Step 4: Run the suite to confirm green**

Run: `npm run test:html`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add skills/html-artifacts/SKILL.md skills/html-artifacts/references/authoring.md tests/html-artifacts/skill.test.js
git commit -m "$(cat <<'EOF'
refactor(html-artifacts): scope the skill to the design spec only

Drop plan/roadmap/learnings template rules and the task-state mirror; keep
the self-contained spec + diagram guidance. Tests updated to match.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Revert writing-plans to Markdown and add the execution-model choice

**Files:**
- Modify: `tests/html-artifacts/writing-plans.test.js`
- Modify: `skills/writing-plans/SKILL.md`

Write the new content test first (it will fail against the current HTML-era skill), then rewrite the skill to satisfy it. The new skill: Markdown-only canonical plan, Markdown multi-session structure, an up-front "Execution Model" choice (sequential subagents vs team of specialists), a "Team Plan Structure" section, and a branched execution handoff.

- [ ] **Step 1: Rewrite `writing-plans.test.js` to assert the new contract**

Replace the entire contents of `tests/html-artifacts/writing-plans.test.js` with:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const skill = readFileSync('skills/writing-plans/SKILL.md', 'utf8');

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

test('writing-plans documents the team plan structure with specialists and dependencies', () => {
  assert.match(skill, /## Team Plan Structure/);
  assert.match(skill, /Work-streams/);
  assert.match(skill, /Specialist/);
  assert.match(skill, /depend/i);
});

test('writing-plans branches the execution handoff to the right sub-skills', () => {
  assert.match(skill, /subagent-driven-development/);
  assert.match(skill, /executing-plans/);
  assert.match(skill, /dispatching-parallel-agents/);
});

test('writing-plans keeps the multi-session structure in Markdown', () => {
  assert.match(skill, /multi-session/i);
  assert.match(skill, /docs\/superpowers\/plans\/<feature>\//);
  assert.match(skill, /roadmap\.md/);
  assert.match(skill, /learnings\.md/);
  assert.ok(!/roadmap\.html/.test(skill), 'roadmap.html reference should be removed');
  assert.ok(!/learnings\.html/.test(skill), 'learnings.html reference should be removed');
});

test('writing-plans documents the four-part learnings log entry', () => {
  for (const part of ['What happened', 'Deviations', 'Surprises', 'Follow-ups']) {
    assert.ok(skill.includes(part), `missing learnings part: ${part}`);
  }
});

test('writing-plans requires session plans to be self-contained', () => {
  assert.match(skill, /Session plans are self-contained/);
});
```

- [ ] **Step 2: Run the test to confirm it fails against the current skill**

Run: `npm run test:html`
Expected: FAIL — the current `writing-plans/SKILL.md` still contains `## HTML Plan View`, `sp-task-state`, `templates/plan.html`, etc., and has no `## Execution Model` / `## Team Plan Structure` sections.

- [ ] **Step 3: Rewrite `skills/writing-plans/SKILL.md`**

Replace the entire contents of `skills/writing-plans/SKILL.md` with:

`````markdown
---
name: writing-plans
description: Use when you have a spec or requirements for a multi-step task, before touching code
---

# Writing Plans

## Overview

Write comprehensive implementation plans assuming the engineer has zero context for our codebase and questionable taste. Document everything they need to know: which files to touch for each task, code, testing, docs they might need to check, how to test it. Give them the whole plan as bite-sized tasks. DRY. YAGNI. TDD. Frequent commits.

Assume they are a skilled developer, but know almost nothing about our toolset or problem domain. Assume they don't know good test design very well.

**Announce at start:** "I'm using the writing-plans skill to create the implementation plan."

**Context:** If working in an isolated worktree, it should have been created via the `superpowers:using-git-worktrees` skill at execution time.

**Save plans to:** `docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md` — this Markdown plan is **canonical** and is the single source of truth. Execution skills read and tick its checkboxes directly.
- (User preferences for plan location override this default)

## Scope Check

If the spec covers multiple independent subsystems, it should have been broken into sub-project specs during brainstorming. If it wasn't, suggest breaking this into separate plans — one per subsystem. Each plan should produce working, testable software on its own.

## Execution Model

**Choose the execution model up front, before writing tasks** — ask your human partner which fits the work, because it changes the shape of the plan:

**1. Sequential subagents (default)** — a fresh subagent implements one task at a time, with review between tasks. Produces a plain ordered plan (the task structure below). Best when tasks are coupled or must run in a fixed order.

**2. Team of specialists** — multiple specialized agents work concurrently on independent tasks. Produces a plan organized into parallel work-streams with an explicit dependency graph and a specialist tag per task (see "Team Plan Structure"). Best when the work splits into independent domains that benefit from concurrency.

Record the chosen model in the plan header (`**Execution:**` line). This choice is **orthogonal** to the multi-session judgment below: a multi-session feature can have each session plan written in either shape.

## Multi-Session Plans

**Judge the scope first.** After the spec is approved, decide whether the work fits one session. If it spans multiple subsystems, or has more tasks than a single lead can carry while keeping its context healthy, produce a **multi-session structure**. Otherwise produce a single plan. This is your judgment — there is no manual knob.

When the work is multi-session, group everything in a per-feature folder of Markdown files:

```
docs/superpowers/plans/<feature>/
    roadmap.md            orders the sessions, their dependencies, status, and links
    session-01-<name>.md  canonical session plan (execution agents read this)
    session-02-<name>.md
    learnings.md          cross-session memory
```

- **Roadmap** (`roadmap.md`): orders the sessions, shows their dependencies and status, and links each session's plan. Insert intermediate or fix sessions here as they arise.
- **Session plans are self-contained.** A fresh lead must be able to execute a session by reading only *that* session's plan plus the learnings log — restate the minimal context each session needs. Each session plan is a normal canonical Markdown plan written in the chosen execution-model shape.
- **Learnings log** (`learnings.md`): cross-session memory. After each session, append an entry with four parts — **What happened**, **Deviations** (and why), **Surprises** (discoveries, gotchas, constraints found), and **Follow-ups** (new tasks/risks, which may trigger roadmap edits or a new session). The next lead reads this before starting.

## File Structure

Before defining tasks, map out which files will be created or modified and what each one is responsible for. This is where decomposition decisions get locked in.

- Design units with clear boundaries and well-defined interfaces. Each file should have one clear responsibility.
- You reason best about code you can hold in context at once, and your edits are more reliable when files are focused. Prefer smaller, focused files over large ones that do too much.
- Files that change together should live together. Split by responsibility, not by technical layer.
- In existing codebases, follow established patterns. If the codebase uses large files, don't unilaterally restructure - but if a file you're modifying has grown unwieldy, including a split in the plan is reasonable.

This structure informs the task decomposition. Each task should produce self-contained changes that make sense independently.

## Bite-Sized Task Granularity

**Each step is one action (2-5 minutes):**
- "Write the failing test" - step
- "Run it to make sure it fails" - step
- "Implement the minimal code to make the test pass" - step
- "Run the tests and make sure they pass" - step
- "Commit" - step

## Plan Document Header

**Every plan MUST start with this header:**

```markdown
# [Feature Name] Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: implement this plan task-by-task with the sub-skill named under "Execution Handoff" — superpowers:subagent-driven-development (recommended) or superpowers:executing-plans for a sequential plan, superpowers:dispatching-parallel-agents for a team plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** [One sentence describing what this builds]

**Architecture:** [2-3 sentences about approach]

**Tech Stack:** [Key technologies/libraries]

**Execution:** [Sequential subagents | Team of specialists]

---
```

## Team Plan Structure

When the chosen model is **team of specialists**, structure the plan so a dispatcher can run specialists concurrently:

- **Work-streams section (up front).** Before the tasks, list each work-stream: a short name, the specialist role it needs, the tasks it owns, and the work-streams it depends on. This is the dependency graph — a dispatcher runs all dependency-free streams in the first wave, then the next wave as dependencies clear.
- **Specialists are inferred per plan.** There is no fixed taxonomy. Derive the roles the work actually needs from the task content (for example: a DB-migration specialist, an API specialist, a React specialist) and tag each task with a `**Specialist:** <role>` line under its `**Files:**` block.
- **Tasks stay bite-sized and independently testable** (same structure as below). Tasks within one stream are ordered; tasks across independent streams are not.

Example work-streams section:

```markdown
## Work-streams

- **Stream A — Schema** (Specialist: DB-migration) — Tasks 1–2. Depends on: none.
- **Stream B — API** (Specialist: backend) — Tasks 3–4. Depends on: Stream A.
- **Stream C — UI** (Specialist: React) — Tasks 5–6. Depends on: none.
```

## Task Structure

````markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

- [ ] **Step 1: Write the failing test**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/path/test.py::test_name -v`
Expected: FAIL with "function not defined"

- [ ] **Step 3: Write minimal implementation**

```python
def function(input):
    return expected
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/path/test.py::test_name -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/path/test.py src/path/file.py
git commit -m "feat: add specific feature"
```
````

## No Placeholders

Every step must contain the actual content an engineer needs. These are **plan failures** — never write them:
- "TBD", "TODO", "implement later", "fill in details"
- "Add appropriate error handling" / "add validation" / "handle edge cases"
- "Write tests for the above" (without actual test code)
- "Similar to Task N" (repeat the code — the engineer may be reading tasks out of order)
- Steps that describe what to do without showing how (code blocks required for code steps)
- References to types, functions, or methods not defined in any task

## Remember
- Exact file paths always
- Complete code in every step — if a step changes code, show the code
- Exact commands with expected output
- DRY, YAGNI, TDD, frequent commits

## Self-Review

After writing the complete plan, look at the spec with fresh eyes and check the plan against it. This is a checklist you run yourself — not a subagent dispatch.

**1. Spec coverage:** Skim each section/requirement in the spec. Can you point to a task that implements it? List any gaps.

**2. Placeholder scan:** Search your plan for red flags — any of the patterns from the "No Placeholders" section above. Fix them.

**3. Type consistency:** Do the types, method signatures, and property names you used in later tasks match what you defined in earlier tasks? A function called `clearLayers()` in Task 3 but `clearFullLayers()` in Task 7 is a bug.

If you find issues, fix them inline. No need to re-review — just fix and move on. If you find a spec requirement with no task, add the task.

## Execution Handoff

After saving the plan, hand off according to the execution model chosen up front.

**If Sequential subagents:**

> **"Plan complete and saved to `docs/superpowers/plans/<filename>.md`. Two execution options:**
>
> **1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration
>
> **2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints
>
> **Which approach?"**

- If Subagent-Driven chosen: **REQUIRED SUB-SKILL:** Use superpowers:subagent-driven-development — fresh subagent per task + two-stage review.
- If Inline Execution chosen: **REQUIRED SUB-SKILL:** Use superpowers:executing-plans — batch execution with checkpoints for review.

**If Team of specialists:**

- **REQUIRED SUB-SKILL:** Use superpowers:dispatching-parallel-agents.
- Dispatch one specialist agent per dependency-free work-stream as a wave; give each agent only its stream's tasks plus the minimal context it needs. Review each stream's work as it returns, then launch the next wave as its dependencies clear.
`````

- [ ] **Step 4: Run the suite to confirm the rewritten test now passes**

Run: `npm run test:html`
Expected: PASS (all `writing-plans.test.js` assertions satisfied; whole suite green).

- [ ] **Step 5: Commit**

```bash
git add skills/writing-plans/SKILL.md tests/html-artifacts/writing-plans.test.js
git commit -m "$(cat <<'EOF'
feat(writing-plans): revert to Markdown plans + add execution-model choice

Plans are canonical Markdown again (no HTML view, no sp-task-state mirror);
multi-session is roadmap.md/session-NN.md/learnings.md. Add an up-front
choice between sequential subagents and a team of per-plan-inferred
specialists, with a Team Plan Structure section and a branched handoff to
subagent-driven-development / executing-plans / dispatching-parallel-agents.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Correct the README

**Files:**
- Modify: `README.md`

The README still advertises the plan as HTML and the multi-session artifacts as HTML. Correct the fork blurb, the "What's added" bullets, the principles line, and the comparison table; add the new execution-model choice. There is no automated test for the README — verify by reading and by grepping for stale claims.

- [ ] **Step 1: Fix the top-of-file fork blurb**

In `README.md`, replace this blockquote line:

```markdown
> **This is `superpowers-html`** — a fork of [obra/superpowers](https://github.com/obra/superpowers) that makes the human-facing design **spec** and implementation **plan** render as rich, self-contained **HTML** (diagrams, tables, navigable task lists) instead of plain Markdown, and adds a multi-session workflow with a cross-session learnings log. The agent-only execution layer is unchanged. See [What this fork changes](#what-this-fork-changes-superpowers-html) and [how to install it](#this-fork-superpowers-html).
```

with:

```markdown
> **This is `superpowers-html`** — a fork of [obra/superpowers](https://github.com/obra/superpowers) that makes the human-facing design **spec** render as a rich, self-contained **HTML** document (diagrams, tables) instead of plain Markdown, adds a Markdown multi-session workflow with a cross-session learnings log, and lets you choose at planning time between sequential subagents and a team of specialized agents. The agent-only execution layer is unchanged. See [What this fork changes](#what-this-fork-changes-superpowers-html) and [how to install it](#this-fork-superpowers-html).
```

- [ ] **Step 2: Fix the "What's added" bullets**

In `README.md`, replace this block:

```markdown
- **A new `html-artifacts` skill** — one canonical, zero-dependency stylesheet plus HTML templates (spec, plan, roadmap, learnings) and authoring rules, with a small Node test suite that enforces self-containment. It's the shared design system every artifact inlines.
- **`brainstorming` emits an HTML design spec.** The spec is written to `…-design.html` (built from `templates/spec.html`) with at least one hand-authored inline **SVG** diagram and at least one semantic **table**, instead of `…-design.md`.
- **`writing-plans` emits an HTML plan _view_.** The Markdown plan stays **canonical** (execution skills read and tick it, unchanged); alongside it the skill renders a navigable HTML view from `templates/plan.html` carrying a machine-checkable `sp-task-state` mirror of the Markdown checkboxes.
- **A multi-session workflow.** For work too large for one session, `writing-plans` (by its own judgment) produces a per-feature folder with a **roadmap**, self-contained **session plans** (canonical Markdown + an HTML view each), and a cross-session **learnings log** (What happened · Deviations · Surprises · Follow-ups).
```

with:

```markdown
- **A new `html-artifacts` skill** — one canonical, zero-dependency stylesheet plus the spec HTML template and authoring rules, with a small Node test suite that enforces self-containment. It's the shared design system the design spec inlines.
- **`brainstorming` emits an HTML design spec.** The spec is written to `…-design.html` (built from `templates/spec.html`) with at least one hand-authored inline **SVG** diagram and at least one semantic **table**, instead of `…-design.md`.
- **`writing-plans` lets you choose an execution model.** Up front you pick **sequential subagents** (a fresh subagent per task, reviewed between tasks) or a **team of specialists** (independent work-streams with a dependency graph and a per-plan-inferred specialist per task, dispatched concurrently). The plan itself stays canonical **Markdown**.
- **A Markdown multi-session workflow.** For work too large for one session, `writing-plans` (by its own judgment) produces a per-feature folder of Markdown files: a **roadmap** (`roadmap.md`), self-contained **session plans** (`session-NN-<name>.md`), and a cross-session **learnings log** (`learnings.md` — What happened · Deviations · Surprises · Follow-ups).
```

- [ ] **Step 3: Fix the principles line**

In `README.md`, replace:

```markdown
**Principles:** every artifact is a single self-contained HTML file — no CDNs, no build step, no external resources; diagrams are hand-authored inline SVG; and the Markdown plan remains the source of truth wherever a machine reads it.
```

with:

```markdown
**Principles:** the design spec is a single self-contained HTML file — no CDNs, no build step, no external resources; diagrams are hand-authored inline SVG; and implementation plans stay canonical Markdown so execution skills read and tick them directly.
```

- [ ] **Step 4: Fix the comparison table**

In `README.md`, replace this table:

```markdown
| Artifact | Upstream | This fork |
|---|---|---|
| Design spec | Markdown | **HTML** (inline SVG + tables) |
| Implementation plan | Markdown | Markdown (canonical) **+ HTML view** |
| Multi-session roadmap / learnings log | — | **HTML** |
| Agent-only / execution skills | Markdown | unchanged |
```

with:

```markdown
| Artifact | Upstream | This fork |
|---|---|---|
| Design spec | Markdown | **HTML** (inline SVG + tables) |
| Implementation plan | Markdown | Markdown (canonical) |
| Multi-session roadmap / learnings log | — | **Markdown** |
| Execution model choice (sequential subagents / team of specialists) | — | **chosen at planning time** |
| Agent-only / execution skills | Markdown | unchanged |
```

- [ ] **Step 5: Verify no stale plan-HTML claims remain and tests still pass**

Run: `npm run test:html`
Expected: PASS.

Run: `grep -nE "HTML plan|plan _view_|plan view|roadmap\.html|learnings\.html|sp-task-state|HTML view each" README.md`
Expected: no output (all stale plan-HTML claims removed).

- [ ] **Step 6: Commit**

```bash
git add README.md
git commit -m "$(cat <<'EOF'
docs(readme): plans are Markdown again; document execution-model choice

Correct the fork blurb, the added-features bullets, the principles line, and
the comparison table to reflect Markdown plans + Markdown multi-session, and
the new sequential-subagents vs team-of-specialists choice.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Final verification (run after all tasks)

- [ ] **Full test suite green**

Run: `npm run test:html`
Expected: PASS, all files.

- [ ] **No dangling references to the reverted plan HTML in skills/tests/README**

Run: `grep -rnE "templates/(plan|roadmap|learnings)\.html|sp-task-state|taskStateMatches|HTML Plan View" skills/ tests/ README.md`
Expected: no output. (Matches inside `docs/superpowers/specs/` and `docs/plans/` are historical design records and are expected to remain.)
