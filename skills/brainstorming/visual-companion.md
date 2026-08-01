# Visual Companion — retired

The browser-based visual companion is **no longer offered** in this fork (`superpowers-html`). Brainstorming conveys visual design through static, self-contained **HTML mockups** instead — see the **Mockups** section of `SKILL.md`.

- Schematic wireframes go **inline in the design spec** (using the `html-artifacts` conventions).
- Higher-fidelity, product-styled mockups are **spun out** to their own self-contained HTML files in the topic folder and linked from the spec and the plan.
- There is no server to start and no interactive selection — the user opens the file and any choice is made in the terminal.

The companion's server and scripts (`scripts/server.cjs`, `scripts/*.sh`, `frame-template.html`, `helper.js`) and their tests (`tests/brainstorm-server/`) remain on disk, identical to upstream, so syncing future upstream releases stays clean. They are simply never invoked. Do not start the server.
