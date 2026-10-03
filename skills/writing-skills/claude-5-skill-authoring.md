# Authoring Skills for Claude 5 Models

Read this when the skill you're writing or editing will run on Claude 5
models (Opus 5.5, Sonnet 5.5, Fable 5.1). It condenses Anthropic's official
guidance as of 2026-10. None of it overrides the RED-GREEN-REFACTOR cycle:
every point is a hypothesis to confirm with a baseline run, not a reason to
edit tuned content without one.

Sources (PE = `https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/`):

- PE `prompting-claude-opus-5-5`, `prompting-claude-opus-5`, `prompting-claude-sonnet-5-5`, `prompting-claude-fable-5`
- PE `claude-prompting-best-practices` (Claude 4.x-era, still current)
- `https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices` (generic skill authoring; see also anthropic-best-practices.md)

Anthropic has no Claude 5-specific skill-authoring page, and the Opus 5.5
page says prompts written for Opus 5 "should perform well without changes."
Treat what follows as the deltas from older models.

## Behavioral text: calibrate emphasis

Current models are highly responsive to the system prompt, so the same text
applies more strongly than it did on older models. Inflated emphasis ("MUST",
"CRITICAL", ALL CAPS) causes over-triggering and rigid behavior; when every
rule is marked critical, the markers stop carrying information. Leftover
hedges ("try to", "if possible") are now read literally.

- Use normal language by default. Keep emphasis as a tested, scoped fix for
  one instruction a baseline run shows is underweighted. That is the same
  bar this skill already sets for prohibitions and rationalization tables.
- A prohibition against a failure the model wasn't going to make can anchor
  it toward that failure. Before keeping a "never X", check that X still
  happens on the target model.
- **Trigger text is different.** A skill's frontmatter `description` and the
  session bootstrap may keep calibrated urgency, because skills still tend to
  under-trigger. Dial down behavioral bodies, not discovery text.

## Give the reason, not just the rule

Claude 5 models generalize from intent: "you can steer most behaviors with a
brief instruction rather than enumerating each behavior by name." One
sentence on *why* a rule exists ("ASCII sketches misrepresent proportion, so
the partner approves a layout they never saw") covers cases a list of
prohibitions misses. Positive examples of the desired output work better
than examples of what to avoid.

## Expect initiative; bound the scope

Claude 5 models widen scope when there's room: extra steps, nearby tidying,
starting to build while asked to plan. Official mitigations:

- State the deliverable and where to stop. "When the user asks for ideas,
  options or a plan, give them that and stop" (Sonnet 5.5 page).
- Remove verification instructions ("double-check", "verify before
  reporting"). These models already self-verify, and the instructions cause
  over-verification (Opus 5 page). Fable 5 on long unattended runs is the
  documented exception.
- Remove "delegate more" lines written for Opus 4.8. Opus 5 and 5.5 spawn
  subagents readily. If anything, say not to delegate work finishable in a
  handful of tool calls.
- Remove "be thorough" and anti-laziness scaffolding written for older
  models; it now over-applies.

## Leave the procedure open unless it is the point

Skills developed for prior models "are often too prescriptive" for Claude 5
"and can degrade output quality" (Fable 5 page). State the goal, the
constraints, and the output contract. Keep step-by-step procedure only where
order matters (a gate, a git sequence, a checklist the partner relies on).
This is the "Match the Form to the Failure" principle: a recipe for the
output's shape, not a script for the model's thinking.

## Thinking and effort are settings, not prose

Lowering effort reduces thinking "more reliably than prompt instructions
do." Opus 5.5 defaults to `medium`. Drop "think carefully" and "think step
by step" lines from skill bodies. A skill that requires the model to write
out its internal reasoning may be declined by the `reasoning_extraction`
classifier. Ask for the conclusion and its evidence instead.

## Length and verbosity

Opus 5-family replies run longer by default, and effort doesn't shorten them.
If a skill needs terse output (a status line, a summary to the partner),
state the length. Otherwise the generic limits still hold: description
≤ 1024 characters and third person, saying what the skill does and when to
use it; SKILL.md body under 500 lines; reference files one level deep from
SKILL.md, with a table of contents past 100 lines.

## Not covered by official guidance

Anthropic has published nothing for or against rationalization tables and
Red Flags lists. This repo's evidence (see "Bulletproofing" and "Match the
Form to the Failure" in SKILL.md) remains the authority. Apply the emphasis
calibration above to new content, and change tuned content only with
before/after evals.
