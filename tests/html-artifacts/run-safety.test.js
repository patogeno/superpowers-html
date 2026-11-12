import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Final-review fixes: what keeps an unattended or resumed roadmap run safe.
const runner = readFileSync('skills/running-multi-session-plans/SKILL.md', 'utf8');
const lead = readFileSync('skills/running-multi-session-plans/references/session-lead-prompt.md', 'utf8');
const publishing = readFileSync('skills/html-artifacts/references/claude-code-artifacts.md', 'utf8');

test('the controller sets up one workspace before session 1 and every lead works in it', () => {
  assert.match(runner, /workspace/i);
  assert.match(runner, /before (the first|session 1)/i);
  assert.match(lead, /Workspace: \[/, 'lead prompt carries the workspace path and branch');
  assert.match(lead, /don't create (a|another) worktree/i);
});

test('a lead never runs finishing-a-development-branch; the controller owns finishing', () => {
  assert.match(lead, /Don't (use|run) superpowers:finishing-a-development-branch/i);
});

test('the run log gets a started line before the lead is dispatched', () => {
  assert.match(runner, /session N started \(base <sha>\)/);
  const started = runner.indexOf('session N started');
  const dispatch = runner.indexOf('references/session-lead-prompt.md');
  assert.ok(started > 0 && started < dispatch + 400, 'started is written in the dispatch step');
});

test('a partial session is retried once, then marked blocked and the run moves on', () => {
  assert.match(runner, /blocked/);
  assert.match(runner, /retr(y|ied)[^.]*once|once more/i);
  assert.match(runner, /next session whose dependencies/i);
});

test('staged waits for a go-ahead; feedback alone does not start the next session', () => {
  assert.match(runner, /go-ahead/i);
  assert.match(runner, /feedback[^.]*(alone|by itself)[^.]*(doesn't|does not) start/i);
});

test('destructive git commands are parked, not run, by leads', () => {
  for (const cmd of [/reset --hard/, /clean -fdx/, /force-push|push --force/, /rewrit/i]) {
    assert.match(lead, cmd);
    assert.match(runner, cmd);
  }
});

test('an artifact from an earlier conversation is updated by its URL, not republished by path', () => {
  assert.match(publishing, /earlier conversation|another conversation|new session/i);
  assert.match(publishing, /`url`/);
  assert.match(publishing, /\*\*Report:\*\*/);
  assert.match(publishing, /\*\*Design:\*\*/);
  assert.match(runner, /`url`/);
});
