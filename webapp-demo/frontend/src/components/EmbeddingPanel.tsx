import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { api } from '../api/client'
import { aaInfo, CATEGORY_COLOR, CATEGORY_LABEL, type AACategory } from '../lib/aminoAcids'
import { fitCanvas, lerpColor } from '../lib/canvas'
import { themeColor } from '../lib/themeColors'
import { useCachedFetch } from '../lib/useCachedFetch'
import { useElementSize } from '../lib/useElementSize'
import { StateMessage } from './StateMessage'

type ColorMode = 'category' | 'hydrophobicity' | 'charge' | 'position'

const PAD = 30

function colorFor(mode: ColorMode, residue: string, index: number, total: number): string {
  const info = aaInfo(residue)
  const lowC = themeColor('--surface-raised')
  if (mode === 'category') return CATEGORY_COLOR[info.category]
  if (mode === 'hydrophobicity') {
    const t = (info.hydrophobicity + 4.5) / 9
    return lerpColor(themeColor('--cyan'), themeColor('--amber'), t)
  }
  if (mode === 'charge') {
    if (info.charge > 0) return themeColor('--amber')
    if (info.charge < 0) return themeColor('--magenta')
    return lowC
  }
  const t = index / Math.max(1, total - 1)
  return lerpColor(themeColor('--cyan'), themeColor('--accent'), t)
}

export function EmbeddingPanel({ sequence }: { sequence: string }) {
  const { data, loading, error } = useCachedFetch(
    sequence ? `embeddings:${sequence}` : null,
    () => api.embeddings(sequence),
  )
  const { ref: frameRef, size } = useElementSize<HTMLDivElement>()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mode, setMode] = useState<ColorMode>('category')
  const [hover, setHover] = useState<{ index: number; x: number; y: number } | null>(null)
  const pointsRef = useRef<{ x: number; y: number }[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !data || size.width === 0) return
    const { coords2d, residues } = data
    const xs = coords2d.map((c) => c[0])
    const ys = coords2d.map((c) => c[1])
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    const spanX = maxX - minX || 1
    const spanY = maxY - minY || 1
    const plotW = size.width - PAD * 2
    const plotH = size.height - PAD * 2

    const points = coords2d.map(([x, y]) => ({
      x: PAD + ((x - minX) / spanX) * plotW,
      y: PAD + plotH - ((y - minY) / spanY) * plotH,
    }))
    pointsRef.current = points

    const ctx = fitCanvas(canvas, size.width, size.height)
    ctx.fillStyle = themeColor('--surface')
    ctx.fillRect(0, 0, size.width, size.height)

    // backbone trace — connects residues in sequence order
    ctx.strokeStyle = themeColor('--border-strong')
    ctx.lineWidth = 1
    ctx.beginPath()
    points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)))
    ctx.stroke()

    points.forEach((p, i) => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
      ctx.fillStyle = colorFor(mode, residues[i], i, residues.length)
      ctx.fill()
      ctx.lineWidth = 1
      ctx.strokeStyle = themeColor('--bg')
      ctx.stroke()
    })
  }, [data, size, mode])

  if (!sequence) return null
  if (loading) return <StateMessage kind="loading" headline="Projecting residue embeddings…" />
  if (error) return <StateMessage kind="error" headline="Embedding failed" detail={error} />
  if (!data) return null

  function handleMove(e: MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    let best = -1
    let bestDist = 64
    pointsRef.current.forEach((p, i) => {
      const d = (p.x - x) ** 2 + (p.y - y) ** 2
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    })
    setHover(best >= 0 ? { index: best, x, y } : null)
  }

  const categories: AACategory[] = ['nonpolar', 'polar', 'acidic', 'basic', 'special']

  return (
    <div className="panel-canvas-wrap">
      <div className="btn-row">
        {(['category', 'hydrophobicity', 'charge', 'position'] as ColorMode[]).map((m) => (
          <button
            key={m}
            className={`btn ${mode === m ? 'active' : ''}`}
            onClick={() => setMode(m)}
          >
            {m}
          </button>
        ))}
        <span style={{ flex: 1 }} />
        {mode === 'category' ? (
          <div className="comp-legend">
            {categories.map((c) => (
              <span className="comp-legend-item" key={c}>
                <span className="swatch" style={{ background: CATEGORY_COLOR[c] }} />
                {CATEGORY_LABEL[c]}
              </span>
            ))}
          </div>
        ) : (
          <div className="legend-scale">
            <span>{mode === 'charge' ? '−' : mode === 'position' ? 'N-term' : 'hydrophilic'}</span>
            <div
              className="swatches"
              style={{
                width: 100,
                height: 10,
                background:
                  mode === 'charge'
                    ? 'linear-gradient(90deg, var(--magenta), var(--surface-raised), var(--amber))'
                    : mode === 'position'
                      ? 'linear-gradient(90deg, var(--cyan), var(--accent))'
                      : 'linear-gradient(90deg, var(--cyan), var(--amber))',
                borderRadius: 2,
              }}
            />
            <span>{mode === 'charge' ? '+' : mode === 'position' ? 'C-term' : 'hydrophobic'}</span>
          </div>
        )}
      </div>
      <div className="viz-frame" ref={frameRef}>
        <canvas ref={canvasRef} onMouseMove={handleMove} onMouseLeave={() => setHover(null)} />
        {hover && (
          <div
            className="tooltip"
            style={{ left: Math.min(hover.x + 14, size.width - 160), top: hover.y + 14 }}
          >
            <span className="k">res {hover.index + 1}</span> {data.residues[hover.index]} —{' '}
            {aaInfo(data.residues[hover.index]).name}
          </div>
        )}
      </div>
      <p className="footnote">
        Per-residue hidden states projected to 2D via PCA. The trace line follows sequence order,
        N- to C-terminus.
      </p>
    </div>
  )
}
