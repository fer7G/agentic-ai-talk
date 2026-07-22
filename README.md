# Getting Started with Agentic AI — talk material

Material for the seminar on agentic AI (a.k.a. vibe coding) at the Biomedical
Sciences department (UIC), July 22, 2026.

## Contents

- [`slides.md`](slides.md) — slide deck in [Marp](https://marp.app) format
  (Markdown → PDF / PPTX / HTML).
- [`slides.pdf`](slides.pdf) — PDF export of the slides.
- [`companion-doc.md`](companion-doc.md) — companion document with more detail,
  meant for the audience to read before, during, or after the talk.
- `fasta-demo/` — the FASTA sequence analyzer already built and tested from
  `spec-demo.md`, kept as a working reference/fallback copy.
- `fasta-demo-live/` — a clean copy containing only `spec-demo.md`, meant to
  be built live during the talk (see "For the demo" below).
- `webapp-demo/` — a second, more complex pre-built demo (an ESM-2 protein
  explorer) to show off what's possible beyond the live-built example.

## Recreate the demo

During the talk, the FASTA sequence analyzer was built live with Claude Code,
starting from nothing but a specification. You can reproduce that yourself:

1. Copy `fasta-demo-live/spec-demo.md` into an empty folder — it's just the
   spec, so you start from scratch, the same way the demo did.
2. Launch Claude Code in that folder (`claude` in the terminal).
3. Ask Claude Code to implement the specification as a web page.
4. Open the resulting `index.html` in your browser to see the result.

`fasta-demo/` already has a finished, working build of the same spec, if
you'd rather just see the end result first.

## Recommended videos

[https://www.youtube.com/watch?v=2aN_-m1uU4k](https://www.youtube.com/watch?v=2aN_-m1uU4k)

[https://www.youtube.com/watch?v=uogzSxOw4LU](https://www.youtube.com/watch?v=uogzSxOw4LU)

## How to export the slides

You need Node.js installed. Marp can be used without installing anything
globally, via `npx`:

```bash
# Live-reloading browser preview while you edit slides.md
npx @marp-team/marp-cli@latest -w -s slides.md

# Export to PDF
npx @marp-team/marp-cli@latest slides.md -o slides.pdf

# Export to PowerPoint (editable)
npx @marp-team/marp-cli@latest slides.md -o slides.pptx

# Export to a self-contained HTML page
npx @marp-team/marp-cli@latest slides.md -o slides.html
```

Alternative: install the **"Marp for VS Code"** extension, which adds an
in-editor preview and export commands from the UI.

Note: PDF/PPTX export needs a local Chrome, Edge, or Firefox install (Marp
uses it under the hood to render). Arc (Chromium-based) does not work for this
— it fails to launch in headless/automated mode. The HTML export does not need
a browser at all, and can simply be opened in Arc (or any browser) directly —
this is the easiest way to present.
