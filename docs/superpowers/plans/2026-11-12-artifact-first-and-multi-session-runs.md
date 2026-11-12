# Artifact-First Brainstorming + Multi-Session Runs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: implement this plan task-by-task with the sub-skill named under "Execution Handoff" — superpowers:subagent-driven-development (recommended) or superpowers:executing-plans for a sequential plan, superpowers:dispatching-parallel-agents for a team plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge upstream v7.0.2 into the fork, make brainstorming experience-first with design artifacts published on Claude Code, and add staged/autonomous multi-session runs with topic-split learnings.

**Architecture:** Upstream's rebuilt brainstorming becomes the base; the fork's edits move the "how pages are built and published" knowledge into html-artifacts (templates + a Claude Code publishing reference). A new `running-multi-session-plans` skill runs roadmaps; writing-plans and subagent-driven-development gain Run/Build/Review settings and a review panel reference.

**Tech Stack:** Markdown skills, self-contained HTML/CSS/JS templates, Node `node:test` content tests, bash upstream tests.

**Spec:** `docs/superpowers/specs/2026-11-12-artifact-first-brainstorming/index.html` and `docs/superpowers/specs/2026-11-12-multi-session-runs/index.html`

**Execution:** Sequential subagents — Native — the tasks are prose edits to behaviour-shaping skill text whose decisions live in this session's conversation; a fresh subagent would have to rediscover them. One fresh whole-branch reviewer at the end.

**Mockups:** `docs/superpowers/specs/2026-11-12-artifact-first-brainstorming/prototype.html`, `docs/superpowers/specs/2026-11-12-multi-session-runs/prototype.html`

## Global Constraints

- Every `skills/*/SKILL.md` stays under 20,000 bytes (`tests/skill-size/test-skill-size.sh`).
- Zero dependencies; templates are self-contained (`findExternalRefs` empty) and responsive (`findResponsiveDeficiencies` empty).
- Fork version 7.1.0 across `.version-bump.json` files.
- Work stays on branch `artifact-first-brainstorming`; nothing is pushed or merged to `main` without the partner.
- Upstream code (servers, scripts) stays identical to upstream.
- Keep upstream's voice and "your human partner" language in edited skills.

## Review Focus

1. A harness without the Artifact tool: every instruction must still produce local files and chat feedback, never a dead "publish" step.
2. Prototype screen ids colliding with claude.ai reserved hash names (`settings`, `sidebar`, `customize`, `upgrade`, `downloads`, `comment-*`).
3. An overnight run reaching an outward action (push, PR, deploy, delete): it must be parked, never done.
4. "Continue the roadmap" in a fresh session with a half-finished run log: it must resume at the first unfinished session.
5. A comment batch without a go-ahead: it is feedback, not approval.

Tests for each are named in Tasks 4, 3, 6, 6, 4.

---

### Task 1: Merge upstream v7.0.2

**Files:** version files, `RELEASE-NOTES.md`, `hooks/run-hook.cmd`, `skills/writing-skills/SKILL.md`, `skills/brainstorming/SKILL.md` (take upstream's, ported in Task 4)

- [ ] `git merge upstream/main`; version files → upstream text then bump to 7.1.0 in Task 8.
- [ ] `run-hook.cmd`: upstream structure; add the `where git` → `..\bin\bash.exe` fallback as a `BASH_EXE` candidate before the "no bash" exit, and keep our stderr warning in place of the silent exit.
- [ ] `writing-skills/SKILL.md`: upstream version plus our Claude 5 line pointing at `claude-5-skill-authoring.md` (moved to `references/`).
- [ ] `brainstorming/SKILL.md`: take upstream's (`git checkout --theirs`).
- [ ] `RELEASE-NOTES.md`: fork section on top, upstream history below.
- [ ] Commit the merge.

### Task 2: Skill sizes and the Claude 5 references

**Files:** `skills/subagent-driven-development/claude-5-models.md` → `references/claude-5-models.md`; `skills/writing-skills/claude-5-skill-authoring.md` → `references/`; `tests/html-artifacts/claude-5-models.test.js`

- [ ] Move both files; update pointers; SDD paragraph shortened to one sentence.
- [ ] Test: paths in `claude-5-models.test.js` updated; `bash tests/skill-size/test-skill-size.sh` → PASS.
- [ ] Commit.

### Task 3: html-artifacts — layered spec, prototype, report, publishing

**Files:** `skills/html-artifacts/stylesheet.css`, `templates/spec.html`, `templates/prototype.html` (new), `templates/report.html` (new), `references/claude-code-artifacts.md` (new), `references/authoring.md`, `SKILL.md`, `tests/html-artifacts/{templates,stylesheet,skill}.test.js`

**Interfaces:**
- Produces: spec section ids `purpose`, `features`, `screens`, `flows`, `approaches`, `technical` (inside `<details class="tech">`); prototype screens are `<section data-screen id="…">` routed on `location.hash`; report template sections `done`, `calls`, `waiting`, `try`, `learnings`, `history`.

- [ ] Tests first: stylesheet has dark tokens under `:root:not([data-theme="light"])` and `:root[data-theme="dark"]`; spec template is a fragment (no `<html`/`<body`), carries the six ids in order and `<details class="tech"`; prototype and report templates are full documents, self-contained, responsive, both dark guards; prototype template has no reserved screen ids (Review Focus 2); `claude-code-artifacts.md` mentions `files`, republish to the same path, `ArtifactComments`, reserved names.
- [ ] Implement; add `feat`, `cards`/`card`/`thumb`, `details.tech`, `yours` classes to the stylesheet; sticky sidebar `top: env(safe-area-inset-top,0px)`.
- [ ] `node --test tests/html-artifacts/*.test.js` → all pass. Commit.

### Task 4: Brainstorming port

**Files:** `skills/brainstorming/SKILL.md`, `builder-check-prompt.md`, `visual-companion.md`, `tests/html-artifacts/brainstorming.test.js`

- [ ] Tests first: the design doc is HTML via html-artifacts (`-design.html` or topic folder `index.html` + `prototype.html`, no `-design.md`); the doc leads with experience and folds technical design; "Showing it" publishes with the Artifact tool when available, else local files (Review Focus 1); no visual-companion offer; comments read when partner replies; untouched parts approved only on a go-ahead (Review Focus 5); approval of doc + prototype is the last gate and writing-plans follows; HARD-GATE intact.
- [ ] Edit upstream text in place: Show, don't tell; Play It Back; The Written Design (where it goes); Builder check (HTML, prototype, technical section); Visual Companion → Showing it; HARD-GATE last-gate line.
- [ ] Tests pass; skill size PASS. Commit.

### Task 5: writing-plans — design links and Run/Build/Review

**Files:** `skills/writing-plans/SKILL.md`, `multi-session-plans.md`, `team-plans.md`, `tests/html-artifacts/writing-plans.test.js`

- [ ] Tests first: header `**Design:**` line (artifact link or topic folder), UI tasks list `Prototype: …/prototype.html#screen-id`; multi-session handoff names `running-multi-session-plans` and states `Run / Build / Review`; `multi-session-plans.md` documents `learnings/index.md`, topic files with "Current truths", `feedback.md`, `**Read learnings:**`, condense at ~150 lines, roadmap run log; Build maps to the execution models.
- [ ] Implement; update the old four-part learnings test to the topic format.
- [ ] Tests pass. Commit.

### Task 6: running-multi-session-plans skill

**Files:** `skills/running-multi-session-plans/SKILL.md`, `references/session-lead-prompt.md`, `references/second-opinion.md`, `skills/using-superpowers/SKILL.md` (if it lists execution skills), `tests/html-artifacts/running-multi-session-plans.test.js`

- [ ] Tests first: frontmatter "Use when" covering executing a roadmap and "continue the roadmap"; staged default; switch phrases both ways; resume at first unfinished session from the run log (Review Focus 4); the outward-actions list is parked in either mode (Review Focus 3); easiest-to-undo calls flagged; second opinion criteria; one report per roadmap republished; no-subagent fallback; lead prompt returns a fixed summary.
- [ ] Implement. Tests pass. Commit.

### Task 7: Review panel

**Files:** `skills/subagent-driven-development/references/review-panel.md`, one pointer line in SDD `SKILL.md`, test

- [ ] Test: lenses (user experience, correctness, security, tests), per-task and final panel, the lead merges findings, read only when Review is panel; SDD size PASS.
- [ ] Implement. Commit.

### Task 8: Docs, version, full verification

**Files:** `README.md` fork section, `RELEASE-NOTES.md` fork entry, version files

- [ ] `bash scripts/bump-version.sh 7.1.0` (or edit the declared files if jq is missing); README fork section and comparison table rewritten; release-notes entry.
- [ ] Run `node --test tests/html-artifacts/*.test.js`, `bash tests/skill-size/test-skill-size.sh`, `bash tests/skill-layout/test-no-dev-files-in-skills.sh`, `bash tests/sdd-helper-paths/test-sdd-helper-paths.sh`, `bash tests/hooks/test-session-start.sh`. All pass.
- [ ] Fresh whole-branch reviewer (most capable model). Fix findings. Commit.
