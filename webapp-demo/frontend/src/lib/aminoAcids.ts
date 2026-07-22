export type AACategory = 'nonpolar' | 'polar' | 'acidic' | 'basic' | 'special' | 'other'

export interface AAInfo {
  name: string
  category: AACategory
  hydrophobicity: number // Kyte-Doolittle
  charge: number
}

export const CATEGORY_COLOR: Record<AACategory, string> = {
  nonpolar: '#9fef6b',
  polar: '#79e3d8',
  acidic: '#ff5c8a',
  basic: '#ff9b4a',
  special: '#b7a6ff',
  other: '#6b7264',
}

export const CATEGORY_LABEL: Record<AACategory, string> = {
  nonpolar: 'Nonpolar',
  polar: 'Polar',
  acidic: 'Acidic (-)',
  basic: 'Basic (+)',
  special: 'Special',
  other: 'Ambiguous',
}

export const AA_TABLE: Record<string, AAInfo> = {
  A: { name: 'Alanine', category: 'nonpolar', hydrophobicity: 1.8, charge: 0 },
  V: { name: 'Valine', category: 'nonpolar', hydrophobicity: 4.2, charge: 0 },
  L: { name: 'Leucine', category: 'nonpolar', hydrophobicity: 3.8, charge: 0 },
  I: { name: 'Isoleucine', category: 'nonpolar', hydrophobicity: 4.5, charge: 0 },
  M: { name: 'Methionine', category: 'nonpolar', hydrophobicity: 1.9, charge: 0 },
  F: { name: 'Phenylalanine', category: 'nonpolar', hydrophobicity: 2.8, charge: 0 },
  W: { name: 'Tryptophan', category: 'nonpolar', hydrophobicity: -0.9, charge: 0 },
  S: { name: 'Serine', category: 'polar', hydrophobicity: -0.8, charge: 0 },
  T: { name: 'Threonine', category: 'polar', hydrophobicity: -0.7, charge: 0 },
  N: { name: 'Asparagine', category: 'polar', hydrophobicity: -3.5, charge: 0 },
  Q: { name: 'Glutamine', category: 'polar', hydrophobicity: -3.5, charge: 0 },
  Y: { name: 'Tyrosine', category: 'polar', hydrophobicity: -1.3, charge: 0 },
  D: { name: 'Aspartate', category: 'acidic', hydrophobicity: -3.5, charge: -1 },
  E: { name: 'Glutamate', category: 'acidic', hydrophobicity: -3.5, charge: -1 },
  K: { name: 'Lysine', category: 'basic', hydrophobicity: -3.9, charge: 1 },
  R: { name: 'Arginine', category: 'basic', hydrophobicity: -4.5, charge: 1 },
  H: { name: 'Histidine', category: 'basic', hydrophobicity: -3.2, charge: 0.5 },
  G: { name: 'Glycine', category: 'special', hydrophobicity: -0.4, charge: 0 },
  P: { name: 'Proline', category: 'special', hydrophobicity: -1.6, charge: 0 },
  C: { name: 'Cysteine', category: 'special', hydrophobicity: 2.5, charge: 0 },
}

export function aaInfo(code: string): AAInfo {
  return (
    AA_TABLE[code] ?? { name: 'Non-standard', category: 'other', hydrophobicity: 0, charge: 0 }
  )
}

export function composition(sequence: string): { category: AACategory; count: number }[] {
  const counts: Partial<Record<AACategory, number>> = {}
  for (const ch of sequence) {
    const cat = aaInfo(ch).category
    counts[cat] = (counts[cat] ?? 0) + 1
  }
  return (Object.entries(counts) as [AACategory, number][])
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
}
