---
name: differentialabundance-pipeline
description: >-
  Guides running the nf-core/differentialabundance Nextflow pipeline correctly —
  picking the right analysis profile (rnaseq/affy/maxquant/soft/generic_matrix,
  DESeq2/limma/DREAM/propd), preparing samplesheet/matrix/contrasts inputs,
  filtering, functional enrichment (GSEA/gprofiler2/decoupler/grea), reproducibility,
  and scaling to large sample numbers. Use when the user wants to run, configure,
  debug, or review a run of nf-core/differentialabundance, or asks about DESeq2 vs
  limma vs DREAM vs propd, contrasts files, or the Quarto/Shiny report outputs.
---

# Running nf-core/differentialabundance

Best-practice guide for configuring and executing the nf-core/differentialabundance
pipeline. Derived from this repo's `docs/usage.md`, `nextflow.config`, and
`nextflow_schema.json` — re-check those files if the pipeline version differs from
what's described here, since profile names and defaults do change between releases.

## 1. Always start from the test profile

Before touching real data, verify the install works:

```bash
nextflow run nf-core/differentialabundance -profile test,docker --outdir test_results
```

Swap `docker` for `singularity`/`podman`/`conda` etc. Docker/Singularity are strongly
preferred over Conda for reproducibility.

## 2. Pick ONE analysis profile — don't hand-assemble methods

Analysis profiles bundle study type + differential method + method-specific defaults
(column names, thresholds) consistently. **Never override `--differential_method` on
the CLI when using a profile** — switch profiles instead, or you'll get mismatched
defaults (e.g. wrong LFC/p-value column names).

| Data | Profile | Method |
|---|---|---|
| RNA-seq counts (default, most common) | `rnaseq` | DESeq2 |
| RNA-seq + GSEA | `rnaseq_deseq2_gsea` | DESeq2 |
| RNA-seq + g:Profiler2 | `rnaseq_deseq2_gprofiler2` | DESeq2 |
| RNA-seq, voom | `rnaseq_limma` | limma |
| RNA-seq, voom + GSEA/gprofiler2/decoupler | `rnaseq_limma_gsea` / `_gprofiler2` / `_decoupler` | limma |
| RNA-seq, repeated measures / random effects | `rnaseq_dream` (+ `_decoupler`) | DREAM |
| RNA-seq, compositional / differential proportionality | `rnaseq_propd` (+ `_grea`) | propd |
| Affymetrix CEL files | `affy` (+ `_limma_gsea` / `_limma_gprofiler2`) | limma |
| MaxQuant `proteinGroups.txt` | `maxquant` | limma |
| GEO SOFT matrices | `soft` | limma |
| Pre-scaled/normalised matrix (microarray intensities, logCPM, etc.) | `generic_matrix` (or `generic_matrix_dream` for mixed effects) | limma / DREAM |

Combine with exactly one container profile: `-profile rnaseq,docker`. Order matters —
later profiles override earlier ones.

`study_type` (rnaseq/affy/maxquant/geo_soft_file/generic_matrix) only controls input
format handling; it is a *related but separate* setting from the analysis profile,
which controls the statistical method. Don't assume setting `study_type` alone
selects DESeq2 vs limma.

## 3. Choosing the differential method

- **DESeq2** (`rnaseq*` default): best default for raw RNA-seq counts, negative
  binomial model. Use `--deseq2_vs_method rlog` to swap VST→rlog if needed (small
  n, or need for rlog-specific downstream use); VST is faster and the default.
- **limma(-voom)**: use for microarray/proteomics/pre-normalised matrices, or RNA-seq
  when you specifically want a linear-model/voom approach.
- **DREAM** (`variancePartition`): required — not optional — when observations are
  **not independent**: repeated measures on the same donor/subject, technical
  replicates within subjects, paired time-course designs. DESeq2/limma assume
  independence and will understate variance/inflate false positives otherwise.
  Random effects use `(1 | variable)` `lme4` syntax inside a YAML contrasts
  `formula`, e.g. `~ condition + (1 | donor)`.
- **propd**: compositional / differential-proportionality analysis, normalization-free
  (log-ratios on raw counts). Different output columns (`LFC`, `rcDdis`,
  `significant`) — don't expect standard padj columns. Its LFC is per-gene-reference,
  not condition-vs-condition, so the global `differential_min_fold_change` (2.0)
  reads too strict; the `rnaseq_propd` profile already lowers this to 1.5 — don't
  "fix" that back to 2.0 without a reason.

## 4. Input matrix — get the scale right or the stats are wrong

This is the single most common correctness mistake:

- **DESeq2** needs **raw counts**. If your matrix came from tximport/salmon (e.g.
  nf-core/rnaseq), pair raw counts with `--feature_length_matrix` (gene lengths
  file, available from nf-core/rnaseq ≥3.13.2) so DESeq2 can model length bias:
  ```bash
  --matrix salmon.merged.gene_counts.tsv --feature_length_matrix salmon.merged.gene_lengths.tsv
  ```
  Without a lengths file, do **not** feed raw `salmon.merged.gene_counts.tsv` in —
  use `gene_counts_length_scaled.tsv` or `gene_counts_scaled.tsv` instead.
- **limma-voom** does not use the offset matrix, so use the **scaled** counts
  matrices (`gene_counts_length_scaled.tsv` / `gene_counts_scaled.tsv`), never raw
  counts.
- **`generic_matrix` profile**: only for data that is *already* on the appropriate
  scale (log-transformed microarray intensities, logCPM, etc.) — no VST/rlog/voom
  is applied, the matrix goes straight to limma.
- Match `--observations_id_col` / `--features_id_col` to the actual ID columns in
  your samplesheet/matrix (defaults: `sample` / `gene_id`).

## 5. Contrasts — prefer YAML for anything beyond a simple two-group test

CSV/TSV contrasts (`id,variable,reference,target,blocking`) are fine for simple
one-factor comparisons. Switch to **YAML** contrasts when you need:

- Random effects for DREAM: `formula: "~ condition + (1 | donor)"`
- Interaction terms: `formula: "~ genotype * treatment"` with an explicit
  `make_contrasts_str` (e.g. `"genotypeKO.treatmentTreated"`) matching the exact
  model-matrix coefficient name — validate the formula first with
  [`ExploreModelMatrix`](https://www.bioconductor.org/packages/release/bioc/html/ExploreModelMatrix.html)
  before committing to a `make_contrasts_str`, since a typo there fails silently
  or selects the wrong coefficient.
- Sample exclusion per-contrast: `exclude_samples_col` / `exclude_samples_values`.

Formula-based contrasts aren't supported by `GSEA_GSEA`/`SHINYNGS_APP` (they need a
`meta.variable`) — use `comparison`-style contrasts if you need those downstream
steps for a given contrast.

## 6. Reproducibility checklist

- Pin the pipeline version: `-r <version>` (e.g. `-r 2.x.x`), and re-pull with
  `nextflow pull nf-core/differentialabundance` before switching.
- Set `--seed <int>` for reproducible reruns of DESeq2/limma/DREAM/GSEA (unset by
  default — stochastic steps are non-deterministic until you set this).
- Use a `-params-file params.yaml` for repeated/shared runs instead of long CLI
  commands; never use `-c <file>` to pass parameters (that's for resource/process
  config only and will error).
- Leave `--round_digits` at its default (`-1`, disabled) unless you explicitly want
  rounded report tables — rounding by default risks silent information loss on
  small values.
- If sharing a params file publicly (e.g. as paper supplementary material), strip
  cluster-specific paths and institutional profiles first.

## 7. Filtering — set before trusting differential results

Key params (`filtering_min_samples`, `filtering_min_abundance`,
`filtering_min_proportion`, `filtering_grouping_var`,
`filtering_min_proportion_not_na`, `filtering_min_samples_not_na`) control which
features enter the model. Under-filtering leaves low-count noise that hurts
multiple-testing correction (e.g. DESeq2 independent filtering, BH power); over-filtering
drops real signal. Check the exploratory report's abundance distributions before
finalizing thresholds — the test profile deliberately raises
`filtering_min_abundance` to demonstrate this working, don't copy that value blindly
into a production run without checking it suits your depth/library size.

## 8. Functional enrichment — pick the tool that matches your differential method

| Tool | Needs | Notes |
|---|---|---|
| GSEA | `--gene_sets_files gene_sets.gmt` | ranked-list based |
| gprofiler2 | `--gprofiler2_organism <species>` (or own gene sets) | web-API based; uses abundance-filtered genes as background by default — this matters, don't disable without reason (background bias is a well-documented confound) |
| decoupler | `--decoupler_network network.tsv` (DoRothEA/CollecTRI/PROGENy etc.) | consumes DE stats (logFC/p) directly; human/mouse networks only unless you supply a custom one |
| grea | requires `--differential_method propd` + `--propd_save_adjacency true` | only pairs with propd — consumes its adjacency matrix, not per-gene stats |

Use the bundled combo profiles (e.g. `rnaseq_deseq2_gsea`, `rnaseq_propd_grea`)
rather than hand-wiring `--functional_method` + method params, to avoid mismatched
defaults.

## 9. Scaling to large sample numbers (100s+)

Several reporting steps aren't optimized for large N and can fail the whole run.
Either:

```groovy
process {
    withName:'PLOT_EXPLORATORY|PLOT_DIFFERENTIAL|QUARTONOTEBOOK|MAKE_REPORT_BUNDLE|SHINYNGS_APP'{
        ext.when = false
    }
}
```

or use the narrower `--skip_reports` (skips just the Quarto notebook/report bundle,
keeps other plots). Also consider `--differential_subset_to_contrast_samples` to
restrict DESeq2/limma/DREAM to only the samples in each contrast — speeds things up
significantly with many samples but few per-contrast.

## 10. Resource / failure troubleshooting

Exit code `137` on `DESEQ2_DIFFERENTIAL` (or similar) after retries = OOM. The
pipeline auto-retries failed steps at 2x then 3x the original resource request
(see `conf/base.config`) before giving up — repeated `137`s mean you need to raise
the base resource profile (via `nf-core/configs`-style custom config), not just wait
for the retry. Also set `OPENBLAS_NUM_THREADS` if DESeq2 seems to be using all
machine cores rather than the allocated ones.

## 11. Two operating modes — know which one you're in

- **Single-run (profiles)** — production default. Precedence: `CLI/-params-file >
  profile > pipeline defaults`.
- **Multi-run (`--paramsheet`)** — for comparing configurations (e.g. DESeq2 vs
  limma side by side). Precedence is **inverted**: `paramsheet > CLI > defaults`
  — each paramsheet entry is meant to be self-contained. Use `--paramset_name
  a,b` to run only a subset. There is no bundled default paramsheet; you always
  supply your own.

## Canonical commands

```bash
# RNA-seq, DESeq2 (most common production case)
nextflow run nf-core/differentialabundance -r <version> \
    -profile rnaseq,docker \
    --input samplesheet.csv --contrasts contrasts.yaml \
    --matrix assay_matrix.tsv --gtf genes.gtf \
    --seed 1234 \
    --outdir results/

# RNA-seq, repeated measures (DREAM)
nextflow run nf-core/differentialabundance -r <version> \
    -profile rnaseq_dream,docker \
    --input samplesheet.csv --contrasts contrasts_with_random_effects.yaml \
    --matrix assay_matrix.tsv --gtf genes.gtf \
    --outdir results/

# Affymetrix CEL archive
nextflow run nf-core/differentialabundance -r <version> \
    -profile affy,docker \
    --input samplesheet.csv --contrasts contrasts.csv \
    --affy_cel_files_archive cel_files.tar \
    --outdir results/

# MaxQuant proteomics
nextflow run nf-core/differentialabundance -r <version> \
    -profile maxquant,docker \
    --input samplesheet.csv --contrasts contrasts.csv \
    --matrix proteinGroups.txt \
    --outdir results/
```

## Quick pitfalls checklist

- [ ] Overrode `--differential_method` on top of a profile → don't; pick the right profile instead.
- [ ] Fed raw salmon/tximport counts to DESeq2 without `--feature_length_matrix`, or to limma at all → use scaled/length-scaled counts.
- [ ] Repeated-measures design run through DESeq2/limma instead of DREAM → non-independence violated, use `rnaseq_dream`.
- [ ] `make_contrasts_str` typed by hand without checking it matches the model matrix → validate with `ExploreModelMatrix` first.
- [ ] No `--seed` set, then surprised reruns differ slightly → set it for anything you'll need to reproduce.
- [ ] Used `-c` to pass pipeline parameters → only use `-c` for resource/process config; use `-params-file` for params.
- [ ] Large cohort (100s of samples) run without disabling/adjusting reporting steps → will likely fail; see §9.
- [ ] `grea` requested without `--differential_method propd` or without `--propd_save_adjacency true` → grea only consumes propd's adjacency matrix.

## Reference

- `docs/usage.md` in this repo — full parameter narrative (samplesheet/matrix/contrasts formats, DREAM, propd, enrichment tools, scaling).
- `docs/output.md` — output directory structure (report/, plots/, tables/).
- `nextflow_schema.json` — authoritative current defaults/help text per parameter (check before trusting a value quoted here, in case the pipeline version has moved on).
- https://nf-co.re/differentialabundance/parameters — full parameter reference (rendered from the same schema).
- https://nf-co.re/differentialabundance/usage — canonical hosted usage docs.

