# Publishing Design Pages as Claude Artifacts

Read this when your harness has the **Artifact tool** (Claude Code). It
publishes an HTML page to claude.ai as a private artifact your human
partner can open, click through, and comment on from a PC or a phone.
On any other harness, or when the tool is not available in this session,
skip it: write the same files to disk and give your partner their paths.
Feedback then comes in chat only.

The files are written to the repo either way. Publishing is a view of
them, not a replacement.

## The design artifact: one link, two pages

A topic folder holds the spec and its prototype side by side:

```
docs/superpowers/specs/YYYY-MM-DD-<topic>/
    index.html       the layered spec (templates/spec.html, a page fragment)
    prototype.html   the clickable prototype (templates/prototype.html)
```

Publish them as **one** artifact: `file_path` is `index.html`, and
`files` maps `"prototype.html"` to the prototype's path. The spec links
`prototype.html#<screen-id>`; the prototype's "Back to spec" links
`index.html`. Those relative links work both in the artifact and on disk.

- **First publish:** pass `icon` (one generic word, such as `blueprint`)
  and a one-sentence `description`. Keep the page's `<title>` a name.
- **Every revision:** edit the files, then publish the **same file path**
  again, with `files` again when the prototype changed. That republishes
  to the same URL, so the link your partner already has shows the new
  version. Omit `icon` on a republish.
- **Mid-conversation visuals** (a single screen, two layout options) are
  the same thing at a smaller scale: one page, published when it helps,
  linked in your message. You don't need to ask first; a link is cheap to
  ignore.

Pages follow the artifact page rules the Artifact tool gives you (title,
theme tokens with both dark-mode guards, an explicit `body` background,
a 16px side gutter at phone width, no external resources beyond its CDN
allowlist). The spec template's stylesheet and the prototype and report
templates already satisfy them; keep that shape when you fill them in.
The spec keeps the canonical stylesheet; a prototype takes the product's
own look.

**Screen ids** are the hash names the spec links to. Use ASCII letters,
digits and hyphens. claude.ai reserves `settings`, `sidebar`,
`customize`, `upgrade`, `downloads` and anything starting with
`comment-`; never use those as a screen id.

## Reading feedback

Your partner can leave comments on either page, and may also write a
general note in chat. When they reply:

1. Read the artifact's comments with the `ArtifactComments` tool (load
   it first if it is deferred), and read their chat note.
2. Treat both as one set of feedback. A comment is pinned to what they
   looked at; the chat note covers everything else.
3. Answer each comment in its own thread: what you changed, or why it
   stands.
4. Revise the files, republish to the same path, and tell your partner
   in chat what changed.

Read comments when your partner replies, or when a watch notice arrives
for a comment sent to Claude. Don't poll. Parts they didn't comment on
or mention count as approved only when they give a go-ahead; a batch of
comments by itself is feedback, not approval.

## Reports

`templates/report.html` is the run report for a multi-session roadmap
(superpowers:running-multi-session-plans). Publish it the same way: one
artifact per roadmap, republished to the same path after every session.
