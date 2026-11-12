# Superpowers

Superpowers is a complete software development methodology for your coding agents, built on top of a set of composable skills and some initial instructions that make sure your agent uses them.

> **This is `superpowers-html`** — a fork of [obra/superpowers](https://github.com/obra/superpowers) that makes the human-facing design **spec** render as a rich, self-contained **HTML** document (diagrams, tables) instead of plain Markdown, adds a Markdown multi-session workflow with a cross-session learnings log, and lets you choose at planning time between sequential subagents and a team of specialized agents. The agent-only execution layer is unchanged. See [What this fork changes](#what-this-fork-changes-superpowers-html) and [how to install it](#this-fork-superpowers-html).

## Table of Contents

- [How it works](#how-it-works)
- [Commercial Services](#commercial-services)
- [What this fork changes (superpowers-html)](#what-this-fork-changes-superpowers-html)
- [Execution models for implementation plans](#execution-models-for-implementation-plans)
- [Getting Started](#installation)
  - [Claude Code](#claude-code)
  - [Antigravity](#antigravity)
  - [Codex App](#codex-app)
  - [Codex CLI](#codex-cli)
  - [Cursor](#cursor)
  - [Devin CLI](#devin-cli)
  - [Factory Droid](#factory-droid)
  - [Gemini CLI](#gemini-cli)
  - [GitHub Copilot CLI](#github-copilot-cli)
  - [Grok Build CLI](#grok-build-cli)
  - [Kimi Code](#kimi-code)
  - [OpenCode](#opencode)
  - [Pi](#pi)
  - [Qwen Code](#qwen-code)
  - [Hermes Agent](#hermes-agent)
  - [Muse](#muse)
  - [Installing this fork on other harnesses](#installing-this-fork-on-other-harnesses)
- [Troubleshooting](#troubleshooting)
- [The Basic Workflow](#the-basic-workflow)
- [When Something Goes Wrong](#when-something-goes-wrong)
- [Community](#community)
- [What's Inside](#whats-inside)
- [Philosophy](#philosophy)
- [Contributing](#contributing)
- [Updating](#updating)
- [License](#license)
- [Visual companion telemetry](#visual-companion-telemetry)

## How it works

It starts from the moment you fire up your coding agent. As soon as it sees that you're building something, it *doesn't* just jump into trying to write code. Instead, it steps back and asks you what you're really trying to do. 

Once it's teased a spec out of the conversation, it shows it to you in chunks short enough to actually read and digest. 

After you've signed off on the design, your agent puts together an implementation plan that's clear enough for an enthusiastic junior engineer with poor taste, no judgement, no project context, and an aversion to testing to follow. It emphasizes true red/green TDD, YAGNI (You Aren't Gonna Need It), and DRY. 

Next up, once you say "go", it works through each engineering task, inspecting and reviewing the work, and continuing forward — either a *subagent-driven-development* process (a fresh subagent per task) or a team of specialized agents working concurrently, whichever you chose when the plan was written. It's not uncommon for your agent to work autonomously for a couple hours at a time without deviating from the plan you put together.

There's a bunch more to it, but that's the core of the system. And because the skills trigger automatically, you don't need to do anything special. Your coding agent just has Superpowers.

## Commercial Services

If you're using Superpowers in enterprise and could benefit from commercial support, additional tooling, or managed spending, please don't hesitate to drop us a line at sales@primeradiant.com.

## What this fork changes (superpowers-html)

Upstream Superpowers produces its human-facing artifacts as Markdown. This fork keeps everything Superpowers does and changes **what you read and review**. Designs show you the experience first, as a layered HTML spec with a clickable prototype that you can open on a PC or a phone, and on Claude Code they are published as Claude artifacts you can comment on. Plans stay canonical Markdown and are accepted by default, so your review time goes into the design. Big plans run as a roadmap of sessions, staged or overnight. The agent-executed *code* (the brainstorm server, scripts) is left identical to upstream, which keeps the fork easy to merge.

**What's added:**

- **Experience-first designs.** `brainstorming` (upstream's rebuilt skill, with the fork's edits) writes the design as a layered HTML page: what it's for, what users can do, the screens, how it flows, the approaches, and then the **technical design folded** at the bottom, where you open it only when you want to. Work with screens also gets a **clickable prototype** styled like the product. They sit together in the topic folder (`docs/superpowers/specs/YYYY-MM-DD-<topic>/index.html` + `prototype.html`).
- **Claude artifacts on Claude Code.** Whenever something is easier to see than read, it is published as a private claude.ai artifact and linked in chat, with no "want me to show you?" offer. The spec and its prototype go out as one artifact, every revision keeps the same link, and you can comment on either page or write a general note in chat; Claude reads both. On other harnesses the same pages are written locally. Upstream's browser visual companion is retired (its server stays on disk, unused).
- **A new `html-artifacts` skill.** Templates for the layered spec, the prototype, and the run report; one canonical, zero-dependency stylesheet (light/dark with the artifact viewer's theme guards, responsive down to a phone); and a reference for publishing and reading comments on Claude Code. A Node test suite enforces self-containment and responsiveness.
- **Design is the last human gate; plans are accepted by default.** Approving the design and its prototype is the final checkpoint. `writing-plans` writes the plan, posts a short summary, and starts executing. It stops again only for a **design issue**: an ambiguous or contradictory requirement, one that can't be met, or a user-visible decision the design never made. Say *"let me review the plan first"* to restore the plan gate.
- **Build and Review, in plain words.** `writing-plans` records **Build** (*one at a time*, or *parallel* as a team of specialists) and **Review** (*standard*, or a *panel* of reviewers with user-experience, correctness, security and test lenses) in the plan header. Say *"fast"* or *"thorough"* to change them.
- **Multi-session runs, staged or overnight.** For work too large for one session, `writing-plans` produces a roadmap folder and the new **`running-multi-session-plans`** skill runs it. Each session gets a fresh lead with a clean context. **Staged** (the default) stops after each session with a report for you to answer; **autonomous** runs every session back to back and leaves a night report. Switch any time: *"go autonomous until it's done"*, *"stop after this session"*. Calls made without you take the option easiest to undo and are flagged, hard ones get a two-agent second opinion first, and anything outward (push, PR, deploy, deletes, sends) is parked for you in either mode.
- **Learnings split by topic.** A roadmap's `learnings/` folder holds an index, one file per topic opening with its *current truths*, and a `feedback.md` of what you told the run. Each session plan names the topics its lead reads, so no session reads everything, and long topic files are condensed.
- **Claude 5 tuning.** `subagent-driven-development/references/claude-5-models.md` maps the vendor-neutral model tiers onto Haiku 4.5 · Sonnet 5.5 · Opus 5.5 · Fable 5.1 and records what changes in dispatch prompts on Claude 5. `writing-skills/references/claude-5-skill-authoring.md` condenses Anthropic's Claude 5 prompting guidance, with source links.
- **Windows hook fallback.** On top of upstream's Windows bash discovery, `run-hook.cmd` also finds the bash beside a `git` on `PATH` (a Git install in a non-standard folder), and warns on stderr instead of failing silently when there's no bash at all.

**Principles:** every page is self-contained HTML (no CDNs, no build step), reads on a desktop, a tablet and a phone in light and dark, and draws diagrams as inline SVG. Prototypes and mockups carry the product's own look. Implementation plans, roadmaps and learnings stay canonical Markdown so execution skills read and tick them directly.

| Artifact | Upstream | This fork |
|---|---|---|
| Design doc | Markdown | **Layered HTML**: experience first, technical design folded |
| Visuals | Browser visual companion (live server, offered) | **Clickable prototype + mockup pages**, published as Claude artifacts on Claude Code, local files elsewhere |
| Feedback on the design | chat | chat **and** artifact comments |
| Plan approval | you review the plan | **accepted by default**; stops only for design issues |
| Build / Review settings | — | **one at a time / parallel · standard / panel** |
| Multi-session roadmap | — | **staged or autonomous runs**, one run report, switch any time |
| Learnings | — | **split by topic** with current truths and your feedback |
| Implementation plan | Markdown | Markdown (canonical) |
| Agent-executed server/scripts | shipped | unchanged (kept, not offered) |

> Why HTML? For a human–AI collaborative *output* like the design spec, HTML gives better information density, navigability, and diagrams/tables — making the work legible enough that you actually want to read it. The win is at the review layer, not the agent-instruction layer.

## Execution models for implementation plans

There are **two separate, independent decisions** here — don't conflate them:

1. **Which path the plan takes** — a *planning-time* choice inside `writing-plans` (sequential subagents vs team of specialists). This shapes the plan and applies on **any** harness.
2. **Whether your harness runs the work as first-class concurrent agents** — a *harness capability* you turn on once in config (e.g. Claude Code's experimental **agent teams**). This is optional: a team plan still runs without it, just as ordinary parallel subagents.

### 1. Pick the execution path (planning time)

When `writing-plans` turns an approved design into a plan, it picks how the plan will be executed before it writes the tasks, because the choice changes the shape of the plan. It records the choice and a one-line reason in the plan header, and you can name a different one at any time. The plan itself is always canonical Markdown either way.

| | **Sequential subagents** (default) | **Team of specialists** |
|---|---|---|
| Plan shape | A plain ordered list of tasks | Tasks grouped into parallel **work-streams** with an explicit dependency graph; each task tagged `**Specialist:** <role>` |
| How it runs | A fresh subagent implements one task at a time, with review between tasks | One specialist agent per dependency-free work-stream runs **concurrently**; the next wave launches as dependencies clear |
| Best when | Tasks are coupled or must run in a fixed order | The work splits into independent domains that benefit from concurrency |
| Execution skill | `subagent-driven-development` (fresh subagent + review per task) or `executing-plans` (Native: inline, one final review) — `writing-plans` recommends one for the plan | `dispatching-parallel-agents` |

Force the team path by saying so up front (e.g. *"write this as a team plan"* / *"use a team of specialists"*). `writing-plans` then derives the specialist roles the work needs from the task content (no fixed taxonomy — e.g. a DB-migration specialist, an API specialist, a React specialist), lays out the work-streams and their dependencies, and tags each task with its role. The choice is recorded in an `**Execution:**` line in the plan header, and is **orthogonal** to whether the work is split across multiple sessions.

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

Antigravity lists each installed skill's description, and the description of
the `using-superpowers` skill prompts the model to load that skill at the start
of a conversation. Reinstall with the same command to update.

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

### Devin CLI

- Install the plugin from this repository:

  ```bash
  devin plugins install obra/superpowers
  ```

- Update to the latest version with:

  ```bash
  devin plugins update superpowers
  ```

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

### Grok Build CLI

Superpowers is available via the [official Grok plugin marketplace](https://github.com/xai-org/plugin-marketplace).

- Install the plugin from xAI's official marketplace:

  ```bash
  grok plugin install superpowers@xai-official --trust
  ```

- Or open the marketplace in the TUI, search for Superpowers, and install it:

  ```text
  /marketplace
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

### Qwen Code

Qwen Code installs plugins from Claude Code marketplaces directly.

- Install the plugin from this repository, and pick `superpowers` when prompted:

  ```bash
  qwen extensions install obra/superpowers
  ```

- Update later:

  ```bash
  qwen extensions update superpowers
  ```

### Hermes Agent

Install Superpowers as a Hermes plugin from this repository:

```bash
hermes plugins install obra/superpowers --enable
```

Restart any active Hermes sessions after installing. Note: Hermes has no
post-compaction hook, so a very long session that compacts over its first
turn loses the bootstrap — start a fresh session if skills stop triggering.

### Muse

Superpowers is available as a native Muse plugin — same repo, same skills, all harnesses. The `using-superpowers` bootstrap is injected via the native `SessionStart` hook alongside Claude Code, Codex, Cursor, Gemini, Pi, and the rest — no per-session opt-in.

- Install from a local checkout:

  ```bash
  muse plugins install ./
  muse plugins approve superpowers
  ```

  Or clone and install:

  ```bash
  git clone https://github.com/obra/superpowers.git
  muse plugins install ./superpowers
  muse plugins approve superpowers
  ```

- Update later:

  ```bash
  muse plugins update superpowers
  ```

Restart any active Muse sessions after installing so the `SessionStart` hook takes effect — skills are active immediately, hooks require approval on first install. To verify, start a fresh session and send `Let's make a react todo list` — a working install auto-triggers `brainstorming` before any code is written. Version is tracked in `.version-bump.json` so `scripts/bump-version.sh` keeps it in sync.

### Installing this fork on other harnesses

The fork's changes live in the shared skill files, which every harness loads. For harnesses that can install from an arbitrary Git repository, point the installer at `patogeno/superpowers-html` (or `https://github.com/patogeno/superpowers-html`) in place of `obra/superpowers`:

- **Devin CLI:** `devin plugins install patogeno/superpowers-html`
- **Gemini CLI:** `gemini extensions install https://github.com/patogeno/superpowers-html`
- **Factory Droid:** `droid plugin marketplace add https://github.com/patogeno/superpowers-html` then `droid plugin install superpowers@superpowers-dev`
- **GitHub Copilot CLI:** `copilot plugin marketplace add patogeno/superpowers-html` then `copilot plugin install superpowers@superpowers-dev`
- **Kimi Code:** `/plugins install https://github.com/patogeno/superpowers-html`
- **OpenCode:** tell OpenCode to `Fetch and follow instructions from https://raw.githubusercontent.com/patogeno/superpowers-html/refs/heads/main/.opencode/INSTALL.md`
- **Pi:** `pi install git:github.com/patogeno/superpowers-html`
- **Hermes Agent:** `hermes plugins install patogeno/superpowers-html --enable`
- **Muse:** `git clone https://github.com/patogeno/superpowers-html.git`, then `muse plugins install ./superpowers-html` and `muse plugins approve superpowers`

**Codex CLI/App and Cursor** install from their own curated marketplaces (`openai/plugins`, the Cursor marketplace), which carry only upstream Superpowers. To use this fork there, clone the repo and install it locally per that harness's local-plugin instructions.

## Troubleshooting

### Windows: skills not auto-triggering

On Windows the SessionStart hook needs **bash** (shipped with Git for Windows) to execute the bootstrap that makes skills auto-trigger. If skills never activate — your agent jumps straight into coding instead of brainstorming — bash probably wasn't found.

Claude Code ≥ 2.1.81 resolves the hook's `shell: "bash"` declaration to Git for Windows directly and prompts you to install it when it's missing. On older versions the hook runs through `hooks/run-hook.cmd`, which looks for bash in this order: the standard Git for Windows locations (`C:\Program Files\Git\bin\bash.exe` and the `(x86)` variant), then `bash` on `PATH`, then bash bundled next to whichever `git` is on `PATH` (so a non-standard install like `D:\Tools\Git` is found). If none resolve, it prints a one-line warning to stderr and lets the session start without the bootstrap.

To fix it:

- Install [Git for Windows](https://gitforwindows.org/) (the default location is detected automatically), **or**
- Make sure `git` (or `bash`) is on your `PATH` — open a new terminal and check `where git` / `where bash` resolves.

After installing, start a fresh Claude Code session so the hook runs again.

## The Basic Workflow

1. **brainstorming** - Activates before building anything. Draws out what you actually want, and why, through questions that get you describing it, then plays its understanding back for correction. Small changes get agreed in chat; projects get a written design document a builder could plan from.

2. **using-git-worktrees** - Activates after design approval. Creates isolated workspace on new branch, runs project setup, verifies clean test baseline.

3. **writing-plans** - Activates with approved design. Breaks work into bite-sized tasks (2-5 minutes each). Every task has exact file paths, complete code, verification steps.

4. **subagent-driven-development**, **executing-plans**, or **dispatching-parallel-agents** - Activates with plan, per the execution model chosen when the plan was written ([see above](#execution-models-for-implementation-plans)). A *sequential* plan either dispatches a fresh subagent per task with a review after each (most thorough), or implements every task inline in the current session with one fresh review of the whole branch at the end (cheapest); a *team* plan dispatches specialist agents across independent work-streams concurrently.

5. **test-driven-development** - Activates during implementation. Enforces RED-GREEN-REFACTOR: write failing test, watch it fail, write minimal code, watch it pass, commit. Deletes code written before tests.

6. **requesting-code-review** - Activates between tasks. Reviews against plan, reports issues by severity. Critical issues block progress.

7. **finishing-a-development-branch** - Activates when tasks complete. Verifies tests, presents options (merge/PR/keep/discard), cleans up worktree.

**The agent checks for relevant skills before any task.** Mandatory workflows, not suggestions.

## When Something Goes Wrong

Sometimes a session misbehaves: a skill fires when it shouldn't, stays silent when it should, or the agent ignores its plan, repeats work, or burns more tokens than you'd expect. Ask your coding agent to "figure out what went wrong with superpowers in this session" and it will invoke the **diagnosing-superpowers** skill. To examine an earlier session, name it: "figure out what went wrong with superpowers in session `<id>`".

The skill reads the session transcript, reports what happened with line-level evidence, and, if you want, packages a scrubbed bundle for a bug report.

## Community

Superpowers is built by [Jesse Vincent](https://blog.fsck.com) and the rest of the folks at [Prime Radiant](https://primeradiant.com).

- **Discord**: [Join us](https://discord.gg/35wsABTejz) for community support, questions, and sharing what you're building with Superpowers
- **Issues**: https://github.com/obra/superpowers/issues
- **Release announcements**: [Sign up](https://primeradiant.com/superpowers/) to get notified about new versions

## What's Inside

### Skills Library

**Testing**
- **test-driven-development** - RED-GREEN-REFACTOR cycle (includes testing anti-patterns reference)

**Debugging**
- **systematic-debugging** - 4-phase root cause process (includes root-cause-tracing, defense-in-depth, condition-based-waiting techniques)
- **verification-before-completion** - Ensure it's actually fixed
- **diagnosing-superpowers** - Work out what went wrong in a session, with evidence; export a scrubbed bundle or file an issue

**Collaboration** 
- **brainstorming** - Drawing out intent before building
- **writing-plans** - Detailed implementation plans
- **executing-plans** - Inline plan execution: one context, one final review
- **running-multi-session-plans** - Runs a multi-session roadmap, staged or autonomous, with a fresh lead per session (fork)
- **html-artifacts** - Layered design specs, clickable prototypes and run reports, published as Claude artifacts on Claude Code (fork)
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

The general contribution process for Superpowers is below. Keep in mind that we don't generally accept contributions of new skills and that any updates to skills must work across all of the coding agents we support. We also don't accept agent-written PRs that fix issues filed by someone else unless a maintainer asked for one, even when you hit the same problem; add your report to the existing issue instead.

1. Fork the repository
2. Switch to the 'dev' branch
3. Create a branch for your work
4. Follow the `writing-skills` skill for creating and testing new and modified skills
5. Submit a PR, filling in every section of the pull request template, including the summary a human writes in their own words.

Skill-behavior tests use the drill eval harness from [superpowers-evals](https://github.com/prime-radiant-inc/superpowers-evals/), cloned into `evals/` — see `evals/README.md` for setup. Plugin-infrastructure tests live at `tests/` and run via the relevant `run-*.sh` or `npm test`.

See `skills/writing-skills/SKILL.md` for the complete guide.

## Updating

Superpowers updates are somewhat coding-agent dependent, but are often automatic.

## License

MIT License - see LICENSE file for details

## Visual companion telemetry

Because skills and plugins don't provide any feedback to creators, we have no idea how many of you are using Superpowers. By default, the Prime Radiant logo on brainstorming's optional visual companion feature is loaded from our website. It includes the version of Superpowers in use. It does not include any details about your project, prompt, or coding agent. We don't see your clicks or anything about what you're building. This helps us have a rough idea of how many folks are using Superpowers and which version of Superpowers they're using. It's 100% optional. To disable this, set the environment variable `SUPERPOWERS_DISABLE_TELEMETRY` to any true value. Superpowers also honors Claude Code's `DISABLE_TELEMETRY` and `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` opt-outs.
