# Review Panel

Read this only when the plan or roadmap says **Review: panel** (your
human partner asked for a thorough review, or "different points of
view"). Otherwise one task reviewer per task is the gate, as SKILL.md
describes.

A panel trades cost for coverage: several reviewers, each looking at the
same diff through one lens, catch what a single generalist reader skims
past. Each lens is a short addition to the normal reviewer brief, not a
different process.

## The lenses

Dispatch the normal task reviewer (`task-reviewer-prompt.md`, same
review package) once per lens, in parallel, with its lens appended:

- **User experience:** what a person using this sees and does. Flows
  that dead-end, states the prototype shows but the code doesn't (empty,
  loading, error), copy that confuses, anything that differs from the
  design's prototype screens.
- **Correctness:** inputs and orders the tests don't exercise, edge
  values, concurrency and failure paths, the plan's Review Focus lines.
- **Security:** untrusted input, secrets in code or logs, permissions,
  injection, anything outward the change opens.
- **Tests:** whether the tests would fail if the behaviour broke:
  assertions on real behaviour rather than mocks, missing cases, tests
  that pass for the wrong reason.

Drop a lens that can't apply to the task (security on a copy change,
user experience on an internal refactor) and say so in the ledger. Each
lens reviewer keeps the spec-compliance verdict from its brief; only the
quality focus changes.

## Per task and final

- **Per task:** run the panel in place of the single task reviewer.
- **Final review:** run the same lenses over the whole branch, per
  `final-review.md`, each with the whole-branch package.

## Merging findings

You, the controller (or the session lead), merge the panel's findings
before acting: dedupe findings that name the same defect, keep the
highest severity any lens gave it, and note which lenses raised it.
Then gate and fix exactly as `fix-loop.md` (per task) or
`final-review.md` (final) says. The panel adds readers, not rounds: the
fix loop's limits are unchanged.
