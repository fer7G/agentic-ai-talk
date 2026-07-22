# Specification: FASTA Sequence Analyzer

## Goal

Build a simple, self-contained web page (no backend, no server: it must work by
just opening a single `index.html` file in the browser) that analyzes a DNA/RNA
sequence pasted by the user in FASTA format.

## Input

- A `<textarea>` where the user pastes text in FASTA format, for example:

  ```
  >example_sequence
  ACGGCTAGCTAGCTACGGATCGATCGATCGGCTAGCATCAGCTAGCATCG
  ```

- Must support both DNA (bases A, C, G, T) and RNA (bases A, C, G, U).
- Must ignore blank lines and whitespace within the sequence.
- If the text has no header (a line starting with `>`), treat the whole text as
  the sequence directly (no header).
- An "Analyze" button that triggers the calculation.

## Output

When "Analyze" is clicked, show in clearly separated cards or sections:

1. **Header / name**: the identifier extracted from the `>` line (if present).
2. **Length**: total number of bases in the sequence.
3. **Base composition**: count and percentage of each base (A, C, G, T or U).
4. **%GC**: percentage of G + C bases over the total.
5. **Reverse complement sequence**:
   - If DNA: A↔T, C↔G, and reverse the order.
   - If RNA: A↔U, C↔G, and reverse the order.
6. **Approximate melting temperature (Tm)**:
   - If the sequence has 14 bases or fewer, use the Wallace rule:
     `Tm = 2°C × (A+T) + 4°C × (G+C)`.
   - If it has more than 14 bases, use the %GC-based formula:
     `Tm = 64.9 + 41 × (GC − 16.4) / length`, where `GC` is the number of G+C
     bases.

## Validation

- If the sequence contains characters that aren't A, C, G, T, or U (ignoring
  case and whitespace), show a warning listing the unrecognized characters
  found, but still attempt to analyze the rest.
- If the text field is empty when "Analyze" is clicked, show a message asking
  the user to enter a sequence.

## Visual style

- Clean, minimalist design, legible typography (`system-ui` or similar).
- Light theme, with a single accent color.
- Should look good both on a laptop screen and projected (text not too small).
- No need for mobile responsiveness.

## Out of scope (do NOT include)

- No backend, database, or build step (Webpack, Vite, etc.) needed: plain
  HTML + CSS + JavaScript in a single file (or at most 2-3 simple files
  referenced from `index.html`).
- No need to support multiple FASTA sequences at once (one per analysis).
- No need to save or persist anything between sessions.
