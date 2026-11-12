# Multi-Session Plans

Read this when you've judged the work too large for one session. Single-session work doesn't need it.

Group everything in a per-feature folder of Markdown files:

```
docs/superpowers/plans/<feature>/
    roadmap.md            sessions, order, dependencies, status, run settings, run log
    session-01-<name>.md  canonical session plan (its lead reads this)
    session-02-<name>.md
    learnings/
        index.md          one line per topic: what it covers, which sessions touched it
        <topic>.md        one file per topic: current truths, then history
        feedback.md       what your human partner has told the run
```

superpowers:running-multi-session-plans runs the roadmap, staged or autonomous. This file is the layout it reads and writes.

## Roadmap

`roadmap.md` orders the sessions, shows their dependencies and status, and links each session's plan. Insert intermediate or fix sessions here as they arise. Its header carries the run settings:

```markdown
**Run:** staged | autonomous
**Build:** one at a time | parallel
**Review:** standard | panel
**Report:** <artifact link or path to the run report>
```

A multi-session plan starts **staged** unless your partner said otherwise. The settings are your partner's to change at any point ("overnight, fast", "go autonomous until it's done", "stop after this session"); the runner updates them.

Below the sessions, a **run log**: one line per event, newest last: a session started or finished (with its commits), a mode switch, a parked action, a call flagged for your partner. A fresh session resumes from this log.

## Session plans

**Session plans are self-contained.** A fresh lead must be able to execute a session by reading only *that* session's plan plus the learnings it names. Restate the minimal context the session needs. Each session plan is a normal canonical Markdown plan written in the shape its Build setting implies (sequential for one at a time, a team plan for parallel), with one extra header line:

```markdown
**Read learnings:** index, auth, data-model, feedback
```

List the topics this session's work touches. `index` and `feedback` are always on the list. The lead reads those files and no others, so name a topic whenever the session could repeat a mistake recorded there.

## Learnings

Learnings are split by topic so a session reads only what bears on its work.

- **`learnings/index.md`:** one line per topic: its name, what it covers, the sessions that touched it. The runner adds a line when a session opens a new topic.
- **`learnings/<topic>.md`:** opens with **Current truths**, the short list of things that are true now (a constraint found, a decision made, a gotcha and its fix), and follows with **History**, dated entries per session: what happened, deviations from the plan and why, surprises, follow-ups.
- **`learnings/feedback.md`:** your partner's feedback from staged reviews and anything they said mid-run, dated, in their words where possible. Every session reads it.

A session lead updates the topics it touched before it hands back: current truths first, then a history entry. Follow-ups that need new work go to the roadmap as a new or amended session.

**Condense.** When a topic file passes about 150 lines, fold its history into its current truths and cut the history to the last few entries. Git keeps the rest. This keeps every file small however long the project runs.

## Settings and plan shape

Run, Build and Review are **orthogonal** to the split itself. Build picks each session plan's shape; Review tells the lead whether to use superpowers:subagent-driven-development's review panel (`references/review-panel.md` there) instead of one reviewer per task. Run only decides whether the runner waits for your partner between sessions.
