---
marp: true
theme: default
paginate: true
size: 16:9
backgroundColor: #F5F3EC
style: |
  /* Palette inspired by the Claude (Anthropic) web UI: warm cream background,
     terracotta accent; retro old-newspaper-headline typography
     (Playfair Display for headings, Lora for body text). */
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
  section {
    background-color: #F5F3EC;
    color: #2C2A25;
    font-family: "Lora", Georgia, serif;
    font-size: 26px;
    line-height: 1.45;
  }
  h1, h2, h3 {
    font-family: "Playfair Display", Georgia, serif;
    font-weight: 700;
    color: #2C2A25;
  }
  h1 {
    color: #C05C3B;
  }
  section.lead {
    background-color: #EFEAD9;
  }
  section.lead h1 {
    font-size: 1.8em;
  }
  section.lead h2 {
    color: #6B6459;
    font-weight: 400;
  }
  strong {
    color: #C05C3B;
  }
  a {
    color: #C05C3B;
  }
  ul li::marker, ol li::marker {
    color: #C05C3B;
  }
  code {
    background-color: #EAE6DA;
    color: #2C2A25;
    border-radius: 4px;
    padding: 0.1em 0.35em;
  }
  pre {
    background-color: #EAE6DA;
    border-radius: 10px;
    padding: 0.8em 1em;
  }
  pre code {
    background-color: transparent;
    padding: 0;
  }
  blockquote {
    border-left: 4px solid #C05C3B;
    color: #6B6459;
    padding-left: 0.8em;
  }
  section::after {
    color: #9A9382;
  }
  img.title-logo {
    position: absolute;
    bottom: 40px;
    left: 73px;
    width: 400px;
  }
  header {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 0.8em;
    color: #6B6459;
  }
  section.lead header {
    display: none;
  }
  @import url('assets/timeline.css');
---

<!-- _class: lead -->
<!-- _paginate: false -->

![bg right:38%](assets/cover-image.jpeg)

# Getting Started with Agentic AI

## A practical introduction to navigate the new wave of AI

Fernando Guirao, Uciel Chorostecki, Nicolás Aira
July 22, 2026

<img src="assets/uic-group-logo.png" alt="Computational RNA Biology Group — UIC" class="title-logo" />

---

## Agenda

1. Introduction: from chat to agents
2. The agent's workspace
3. Getting started with Claude Code
4. Live demo: from spec to app
5. Why context matters
6. *Skills*
7. Under the hood: tokens, context, hallucinations
8. How to navigate the hype

---

<!-- _class: lead -->
<!-- header: 'Introduction' -->

# 1. Introduction

---

## The road to agentic coding

<div class="timeline">
  <div class="tl-line"></div>
  <div class="tl-event tl-pos-chatgpt">
    <div class="tl-dot"></div>
    <div class="tl-content tl-above">
      <div class="tl-label">
        <span class="tl-name">ChatGPT</span>
        <span class="tl-sub">chat goes mainstream</span>
      </div>
      <div class="tl-date">Nov 2022</div>
    </div>
  </div>
  <div class="tl-event tl-pos-cursor">
    <div class="tl-dot"></div>
    <div class="tl-content tl-below">
      <div class="tl-date">Mar 2023</div>
      <div class="tl-label">
        <span class="tl-name">Cursor</span>
        <span class="tl-sub">agent inside the IDE</span>
      </div>
    </div>
  </div>
  <div class="tl-event tl-pos-claudecode">
    <div class="tl-dot"></div>
    <div class="tl-content tl-above">
      <div class="tl-label">
        <span class="tl-name">Claude Code</span>
        <span class="tl-sub">agent goes standalone</span>
      </div>
      <div class="tl-date">May 2025</div>
    </div>
  </div>
  <div class="tl-event tl-today tl-pos-today">
    <div class="tl-dot"></div>
    <div class="tl-content tl-below">
      <div class="tl-date">Jul 2026</div>
      <div class="tl-label">
        <span class="tl-name">Today</span>
      </div>
    </div>
  </div>
</div>

<!--
Speaker note: good moment to ask the room who has used ChatGPT by
copy-pasting code or text by hand. Almost everyone will raise a hand:
that's exactly the paradigm this timeline moves away from. Cursor and
Claude Code both let the model act (read/write files, run commands,
observe results, self-correct) instead of just talking — the difference
between them is whether that agent lives inside an IDE or stands on its
own in the terminal.
-->

---

## Why this talk?

- The field moves at a brutal pace: new models, benchmarks, and tools every week
- Goal 1: give you a solid foundation to start using it today
- Goal 2: give you judgment to separate signal from noise — **not everything that glitters is gold**

---

<!-- _class: lead -->
<!-- header: "The agent's workspace" -->

# 2. The agent's workspace

---

## Where does a coding agent "live"?

- Tools like Claude Code run **on your own computer**, not just on a website
- They need access to:
  - The **file system** (folders and files)
  - The **terminal** (to run commands)
  - Optionally, the internet

---

## File system basics

- Everything on your computer lives organized in folders (directories) and files
- Absolute path: `/Users/your_username/project/data.csv`
- Relative path: `data.csv` (relative to "where you currently are")
- The agent reads and writes files exactly as you would by hand

---

## Terminal basics

- The terminal (shell) lets you give the computer instructions by typing text
- Basic commands:
  - `pwd` → where am I?
  - `ls` → what's here?
  - `cd folder` → move into "folder"
- The agent "types" these commands for you — understanding what they do gives you real control

---

## Which operating system to use?

- **Recommended: macOS or Linux**
- **Windows → WSL** (Windows Subsystem for Linux)
- The agentic AI tooling ecosystem is built with Unix-like environments in mind

---

<!-- _class: lead -->
<!-- header: 'Getting started with Claude Code' -->

# 3. Getting started with Claude Code

---

## What is Claude Code?

- A command-line interface (CLI) for working with Claude in an agentic way
- Runs in your terminal, inside your project folder
- Sees your files, can edit them, run commands, install dependencies...

---

## Installation

Native installer (recommended, auto-updates):
```bash
curl -fsSL https://claude.ai/install.sh | bash
```

With Homebrew (macOS/Linux):
```bash
brew install --cask claude-code
```

With npm (requires Node.js 22+):
```bash
npm install -g @anthropic-ai/claude-code
```

---

## Plans and access

- Requires a **Pro, Max, Team, or Enterprise** account (the free claude.ai plan does not include Code)
- Alternative: your own API key, pay-as-you-go, no subscription needed
- Also available through AWS Bedrock, Google Vertex AI, or Microsoft Foundry

<!--
Note: if someone from the department asks about cost for research use,
remember that API billing is per token consumed, not per seat/user.
-->

---

<!-- _class: lead -->
<!-- header: 'Live demo' -->

# 4. Live demo

---

## From spec to application

- We start from a Markdown file with the **specification** of a small tool
- We hand it to Claude Code and ask it to implement it
- Recommended editor to review the generated code: **VS Code**
- The whole process, live, with nothing prepared in advance

---

## What we're going to build

- A small **FASTA sequence analyzer**
- Input: a DNA/RNA sequence in FASTA format
- Output: length, %GC, base composition, reverse complement, approximate Tm
- A simple web page, no backend

*(full specification in `demo/spec-demo.md`)*

<!--
Note: open demo/spec-demo.md in VS Code, then launch Claude Code in that
folder and ask it to "implement the specification in this file". Let it
work without interrupting; narrate out loud what it's doing.
-->

---

<!-- _class: lead -->
<!-- header: 'Why context matters' -->

# 5. Why context matters

---

## "Context" = what the agent knows before it starts

- An LLM has no memory between sessions: it only knows what we tell it in each conversation
- The better the context, the better the decisions the agent makes
- Ways to give context: direct instructions, reference files, project documentation...

---

## CLAUDE.md / AGENTS.md

- `CLAUDE.md`: a Markdown file Claude Code reads automatically when it starts working in a project
- Contains: project conventions, useful commands, design decisions, things to avoid...
- `AGENTS.md`: an equivalent, provider-agnostic convention (used by Cursor, Copilot...)
- Claude Code can read both, and can even generate them automatically with `/init`

---

## Context best practices

- Markdown specification documents (like the one used in the demo)
- Keep them short and specific — not a dump of all knowledge in the world
- Context isn't free: it takes up space in the context window (next section)

---

<!-- _class: lead -->
<!-- header: 'Skills' -->

# 6. Skills

---

## What are Skills?

- Reusable packages of instructions for specific, repeatable tasks
- Live in `.claude/skills/`, defined in a `SKILL.md` file
- Invoked either as a command (`/skill-name`) or auto-triggered by the agent when relevant

---

## Why are they useful?

- Only loaded when actually needed → don't take up context in the background
- Let you standardize procedures: "how to deploy", "how to review code", "how to run a type-X analysis"
- Can be shared across projects and across members of the same research group

---

<!-- _class: lead -->
<!-- header: 'Under the hood' -->

# 7. Under the hood

---

## Tokens

- An LLM doesn't process "words", it processes **tokens** (text chunks, ~3-4 characters on average)
- Everything has a token cost: what you write, what the model replies, the files the agent reads
- API pricing and usage limits are measured in tokens

---

## Context window

- The maximum number of tokens a model can "keep in mind" at once
- Includes: the conversation, files the agent has read, `CLAUDE.md`, loaded skills...
- Once it fills up, older content has to be summarized or dropped → detail can be lost
- A very large context window does **not** guarantee equal attention to all of its content

---

## Hallucinations

- An LLM generates statistically plausible text, not necessarily true text
- It can confidently invent functions, citations, or the results of an analysis
- In an agent, this is more serious: it can **take actions** based on a hallucination
- Mitigation: verify, ask for sources, run tests, review the diff before accepting changes

<!--
Note: good moment to connect with the research angle: never accept an
AI-generated analysis result or bibliographic citation without checking it.
-->

---

<!-- _class: lead -->
<!-- header: 'How to navigate the hype' -->

# 8. How to navigate the hype

---

## Some heuristics

- A new model or benchmark every week doesn't mean your workflow should change every week
- Be suspicious of demos you can't reproduce yourself
- Test with your own data and real tasks before believing a headline
- The useful question isn't "is this the newest thing?" but "does this save me time today, on my problem?"

---

## Resources to keep learning

- Official Claude Code docs: `https://code.claude.com/docs`
- Agent Skills format (open standard): `https://agentskills.io`
- This talk's companion document: `companion-doc.md`
- The specification used in the demo: `demo/spec-demo.md`

---

<!-- _class: lead -->

# Thank you!

## Questions

Fernando Guirao — fernando.guirao@estudiantat.upc.edu
Uciel Chorostecki — upchorostecki@uic.es
Nicolás Aira — naira@uic.es
