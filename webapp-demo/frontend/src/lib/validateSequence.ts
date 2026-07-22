const VALID_AA = new Set('ACDEFGHIKLMNPQRSTVWYXBUZO'.split(''))

export const MAX_ANALYSIS_LEN = 512
export const MAX_STRUCTURE_LEN = 400

export function cleanSequence(raw: string): { sequence: string; error: string | null } {
  const lines = raw.split(/\r?\n/).filter((l) => !l.startsWith('>'))
  const seq = lines.join('').replace(/\s+/g, '').toUpperCase()
  if (!seq) return { sequence: '', error: null }
  const bad = [...new Set([...seq].filter((c) => !VALID_AA.has(c)))]
  if (bad.length > 0) {
    return { sequence: seq, error: `Invalid character(s): ${bad.join(', ')}` }
  }
  if (seq.length > MAX_ANALYSIS_LEN) {
    return { sequence: seq, error: `Too long (${seq.length} residues, max ${MAX_ANALYSIS_LEN}).` }
  }
  return { sequence: seq, error: null }
}
