# brainstorming → HTML Design Spec Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the `brainstorming` skill emit its design spec as a self-contained HTML artifact (built from the `html-artifacts` `templates/spec.html`) instead of Markdown, with deterministic invariants that a spec is visual (≥1 inline `<svg>`, ≥1 `<table>`) and self-contained.

**Architecture:** Surgical, additive edits to one skill file plus new validator coverage. `brainstorming/SKILL.md` gains an `html-artifacts` **REQUIRED SUB-SKILL** reference and changes its spec output path from `…-design.md` to `…-design.html`. A new `findSpecDeficiencies` helper joins the existing zero-dependency validator (`tests/html-artifacts/validate.js`); new test files assert the SKILL.md invariants and run the validator against the committed example spec as a golden fixture. The agent-only execution and instruction layers are untouched.

**Tech Stack:** Node.js ≥18 built-ins only (`node:test`, `node:assert`, `node:fs`) — zero dependencies. Markdown skill files. Plain HTML/CSS/SVG (authored at spec-generation time, not in this plan).

**Conventions for the executor:**
- Repo root is the superpowers-html checkout. Run all commands **from the repo root** unless stated otherwise.
- The repo's root `package.json` has `"type": "module"`, so `.js`/`.test.js` files under `tests/html-artifacts/` are ES modules — use `import`/`export`, not `require`.
- `npm run test:html` runs `node --test tests/html-artifacts/*.test.js`, so new `*.test.js` files in that directory are picked up automatically.
- Use forward slashes in all paths inside skill/code files (project rule), even on Windows.
- This plan does NOT change agent-only skills (`executing-plans`, `subagent-driven-development`, `writing-plans`, TDD, etc.) and does NOT touch the canonical Markdown plan format. Only `brainstorming`'s human-facing spec output changes.

---

### Task 1: Spec-quality validator — `findSpecDeficiencies`

A human-facing design spec must be *visual*: the spec (§7) requires hand-authored inline SVG diagrams and semantic tables. This helper makes "is this spec visual enough?" a deterministic check, reusing the same self-containment validator the foundation shipped.

**Files:**
- Modify: `tests/html-artifacts/validate.js`
- Test: `tests/html-artifacts/validate.test.js`

- [ ] **Step 1: Write the failing test**

Append to `tests/html-artifacts/validate.test.js`:

```js
import { findSpecDeficiencies } from './validate.js';

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

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html-artifacts/validate.test.js`
Expected: FAIL — `findSpecDeficiencies` is not exported (`SyntaxError` / `is not a function`).

- [ ] **Step 3: Write minimal implementation**

Append to `tests/html-artifacts/validate.js`:

```js
// Spec-quality check: a human-facing design spec (§7 of the design) should be
// visual — at least one hand-authored inline <svg> diagram and one semantic
// <table>. Returns a list of human-readable deficiencies; empty means it qualifies.
export function findSpecDeficiencies(html) {
  const out = [];
  if (!/<svg[\s>]/i.test(html)) out.push('no inline <svg> diagram');
  if (!/<table[\s>]/i.test(html)) out.push('no <table>');
  return out;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/html-artifacts/validate.test.js`
Expected: PASS — `# fail 0` (the file now has its original cases plus these 3).

- [ ] **Step 5: Commit**

```bash
git add tests/html-artifacts/validate.js tests/html-artifacts/validate.test.js
git commit -m "feat(html-artifacts): add findSpecDeficiencies spec-quality validator"
```

---

### Task 2: Point `brainstorming` at `html-artifacts` and emit an HTML spec

Surgical edits to `skills/brainstorming/SKILL.md`: the checklist item and the "After the Design → Documentation" block change the output from `…-design.md` to a self-contained `…-design.html` built via the `html-artifacts` **REQUIRED SUB-SKILL**, emphasizing inline SVG diagrams and tables (spec §3, §4, §7). The TDD test asserts these content invariants so the change can't silently regress.

**Files:**
- Modify: `skills/brainstorming/SKILL.md`
- Test: `tests/html-artifacts/brainstorming.test.js`

- [ ] **Step 1: Write the failing test**

Create `tests/html-artifacts/brainstorming.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html-artifacts/brainstorming.test.js`
Expected: FAIL — the current SKILL.md writes `…-design.md` and never mentions `html-artifacts`, `templates/spec.html`, `<svg>`, or `<table>`.

- [ ] **Step 3: Edit the checklist item**

In `skills/brainstorming/SKILL.md`, replace the checklist line (in the `## Checklist` section):

Find:
```markdown
6. **Write design doc** — save to `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md` and commit
```

Replace with:
```markdown
6. **Write design doc** — REQUIRED SUB-SKILL: use superpowers:html-artifacts. Save as self-contained HTML to `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.html` and commit
```

- [ ] **Step 4: Edit the "Documentation" block**

In the `## After the Design` section, find the `**Documentation:**` block:

Find:
```markdown
**Documentation:**

- Write the validated design (spec) to `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`
  - (User preferences for spec location override this default)
- Use elements-of-style:writing-clearly-and-concisely skill if available
- Commit the design document to git
```

Replace with:
```markdown
**Documentation:**

- **REQUIRED SUB-SKILL:** Use superpowers:html-artifacts to author the spec as a self-contained HTML document, starting from `templates/spec.html` with the canonical stylesheet inlined.
- Write the validated design (spec) to `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.html`
  - (User preferences for spec location override this default)
- The spec is **HTML-primary** — a human reads it; nothing machine-parses it. Make it visual: include at least one hand-authored inline `<svg>` diagram (architecture or data flow) and at least one semantic `<table>` (comparisons, data models, decisions).
- Keep it **self-contained**: no external scripts, stylesheets, fonts, or images, and no CDNs (the `html-artifacts` validator's `findExternalRefs` must return empty).
- Use elements-of-style:writing-clearly-and-concisely skill if available
- Commit the design document to git
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test tests/html-artifacts/brainstorming.test.js`
Expected: PASS — `# pass 4`, `# fail 0`.

- [ ] **Step 6: Commit**

```bash
git add skills/brainstorming/SKILL.md tests/html-artifacts/brainstorming.test.js
git commit -m "feat(brainstorming): emit self-contained HTML design spec via html-artifacts"
```

---

### Task 3: Golden-fixture invariant + full-suite green

Run both validators against the committed example design spec (`docs/superpowers/specs/2026-05-30-html-output-design.html`) so the spec the project ships about itself is provably self-contained and visual — a real-world regression guard for `findExternalRefs` and `findSpecDeficiencies`. Then confirm the whole `html-artifacts` suite is green.

**Files:**
- Test: `tests/html-artifacts/spec-example.test.js`

- [ ] **Step 1: Write the failing test**

Create `tests/html-artifacts/spec-example.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { findExternalRefs, findSpecDeficiencies } from './validate.js';

const spec = readFileSync(
  'docs/superpowers/specs/2026-05-30-html-output-design.html', 'utf8');

test('the committed example design spec is self-contained', () => {
  assert.deepEqual(findExternalRefs(spec), []);
});

test('the committed example design spec qualifies as visual (svg + table)', () => {
  assert.deepEqual(findSpecDeficiencies(spec), []);
});
```

- [ ] **Step 2: Run test to verify it fails (then passes once the import resolves)**

Run: `node --test tests/html-artifacts/spec-example.test.js`
Expected: This test depends on `findSpecDeficiencies` from Task 1. If Task 1 is complete, it should PASS immediately (the example spec already contains inline `<svg>`, a `<table>`, and no external refs). If `findSpecDeficiencies` is missing, it FAILS with an import error — complete Task 1 first.

- [ ] **Step 3: Run the full html-artifacts suite**

Run: `npm run test:html`
Expected: PASS — `# fail 0` across `validate.test.js`, `stylesheet.test.js`, `templates.test.js`, `skill.test.js`, `brainstorming.test.js`, and `spec-example.test.js`.

- [ ] **Step 4: Commit**

```bash
git add tests/html-artifacts/spec-example.test.js
git commit -m "test(html-artifacts): assert the example design spec is self-contained and visual"
```

---

## Manual eval (not automated here)

The subagent-scenario trigger from the design's §8 testing table — "*Let's build a todo app*" → `brainstorming` runs and the produced spec is HTML with ≥1 diagram + ≥1 table — is a behavioral eval, not a deterministic unit test. After this plan lands, validate it manually (or via `superpowers:writing-skills` adversarial sessions): run a brainstorming session in a fresh harness, confirm the saved spec is `…-design.html`, and run it through `findExternalRefs` and `findSpecDeficiencies` (both must return `[]`). The deterministic half of that check is exactly what `spec-example.test.js` already exercises against the committed spec.

## Notes for Plan 3 (not implemented here)

- **Plan 3 (writing-plans → HTML view + multi-session):** make `writing-plans/SKILL.md` reference `html-artifacts`, keep the Markdown plan canonical, additionally emit `*.html` from `templates/plan.html` with a synced `sp-task-state` block (verified by `taskStateMatches`), and add the multi-session roadmap/session-plan/learnings-log behavior with the agent-judged trigger.
- The execution skills (`executing-plans`, `subagent-driven-development`) remain **unchanged** and keep reading the Markdown plan.
