# writing-plans → HTML Plan View + Multi-Session Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the `writing-plans` skill keep its Markdown plan canonical while additionally emitting a self-contained HTML *view* (built from `html-artifacts` `templates/plan.html`, with a `sp-task-state` block kept in sync with the Markdown checkboxes), and add an agent-judged multi-session workflow (roadmap, self-contained session plans, learnings log).

**Architecture:** Additive, surgical edits to one skill file plus new test coverage. `writing-plans/SKILL.md` gains two new sections — "HTML Plan View" and "Multi-Session Plans" — and a one-line note on the existing "Save plans to" block; nothing existing is rewritten. Two new test files in the existing zero-dependency `tests/html-artifacts/` suite: `writing-plans.test.js` pins the SKILL.md content invariants, and `plan-view.test.js` proves the authoring contract end-to-end by building a plan view from the real template + stylesheet and checking it against the existing validators (`taskStateMatches`, `findExternalRefs`, `findUnreplacedMarkers`). No new validator code is needed — Plan 1 already shipped every helper this requires.

**Tech Stack:** Node.js ≥18 built-ins only (`node:test`, `node:assert`, `node:fs`) — zero dependencies. Markdown skill files. Plain HTML/CSS (authored at plan-generation time, not in this plan).

**Conventions for the executor:**
- Repo root is the superpowers-html checkout. Run all commands **from the repo root** unless stated otherwise.
- The repo's root `package.json` has `"type": "module"`, so `.test.js` files under `tests/html-artifacts/` are ES modules — use `import`/`export`.
- `npm run test:html` runs `node --test tests/html-artifacts/*.test.js`, so new `*.test.js` files are auto-discovered.
- Use forward slashes in all paths inside skill/code files (project rule), even on Windows.
- **Do NOT** change agent-only skills (`executing-plans`, `subagent-driven-development`, TDD, etc.) and **do NOT** change the canonical Markdown plan format. Only `writing-plans`'s human-facing output behavior is extended. The HTML view mirrors the Markdown at authoring/regeneration time; this plan does not make execution skills auto-regenerate the view (they remain unchanged and keep reading the Markdown).
- All three required templates (`plan.html`, `roadmap.html`, `learnings.html`), the canonical `stylesheet.css`, and the validator already exist from Plan 1. This plan only edits `skills/writing-plans/SKILL.md` and adds tests.

---

### Task 1: `writing-plans` emits a synced HTML plan view

Surgical edits to `skills/writing-plans/SKILL.md`: annotate the existing "Save plans to" block and add a new "## HTML Plan View" section pointing at `html-artifacts` as a REQUIRED SUB-SKILL, the `templates/plan.html` view, the `.html` output path, the canonical-Markdown rule, and the `sp-task-state` ↔ `taskStateMatches` sync contract. A TDD content-invariant test pins these so they can't silently regress.

**Files:**
- Modify: `skills/writing-plans/SKILL.md`
- Test: `tests/html-artifacts/writing-plans.test.js`

- [ ] **Step 1: Write the failing test**

Create `tests/html-artifacts/writing-plans.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const skill = readFileSync('skills/writing-plans/SKILL.md', 'utf8');

test('writing-plans references html-artifacts as a REQUIRED SUB-SKILL', () => {
  assert.match(skill, /REQUIRED SUB-SKILL/);
  assert.match(skill, /html-artifacts/);
});

test('writing-plans keeps Markdown canonical and emits an HTML view', () => {
  assert.match(skill, /canonical/i);
  assert.match(skill, /templates\/plan\.html/);
  assert.match(skill, /plans\/YYYY-MM-DD-<feature-name>\.html/);
});

test('writing-plans documents the sp-task-state sync contract', () => {
  assert.match(skill, /sp-task-state/);
  assert.match(skill, /taskStateMatches/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html-artifacts/writing-plans.test.js`
Expected: FAIL — the current SKILL.md never mentions `html-artifacts`, `templates/plan.html`, a `.html` plan path, `sp-task-state`, or `taskStateMatches`.

- [ ] **Step 3: Annotate the "Save plans to" block**

In `skills/writing-plans/SKILL.md`, find this exact block (near the top, under `## Overview`):

```markdown
**Save plans to:** `docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md`
- (User preferences for plan location override this default)
```

Replace it with:

```markdown
**Save plans to:** `docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md` — this Markdown plan is **canonical**.
- (User preferences for plan location override this default)
- **Also emit a human-facing HTML view** alongside it — see "HTML Plan View" below.
```

- [ ] **Step 4: Add the "HTML Plan View" section**

In `skills/writing-plans/SKILL.md`, insert the following new section immediately BEFORE the `## File Structure` heading (and after the `## Scope Check` section's last line, `Each plan should produce working, testable software on its own.`):

```markdown
## HTML Plan View

**REQUIRED SUB-SKILL:** Use superpowers:html-artifacts to render a human-facing HTML view of the plan.

The Markdown plan is **canonical** — it holds the authoritative checkbox task-state that execution skills read and tick. In addition, author a self-contained HTML **view** of the same plan so the human can read and navigate it comfortably:

- Build it from `templates/plan.html` with the canonical stylesheet inlined (no external resources).
- Save it next to the Markdown plan with the same basename and a `.html` extension: `docs/superpowers/plans/YYYY-MM-DD-<feature-name>.html`.
- Embed the canonical checkbox state in the `<script type="application/json" id="sp-task-state">` block. `checkboxes` is the ordered list of every `- [ ]`/`- [x]` step, each with its `checked` boolean and raw step `text`.
- The view **mirrors** the Markdown; it is never the authority. Whenever you (re)write the Markdown plan, regenerate the HTML view in the same turn so they stay in sync.

The sync contract is verifiable: `taskStateMatches(markdown, html)` in `tests/html-artifacts/validate.js` returns true only when the view's `sp-task-state` block exactly matches the Markdown checkboxes.
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test tests/html-artifacts/writing-plans.test.js`
Expected: PASS — `# pass 3`, `# fail 0`.

- [ ] **Step 6: Commit**

```bash
git add skills/writing-plans/SKILL.md tests/html-artifacts/writing-plans.test.js
git commit -m "feat(writing-plans): emit a synced self-contained HTML plan view via html-artifacts"
```

---

### Task 2: Multi-session workflow (roadmap, session plans, learnings log)

Add a "## Multi-Session Plans" section to `skills/writing-plans/SKILL.md` describing the agent-judged scope trigger, the per-feature folder layout, the roadmap, self-contained session plans, and the four-part learnings log (spec §5). Extend the content-invariant test.

**Files:**
- Modify: `skills/writing-plans/SKILL.md`
- Modify: `tests/html-artifacts/writing-plans.test.js`

- [ ] **Step 1: Write the failing test**

Append to `tests/html-artifacts/writing-plans.test.js`:

```js
test('writing-plans describes the agent-judged multi-session trigger', () => {
  assert.match(skill, /multi-session/i);
  assert.match(skill, /docs\/superpowers\/plans\/<feature>\//);
});

test('writing-plans references the roadmap and learnings templates', () => {
  assert.match(skill, /templates\/roadmap\.html/);
  assert.match(skill, /templates\/learnings\.html/);
});

test('writing-plans documents the four-part learnings log entry', () => {
  for (const part of ['What happened', 'Deviations', 'Surprises', 'Follow-ups']) {
    assert.ok(skill.includes(part), `missing learnings part: ${part}`);
  }
});

test('writing-plans requires session plans to be self-contained', () => {
  assert.match(skill, /self-contained/i);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html-artifacts/writing-plans.test.js`
Expected: FAIL — the new multi-session assertions fail (`multi-session`, the `<feature>/` folder, the roadmap/learnings templates, and the four learnings parts are not present yet). The three Task 1 tests still pass.

- [ ] **Step 3: Add the "Multi-Session Plans" section**

In `skills/writing-plans/SKILL.md`, insert the following new section immediately AFTER the `## HTML Plan View` section added in Task 1 (and still before `## File Structure`):

````markdown
## Multi-Session Plans

**Judge the scope first.** After the spec is approved, decide whether the work fits one session. If it spans multiple subsystems, or has more tasks than a single lead can carry while keeping its context healthy, produce a **multi-session structure**. Otherwise produce a single plan (with its HTML view, as above). This is your judgment — there is no manual knob.

When the work is multi-session, group everything in a per-feature folder and use superpowers:html-artifacts for each human-facing artifact:

```
docs/superpowers/plans/<feature>/
    roadmap.html                  ← from templates/roadmap.html
    session-01-<name>.md          ← canonical (execution agents read this)
    session-01-<name>.html        ← view (from templates/plan.html)
    session-02-<name>.md / .html
    learnings.html                ← from templates/learnings.html
```

- **Roadmap** (`roadmap.html`): orders the sessions, shows their dependencies and status, and links each session's plan. Insert intermediate or fix sessions here as they arise.
- **Session plans are self-contained.** A fresh lead must be able to execute a session by reading only *that* session's plan plus the learnings log — restate the minimal context each session needs. Each session plan is a normal canonical Markdown plan with its synced HTML view.
- **Learnings log** (`learnings.html`): cross-session memory. After each session, append an entry with four parts — **What happened**, **Deviations** (and why), **Surprises** (discoveries, gotchas, constraints found), and **Follow-ups** (new tasks/risks, which may trigger roadmap edits or a new session). The next lead reads this before starting.
````

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/html-artifacts/writing-plans.test.js`
Expected: PASS — `# pass 7`, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add skills/writing-plans/SKILL.md tests/html-artifacts/writing-plans.test.js
git commit -m "feat(writing-plans): add agent-judged multi-session roadmap/session/learnings workflow"
```

---

### Task 3: Golden round-trip test — a plan view built from the real template is self-contained and in sync

Prove the authoring contract end-to-end without committing a large fixture: build a plan HTML view from the actual `templates/plan.html` + `stylesheet.css`, populate its `sp-task-state` block, and assert it inlines clean, references nothing external, and `taskStateMatches` its Markdown. A negative case proves the check catches drift. Then confirm the whole suite is green.

**Files:**
- Test: `tests/html-artifacts/plan-view.test.js`

- [ ] **Step 1: Write the test**

Create `tests/html-artifacts/plan-view.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it passes**

Run: `node --test tests/html-artifacts/plan-view.test.js`
Expected: PASS — `# pass 2`, `# fail 0`. (All helpers exist from Plan 1; the template's literal `{"checkboxes":[]}` placeholder is replaced with the populated state. If it FAILS, do NOT modify the template/stylesheet/validator to force a pass — report the failure instead, as it would indicate a real regression in the foundation.)

- [ ] **Step 3: Run the full html-artifacts suite**

Run: `npm run test:html`
Expected: PASS — `# fail 0` across `validate.test.js`, `stylesheet.test.js`, `templates.test.js`, `skill.test.js`, `brainstorming.test.js`, `spec-example.test.js`, `writing-plans.test.js`, and `plan-view.test.js`.

- [ ] **Step 4: Commit**

```bash
git add tests/html-artifacts/plan-view.test.js
git commit -m "test(html-artifacts): assert a template-built plan view is self-contained and in sync"
```

---

## Manual eval (not automated here)

Two §8 subagent-scenario checks are behavioral, not deterministic unit tests, and should be validated manually (or via `superpowers:writing-skills` adversarial sessions) after this plan lands:

- **Large scope → multi-session:** give `writing-plans` a spec that spans multiple subsystems and confirm it produces a roadmap + multiple session plans (`.md` + `.html`) + a learnings log in a per-feature folder, rather than one flat plan.
- **Execution-loop regression:** confirm an untouched execution skill (`subagent-driven-development`) still reads and ticks the canonical Markdown plan correctly, and that regenerating the HTML view afterward keeps `taskStateMatches` true. The deterministic half of the sync check is already exercised by `plan-view.test.js`.

## Roadmap status

With Plan 1 (html-artifacts foundation), Plan 2 (brainstorming → HTML spec), and this Plan 3 (writing-plans → HTML view + multi-session) complete, the design spec's in-scope items (§2) are covered. The §10 "Future work" items — HTML treatment for `finishing-a-development-branch` menus and the `requesting-code-review` report — remain explicitly deferred.
