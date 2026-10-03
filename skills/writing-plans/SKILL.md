---
name: writing-plans
description: Use when you have a spec or requirements for a multi-step task, before touching code
---

# Writing Plans

## Overview

Write implementation plans for an engineer who has not seen this codebase or this spec. Assume they write idiomatic code in the project's language once they know the exact interface and the exact test, and that they will make a reasonable choice wherever the plan leaves one open. What they cannot know is what you decided: which files, which names and signatures, which values from the spec, which tests prove each task. Document those. Give them the whole plan as bite-sized tasks. DRY. YAGNI. TDD. Frequent commits.

**Announce at start:** "I'm using the writing-plans skill to create the implementation plan."

**Context:** If working in an isolated worktree, it should have been created via the `superpowers:using-git-worktrees` skill at execution time.

**Save plans to:** `docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md` — this Markdown plan is **canonical** and is the single source of truth. Execution skills read and tick its checkboxes directly.
- (User preferences for plan location override this default)

## Scope Check

If the spec covers multiple independent subsystems, it should have been broken into sub-project specs during brainstorming. If it wasn't, suggest breaking this into separate plans — one per subsystem. Each plan should produce working, testable software on its own.

## Execution Model

Choose the execution model before writing tasks, because it changes the shape of the plan. Make the choice yourself from the spec — your human partner spends their review time on the design, not on plan mechanics. If they already named a model, use theirs.

**1. Sequential subagents (default)** — one task at a time, in order. Produces a plain ordered plan (the task structure below). Fits when tasks are coupled or must run in a fixed order.

**2. Team of specialists** — multiple specialized agents work concurrently on independent tasks. Produces a plan organized into parallel work-streams with an explicit dependency graph and a specialist tag per task (see "Team Plan Structure"). Fits when the work splits into independent domains that benefit from concurrency.

Record the choice in the plan header's `**Execution:**` line with a one-line reason drawn from the plan, so your partner can overrule it at a glance. This choice is orthogonal to the multi-session judgment below: a multi-session feature can have each session plan written in either shape.

## Multi-Session Plans

**Judge the scope first.** After the spec is approved, decide whether the work fits one session. If it spans multiple subsystems, or has more tasks than a single lead can carry while keeping its context healthy, produce a **multi-session structure** — a per-feature folder with a roadmap, self-contained session plans, and a learnings log. Otherwise produce a single plan. This is your judgment — there is no manual knob.

If multi-session: read `multi-session-plans.md` for the folder layout and the learnings-log format.

## File Structure

Before defining tasks, map out which files will be created or modified and what each one is responsible for. This is where decomposition decisions get locked in.

- Design units with clear boundaries and well-defined interfaces. Each file should have one clear responsibility.
- You reason best about code you can hold in context at once, and your edits are more reliable when files are focused. Prefer smaller, focused files over large ones that do too much.
- Files that change together should live together. Split by responsibility, not by technical layer.
- In existing codebases, follow established patterns. If the codebase uses large files, don't unilaterally restructure - but if a file you're modifying has grown unwieldy, including a split in the plan is reasonable.

This structure informs the task decomposition. Each task should produce self-contained changes that make sense independently.

## Task Right-Sizing

A task is the smallest unit that carries its own test cycle and is worth a
fresh reviewer's gate. When drawing task boundaries: fold setup,
configuration, scaffolding, and documentation steps into the task whose
deliverable needs them; split only where a reviewer could meaningfully
reject one task while approving its neighbor. Each task ends with an
independently testable deliverable.

## Step Granularity

**Each step is one action with a checkable result:**
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

**Spec:** [path to the spec/design doc this plan implements — the plan
argues from the spec, so the spec travels with it; executors read both]

**Execution:** [Sequential subagents | Team of specialists] — [Subagent-driven | Native for a sequential plan] — [one-line reason]

**Mockups:** [If the spec shipped mockups, link the topic folder — e.g. `docs/superpowers/specs/2026-06-17-checkout/`. Omit this line if there are none.]

## Global Constraints

[The spec's project-wide requirements — version floors, dependency limits,
naming and copy rules, platform requirements — one line each, with exact
values copied verbatim from the spec. Every task's requirements implicitly
include this section.]

## Review Focus

[The five input classes or failure modes the spec implies but no task's
tests exercise that are most likely to bite a person using this software
— one line each, naming the input or condition and the behavior a
reasonable person would expect, most likely first. The spec is a vision
document: it says what the software must do, not everything it will
meet, and its silence on an input is not permission for that input to
break the program. Write the list here, once, with the spec in front of
you. Then, for each line, add the test that pins it to the task that
owns the code, in that task's own step style.]

---
```

## Mockups

If the design spec shipped HTML mockups (see `brainstorming`'s Mockups section), the plan ties them to the work so an implementer building a screen opens the right reference:

- Link the topic folder once in the header's `**Mockups:**` line.
- In each UI-building task, list the specific `mockup-<name>.html` it implements under that task's `**Files:**` block (as a `Mockup:` entry). The implementer reads the mockup, not just the prose.

Plans stay canonical Markdown; mockups are linked, never embedded.

## Team Plan Structure

When the chosen model is **team of specialists**, the plan gains a **Work-streams** section up front — each stream's name, the specialist role it needs, the tasks it owns, and the streams it depends on — and each task carries a `**Specialist:** <role>` tag. That dependency graph is what lets a dispatcher run streams concurrently.

Read `team-plans.md` for the work-streams format and the team execution handoff.

## Task Structure

````markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`
- Mockup: `docs/superpowers/specs/<topic>/mockup-<name>.html` (UI tasks only, if the spec shipped one)

**Interfaces:**
- Consumes: [what this task uses from earlier tasks — exact signatures]
- Produces: [what later tasks rely on — exact function names, parameter
  and return types. A task's implementer sees only their own task; this
  block is how they learn the names and types neighboring tasks use.]

- [ ] **Step 1: Write the failing test**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/path/test.py::test_name -v`
Expected: FAIL with "function not defined"

- [ ] **Step 3: Implement `function(input: InputType) -> ResultType` in `exact/path/to/file.py`**

One line on the approach when the signature and the test leave a choice
(which library call, which data structure); a code block only for an
algorithm they do not determine.

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/path/test.py::test_name -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/path/test.py src/path/file.py
git commit -m "feat: add specific feature"
```
````

**For team plans only:** add a `**Specialist:** <role>` line immediately after the `**Interfaces:**` block of each task (see "Team Plan Structure"). Sequential plans omit it.

## What a Step Contains

A step is done when the implementer can write exactly one reasonable thing
from it. That is the whole requirement: unambiguous, not complete. Each kind
of step carries what makes it unambiguous and nothing more:

- **A test step:** the test's name and its assertions, as code, with the
  spec's exact values in them.
- **A code step:** the exact signature (name, parameters, return type), the
  file it lives in, and the specific values the spec pins. The implementer
  writes the body. A body appears only for an algorithm the signature and
  tests do not determine, or for exact copy the spec fixes.
- **A verification step:** the command to run and the output that means it
  passed.
- **A reference to another task:** that task's Interfaces block says what
  to use; the plan does not repeat that task's code.

A plan is the set of decisions the implementer cannot make alone. A plan
longer than the code it describes has written the code instead. Lines that
decide nothing ("TBD", "handle edge cases", "add appropriate validation",
"write tests for the above", a type or function no task defines) are the
opposite failure, and the self-review catches both.

## Self-Review

After writing the complete plan, look at the spec with fresh eyes and check the plan against it. This is a checklist you run yourself — not a subagent dispatch.

**1. Spec coverage:** Skim each section/requirement in the spec. Can you point to a task that implements it? List any gaps.

**2. Step scan:** Every step must let the implementer write exactly one reasonable thing, and no step may carry more than that: a line that decides nothing is a gap, a function body the signature and tests already determine is a transcript. Fix both.

**3. Type consistency:** Do the types, method signatures, and property names you used in later tasks match what you defined in earlier tasks? A function called `clearLayers()` in Task 3 but `clearFullLayers()` in Task 7 is a bug.

**4. Review Focus:** For each input class or failure mode the spec implies, is there a task whose tests exercise it? The five uncovered ones most likely to bite a person go in the Review Focus section, and each line there gets its test added to the owning task. An empty section means you checked and found none, not that you skipped the check.

**5. Proportion:** Compare the plan's length to the spec's. A plan several times longer than the spec it implements is a transcript of the program, not a plan. If code blocks are most of the document, replace bodies with signatures, test names and assertions, and check that each step is still unambiguous.

If you find issues, fix them inline. No need to re-review — just fix and move on. If you find a spec requirement with no task, add the task.

## Execution Handoff

The plan is **accepted by default.** Your human partner approved the design
when they approved the written spec and its mockups; the plan is how you
carry out that design, not a second design review. So after saving and
self-reviewing it, report and continue — do not wait for a reply:

> "Plan saved to `docs/superpowers/plans/<filename>.md` — <N> tasks,
> <execution model and method>, because <the one-line reason from the
> header>. Starting execution now; say *stop* or *let me review the plan
> first* at any point."

Then invoke the execution sub-skill for the chosen method:

- **Sequential, Subagent-driven** — a fresh subagent implements each task and a fresh reviewer checks it, then a whole-branch review. Choose it when tasks lean on each other's interfaces or a shipped mistake would be costly. **REQUIRED SUB-SKILL:** superpowers:subagent-driven-development
- **Sequential, Native** — you implement every task in this session, then one fresh reviewer on the most capable model checks the whole branch. Cheapest and fastest; choose it when the tasks are few, well-specified, and mostly independent. **REQUIRED SUB-SKILL:** superpowers:executing-plans
- **Team of specialists** — **REQUIRED SUB-SKILL:** superpowers:dispatching-parallel-agents, one specialist per dependency-free work-stream as a wave. Read `team-plans.md` → "Team Execution Handoff" for the agent-team path and the wave mechanics.

If your partner already named a method, use theirs.

### When to stop instead: design issues

Stop before executing — and only then — when writing or self-reviewing the
plan surfaced a **design issue**: something only your partner can decide,
because it changes what they will see or what the software does. These are:

- a spec requirement that is **ambiguous** — two reasonable readings that
  would build different UI or behavior;
- two parts of the spec or its mockups that **contradict** each other;
- a requirement that **cannot be met** as written (a platform limit, a
  conflicting constraint, a dependency that does not exist);
- a decision the **spec never made** that affects UI or user-visible
  behavior (an unspecified screen state, an error the user will see, a
  flow the mockups skip).

Present each issue as a design question with your recommended answer —
show it with an updated mockup or diagram when it is visual. Once your
partner answers, update the spec (and mockups) first, then the plan, then
execute. Plan-internal choices — task boundaries, file layout, test
names, execution method — are yours to make; don't stop for them.

### When your partner wants the plan gate back

If your partner asks to review the plan first — in this request, earlier
in the session, or in their standing instructions — link the plan, wait
for their review, and confirm the execution method with them before
implementation.
