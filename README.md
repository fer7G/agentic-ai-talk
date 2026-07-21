# Agentic AI and Vibe Coding — talk material

Material for the seminar on agentic AI / vibe coding at the Biomedical Sciences
department (UIC), July 22, 2026. The talk itself is in English (this README and
our working conversation are in Spanish, but everything the audience sees is
in English).

## Contents

- [`slides.md`](slides.md) — slide deck in [Marp](https://marp.app) format
  (Markdown → PDF / PPTX / HTML).
- [`companion-doc.md`](companion-doc.md) — companion document with more detail,
  meant for the audience to read before, during, or after the talk.
- [`demo/spec-demo.md`](demo/spec-demo.md) — specification for the mini-app built
  live during the demo (a FASTA sequence analyzer).

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

## Presenter notes

Inside `slides.md`, some slides have HTML comments (`<!-- ... -->`) with notes
for the speaker. Marp treats these as presenter notes: they don't show up in a
normal export, but do appear in presenter mode
(`npx @marp-team/marp-cli@latest -s slides.md`, "Presenter View" option).

## For the live demo

1. Open the `demo/` folder in VS Code.
2. Launch Claude Code in that folder (`claude` in the terminal, from inside
   `demo/`).
3. Ask Claude Code to implement `spec-demo.md` as a web page.
4. Open the resulting `index.html` in the browser to see the result.

If you'd like a pre-built version as a safety net in case the live demo fails
(wifi, time, etc.), let me know and I'll also generate a reference
implementation in `demo/solution/`.
