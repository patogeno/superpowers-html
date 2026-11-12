---
name: running-multi-session-plans
description: Use when executing a multi-session roadmap from superpowers:writing-plans (a docs/superpowers/plans/<feature>/ folder with roadmap.md), or when your human partner says to continue, resume, or keep going on a roadmap, staged or autonomous ("overnight", "go autonomous until it's done").
---

# Running Multi-Session Plans

A roadmap is too much work for one context, so you don't run it in one.
You are the **controller**: for each session on the roadmap you start a
fresh **lead** with a clean context, collect its summary, update the
roadmap, learnings and report, and then either wait for your human
partner (staged) or start the next one (autonomous). The work lives on
disk, so the run survives your own context and a crashed session.

**Announce at start:** "I'm using running-multi-session-plans to run the roadmap."

## Settings

The roadmap header carries them (see writing-plans' `multi-session-plans.md`):

- **Run:** `staged` (stop after each session for your partner) or
  `autonomous` (run every remaining session back to back). Staged unless
  they said otherwise.
- **Build:** `one at a time` or `parallel`: the shape each session plan
  was written in. The lead runs it with the method its header names.
- **Review:** `standard` or `panel`.

Your partner changes them in plain words at any point, and you update
the header and add a run-log line:

- "go autonomous until it's done", "overnight", "I'm off to bed" →
  `Run: autonomous`, then continue without waiting.
- "stop after this session", "let me see the next one" →
  `Run: staged` from the session now running.
- "fast" → `Build: parallel` for sessions not yet started (rewrite their
  plans as team plans only if they split into independent streams);
  "carefully", "safer" → `one at a time`. "thorough" → `Review: panel`.

## The Loop

1. **Read the roadmap** and its run log. **Resume** at the first unfinished
   session, the first whose status isn't done: a session with a "started" line and no
   "finished" line was interrupted, so check `git log` for its commits
   and hand its lead what already landed. Never redo a finished session.
2. **Start a fresh lead** for that session, with
   `references/session-lead-prompt.md`: the session plan's path, the
   learnings files its `**Read learnings:**` line names, `learnings/index.md`,
   `learnings/feedback.md`, the run settings, and any carry-over from the
   run log. Nothing else: the lead's clean context is the point. Choose its
   model per superpowers:subagent-driven-development's Model Selection;
   a lead coordinates, so the standard tier usually fits.
3. **Collect its summary.** Check it against the repo: the commits it
   names exist, the tests it names pass. A summary you didn't check is a
   claim, not a result.
4. **Update the record:** roadmap status and run log; new topics in
   `learnings/index.md`; any new or amended session the follow-ups call
   for; the run report (below).
5. **Staged:** publish the report, tell your partner in a few lines what
   the session did and what's next, and **stop**. Their reply goes to
   `learnings/feedback.md` in their words, and into the next session's
   plan when it changes the work, before that session starts.
   **Autonomous:** go to step 1 for the next session.
6. **Done:** when every session is done, run the final whole-branch
   review the last session's execution skill calls for (a panel when
   Review is panel), publish the final report, and stop. Use
   superpowers:finishing-a-development-branch only with your partner;
   merging and pushing are theirs (below).

## Calls Made Without Your Partner

A lead or you will hit things only your partner could decide: a screen
state the spec never covered, two readings of a requirement. In
autonomous mode, don't stop the night on one question:

- **Make the call that's easiest to undo**, flag it in the run log and
  the report with how to undo it, and keep going.
- **When a call is hard**, get a second opinion first:
  `references/second-opinion.md`.
- When a call would change what users see in a big way, and the sessions
  after it don't depend on it, park that part and carry on with the rest.

In staged mode, the same calls go in the session report for your
partner to confirm or reverse in their reply.

## Never Unattended

Some actions are outward or hard to undo. In **either mode** they are
**parked**, never done: listed under "Waiting for you" in the report,
with the exact command, for your partner to run or approve.

- `git push`, opening or merging pull requests, merging to the main branch
- deploys, releases, publishing packages
- deleting data, databases, or files outside the work tree
- sending messages, emails, or notifications to anyone
- paid API spend beyond the session's normal use, creating accounts or keys

Commits on the work branch are fine; they are how the run makes progress.

## The Run Report

One report per roadmap, from html-artifacts' `templates/report.html`,
saved beside the roadmap and republished to the same path after every
session, so the link your partner has always shows the latest. With the
Artifact tool (Claude Code), publish it as an artifact and put the link
in the roadmap's `**Report:**` line (see html-artifacts'
`references/claude-code-artifacts.md`); comments on it are feedback like
any other. Without it, give your partner the file path.

It shows: sessions done, calls made without them (each with how to undo
it), what's waiting for them, how to try the result, which learnings
changed, and earlier sessions folded below.

## Without a Subagent Tool

Run each session yourself, in order, as its lead would: read only its
plan and its learnings, execute it with superpowers:executing-plans,
update learnings, roadmap and report. Between sessions, suggest your
partner start a fresh session ("continue the roadmap") so the next one
gets a clean context; in autonomous mode, continue here if they asked
you to.

## Red Flags

| Thought | Reality |
|---------|---------|
| "I'll do this session myself, it's small" | Your context is the run's memory. Start a lead. |
| "I'll give the lead all the learnings, just in case" | It reads what its plan names. That's what keeps the files useful. |
| "Pushing is harmless, it's my branch" | Pushing is outward. Park it. |
| "They said overnight, so I'll ask nothing and decide nothing" | Decide, the easiest-to-undo way, and flag it. |
| "The lead said tests pass" | Check. Then record it. |
| "Staged, but the next session is obvious, I'll start it" | Staged waits for their reply. |
