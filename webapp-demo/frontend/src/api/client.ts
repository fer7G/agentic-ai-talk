export interface HealthResponse {
  status: string
  device: string
  accelerator: 'cuda' | 'mps' | 'cpu'
  cuda: boolean
  model_id: string
  num_params: number
  load_seconds: number
}

export interface Preset {
  id: string
  name: string
  description: string
  sequence: string
}

export interface EmbeddingsResponse {
  residues: string[]
  coords2d: [number, number][]
}

export interface ContactsResponse {
  matrix: number[][]
}

export interface MutationsResponse {
  wildtype: string[]
  amino_acids: string[]
  matrix: number[][]
  perplexity: number
}

export interface StructureResponse {
  pdb: string
  confidences: number[]
}

async function postJSON<T>(path: string, sequence: string): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sequence }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    const detail = body?.detail
    const message = Array.isArray(detail)
      ? detail.map((d: { msg?: string }) => d.msg).join('; ')
      : detail || `Request to ${path} failed (${res.status})`
    throw new Error(message)
  }
  return res.json()
}

export const api = {
  health: () => fetch('/api/health').then((r) => r.json() as Promise<HealthResponse>),
  presets: () => fetch('/api/presets').then((r) => r.json() as Promise<Preset[]>),
  embeddings: (sequence: string) => postJSON<EmbeddingsResponse>('/api/embeddings', sequence),
  contacts: (sequence: string) => postJSON<ContactsResponse>('/api/contacts', sequence),
  mutations: (sequence: string) => postJSON<MutationsResponse>('/api/mutations', sequence),
  structure: (sequence: string) => postJSON<StructureResponse>('/api/structure', sequence),
}
