# RNA-seq Analysis Demo with Claude Code

This demo shows an end-to-end bulk RNA-seq workflow — quantification, QC, and
differential expression — driven entirely from natural-language prompts to
Claude Code, using the [ClawBio](https://github.com/ClawBio/ClawBio) plugin
and a custom `differentialabundance` skill. The goal is to show that Claude
Code can orchestrate real bioinformatics pipelines (Salmon, MultiQC,
nf-core/differentialabundance), not just write code.

## 1. Get the sample data

Download and unpack a public paired-end RNA-seq FASTQ sample set into
`rnaseq_data/`:

```bash
# Download the ZIP file and save it locally
curl -L -O https://bioinfogp.cnb.csic.es/files/samples/rnaseq/RNA-Seq_Sample_Files.zip

# Extract the contents into a new directory named 'rnaseq_data'
unzip RNA-Seq_Sample_Files.zip -d rnaseq_data

# Clean up the archive
rm RNA-Seq_Sample_Files.zip
```

## 2. Install the ClawBio plugin in Claude Code

Start Claude Code inside this directory (`claude`) and install the ClawBio
marketplace and plugin:

```
/plugin marketplace add ClawBio/ClawBio
/plugin install clawbio
/reload-plugins
```

ClawBio adds bioinformatics skills to Claude Code — including pipeline
wrappers for read QC, alignment/quantification, and MultiQC aggregation.

## 3. Install the `differentialabundance` skill

This repo already vendors a custom skill at
[`skills/differentialabundance/SKILL.md`](skills/differentialabundance/SKILL.md)
that teaches Claude Code how to correctly configure and run the
[nf-core/differentialabundance](https://nf-co.re/differentialabundance)
Nextflow pipeline (choosing the right analysis profile, DESeq2 vs limma vs
DREAM vs propd, contrasts, filtering, functional enrichment, etc.).

Claude Code only auto-loads skills placed under `.claude/skills/`, so copy
(or symlink) it there:

```bash
mkdir -p .claude/skills
cp -r skills/differentialabundance .claude/skills/differentialabundance
```

- Use `.claude/skills/` at the **project root** to make the skill available
  only in this project.
- Use `~/.claude/skills/` instead if you want it available in every project
  on your machine.

Restart Claude Code (or run `/reload-plugins`) after copying so it picks up
the new skill.

## 4. Run the demo

With the FASTQ files from step 1 in the current directory, prompt Claude Code:

> Use clawbio to run rnaseq with the fastq files in the current directory. We
> just want a quick quantification with salmon and a basic multiQC, so skip
> slow processes like Picard, StringTie, RSeQC, dupRadar, etc. After that is
> finished, use the differentialabundance skill to run differential
> expression analysis and generate a report. Measure and report the time
> spent on each step.

What this prompt does:

1. **Quantification (Salmon)** — pseudo-alignment and transcript/gene-level
   quantification of the FASTQ files, skipping the slower QC/analysis
   processes (Picard, StringTie, RSeQC, dupRadar) that aren't needed for a
   quick demo.
2. **QC report (MultiQC)** — aggregates the Salmon logs into a single basic
   MultiQC HTML report.
3. **Differential expression** (`differentialabundance` skill) — runs
   nf-core/differentialabundance (DESeq2 by default for RNA-seq counts) on
   the Salmon output and produces the DE report.
4. **Timing** — Claude Code times and reports how long each of the above
   steps took, so you can see where the time goes in a real pipeline run.
