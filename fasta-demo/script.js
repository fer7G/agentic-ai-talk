const input = document.getElementById("fasta-input");
const analyzeBtn = document.getElementById("analyze-btn");
const messageBox = document.getElementById("message");
const resultsBox = document.getElementById("results");

const elHeader = document.getElementById("result-header");
const elLength = document.getElementById("result-length");
const elGC = document.getElementById("result-gc");
const elComposition = document.getElementById("result-composition");
const elRevComp = document.getElementById("result-revcomp");
const elTm = document.getElementById("result-tm");

function showMessage(text) {
  messageBox.textContent = text;
  messageBox.hidden = false;
}

function hideMessage() {
  messageBox.hidden = true;
  messageBox.textContent = "";
}

function parseFasta(raw) {
  const lines = raw.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  let header = null;
  let sequenceLines = lines;

  if (lines.length > 0 && lines[0].startsWith(">")) {
    header = lines[0].slice(1).trim();
    sequenceLines = lines.slice(1);
  }

  const sequence = sequenceLines.join("").replace(/\s+/g, "");
  return { header, sequence };
}

function analyze() {
  hideMessage();
  resultsBox.hidden = true;

  const raw = input.value;
  if (!raw.trim()) {
    showMessage("Please enter a sequence to analyze.");
    return;
  }

  const { header, sequence } = parseFasta(raw);

  if (!sequence) {
    showMessage("Please enter a sequence to analyze.");
    return;
  }

  const validBases = new Set(["A", "C", "G", "T", "U"]);
  const upper = sequence.toUpperCase();
  const invalidChars = new Set();
  let cleanSequence = "";

  for (const ch of upper) {
    if (validBases.has(ch)) {
      cleanSequence += ch;
    } else {
      invalidChars.add(ch);
    }
  }

  if (invalidChars.size > 0) {
    showMessage(
      `Warning: found unrecognized character(s): ${[...invalidChars].join(", ")}. ` +
      `These were ignored in the analysis below.`
    );
  }

  const isRNA = cleanSequence.includes("U");
  const length = cleanSequence.length;

  const counts = { A: 0, C: 0, G: 0, T: 0, U: 0 };
  for (const ch of cleanSequence) counts[ch]++;

  const gcCount = counts.G + counts.C;
  const weakCount = isRNA ? counts.U : counts.T;
  const gcPercent = length > 0 ? ((gcCount / length) * 100).toFixed(1) : "0.0";

  // Reverse complement
  const complementMap = isRNA
    ? { A: "U", U: "A", C: "G", G: "C" }
    : { A: "T", T: "A", C: "G", G: "C" };
  const revComp = cleanSequence
    .split("")
    .reverse()
    .map((ch) => complementMap[ch])
    .join("");

  // Melting temperature
  let tm;
  if (length <= 14) {
    tm = 2 * weakCount + 4 * gcCount;
  } else {
    tm = 64.9 + (41 * (gcCount - 16.4)) / length;
  }

  // Render
  elHeader.textContent = header || "(no header)";
  elLength.textContent = `${length} bases`;
  elGC.textContent = `${gcPercent}%`;
  elRevComp.textContent = revComp;
  elTm.textContent = `${tm.toFixed(1)} °C`;

  const baseLabels = isRNA ? ["A", "C", "G", "U"] : ["A", "C", "G", "T"];
  elComposition.innerHTML = baseLabels
    .map((base) => {
      const count = counts[base];
      const pct = length > 0 ? ((count / length) * 100).toFixed(1) : "0.0";
      return `<span>${base}: ${count}<small>${pct}%</small></span>`;
    })
    .join("");

  resultsBox.hidden = false;
}

analyzeBtn.addEventListener("click", analyze);
