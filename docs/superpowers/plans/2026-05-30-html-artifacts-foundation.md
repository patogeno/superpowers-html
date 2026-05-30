# html-artifacts Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the shared `html-artifacts` skill (canonical stylesheet, HTML templates, authoring conventions) plus a zero-dependency validator with fast Node tests, so later plans can make `brainstorming` and `writing-plans` emit self-contained HTML artifacts.

**Architecture:** A new skill directory `skills/html-artifacts/` holds one canonical `stylesheet.css` (single source of truth) and thin structural `templates/*.html` that carry a `/* INLINE_STYLESHEET */` marker the authoring agent replaces with the stylesheet at generation time. A `tests/html-artifacts/validate.js` ESM module provides deterministic invariant checks (self-contained, stylesheet-inlining, Markdown↔HTML task-state matching) consumed by `node --test`. This plan ships only the foundation + its unit tests; the skills that *use* it are built in Plans 2 and 3.

**Tech Stack:** Node.js ≥18 built-ins only (`node:test`, `node:assert`, `node:fs`) — zero dependencies. Plain HTML/CSS/SVG. Markdown skill files.

**Conventions for the executor:**
- Repo root is the superpowers-html checkout. Run all commands **from the repo root** unless stated otherwise.
- The repo's root `package.json` has `"type": "module"`, so `.js` files under `tests/html-artifacts/` are ES modules — use `import`/`export`, not `require`.
- Use forward slashes in all paths inside skill/code files (project rule), even on Windows.

---

### Task 1: Self-contained validator — `findExternalRefs`

**Files:**
- Create: `tests/html-artifacts/validate.js`
- Test: `tests/html-artifacts/validate.test.js`

- [ ] **Step 1: Write the failing test**

Create `tests/html-artifacts/validate.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { findExternalRefs } from './validate.js';

test('findExternalRefs: clean self-contained HTML has none', () => {
  const html = `<!DOCTYPE html><html><head><style>body{color:red}</style></head>
    <body><a href="#section">jump</a><a href="https://example.com">link text</a>
    <img src="data:image/png;base64,AAAA"></body></html>`;
  assert.deepEqual(findExternalRefs(html), []);
});

test('findExternalRefs: flags external script, stylesheet link, image, and css url', () => {
  const html = `<link rel="stylesheet" href="https://cdn.test/x.css">
    <script src="https://cdn.test/x.js"></script>
    <img src="//cdn.test/a.png">
    <style>@import url(https://cdn.test/f.css); body{background:url('http://cdn.test/b.png')}</style>`;
  const refs = findExternalRefs(html);
  assert.equal(refs.length, 5);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html-artifacts/validate.test.js`
Expected: FAIL — `Cannot find module './validate.js'` (the module does not exist yet).

- [ ] **Step 3: Write minimal implementation**

Create `tests/html-artifacts/validate.js`:

```js
// Zero-dependency validators for superpowers-html artifacts.
// "External ref" = a resource the browser would LOAD from off-document
// (script/img/iframe/source src, <link href>, CSS url()/@import) over
// http(s) or protocol-relative URLs. Plain <a href> hyperlinks and data:
// URIs are allowed — they do not break self-containment.
const EXTERNAL = [
  /\bsrc\s*=\s*["'](?:https?:\/\/|\/\/)[^"']*/gi,         // script/img/iframe/source
  /\bsrcset\s*=\s*["'][^"']*(?:https?:\/\/|\/\/)[^"']*/gi,
  /<link\b[^>]*\bhref\s*=\s*["'](?:https?:\/\/|\/\/)[^"']*/gi,
  /@import\s+(?:url\()?["']?(?:https?:\/\/|\/\/)[^"')]*/gi,
  /url\(\s*["']?(?:https?:\/\/|\/\/)[^"')]*/gi,
];

export function findExternalRefs(html) {
  const refs = [];
  for (const re of EXTERNAL) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(html)) !== null) refs.push(m[0]);
  }
  return refs;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/html-artifacts/validate.test.js`
Expected: PASS — `# pass 2`, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add tests/html-artifacts/validate.js tests/html-artifacts/validate.test.js
git commit -m "feat(html-artifacts): add findExternalRefs self-containment validator"
```

---

### Task 2: Stylesheet inlining + task-state matching in the validator

**Files:**
- Modify: `tests/html-artifacts/validate.js`
- Test: `tests/html-artifacts/validate.test.js`

The plan HTML view will embed a machine-readable mirror of the canonical Markdown task state in a `<script type="application/json" id="sp-task-state">` block. These helpers let later plans verify the HTML view matches the canonical Markdown without parsing visual markup.

- [ ] **Step 1: Write the failing test**

Append to `tests/html-artifacts/validate.test.js`:

```js
import {
  inlineStylesheet, findUnreplacedMarkers,
  extractMarkdownCheckboxes, extractHtmlTaskState, taskStateMatches,
} from './validate.js';

test('inlineStylesheet replaces the marker and removes it', () => {
  const tpl = `<style>/* INLINE_STYLESHEET */</style>`;
  const out = inlineStylesheet(tpl, 'body{color:#000}');
  assert.ok(out.includes('body{color:#000}'));
  assert.deepEqual(findUnreplacedMarkers(out), []);
});

test('findUnreplacedMarkers flags a leftover marker', () => {
  assert.equal(findUnreplacedMarkers('<style>/* INLINE_STYLESHEET */</style>').length, 1);
});

test('extractMarkdownCheckboxes reads checked state and text', () => {
  const md = `- [ ] **Step 1: a**\nsome prose\n- [x] **Step 2: b**`;
  assert.deepEqual(extractMarkdownCheckboxes(md), [
    { checked: false, text: '**Step 1: a**' },
    { checked: true, text: '**Step 2: b**' },
  ]);
});

test('taskStateMatches true when HTML JSON mirror equals Markdown checkboxes', () => {
  const md = `- [x] **Step 1: a**\n- [ ] **Step 2: b**`;
  const html = `<script type="application/json" id="sp-task-state">
    {"checkboxes":[{"checked":true,"text":"**Step 1: a**"},{"checked":false,"text":"**Step 2: b**"}]}
    </script>`;
  assert.equal(taskStateMatches(md, html), true);
});

test('taskStateMatches false when checked state diverges', () => {
  const md = `- [ ] **Step 1: a**`;
  const html = `<script type="application/json" id="sp-task-state">
    {"checkboxes":[{"checked":true,"text":"**Step 1: a**"}]}</script>`;
  assert.equal(taskStateMatches(md, html), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html-artifacts/validate.test.js`
Expected: FAIL — `inlineStylesheet`/`extractMarkdownCheckboxes`/etc. are not exported (`SyntaxError` or `is not a function`).

- [ ] **Step 3: Write minimal implementation**

Append to `tests/html-artifacts/validate.js`:

```js
const MARKER = '/* INLINE_STYLESHEET */';

export function inlineStylesheet(templateHtml, css) {
  return templateHtml.split(MARKER).join(css);
}

export function findUnreplacedMarkers(html) {
  return html.includes(MARKER) ? [MARKER] : [];
}

export function extractMarkdownCheckboxes(md) {
  const re = /^[ \t]*-[ \t]*\[([ xX])\][ \t]*(.*\S)[ \t]*$/gm;
  const out = [];
  let m;
  while ((m = re.exec(md)) !== null) {
    out.push({ checked: m[1].toLowerCase() === 'x', text: m[2] });
  }
  return out;
}

export function extractHtmlTaskState(html) {
  const m = html.match(
    /<script[^>]*id\s*=\s*["']sp-task-state["'][^>]*>([\s\S]*?)<\/script>/i
  );
  if (!m) return null;
  return JSON.parse(m[1]).checkboxes;
}

export function taskStateMatches(md, html) {
  const a = extractMarkdownCheckboxes(md);
  const b = extractHtmlTaskState(html);
  if (b === null || a.length !== b.length) return false;
  return a.every((x, i) =>
    x.checked === b[i].checked && x.text.trim() === b[i].text.trim());
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/html-artifacts/validate.test.js`
Expected: PASS — `# pass 7`, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add tests/html-artifacts/validate.js tests/html-artifacts/validate.test.js
git commit -m "feat(html-artifacts): add stylesheet inlining and task-state matching validators"
```

---

### Task 3: Canonical stylesheet

**Files:**
- Create: `skills/html-artifacts/stylesheet.css`
- Test: `tests/html-artifacts/stylesheet.test.js`

- [ ] **Step 1: Write the failing test**

Create `tests/html-artifacts/stylesheet.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync('skills/html-artifacts/stylesheet.css', 'utf8');

test('stylesheet declares light + dark theme tokens', () => {
  assert.match(css, /:root\s*\{/);
  assert.match(css, /@media\s*\(prefers-color-scheme:\s*dark\)/);
  for (const v of ['--bg-primary', '--text-primary', '--accent', '--border', '--success']) {
    assert.ok(css.includes(v), `missing token ${v}`);
  }
});

test('stylesheet defines the artifact layout + component classes', () => {
  for (const sel of ['.sidebar', '.toc', '.progress', 'details.task',
                     'summary', '.badge', '.fig', 'table', '.callout', '.pill']) {
    assert.ok(css.includes(sel), `missing selector ${sel}`);
  }
});

test('stylesheet contains no external resource references', async () => {
  const { findExternalRefs } = await import('./validate.js');
  assert.deepEqual(findExternalRefs(css), []);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html-artifacts/stylesheet.test.js`
Expected: FAIL — `ENOENT: no such file ... skills/html-artifacts/stylesheet.css`.

- [ ] **Step 3: Write minimal implementation**

Create `skills/html-artifacts/stylesheet.css`:

```css
/* superpowers-html · canonical artifact stylesheet
   Light/dark aware · zero dependencies · inline into each artifact's <style>. */
*{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg-primary:#f5f5f7;--bg-secondary:#fff;--bg-tertiary:#e9e9ec;--border:#d1d1d6;
  --text-primary:#1d1d1f;--text-secondary:#6e6e73;--text-tertiary:#aeaeb2;
  --accent:#0071e3;--success:#34c759;--warning:#ff9f0a;--error:#ff3b30;--purple:#bf5af2;--code-bg:#f6f8fa;
}
@media (prefers-color-scheme:dark){:root{
  --bg-primary:#1d1d1f;--bg-secondary:#2d2d2f;--bg-tertiary:#3a3a3c;--border:#424245;
  --text-primary:#f5f5f7;--text-secondary:#a1a1a6;--text-tertiary:#636366;--accent:#0a84ff;--code-bg:#161618;}}
body{font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif;background:var(--bg-primary);
  color:var(--text-primary);line-height:1.6;}
.layout{display:grid;grid-template-columns:270px 1fr;min-height:100vh;}
.sidebar{position:sticky;top:0;align-self:start;height:100vh;overflow-y:auto;background:var(--bg-secondary);
  border-right:1px solid var(--border);padding:1.5rem 1rem;}
.sidebar .doc-label{font-size:.68rem;text-transform:uppercase;letter-spacing:.06em;color:var(--accent);font-weight:700;}
.sidebar h1{font-size:1.05rem;font-weight:650;margin:.3rem 0 .8rem;line-height:1.3;}
.toc a{display:flex;align-items:center;gap:.55rem;text-decoration:none;color:var(--text-secondary);
  font-size:.84rem;padding:.36rem .5rem;border-radius:6px;}
.toc a:hover,.toc a.active{background:var(--bg-tertiary);color:var(--text-primary);}
.toc .num{color:var(--text-tertiary);font-variant-numeric:tabular-nums;margin-right:.4rem;}
.progress{background:var(--bg-tertiary);border-radius:8px;padding:.75rem;margin-bottom:1.1rem;}
.progress .bar{height:6px;background:var(--bg-primary);border-radius:99px;overflow:hidden;margin-bottom:.5rem;}
.progress .fill{height:100%;background:var(--success);}
.progress .pct{font-size:.78rem;color:var(--text-secondary);}
.dot{width:9px;height:9px;border-radius:50%;flex-shrink:0;border:2px solid var(--text-tertiary);}
.dot.done{background:var(--success);border-color:var(--success);}
.dot.active{background:var(--accent);border-color:var(--accent);}
.main{padding:2.5rem 3rem;max-width:880px;}
.lede{font-size:1.05rem;color:var(--text-secondary);margin-bottom:1.5rem;}
h2{font-size:1.35rem;font-weight:660;margin:2.4rem 0 .9rem;padding-bottom:.4rem;border-bottom:1px solid var(--border);scroll-margin-top:1rem;}
h2:first-of-type{margin-top:0;}
h3{font-size:1.02rem;font-weight:620;margin:1.3rem 0 .5rem;}
p{margin-bottom:.9rem;}ul,ol{margin:.3rem 0 1rem 1.4rem;}li{margin-bottom:.35rem;}
code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.86em;background:var(--code-bg);padding:.1rem .35rem;border-radius:5px;}
pre{background:var(--code-bg);border:1px solid var(--border);border-radius:8px;padding:.9rem 1rem;overflow-x:auto;
  font-family:ui-monospace,Menlo,monospace;font-size:.8rem;line-height:1.55;margin:.6rem 0 1.1rem;}
pre code{background:none;padding:0;}
.callout{border-left:3px solid var(--accent);background:color-mix(in srgb,var(--accent) 9%,transparent);
  border-radius:0 8px 8px 0;padding:.8rem 1.1rem;margin:1.1rem 0;font-size:.92rem;}
.callout.warn{border-color:var(--warning);background:color-mix(in srgb,var(--warning) 11%,transparent);}
.callout .h{font-weight:650;display:block;margin-bottom:.2rem;}
table{width:100%;border-collapse:collapse;margin:1rem 0 1.3rem;font-size:.9rem;}
th,td{text-align:left;padding:.55rem .8rem;border-bottom:1px solid var(--border);vertical-align:top;}
th{font-size:.7rem;text-transform:uppercase;letter-spacing:.04em;color:var(--text-secondary);}
tbody tr:hover{background:var(--bg-secondary);}
td code{color:var(--accent);}
.pill{font-size:.68rem;font-weight:650;padding:.14rem .5rem;border-radius:99px;white-space:nowrap;}
.pill.ok{color:var(--success);background:color-mix(in srgb,var(--success) 16%,transparent);}
.pill.warn{color:var(--warning);background:color-mix(in srgb,var(--warning) 16%,transparent);}
.pill.muted{color:var(--text-secondary);background:var(--bg-tertiary);}
.fig{background:var(--bg-secondary);border:1px solid var(--border);border-radius:12px;padding:1.4rem;margin:1.2rem 0;}
.fig-cap{font-size:.74rem;color:var(--text-secondary);text-align:center;margin-top:.7rem;}
.nlabel{fill:var(--text-primary);font:600 12.5px system-ui;text-anchor:middle;}
.nsub{fill:var(--text-secondary);font:10px system-ui;text-anchor:middle;}
.edge{stroke:var(--text-tertiary);stroke-width:1.4;fill:none;}
.meta-head{border-bottom:1px solid var(--border);padding-bottom:1.5rem;margin-bottom:2rem;}
.meta-row{display:grid;grid-template-columns:120px 1fr;gap:1rem;font-size:.92rem;margin-bottom:.5rem;}
.meta-row .k{color:var(--text-secondary);font-weight:600;}
details.task{background:var(--bg-secondary);border:1px solid var(--border);border-radius:12px;margin-bottom:1rem;overflow:hidden;}
details.task[open]{box-shadow:0 2px 10px rgba(0,0,0,.05);}
summary{list-style:none;cursor:pointer;padding:1rem 1.25rem;display:flex;align-items:center;gap:.85rem;}
summary::-webkit-details-marker{display:none;}
summary .tnum{font-size:.72rem;font-weight:700;color:var(--accent);background:color-mix(in srgb,var(--accent) 12%,transparent);padding:.15rem .5rem;border-radius:99px;}
summary h3{font-size:1.05rem;font-weight:620;flex:1;margin:0;}
.badge{font-size:.68rem;font-weight:600;padding:.18rem .55rem;border-radius:99px;text-transform:uppercase;letter-spacing:.03em;}
.badge.done{color:var(--success);background:color-mix(in srgb,var(--success) 15%,transparent);}
.badge.todo{color:var(--text-secondary);background:var(--bg-tertiary);}
.task-body{padding:0 1.25rem 1.25rem;border-top:1px solid var(--border);}
.step{display:flex;gap:.7rem;padding:.55rem 0;align-items:flex-start;font-size:.9rem;}
.step .cb{width:16px;height:16px;border:2px solid var(--text-tertiary);border-radius:4px;flex-shrink:0;margin-top:.18rem;}
.step.checked .cb{background:var(--success);border-color:var(--success);}
.step.checked .txt{color:var(--text-secondary);text-decoration:line-through;}
@media (max-width:780px){.layout{grid-template-columns:1fr;}.sidebar{position:static;height:auto;}.main{padding:1.5rem;}}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/html-artifacts/stylesheet.test.js`
Expected: PASS — `# pass 3`, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add skills/html-artifacts/stylesheet.css tests/html-artifacts/stylesheet.test.js
git commit -m "feat(html-artifacts): add canonical zero-dep artifact stylesheet"
```

---

### Task 4: Spec and plan templates

**Files:**
- Create: `skills/html-artifacts/templates/spec.html`
- Create: `skills/html-artifacts/templates/plan.html`
- Test: `tests/html-artifacts/templates.test.js`

Templates are thin structural skeletons. Each carries the `/* INLINE_STYLESHEET */` marker (the authoring agent replaces it with `stylesheet.css`) and HTML comments marking where content goes.

- [ ] **Step 1: Write the failing test**

Create `tests/html-artifacts/templates.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { findExternalRefs, inlineStylesheet, findUnreplacedMarkers } from './validate.js';

const css = readFileSync('skills/html-artifacts/stylesheet.css', 'utf8');
const TEMPLATES = ['spec', 'plan', 'roadmap', 'learnings'];

for (const name of ['spec', 'plan']) {
  const tpl = readFileSync(`skills/html-artifacts/templates/${name}.html`, 'utf8');

  test(`${name} template carries the stylesheet marker`, () => {
    assert.equal(findUnreplacedMarkers(tpl).length, 1);
  });

  test(`${name} template has no external refs before or after inlining`, () => {
    assert.deepEqual(findExternalRefs(tpl), []);
    const inlined = inlineStylesheet(tpl, css);
    assert.deepEqual(findExternalRefs(inlined), []);
    assert.deepEqual(findUnreplacedMarkers(inlined), []);
  });

  test(`${name} template is a full HTML document`, () => {
    assert.match(tpl, /<!DOCTYPE html>/i);
    assert.match(tpl, /<html[ >]/i);
  });
}

test('plan template embeds the machine-readable task-state block', () => {
  const tpl = readFileSync('skills/html-artifacts/templates/plan.html', 'utf8');
  assert.match(tpl, /id\s*=\s*["']sp-task-state["']/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html-artifacts/templates.test.js`
Expected: FAIL — `ENOENT ... templates/spec.html`.

- [ ] **Step 3: Write minimal implementation**

Create `skills/html-artifacts/templates/spec.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><!-- TITLE: Design Spec — Feature --></title>
<style>/* INLINE_STYLESHEET */</style>
</head>
<body class="layout">
<nav class="sidebar">
  <div class="doc-label">Design Spec</div>
  <h1><!-- FEATURE NAME --></h1>
  <div class="toc"><!-- TOC: <a href="#id"><span class="num">1</span>Section</a> per H2 --></div>
</nav>
<main class="main">
  <p class="lede"><!-- One-sentence summary of what this builds --></p>
  <!-- SECTIONS: each is <h2 id="..."> + prose. Use diagrams (inline SVG in
       a .fig wrapper) and <table> for architecture, comparisons, data models. -->
</main>
</body>
</html>
```

Create `skills/html-artifacts/templates/plan.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><!-- TITLE: Implementation Plan — Feature --></title>
<style>/* INLINE_STYLESHEET */</style>
</head>
<body class="layout">
<nav class="sidebar">
  <div class="doc-label">Implementation Plan</div>
  <h1><!-- FEATURE NAME --></h1>
  <div class="progress">
    <div class="bar"><div class="fill" style="width:0%"></div></div>
    <div class="pct"><!-- N of M tasks complete --></div>
  </div>
  <div class="toc"><!-- TOC: one <a> per task, with <span class="dot"> status --></div>
</nav>
<main class="main">
  <header class="meta-head">
    <h2><!-- Feature — Implementation Plan --></h2>
    <div class="meta-row"><span class="k">Goal</span><span><!-- goal --></span></div>
    <div class="meta-row"><span class="k">Architecture</span><span><!-- approach --></span></div>
    <div class="meta-row"><span class="k">Tech Stack</span><span><!-- stack --></span></div>
    <div class="callout"><span class="h">For agentic workers</span>Canonical task state lives in the Markdown plan; this page is its readable view.</div>
  </header>
  <!-- TASKS: one <details class="task"> per task. summary = tnum + h3 + badge.
       task-body = files, then <div class="step [checked]"> per step. -->

  <!-- Machine-readable mirror of the canonical Markdown checkbox state.
       Keep in sync with the .md plan on every regeneration. -->
  <script type="application/json" id="sp-task-state">
  {"checkboxes":[]}
  </script>
</main>
</body>
</html>
```

- [ ] **Step 4: Run test to verify it passes**

The per-name `test(...)` blocks iterate only `['spec','plan']` in this task, so no missing file is read yet. The `TEMPLATES` constant is declared now but first *used* in Task 5.

Run: `node --test tests/html-artifacts/templates.test.js`
Expected: PASS — `# pass 7`, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add skills/html-artifacts/templates/spec.html skills/html-artifacts/templates/plan.html tests/html-artifacts/templates.test.js
git commit -m "feat(html-artifacts): add spec and plan HTML templates"
```

---

### Task 5: Roadmap and learnings templates

**Files:**
- Create: `skills/html-artifacts/templates/roadmap.html`
- Create: `skills/html-artifacts/templates/learnings.html`
- Modify: `tests/html-artifacts/templates.test.js`

- [ ] **Step 1: Write the failing test**

In `tests/html-artifacts/templates.test.js`, add a loop over the remaining templates. Append:

```js
for (const name of ['roadmap', 'learnings']) {
  const tpl = readFileSync(`skills/html-artifacts/templates/${name}.html`, 'utf8');
  test(`${name} template carries the marker and is self-contained`, () => {
    assert.equal(findUnreplacedMarkers(tpl).length, 1);
    assert.deepEqual(findExternalRefs(tpl), []);
    const inlined = inlineStylesheet(tpl, css);
    assert.deepEqual(findExternalRefs(inlined), []);
    assert.deepEqual(findUnreplacedMarkers(inlined), []);
    assert.match(tpl, /<!DOCTYPE html>/i);
  });
}

test('all four templates exist', () => {
  for (const name of TEMPLATES) {
    assert.ok(readFileSync(`skills/html-artifacts/templates/${name}.html`, 'utf8').length > 0);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html-artifacts/templates.test.js`
Expected: FAIL — `ENOENT ... templates/roadmap.html`.

- [ ] **Step 3: Write minimal implementation**

Create `skills/html-artifacts/templates/roadmap.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><!-- TITLE: Session Roadmap — Feature --></title>
<style>/* INLINE_STYLESHEET */</style>
</head>
<body class="layout">
<nav class="sidebar">
  <div class="doc-label">Session Roadmap</div>
  <h1><!-- FEATURE NAME --></h1>
  <div class="progress">
    <div class="bar"><div class="fill" style="width:0%"></div></div>
    <div class="pct"><!-- N of M sessions complete --></div>
  </div>
  <div class="toc"><!-- one <a> per session, with status dot, linking the session plan --></div>
</nav>
<main class="main">
  <p class="lede"><!-- What the whole effort builds; how sessions relate --></p>
  <!-- SESSIONS TABLE: <table> of # | session | goal | depends on | status.
       Status uses <span class="pill ok|warn|muted">. Link each session to its
       .html plan view. Insert intermediate/fix sessions here as they arise. -->
  <h2 id="learnings">Learnings</h2>
  <p>See the <a href="./learnings.html">learnings log</a> — read it before starting each session.</p>
</main>
</body>
</html>
```

Create `skills/html-artifacts/templates/learnings.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><!-- TITLE: Learnings Log — Feature --></title>
<style>/* INLINE_STYLESHEET */</style>
</head>
<body class="layout">
<nav class="sidebar">
  <div class="doc-label">Learnings Log</div>
  <h1><!-- FEATURE NAME --></h1>
  <div class="toc"><!-- one <a> per session entry --></div>
</nav>
<main class="main">
  <p class="lede">Cross-session memory. Each session appends an entry; the next lead reads this first.</p>
  <!-- ENTRIES: per session, an <h2 id="session-N"> followed by four labelled
       blocks — What happened · Deviations · Surprises · Follow-ups.
       Follow-ups may trigger roadmap edits or a new session. -->
</main>
</body>
</html>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/html-artifacts/templates.test.js`
Expected: PASS — `# pass 10`, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add skills/html-artifacts/templates/roadmap.html skills/html-artifacts/templates/learnings.html tests/html-artifacts/templates.test.js
git commit -m "feat(html-artifacts): add roadmap and learnings templates"
```

---

### Task 6: The `html-artifacts` SKILL.md and authoring reference

**Files:**
- Create: `skills/html-artifacts/SKILL.md`
- Create: `skills/html-artifacts/references/authoring.md`
- Test: `tests/html-artifacts/skill.test.js`

- [ ] **Step 1: Write the failing test**

Create `tests/html-artifacts/skill.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const skill = readFileSync('skills/html-artifacts/SKILL.md', 'utf8');

function frontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(m, 'SKILL.md must start with YAML frontmatter');
  return m[1];
}

test('frontmatter has name=html-artifacts and a "Use when" description', () => {
  const fm = frontmatter(skill);
  assert.match(fm, /name:\s*html-artifacts/);
  assert.match(fm, /description:\s*["']?Use when/i);
});

test('frontmatter stays within the 1024-char budget', () => {
  assert.ok(frontmatter(skill).length <= 1024);
});

test('SKILL.md references the stylesheet and all four templates', () => {
  assert.ok(skill.includes('stylesheet.css'));
  for (const t of ['spec.html', 'plan.html', 'roadmap.html', 'learnings.html']) {
    assert.ok(skill.includes(`templates/${t}`), `missing reference to ${t}`);
  }
});

test('SKILL.md documents the core conventions', () => {
  assert.match(skill, /self-contained/i);
  assert.match(skill, /INLINE_STYLESHEET/);
  assert.match(skill, /SVG/);
  assert.ok(skill.includes('references/authoring.md'));
});

test('authoring reference exists and explains the task-state mirror', () => {
  const ref = readFileSync('skills/html-artifacts/references/authoring.md', 'utf8');
  assert.match(ref, /sp-task-state/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html-artifacts/skill.test.js`
Expected: FAIL — `ENOENT ... skills/html-artifacts/SKILL.md`.

- [ ] **Step 3: Write minimal implementation**

Create `skills/html-artifacts/SKILL.md`:

```markdown
---
name: html-artifacts
description: Use when producing a human-facing HTML artifact in the brainstorming or planning workflow — a design spec, an implementation plan view, a session roadmap, or a learnings log. Provides the canonical stylesheet, templates, and self-contained authoring rules.
---

# Authoring HTML Artifacts

Produce **self-contained, zero-dependency HTML** that a human enjoys reading and navigating. Use this whenever a skill emits a spec, plan view, roadmap, or learnings log.

## Rules

1. **Start from the matching template:**
   - `templates/spec.html` — design spec (diagrams + tables)
   - `templates/plan.html` — implementation plan view (sidebar TOC, progress, collapsible tasks)
   - `templates/roadmap.html` — multi-session roadmap
   - `templates/learnings.html` — cross-session learnings log
2. **Inline the stylesheet.** Replace the `/* INLINE_STYLESHEET */` marker with the full contents of `stylesheet.css`. Never link it externally.
3. **Stay self-contained.** No external scripts, stylesheets, fonts, or images. No CDNs. Plain `<a href>` hyperlinks are fine; embed images as `data:` URIs only if essential.
4. **Diagrams are hand-authored inline SVG** (or CSS boxes), themed with the stylesheet's classes (`.fig`, `.nlabel`, `.edge`). Never use a diagram library. See `references/authoring.md`.
5. **Tables** use plain semantic `<table>` markup.
6. **Plan views carry a task-state mirror.** The `<script type="application/json" id="sp-task-state">` block must match the canonical Markdown checkboxes. Regenerate it whenever the Markdown changes.

## Reference

- Detailed conventions, diagram recipes, and the task-state contract: `references/authoring.md`
- Canonical styles: `stylesheet.css`
```

Create `skills/html-artifacts/references/authoring.md`:

```markdown
# HTML Artifact Authoring Reference

## Self-containment
The artifact must open correctly from `file://` with no network. Concretely: no
`<script src>`, `<link rel=stylesheet>`, `<img src=http...>`, `@import url(http...)`,
or `url(http...)`. The validator `tests/html-artifacts/validate.js` (`findExternalRefs`)
encodes this rule.

## Inlining the stylesheet
Read `stylesheet.css` and replace the template's `/* INLINE_STYLESHEET */` marker
with its full contents. After this, `findUnreplacedMarkers` must return empty.

## Diagrams (inline SVG)
Draw architecture/flow diagrams as inline `<svg>` inside a `<div class="fig">` with a
`<div class="fig-cap">` caption. Use `viewBox` for responsiveness. Theme nodes/edges
with the `.nlabel`, `.nsub`, and `.edge` classes plus CSS variables (`var(--accent)`,
`var(--success)`) so they adapt to light/dark. Define an arrowhead `<marker>` once per svg.

## Task-state mirror (plan views only)
The plan HTML view embeds the canonical Markdown checkbox state as JSON:

    <script type="application/json" id="sp-task-state">
    {"checkboxes":[{"checked":false,"text":"**Step 1: ...**"}, ...]}
    </script>

`checkboxes` is the ordered list of every `- [ ]`/`- [x]` step in the Markdown plan,
with `checked` and the raw step `text`. `taskStateMatches(md, html)` in the validator
verifies the view is in sync. Regenerate the HTML view (and this block) whenever the
Markdown plan changes — including when execution skills tick a checkbox.
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/html-artifacts/skill.test.js`
Expected: PASS — `# pass 5`, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add skills/html-artifacts/SKILL.md skills/html-artifacts/references/authoring.md tests/html-artifacts/skill.test.js
git commit -m "feat(html-artifacts): add SKILL.md and authoring reference"
```

---

### Task 7: Test runner wiring + full-suite green

**Files:**
- Modify: `package.json:1-6`
- Test: (runs the whole `tests/html-artifacts/` suite)

- [ ] **Step 1: Write the failing test**

Confirm there is no `test:html` script yet and that invoking it fails.

Run: `npm run test:html`
Expected: FAIL — `npm error Missing script: "test:html"`.

- [ ] **Step 2: Add the script**

Modify `package.json` to add a `scripts` block (keep existing keys). The file becomes:

```json
{
  "name": "superpowers",
  "version": "5.1.0",
  "type": "module",
  "main": ".opencode/plugins/superpowers.js",
  "scripts": {
    "test:html": "node --test tests/html-artifacts/"
  }
}
```

- [ ] **Step 3: Run the full html-artifacts suite**

Run: `npm run test:html`
Expected: PASS — aggregate across `validate.test.js`, `stylesheet.test.js`, `templates.test.js`, `skill.test.js`: `# fail 0` (25 tests total).

- [ ] **Step 4: Sanity-check a real inlined artifact renders self-contained**

Run:
```bash
node -e "import('./tests/html-artifacts/validate.js').then(async v=>{const fs=await import('node:fs');const css=fs.readFileSync('skills/html-artifacts/stylesheet.css','utf8');for(const t of ['spec','plan','roadmap','learnings']){const tpl=fs.readFileSync('skills/html-artifacts/templates/'+t+'.html','utf8');const out=v.inlineStylesheet(tpl,css);if(v.findExternalRefs(out).length||v.findUnreplacedMarkers(out).length){console.error('FAIL',t);process.exit(1);}}console.log('all templates inline clean');})"
```
Expected: prints `all templates inline clean`, exit 0.

- [ ] **Step 5: Commit**

```bash
git add package.json
git commit -m "chore(html-artifacts): add test:html npm script for the validator suite"
```

---

## Notes for Plans 2 and 3 (not implemented here)

- **Plan 2 (brainstorming → HTML spec):** make `brainstorming/SKILL.md` reference `html-artifacts` as a REQUIRED SUB-SKILL, change the spec output from `*-design.md` to `*-design.html` (built from `templates/spec.html`), and add a triggering/eval check that a produced spec contains ≥1 inline `<svg>` and ≥1 `<table>` and passes `findExternalRefs === []`.
- **Plan 3 (writing-plans → HTML view + multi-session):** make `writing-plans/SKILL.md` reference `html-artifacts`, keep the Markdown plan canonical, additionally emit `*.html` from `templates/plan.html` with a synced `sp-task-state` block (verified by `taskStateMatches`), and add the multi-session roadmap/session-plan/learnings-log behavior with the agent-judged trigger.
- The execution skills (`executing-plans`, `subagent-driven-development`) remain **unchanged** and keep reading the Markdown plan.
