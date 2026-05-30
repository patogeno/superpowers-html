# Superpowers

Superpowers is a complete software development methodology for your coding agents, built on top of a set of composable skills and some initial instructions that make sure your agent uses them.

> **This is `superpowers-html`** — a fork of [obra/superpowers](https://github.com/obra/superpowers) that makes the human-facing design **spec** and implementation **plan** render as rich, self-contained **HTML** (diagrams, tables, navigable task lists) instead of plain Markdown, and adds a multi-session workflow with a cross-session learnings log. The agent-only execution layer is unchanged. See [What this fork changes](#what-this-fork-changes-superpowers-html) and [how to install it](#this-fork-superpowers-html).

## Quickstart

Give your agent Superpowers: [Claude Code](#claude-code), [Codex CLI](#codex-cli), [Codex App](#codex-app), [Factory Droid](#factory-droid), [Gemini CLI](#gemini-cli), [OpenCode](#opencode), [Cursor](#cursor), [GitHub Copilot CLI](#github-copilot-cli).

## How it works

It starts from the moment you fire up your coding agent. As soon as it sees that you're building something, it *doesn't* just jump into trying to write code. Instead, it steps back and asks you what you're really trying to do. 

Once it's teased a spec out of the conversation, it shows it to you in chunks short enough to actually read and digest. 

After you've signed off on the design, your agent puts together an implementation plan that's clear enough for an enthusiastic junior engineer with poor taste, no judgement, no project context, and an aversion to testing to follow. It emphasizes true red/green TDD, YAGNI (You Aren't Gonna Need It), and DRY. 

Next up, once you say "go", it launches a *subagent-driven-development* process, having agents work through each engineering task, inspecting and reviewing their work, and continuing forward. It's not uncommon for Claude to be able to work autonomously for a couple hours at a time without deviating from the plan you put together.

There's a bunch more to it, but that's the core of the system. And because the skills trigger automatically, you don't need to do anything special. Your coding agent just has Superpowers.


## What this fork changes (superpowers-html)

Upstream Superpowers produces its human-facing artifacts as Markdown. This fork keeps everything Superpowers does and changes **only what a human reads and reviews** — the design spec and the implementation plan — so they render as polished, self-contained HTML that's easier to navigate and react to. Nothing the *agent* executes changes, which keeps the fork easy to merge with upstream.

**What's added:**

- **A new `html-artifacts` skill** — one canonical, zero-dependency stylesheet plus HTML templates (spec, plan, roadmap, learnings) and authoring rules, with a small Node test suite that enforces self-containment. It's the shared design system every artifact inlines.
- **`brainstorming` emits an HTML design spec.** The spec is written to `…-design.html` (built from `templates/spec.html`) with at least one hand-authored inline **SVG** diagram and at least one semantic **table**, instead of `…-design.md`.
- **`writing-plans` emits an HTML plan _view_.** The Markdown plan stays **canonical** (execution skills read and tick it, unchanged); alongside it the skill renders a navigable HTML view from `templates/plan.html` carrying a machine-checkable `sp-task-state` mirror of the Markdown checkboxes.
- **A multi-session workflow.** For work too large for one session, `writing-plans` (by its own judgment) produces a per-feature folder with a **roadmap**, self-contained **session plans** (canonical Markdown + an HTML view each), and a cross-session **learnings log** (What happened · Deviations · Surprises · Follow-ups).

**Principles:** every artifact is a single self-contained HTML file — no CDNs, no build step, no external resources; diagrams are hand-authored inline SVG; and the Markdown plan remains the source of truth wherever a machine reads it.

| Artifact | Upstream | This fork |
|---|---|---|
| Design spec | Markdown | **HTML** (inline SVG + tables) |
| Implementation plan | Markdown | Markdown (canonical) **+ HTML view** |
| Multi-session roadmap / learnings log | — | **HTML** |
| Agent-only / execution skills | Markdown | unchanged |

> Why HTML? For human–AI collaborative *outputs* like specs and plans, HTML gives better information density, navigability, and diagrams/tables — making the work legible enough that you actually want to read it. The win is at the review layer, not the agent-instruction layer.

## Sponsorship

If Superpowers has helped you do stuff that makes money and you are so inclined, I'd greatly appreciate it if you'd consider [sponsoring my opensource work](https://github.com/sponsors/obra).

Thanks! 

- Jesse


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

### Codex App

Superpowers is available via the [official Codex plugin marketplace](https://github.com/openai/plugins).

- In the Codex app, click on Plugins in the sidebar.
- You should see `Superpowers` in the Coding section.
- Click the `+` next to Superpowers and follow the prompts.

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

### OpenCode

OpenCode uses its own plugin install; install Superpowers separately even if you
already use it in another harness.

- Tell OpenCode:

  ```
  Fetch and follow instructions from https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/.opencode/INSTALL.md
  ```

- Detailed docs: [docs/README.opencode.md](docs/README.opencode.md)

### Cursor

- In Cursor Agent chat, install from marketplace:

  ```text
  /add-plugin superpowers
  ```

- Or search for "superpowers" in the plugin marketplace.

### GitHub Copilot CLI

- Register the marketplace:

  ```bash
  copilot plugin marketplace add obra/superpowers-marketplace
  ```

- Install the plugin:

  ```bash
  copilot plugin install superpowers@superpowers-marketplace
  ```

### Installing this fork on other harnesses

The fork's changes live in the shared skill files, which every harness loads. For harnesses that can install from an arbitrary Git repository, point the installer at `patogeno/superpowers-html` (or `https://github.com/patogeno/superpowers-html`) in place of `obra/superpowers`:

- **Gemini CLI:** `gemini extensions install https://github.com/patogeno/superpowers-html`
- **Factory Droid:** `droid plugin marketplace add https://github.com/patogeno/superpowers-html` then `droid plugin install superpowers@superpowers-dev`
- **GitHub Copilot CLI:** `copilot plugin marketplace add patogeno/superpowers-html` then `copilot plugin install superpowers@superpowers-dev`
- **OpenCode:** tell OpenCode to `Fetch and follow instructions from https://raw.githubusercontent.com/patogeno/superpowers-html/refs/heads/main/.opencode/INSTALL.md`

**Codex CLI/App and Cursor** install from their own curated marketplaces (`openai/plugins`, the Cursor marketplace), which carry only upstream Superpowers. To use this fork there, clone the repo and install it locally per that harness's local-plugin instructions.

## The Basic Workflow

1. **brainstorming** - Activates before writing code. Refines rough ideas through questions, explores alternatives, presents design in sections for validation. Saves design document.

2. **using-git-worktrees** - Activates after design approval. Creates isolated workspace on new branch, runs project setup, verifies clean test baseline.

3. **writing-plans** - Activates with approved design. Breaks work into bite-sized tasks (2-5 minutes each). Every task has exact file paths, complete code, verification steps.

4. **subagent-driven-development** or **executing-plans** - Activates with plan. Dispatches fresh subagent per task with two-stage review (spec compliance, then code quality), or executes in batches with human checkpoints.

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

See `skills/writing-skills/SKILL.md` for the complete guide.

## Updating

Superpowers updates are somewhat coding-agent dependent, but are often automatic.

## License

MIT License - see LICENSE file for details

## Community

Superpowers is built by [Jesse Vincent](https://blog.fsck.com) and the rest of the folks at [Prime Radiant](https://primeradiant.com).

- **Discord**: [Join us](https://discord.gg/35wsABTejz) for community support, questions, and sharing what you're building with Superpowers
- **Issues**: https://github.com/obra/superpowers/issues
- **Release announcements**: [Sign up](https://primeradiant.com/superpowers/) to get notified about new versions
