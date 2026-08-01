# Claude 5 Model Tiers

Read this when you're dispatching on Anthropic models and need to turn the
neutral tiers in SKILL.md's "Model Selection" into actual model names. On any
other provider, keep the neutral tiers and map them yourself.

## Tier mapping

| SKILL.md tier | Model | API id | Input / output per MTok | Context |
|---|---|---|---|---|
| Fast, cheap | Claude Haiku 4.5 | `claude-haiku-4-5` | $1 / $5 | 200K |
| Standard | Claude Sonnet 5 | `claude-sonnet-5` | $3 / $15 | 1M |
| Most capable | Claude Opus 5 | `claude-opus-5` | $5 / $25 | 1M |
| Above most capable | Claude Fable 5 | `claude-fable-5` | $10 / $50 | 1M |

Dispatch by whatever name your harness uses (Claude Code takes `haiku`,
`sonnet`, `opus`, `fable`); the API ids are for harnesses that want them.

**Claude Opus 5 is the default "most capable" tier** — the final whole-branch
review and architecture tasks land here. Sonnet 5 reaches near-Opus quality on
coding and agentic work, so it carries most integration and review dispatches.
Haiku 4.5 is the only tier with a 200K context — a task brief plus a large diff
can overflow it, so keep it to single-file mechanical work.

**Reach for Fable 5 only when Opus 5 has actually failed** on a genuinely
long-horizon task — it costs 2× Opus 5, its safety classifiers decline more
requests (including some benign security and life-sciences work), and it is
unavailable to organizations configured for zero data retention. It is not the
default top of the escalation ladder; Opus 5 is.

## What changes when the subagents are Claude 5 models

These shift how you write dispatch prompts, not which tier you pick.

**Don't add verification instructions to implementer prompts.** Claude 5 models
verify their own work unprompted, and telling them to "double-check" or "verify
before reporting" produces over-verification with no gain in correctness. SDD
already has a structural review stage — that is the verification. Let the
implementer report and let the reviewer review.

**Don't add "delegate more" guidance.** Claude Opus 5 reaches for subagents
readily on its own. Spawn counts should track the plan — one implementer per
task, one reviewer per review — not grow with helpers a subagent invented.

**State scope as a boundary, not just a goal.** Claude 5 models will expand a
task's scope when the brief leaves room: adding abstractions, tidying nearby
code, finishing work the plan deferred. The task brief is the scope; say so.

**Never tell a reviewer to report only high-severity findings.** Claude 5
models follow a severity filter literally — they find the bugs, then silently
drop the ones below the stated bar, so measured recall falls while the model
got *better* at reviewing. Ask for every finding with a severity attached and
filter afterwards. (This is why SKILL.md forbids the controller from pre-rating
severity or suppressing findings.)

**Prompts tuned for older models are often too prescriptive.** Step-by-step
scaffolding written to compensate for a weaker model measurably reduces output
quality on Claude 5. State the goal and the constraints; leave the procedure to
the subagent unless the procedure is the point.
