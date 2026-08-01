# Team Plan Structure

Read this when the chosen execution model is **team of specialists**. Sequential plans don't need it.

Structure the plan so a dispatcher can run specialists concurrently:

- **Work-streams section (up front).** Before the tasks, list each work-stream: a short name, the specialist role it needs, the tasks it owns, and the work-streams it depends on. This is the dependency graph — a dispatcher runs all dependency-free streams in the first wave, then the next wave as dependencies clear.
- **Specialists are inferred per plan.** There is no fixed taxonomy. Derive the roles the work actually needs from the task content (for example: a DB-migration specialist, an API specialist, a React specialist) and tag each task with a `**Specialist:** <role>` line under its `**Interfaces:**` block.
- **Tasks stay bite-sized and independently testable** (same structure as the main skill). Tasks within one stream are ordered; tasks across independent streams are not.

Example work-streams section:

```markdown
## Work-streams

- **Stream A — Schema** (Specialist: DB-migration) — Tasks 1–2. Depends on: none.
- **Stream B — API** (Specialist: backend) — Tasks 3–4. Depends on: Stream A.
- **Stream C — UI** (Specialist: React) — Tasks 5–6. Depends on: none.
```

## Team Execution Handoff

- **REQUIRED SUB-SKILL:** Use superpowers:dispatching-parallel-agents.
- **Prefer a first-class agent team when the harness provides one.** If your harness exposes agent-team tools — Claude Code's *agent teams* (the user enables them with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`, after which team-creation/teammate tools are available), Codex's multi-agent mode, or similar — create a team and run one teammate per dependency-free work-stream, coordinating through the shared task list and direct messages. Otherwise (or if the feature isn't enabled), dispatch ordinary parallel subagents as below.
- Dispatch one specialist agent per dependency-free work-stream as a wave; give each agent only its stream's tasks plus the minimal context it needs. Review each stream's work as it returns, then launch the next wave as its dependencies clear.

**Keep the wave as wide as the dependency graph, and no wider.** One agent per dependency-free stream — not several agents splitting one stream. A stream small enough for the lead to finish in a handful of tool calls doesn't need an agent at all.
