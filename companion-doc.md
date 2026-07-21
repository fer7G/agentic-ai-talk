# Agentic AI and Vibe Coding

**Talk companion document**
Fernando Guirao — Computational RNA Biology Group, Biomedical Sciences (UIC)
July 22, 2026

This document accompanies the slides (`slides.md`) and expands on each section in
more detail, so you can follow the talk and revisit it later at your own pace. No
prior programming knowledge is needed to understand it.

---

## Table of contents

1. [Introduction](#1-introduction)
2. [The agent's workspace](#2-the-agents-workspace)
3. [Getting started with Claude Code](#3-getting-started-with-claude-code)
4. [Demo: from spec to application](#4-demo-from-spec-to-application)
5. [Why context matters](#5-why-context-matters)
6. [Skills](#6-skills)
7. [Under the hood](#7-under-the-hood)
8. [How to navigate the hype](#8-how-to-navigate-the-hype)
9. [Glossary](#9-glossary)

---

## 1. Introduction

Since ChatGPT launched at the end of 2022, the most common way to use AI has been
the **chat paradigm**: we type a question or request, the model replies with text,
and we're the ones who copy that text, paste it wherever it needs to go (an email,
a script, a document), and decide what to do with it. In this setup, the human
executes every step; the AI only "talks" in the form of text.

For a while now, however, the dominant paradigm in production environments —
software companies, but increasingly research and data analysis too — has been
**agentic AI**. The key difference is that the language model (LLM) stops just
"talking" and can **act**. An AI agent can:

- Read and write files on a real computer.
- Run commands (for example, execute an analysis script).
- Browse the internet or look up documentation.
- Call other tools or services (APIs).

And it does this **autonomously and iteratively**: it plans a series of steps,
executes one, observes the result, and adjusts the next step accordingly — without
a human having to copy and paste anything in between.

This field moves very fast: new models, benchmarks, and tools appear every week.
This talk has two goals:

1. Give you a solid, practical foundation to start making use of this technology
   today, in your day-to-day research work.
2. Give you the judgment to navigate the hype — not every new development deserves
   to change how you work, and not everything that glitters is gold.

---

## 2. The agent's workspace

Tools like **Claude Code** don't live "on a website": they run on your own
computer, inside a real project folder. To act, they need three things: access to
the **file system**, access to the **terminal**, and optionally, access to the
internet.

### File system

Everything you store on a computer lives organized in folders (also called
directories) and files inside them. A **path** describes where a file is located:

- An **absolute** path describes the full location starting from the disk's root,
  e.g. `/Users/fernando/project/data.csv`.
- A **relative** path describes the location relative to "where you currently
  are", e.g. `data.csv` or `results/figure1.png`.

A coding agent reads and writes files exactly the way you would do it manually:
opening a file, modifying it, saving it.

### The terminal

The terminal (also called the *shell*) is a way of giving the computer
instructions by typing text commands, instead of clicking through windows. Some
basic commands:

- `pwd` (*print working directory*): shows which folder you're in.
- `ls` (*list*): lists the files and folders in the current directory.
- `cd folder_name` (*change directory*): moves you into that folder.

An agent like Claude Code "types" these commands for you to carry out tasks. You
don't need to be a terminal expert to use it, but understanding what's happening
gives you real control over what the agent does on your computer.

### Recommended operating system

We recommend using **macOS or Linux**. On Windows, the recommended option is to
install **WSL** (*Windows Subsystem for Linux*), which gives you a full Linux
environment inside Windows. The practical reason is that the vast majority of the
agentic AI tooling ecosystem (installers, libraries, documentation) is built with
Unix-like environments in mind.

---

## 3. Getting started with Claude Code

**Claude Code** is a command-line interface (CLI) that gives you agentic access to
Claude: it runs in your terminal, inside your project folder, and can see your
files, edit them, run commands, install dependencies, and so on.

### Installation

Native installer (recommended option; auto-updates):

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

With Homebrew, the most common package manager on macOS (also available on
Linux):

```bash
brew install --cask claude-code
```

With npm (Node.js's package manager; requires Node.js 22 or higher installed):

```bash
npm install -g @anthropic-ai/claude-code
```

### Plans and access

Claude Code requires a paid Claude account: **Pro, Max, Team, or Enterprise** (the
free claude.ai plan does not include access to Code). It can also be used with your
own API key, in which case billing is pay-as-you-go (tokens consumed) instead of a
subscription — an interesting option for occasional use, or for a research group
that wants to centralize billing. It's also possible to access Claude through cloud
platforms such as AWS Bedrock, Google Vertex AI, or Microsoft Foundry, if the
department already uses one of those.

### The editor: VS Code

Although Claude Code works entirely from the terminal, it's very common to pair it
with a code editor such as **Visual Studio Code (VS Code)**, free and available for
every operating system. VS Code lets you view the project's files, visually review
the changes the agent proposes, and has an extension that integrates Claude Code
directly into the editor.

---

## 4. Demo: from spec to application

One of the most effective ways to work with a coding agent is to first write a
**specification**: a document (usually in Markdown) describing, in plain language,
what we want to build. The more specific the specification, the better the result.

In the talk we start from the file [`demo/spec-demo.md`](demo/spec-demo.md), which
describes a small **FASTA sequence analyzer**: a simple web page, no server
required, where you can paste a DNA/RNA sequence in FASTA format and get:

- The length of the sequence.
- The percentage of G+C bases (%GC).
- The base composition (how many A, C, G, T/U).
- The reverse complement sequence.
- An approximate melting temperature (Tm).

We hand it to Claude Code and ask it to implement that specification. The agent:

1. Reads the specification file.
2. Plans out the files it needs to create (HTML, CSS, JavaScript).
3. Writes them.
4. Can open or check the result, and fix errors if it finds any.

All of this happens within minutes, without anyone copying or pasting code by hand
— the central difference from the "chat" paradigm we started the talk with.

---

## 5. Why context matters

An LLM has no persistent memory between conversations: in each session, it only
"knows" what's inside its context window (see section 7) — that is, what we
explicitly tell it. That's why **giving good context is one of the most important
levers** for getting good results from an agent.

### CLAUDE.md and AGENTS.md

`CLAUDE.md` is a special Markdown file that Claude Code reads automatically when it
starts working in a project folder. It usually contains:

- Project conventions (code style, folder structure...).
- Useful commands (how to run the tests, how to launch the application...).
- Relevant design decisions and things to avoid.

`AGENTS.md` is an equivalent, but **provider-agnostic** convention: it's also used
by other tools such as Cursor or GitHub Copilot. Claude Code knows how to read
both formats, and the `/init` command can automatically generate a `CLAUDE.md`
from the project's contents (including an existing `AGENTS.md`, if there is one).

### Best practices

- Markdown specification documents (like the one used in the demo) are an
  excellent way to give very targeted context for a specific task.
- These documents should be kept **short and specific**: context isn't free — it
  takes up space in the model's context window (section 7), and an overly long or
  generic document dilutes the information that actually matters.

---

## 6. Skills

**Skills** are reusable packages of instructions for specific, repeatable tasks. In
Claude Code, they live in the project's (or user's) `.claude/skills/` folder, and
each one is defined in a `SKILL.md` file with instructions on how to carry out that
task.

They can be invoked explicitly as a command (e.g. `/skill-name`), or the agent
itself can detect that a skill is relevant to the current task and trigger it on
its own.

Why are they useful?

- **Context efficiency**: unlike a `CLAUDE.md` (which is always loaded), a skill's
  content is only loaded into memory when it's actually used.
- **Standardization**: they let you lock in a procedure ("how to generate a figure
  in our house style", "how to run our analysis pipeline") so that anyone in the
  group gets consistent results.
- **Reuse**: they can be shared across projects and among members of the same
  research group.

Skills follow the open [Agent Skills](https://agentskills.io) format, so they
aren't exclusive to Claude Code.

---

## 7. Under the hood

### Tokens

An LLM doesn't process "words" as such, but **tokens**: chunks of text that
average about 3-4 characters each. For example, a long or uncommon word may be
split into several tokens. Everything has a token cost: the text we write, the
model's reply, and also the contents of any file the agent reads. API usage prices,
as well as the limits of the different subscriptions, are measured in tokens.

### Context window

The **context window** is the maximum number of tokens a model can "keep in mind"
at once in a conversation. It includes everything relevant to the current task: the
conversation history, files the agent has read, the contents of `CLAUDE.md`,
loaded skills, etc.

When the context window fills up, parts of the conversation need to be summarized
or a new one started — which can cause some detail to be lost. It's important to
understand that a very large context window does **not guarantee** that the model
pays equal attention to all of its content: information placed at the start of a
very long conversation can carry less weight than more recent content.

### Hallucinations

An LLM essentially generates the most statistically plausible text given what came
before — not necessarily the true text. This can lead to **hallucinations**: the
model confidently "invents" functions that don't exist, nonexistent bibliographic
references, or even results from an analysis that was never actually run.

In an agent, this is especially delicate, because the model doesn't just risk
saying something false: it can **take actions** based on that hallucination (for
example, using a made-up function, or treating results as valid without having
actually computed them). Some ways to mitigate this:

- Always verify important results and claims, especially citations or scientific
  data.
- Ask the agent to show its reasoning or the sources it used.
- Run automated tests that check the code does what it should.
- Review the *diff* (the exact proposed changes) before accepting them, just as
  you would review a human collaborator's change.

---

## 8. How to navigate the hype

Some practical heuristics for not getting lost in the media noise around AI:

- A new model or benchmark coming out every week doesn't mean you should change
  how you work every week.
- Be suspicious of spectacular demos you can't reproduce yourself, with your own
  data.
- Before believing a headline or a viral thread, try the tool on your own, real
  tasks.
- The question that actually matters isn't "is this the newest thing?", but "does
  this save me time today, on my specific problem?"

### Resources to keep learning

- Official Claude Code documentation: `https://code.claude.com/docs`
- Agent Skills format (open standard): `https://agentskills.io`
- The specification used in this talk's demo: [`demo/spec-demo.md`](demo/spec-demo.md)

---

## 9. Glossary

- **LLM (*Large Language Model*)**: an artificial intelligence model trained on
  large amounts of text, able to generate and understand natural language.
- **Agent / agentic AI**: an LLM given the ability to act (read and write files,
  run commands, use tools) autonomously, instead of only replying with text.
- **CLI (*Command Line Interface*)**: a program controlled by typing text
  commands into a terminal, instead of clicking through a graphical interface.
- **Terminal / *shell***: a program that lets you type text commands to control
  the computer.
- **Token**: the minimal unit of text an LLM processes (roughly 3-4 characters on
  average).
- **Context window**: the maximum number of tokens a model can consider at once in
  a conversation.
- **Hallucination**: when a model generates false or made-up information with the
  appearance of confidence.
- **Prompt**: the instruction or question text given to a model.
- **Repository (repo)**: a project folder, usually version-controlled with a
  system like Git.
- **CLAUDE.md / AGENTS.md**: Markdown files that document a project's context so
  an AI agent reads them automatically.
- **Skill**: a reusable package of instructions for a specific, repeatable task.
