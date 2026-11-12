# Visual Companion — retired

The browser-based visual companion is **not offered** in this fork (`superpowers-html`). Brainstorming shows visual design as self-contained HTML pages instead: see the **Showing It** section of `SKILL.md`.

- On Claude Code, pages are published with the **Artifact tool** as claude.ai artifacts your human partner can open, click through, and comment on from a PC or a phone (`skills/html-artifacts/references/claude-code-artifacts.md`).
- On other harnesses, the same pages are written to disk and opened locally.
- The design doc is a layered spec with a clickable prototype of the key screens, together in the topic folder.

The companion's server and scripts (`scripts/server.cjs`, `scripts/*.sh`, `frame-template.html`, `helper.js`) and their tests (`tests/brainstorm-server/`) remain on disk, identical to upstream, so syncing future upstream releases stays clean. They are never invoked. Do not start the server.
