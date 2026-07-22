import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { api, type MutationsResponse } from '../api/client'
import { fitCanvas, lerpColor } from '../lib/canvas'
import { themeColor } from '../lib/themeColors'
import { useCachedFetch } from '../lib/useCachedFetch'
import { StateMessage } from './StateMessage'

const CELL_W = 15
const ROW_H = 18
const MARGIN_LEFT = 30
const MARGIN_TOP = 26

function divergingColor(v: number): string {
  const clamp = 6
  const t = Math.max(-1, Math.min(1, v / clamp))
  const mid = themeColor('--surface-raised')
  return t >= 0
    ? lerpColor(mid, themeColor('--accent'), t)
    : lerpColor(mid, themeColor('--magenta'), -t)
}

function topMutations(data: MutationsResponse, n: number) {
  const rows: { label: string; value: number }[] = []
  data.matrix.forEach((row, pos) => {
    row.forEach((value, aaIdx) => {
      const mutant = data.amino_acids[aaIdx]
      if (mutant === data.wildtype[pos]) return
      rows.push({ label: `${data.wildtype[pos]}${pos + 1}${mutant}`, value })
    })
  })
  return rows.sort((a, b) => b.value - a.value).slice(0, n)
}

export function MutationPanel({ sequence }: { sequence: string }) {
  const { data, loading, error } = useCachedFetch(
    sequence ? `mutations:${sequence}` : null,
    () => api.mutations(sequence),
  )
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hover, setHover] = useState<{ row: number; col: number; x: number; y: number } | null>(
    null,
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !data) return
    const L = data.matrix.length
    const A = data.amino_acids.length
    const width = MARGIN_LEFT + L * CELL_W + 10
    const height = MARGIN_TOP + A * ROW_H + 10
    const ctx = fitCanvas(canvas, width, height)

    ctx.fillStyle = themeColor('--surface')
    ctx.fillRect(0, 0, width, height)
    ctx.font = '10px "JetBrains Mono", monospace'

    for (let pos = 0; pos < L; pos++) {
      for (let aaIdx = 0; aaIdx < A; aaIdx++) {
        const v = data.matrix[pos][aaIdx]
        const x = MARGIN_LEFT + pos * CELL_W
        const y = MARGIN_TOP + aaIdx * ROW_H
        ctx.fillStyle = divergingColor(v)
        ctx.fillRect(x, y, CELL_W - 1, ROW_H - 1)
        if (data.amino_acids[aaIdx] === data.wildtype[pos]) {
          ctx.strokeStyle = themeColor('--text-secondary')
          ctx.lineWidth = 1
          ctx.strokeRect(x + 1, y + 1, CELL_W - 3, ROW_H - 3)
        }
      }
    }

    // row labels — amino acid letters
    ctx.fillStyle = themeColor('--text-secondary')
    for (let aaIdx = 0; aaIdx < A; aaIdx++) {
      ctx.fillText(data.amino_acids[aaIdx], 10, MARGIN_TOP + aaIdx * ROW_H + ROW_H / 2 + 3)
    }

    // column ticks — residue index ruler
    const step = Math.max(1, Math.round(L / 24 / 5) * 5) || 1
    ctx.fillStyle = themeColor('--text-dim')
    ctx.strokeStyle = themeColor('--accent')
    for (let pos = 0; pos < L; pos += step) {
      const x = MARGIN_LEFT + pos * CELL_W
      ctx.globalAlpha = 0.5
      ctx.beginPath()
      ctx.moveTo(x, MARGIN_TOP - 4)
      ctx.lineTo(x, MARGIN_TOP)
      ctx.stroke()
      ctx.globalAlpha = 1
      ctx.save()
      ctx.translate(x + 2, MARGIN_TOP - 8)
      ctx.fillText(String(pos + 1), 0, 0)
      ctx.restore()
    }
  }, [data])

  const top = useMemo(() => (data ? topMutations(data, 8) : []), [data])

  if (!sequence) return null
  if (loading) return <StateMessage kind="loading" headline="Scanning all point mutations…" />
  if (error) return <StateMessage kind="error" headline="Mutation scan failed" detail={error} />
  if (!data) return null

  function handleMove(e: MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const col = Math.floor((x - MARGIN_LEFT) / CELL_W)
    const row = Math.floor((y - MARGIN_TOP) / ROW_H)
    if (row >= 0 && row < data!.amino_acids.length && col >= 0 && col < data!.matrix.length) {
      setHover({ row, col, x, y })
    } else {
      setHover(null)
    }
  }

  return (
    <div className="panel-canvas-wrap">
      <div className="btn-row">
        <div className="readout">
          <span className="value">{data.perplexity.toFixed(2)}</span>
          <span className="eyebrow">pseudo-perplexity · lower = more natural to ESM-2</span>
        </div>
        <span style={{ flex: 1 }} />
        <div className="legend-scale">
          <span>disfavored</span>
          <div
            className="swatches"
            style={{
              width: 100,
              height: 10,
              background: 'linear-gradient(90deg, var(--magenta), var(--surface-raised), var(--accent))',
              borderRadius: 2,
            }}
          />
          <span>favored</span>
        </div>
      </div>

      <div className="viz-frame" style={{ overflowX: 'auto', justifyContent: 'flex-start' }}>
        <canvas ref={canvasRef} onMouseMove={handleMove} onMouseLeave={() => setHover(null)} />
        {hover && (
          <div className="tooltip" style={{ left: hover.x + 14, top: hover.y + 14 }}>
            {data.wildtype[hover.col]}
            {hover.col + 1}
            {data.amino_acids[hover.row]} <span className="k">Δ</span>{' '}
            {data.matrix[hover.col][hover.row].toFixed(2)}
          </div>
        )}
      </div>

      <div className="rail-section">
        <span className="eyebrow">Top predicted mutations</span>
        <div className="btn-row">
          {top.map((m) => (
            <span key={m.label} className="btn mono" style={{ cursor: 'default' }}>
              {m.label} {m.value > 0 ? '+' : ''}
              {m.value.toFixed(2)}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
