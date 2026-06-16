# Superpowers

Superpowers is a complete software development methodology for your coding agents, built on top of a set of composable skills and some initial instructions that make sure your agent uses them.

> **This is `superpowers-html`** — a fork of [obra/superpowers](https://github.com/obra/superpowers) that makes the human-facing design **spec** render as a rich, self-contained **HTML** document (diagrams, tables) instead of plain Markdown, adds a Markdown multi-session workflow with a cross-session learnings log, and lets you choose at planning time between sequential subagents and a team of specialized agents. The agent-only execution layer is unchanged. See [What this fork changes](#what-this-fork-changes-superpowers-html) and [how to install it](#this-fork-superpowers-html).

## We're Hiring!

We're hiring someone to help out full time with Superpowers community and code work. 
You can read about the job at https://primeradiant.com/jobs/superpowers-community-engineer/
If this sounds like someone you know, definitely send them our way.

## Quickstart

Give your agent Superpowers: [Claude Code](#claude-code), [Antigravity](#antigravity), [Codex App](#codex-app), [Codex CLI](#codex-cli), [Cursor](#cursor), [Factory Droid](#factory-droid), [Gemini CLI](#gemini-cli), [GitHub Copilot CLI](#github-copilot-cli), [Kimi Code](#kimi-code), [OpenCode](#opencode), [Pi](#pi).

## How it works

It starts from the moment you fire up your coding agent. As soon as it sees that you're building something, it *doesn't* just jump into trying to write code. Instead, it steps back and asks you what you're really trying to do. 

Once it's teased a spec out of the conversation, it shows it to you in chunks short enough to actually read and digest. 

After you've signed off on the design, your agent puts together an implementation plan that's clear enough for an enthusiastic junior engineer with poor taste, no judgement, no project context, and an aversion to testing to follow. It emphasizes true red/green TDD, YAGNI (You Aren't Gonna Need It), and DRY. 

Next up, once you say "go", it works through each engineering task, inspecting and reviewing the work, and continuing forward — either a *subagent-driven-development* process (a fresh subagent per task) or a team of specialized agents working concurrently, whichever you chose when the plan was written. It's not uncommon for Claude to be able to work autonomously for a couple hours at a time without deviating from the plan you put together.

There's a bunch more to it, but that's the core of the system. And because the skills trigger automatically, you don't need to do anything special. Your coding agent just has Superpowers.

## Commercial Services

If you're using Superpowers in enterprise and could benefit from commercial support, additional tooling, or managed spending, please don't hesitate to drop us a line at sales@primeradiant.com.

## What this fork changes (superpowers-html)

Upstream Superpowers produces its human-facing artifacts as Markdown. This fork keeps everything Superpowers does and changes **what a human reads and reviews** — the design **spec** renders as a polished, self-contained HTML document that's easier to navigate and react to, while implementation plans stay canonical Markdown and gain an up-front choice of execution model. The agent-executed *code* (the brainstorm server, scripts) is left identical to upstream, which keeps the fork easy to merge.

**What's added:**

- **A new `html-artifacts` skill** — one canonical, zero-dependency stylesheet plus the spec HTML template and authoring rules, with a small Node test suite that enforces self-containment. It's the shared design system the design spec inlines.
- **`brainstorming` emits an HTML design spec.** The spec is written to `…-design.html` (built from `templates/spec.html`) with at least one hand-authored inline **SVG** diagram and at least one semantic **table**, instead of `…-design.md`.
- **Mockups instead of a visual companion.** The fork retires upstream's browser-based visual companion (no server, no offer) and conveys visual design as static, self-contained **HTML mockups** — schematic wireframes inline in the spec, and higher-fidelity mockups *styled like the product being designed* spun out to their own files in the topic folder, linked from the spec and the plan. The companion's server and tests stay on disk, untouched, so upstream syncs stay clean.
- **`writing-plans` lets you choose an execution model.** Up front you pick **sequential subagents** (a fresh subagent per task, reviewed between tasks) or a **team of specialists** (independent work-streams with a dependency graph, each task tagged with a specialist role inferred from the work itself, dispatched concurrently). The plan itself stays canonical **Markdown**.
- **A Markdown multi-session workflow.** For work too large for one session, `writing-plans` (by its own judgment) produces a per-feature folder of Markdown files: a **roadmap** (`roadmap.md`), self-contained **session plans** (`session-NN-<name>.md`), and a cross-session **learnings log** (`learnings.md` — What happened · Deviations · Surprises · Follow-ups).

**Principles:** the design spec is a single self-contained HTML file — no CDNs, no build step, no external resources; diagrams are hand-authored inline SVG; mockups reuse that self-containment discipline but carry the product's own look; and implementation plans stay canonical Markdown so execution skills read and tick them directly.

| Artifact | Upstream | This fork |
|---|---|---|
| Design spec | Markdown | **HTML** (inline SVG + tables) |
| Visual mockups | Browser visual companion (live server) | **Static self-contained HTML** (inline schematic, or product-styled spin-out) |
| Implementation plan | Markdown | Markdown (canonical) |
| Multi-session roadmap / learnings log | — | **Markdown** |
| Execution model choice (sequential subagents / team of specialists) | — | **chosen at planning time** |
| Agent-executed server/scripts | shipped | unchanged (kept, not offered) |

> Why HTML? For a human–AI collaborative *output* like the design spec, HTML gives better information density, navigability, and diagrams/tables — making the work legible enough that you actually want to read it. The win is at the review layer, not the agent-instruction layer.

## Execution models for implementation plans

There are **two separate, independent decisions** here — don't conflate them:

1. **Which path the plan takes** — a *planning-time* choice inside `writing-plans` (sequential subagents vs team of specialists). This shapes the plan and applies on **any** harness.
2. **Whether your harness runs the work as first-class concurrent agents** — a *harness capability* you turn on once in config (e.g. Claude Code's experimental **agent teams**). This is optional: a team plan still runs without it, just as ordinary parallel subagents.

### 1. Pick the execution path (planning time)

When `writing-plans` turns an approved design into a plan, it asks you to pick how the plan will be executed before it writes the tasks — the choice changes the shape of the plan. The plan itself is always canonical Markdown either way.

| | **Sequential subagents** (default) | **Team of specialists** |
|---|---|---|
| Plan shape | A plain ordered list of tasks | Tasks grouped into parallel **work-streams** with an explicit dependency graph; each task tagged `**Specialist:** <role>` |
| How it runs | A fresh subagent implements one task at a time, with review between tasks | One specialist agent per dependency-free work-stream runs **concurrently**; the next wave launches as dependencies clear |
| Best when | Tasks are coupled or must run in a fixed order | The work splits into independent domains that benefit from concurrency |
| Execution skill | `subagent-driven-development` (recommended) or `executing-plans` | `dispatching-parallel-agents` |

Pick the team path by choosing it when `writing-plans` asks, or by saying so up front (e.g. *"write this as a team plan"* / *"use a team of specialists"*). `writing-plans` then derives the specialist roles the work needs from the task content (no fixed taxonomy — e.g. a DB-migration specialist, an API specialist, a React specialist), lays out the work-streams and their dependencies, and tags each task with its role. The choice is recorded in an `**Execution:**` line in the plan header, and is **orthogonal** to whether the work is split across multiple sessions.

### 2. Enable real agent teams in your harness (optional)

A team plan executes on **any** harness: by default the lead dispatches one parallel subagent per dependency-free work-stream (via the `Task` tool / `dispatching-parallel-agents`), reviews each as it returns, and launches the next wave as dependencies clear. That needs **no special config**.

To instead run the work-streams as *first-class concurrent agents* — independent teammates with their own context window, a shared task list, and direct agent-to-agent messaging — turn on your harness's multi-agent feature. When it's available, the team handoff (see below) **prefers it** and falls back to parallel subagents otherwise.

**Claude Code** — agent teams are **experimental and off by default**. Enable them in `~/.claude/settings.json` (or project `.claude/settings.json`):

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

Optional related settings: `"teammateMode"` (`auto` | `in-process` | `tmux`) and `"teammateDefaultModel"` (e.g. `"sonnet"`). Requires a recent Claude Code; restart it after editing settings. See the official [agent teams docs](https://code.claude.com/docs/en/agent-teams). With it on, a team plan's work-streams run as named teammates that coordinate through a shared task list, rather than report-back-only subagents.

**Other harnesses** — most support some form of concurrent/multi-agent execution; the team path maps onto whatever each provides. Activation mechanics come from each tool's official docs and evolve quickly, so check your harness's current documentation:

| Harness | Multi-agent support | How to enable / use |
|---|---|---|
| **Claude Code** | Experimental *agent teams* | `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in settings.json `env` (above). Parallel `Task` subagents work without it. |
| **Codex CLI / App** | Stable, on by default | `features.multi_agent` (default `true`) in `~/.codex/config.toml`; tune `agents.max_threads`. Ask it to spawn agents; `/agent` switches threads. |
| **Gemini CLI** | Subagents (added 2026) | Define subagents (`/agents`, or markdown in `.gemini/agents/`); delegate with `@agent-name`; request parallel fan-out explicitly. |
| **Factory Droid** | Coordinator/worker "mission" mode | `droid exec --mission` (with `--worker-model` / `--validator-model`); or `-w/--worktree` for parallel sessions. |
| **OpenCode** | Subagents | Agents with `mode: subagent` in config or `.opencode/agents/`; auto-invoked or `@subagent-name`. |
| **GitHub Copilot CLI** | `/fleet` parallel agents | Run `/fleet`; define custom role agents and invoke with `@agent-name`. |
| **Cursor** | Parallel agents / subagents (UI) | Enable via the Agents Window / parallel-agents UI — not a config flag. |

If the work is genuinely sequential, stick with the default path — concurrency only helps when the streams are actually independent.

## Installation

Installation differs by harness. If you use more than one, install Superpowers separately for each one.

### Claude Code

Superpowers is available via the [official Claude plugin marketplace](https://claude.com/plugins/superpowers)

#### This fork (superpowers-html)

This fork ships as its own Claude Code plugin marketplace, so you can install it straight from GitHub:

- Register the fork's marketplace:

  ```bash
  /plugin marketplace add patogeno/superpowers-html
  ```

- Install the plugin (the fork's marketplace is named `superpowers-dev`):

  ```bash
  /plugin install superpowers@superpowers-dev
  ```

The plugin name is still `superpowers`, so install this **instead of** the upstream Superpowers plugin — having both enabled at once will conflict. Disable or uninstall any existing `superpowers` plugin first.

The sections below describe installing the **upstream** Superpowers from `obra/*`; use them only if you want the original Markdown-based version rather than this fork.

#### Official Marketplace

- Install the plugin from Anthropic's official marketplace:

  ```bash
  /plugin install superpowers@claude-plugins-official
  ```

#### Superpowers Marketplace

The Superpowers marketplace provides Superpowers and some other related plugins for Claude Code.

- Register the marketplace:

  ```bash
  /plugin marketplace add obra/superpowers-marketplace
  ```

- Install the plugin from this marketplace:

  ```bash
  /plugin install superpowers@superpowers-marketplace
  ```

### Antigravity

Install Superpowers as a plugin from this repository:

```bash
agy plugin install https://github.com/obra/superpowers
```

Antigravity runs the plugin's session-start hook, so Superpowers is active from
the first message. Reinstall with the same command to update.

### Codex App

Superpowers is available via the [official Codex plugin marketplace](https://github.com/openai/plugins).

- In the Codex app, click on Plugins in the sidebar.
- You should see `Superpowers` in the Coding section.
- Click the `+` next to Superpowers and follow the prompts.

### Codex CLI

Superpowers is available via the [official Codex plugin marketplace](https://github.com/openai/plugins).

- Open the plugin search interface:

  ```bash
  /plugins
  ```

- Search for Superpowers:

  ```bash
  superpowers
  ```

- Select `Install Plugin`.

### Cursor

- In Cursor Agent chat, install from marketplace:

  ```text
  /add-plugin superpowers
  ```

- Or search for "superpowers" in the plugin marketplace.

### Factory Droid

- Register the marketplace:

  ```bash
  droid plugin marketplace add https://github.com/obra/superpowers
  ```

- Install the plugin:

  ```bash
  droid plugin install superpowers@superpowers
  ```

### Gemini CLI

- Install the extension:

  ```bash
  gemini extensions install https://github.com/obra/superpowers
  ```

- Update later:

  ```bash
  gemini extensions update superpowers
  ```

### GitHub Copilot CLI

- Register the marketplace:

  ```bash
  copilot plugin marketplace add obra/superpowers-marketplace
  ```

- Install the plugin:

  ```bash
  copilot plugin install superpowers@superpowers-marketplace
  ```

### Kimi Code

Superpowers is available in Kimi Code's plugin marketplace.

- Open Kimi Code's plugin manager:

  ```text
  /plugins
  ```

- Go to `Marketplace` > `Superpowers` and install it.

- Or install directly from this repository:

  ```text
  /plugins install https://github.com/obra/superpowers
  ```

- Detailed docs: [docs/README.kimi.md](docs/README.kimi.md)

### OpenCode

OpenCode uses its own plugin install; install Superpowers separately even if you
already use it in another harness.

- Tell OpenCode:

  ```
  Fetch and follow instructions from https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/.opencode/INSTALL.md
  ```

- Detailed docs: [docs/README.opencode.md](docs/README.opencode.md)

### Pi

Install Superpowers as a Pi package from this repository:

```bash
pi install git:github.com/obra/superpowers
```

For local development, run Pi with this checkout loaded as a temporary package:

```bash
pi -e /path/to/superpowers
```

The Pi package loads the Superpowers skills and a small extension that injects the `using-superpowers` bootstrap at session startup and again after compaction. Pi has native skills, so no compatibility `Skill` tool is required. Subagent and task-list tools remain optional Pi companion packages.

### Installing this fork on other harnesses

The fork's changes live in the shared skill files, which every harness loads. For harnesses that can install from an arbitrary Git repository, point the installer at `patogeno/superpowers-html` (or `https://github.com/patogeno/superpowers-html`) in place of `obra/superpowers`:

- **Gemini CLI:** `gemini extensions install https://github.com/patogeno/superpowers-html`
- **Factory Droid:** `droid plugin marketplace add https://github.com/patogeno/superpowers-html` then `droid plugin install superpowers@superpowers-dev`
- **GitHub Copilot CLI:** `copilot plugin marketplace add patogeno/superpowers-html` then `copilot plugin install superpowers@superpowers-dev`
- **OpenCode:** tell OpenCode to `Fetch and follow instructions from https://raw.githubusercontent.com/patogeno/superpowers-html/refs/heads/main/.opencode/INSTALL.md`

**Codex CLI/App and Cursor** install from their own curated marketplaces (`openai/plugins`, the Cursor marketplace), which carry only upstream Superpowers. To use this fork there, clone the repo and install it locally per that harness's local-plugin instructions.

## Troubleshooting

### Windows: skills not auto-triggering

On Windows the SessionStart hook runs through `hooks/run-hook.cmd`, which needs **bash** (shipped with Git for Windows) to execute the bootstrap that makes skills auto-trigger. If skills never activate — your agent jumps straight into coding instead of brainstorming — bash probably wasn't found.

The wrapper looks for bash in this order: the standard Git for Windows locations (`C:\Program Files\Git\bin\bash.exe` and the `(x86)` variant), then `bash` on `PATH`, then bash bundled next to whichever `git` is on `PATH` (so a non-standard install like `D:\Tools\Git` is found). If none resolve, it prints a one-line warning to stderr and lets the session start without the bootstrap.

To fix it:

- Install [Git for Windows](https://gitforwindows.org/) (the default location is detected automatically), **or**
- Make sure `git` (or `bash`) is on your `PATH` — open a new terminal and check `where git` / `where bash` resolves.

After installing, start a fresh Claude Code session so the hook runs again.

## The Basic Workflow

1. **brainstorming** - Activates before writing code. Refines rough ideas through questions, explores alternatives, presents design in sections for validation. Saves design document.

2. **using-git-worktrees** - Activates after design approval. Creates isolated workspace on new branch, runs project setup, verifies clean test baseline.

3. **writing-plans** - Activates with approved design. Breaks work into bite-sized tasks (2-5 minutes each). Every task has exact file paths, complete code, verification steps.

4. **subagent-driven-development**, **executing-plans**, or **dispatching-parallel-agents** - Activates with plan, per the execution model chosen when the plan was written ([see above](#execution-models-for-implementation-plans)). A *sequential* plan dispatches a fresh subagent per task with two-stage review (spec compliance, then code quality) or executes in batches with human checkpoints; a *team* plan dispatches specialist agents across independent work-streams concurrently.

5. **test-driven-development** - Activates during implementation. Enforces RED-GREEN-REFACTOR: write failing test, watch it fail, write minimal code, watch it pass, commit. Deletes code written before tests.

6. **requesting-code-review** - Activates between tasks. Reviews against plan, reports issues by severity. Critical issues block progress.

7. **finishing-a-development-branch** - Activates when tasks complete. Verifies tests, presents options (merge/PR/keep/discard), cleans up worktree.

**The agent checks for relevant skills before any task.** Mandatory workflows, not suggestions.

## What's Inside

### Skills Library

**Testing**
- **test-driven-development** - RED-GREEN-REFACTOR cycle (includes testing anti-patterns reference)

**Debugging**
- **systematic-debugging** - 4-phase root cause process (includes root-cause-tracing, defense-in-depth, condition-based-waiting techniques)
- **verification-before-completion** - Ensure it's actually fixed

**Collaboration** 
- **brainstorming** - Socratic design refinement
- **writing-plans** - Detailed implementation plans
- **executing-plans** - Batch execution with checkpoints
- **dispatching-parallel-agents** - Concurrent subagent workflows
- **requesting-code-review** - Pre-review checklist
- **receiving-code-review** - Responding to feedback
- **using-git-worktrees** - Parallel development branches
- **finishing-a-development-branch** - Merge/PR decision workflow
- **subagent-driven-development** - Fast iteration with two-stage review (spec compliance, then code quality)

**Meta**
- **writing-skills** - Create new skills following best practices (includes testing methodology)
- **using-superpowers** - Introduction to the skills system

## Philosophy

- **Test-Driven Development** - Write tests first, always
- **Systematic over ad-hoc** - Process over guessing
- **Complexity reduction** - Simplicity as primary goal
- **Evidence over claims** - Verify before declaring success

Read [the original release announcement](https://blog.fsck.com/2025/10/09/superpowers/).

## Contributing

The general contribution process for Superpowers is below. Keep in mind that we don't generally accept contributions of new skills and that any updates to skills must work across all of the coding agents we support.

1. Fork the repository
2. Switch to the 'dev' branch
3. Create a branch for your work
4. Follow the `writing-skills` skill for creating and testing new and modified skills
5. Submit a PR, being sure to fill in the pull request template.

Skill-behavior tests use the eval harness submodule at `evals/`. After cloning this repo, run `git submodule update --init evals`, then see `evals/README.md` for setup. Plugin-infrastructure tests live at `tests/` and run via the relevant `run-*.sh` or `npm test`.

See `skills/writing-skills/SKILL.md` for the complete guide.

## Updating

Superpowers updates are somewhat coding-agent dependent, but are often automatic.

## License

MIT License - see LICENSE file for details

## Visual companion telemetry

Because skills and plugins don't provide any feedback to creators, we have no idea how many of you are using Superpowers. By default, the Prime Radiant logo on brainstorming's optional visual companion feature is loaded from our website. It includes the version of Superpowers in use. It does not include any details about your project, prompt, or coding agent. We don't see your clicks or anything about what you're building. This helps us have a rough idea of how many folks are using Superpowers and which version of Superpowers they're using. It's 100% optional. To disable this, set the environment variable `SUPERPOWERS_DISABLE_TELEMETRY` to any true value. Superpowers also honors Claude Code's `DISABLE_TELEMETRY` and `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` opt-outs.

## Community

Superpowers is built by [Jesse Vincent](https://blog.fsck.com) and the rest of the folks at [Prime Radiant](https://primeradiant.com).

- **Discord**: [Join us](https://discord.gg/35wsABTejz) for community support, questions, and sharing what you're building with Superpowers
- **Issues**: https://github.com/obra/superpowers/issues
- **Release announcements**: [Sign up](https://primeradiant.com/superpowers/) to get notified about new versions
