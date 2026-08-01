# Multi-Session Plans

Read this when you've judged the work too large for one session. Single-session work doesn't need it.

Group everything in a per-feature folder of Markdown files:

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

The execution-model choice is **orthogonal** to this split: each session plan can be sequential or a team plan independently.
