import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { api } from '../api/client'
import { fitCanvas, lerpColor } from '../lib/canvas'
import { themeColor } from '../lib/themeColors'
import { useCachedFetch } from '../lib/useCachedFetch'
import { useElementSize } from '../lib/useElementSize'
import { StateMessage } from './StateMessage'

const MARGIN_LEFT = 42
const MARGIN_TOP = 28

interface Hover {
  row: number
  col: number
  x: number
  y: number
}

export function ContactMapPanel({ sequence }: { sequence: string }) {
  const { data, loading, error } = useCachedFetch(
    sequence ? `contacts:${sequence}` : null,
    () => api.contacts(sequence),
  )
  const { ref: frameRef, size } = useElementSize<HTMLDivElement>()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hover, setHover] = useState<Hover | null>(null)
  const [cell, setCell] = useState(1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !data || size.width === 0) return
    const L = data.matrix.length
    const plotW = size.width - MARGIN_LEFT - 10
    const plotH = size.height - MARGIN_TOP - 10
    const c = Math.max(1, Math.min(plotW / L, plotH / L))
    setCell(c)

    const ctx = fitCanvas(canvas, size.width, size.height)
    const surface = themeColor('--surface')
    const low = themeColor('--surface-raised')
    const high = themeColor('--accent')
    const tickColor = themeColor('--accent')
    const textDim = themeColor('--text-dim')

    ctx.fillStyle = surface
    ctx.fillRect(0, 0, size.width, size.height)

    for (let i = 0; i < L; i++) {
      for (let j = 0; j < L; j++) {
        const v = Math.max(0, Math.min(1, data.matrix[i][j]))
        ctx.fillStyle = lerpColor(low, high, v)
        ctx.fillRect(MARGIN_LEFT + j * c, MARGIN_TOP + i * c, Math.ceil(c), Math.ceil(c))
      }
    }

    // axis ticks — the residue-index ruler motif
    const step = Math.max(1, Math.round(L / 12 / 5) * 5) || 1
    ctx.font = '10px "JetBrains Mono", monospace'
    ctx.fillStyle = textDim
    for (let i = 0; i < L; i += step) {
      const yTop = MARGIN_TOP + i * c
      ctx.strokeStyle = tickColor
      ctx.globalAlpha = 0.5
      ctx.beginPath()
      ctx.moveTo(MARGIN_LEFT - 4, yTop)
      ctx.lineTo(MARGIN_LEFT, yTop)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(MARGIN_LEFT + i * c, MARGIN_TOP - 4)
      ctx.lineTo(MARGIN_LEFT + i * c, MARGIN_TOP)
      ctx.stroke()
      ctx.globalAlpha = 1
      ctx.fillText(String(i + 1), 2, yTop + 3)
      ctx.save()
      ctx.translate(MARGIN_LEFT + i * c + 3, MARGIN_TOP - 8)
      ctx.fillText(String(i + 1), 0, 0)
      ctx.restore()
    }
  }, [data, size])

  if (!sequence) return null
  if (loading) return <StateMessage kind="loading" headline="Computing attention contacts…" />
  if (error) return <StateMessage kind="error" headline="Contact map failed" detail={error} />
  if (!data) return null

  const L = data.matrix.length

  function handleMove(e: MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const col = Math.floor((x - MARGIN_LEFT) / cell)
    const row = Math.floor((y - MARGIN_TOP) / cell)
    if (row >= 0 && row < L && col >= 0 && col < L) {
      setHover({ row, col, x, y })
    } else {
      setHover(null)
    }
  }

  return (
    <div className="panel-canvas-wrap">
      <div className="legend-scale">
        <span>0.0</span>
        <div
          className="swatches"
          style={{
            width: 100,
            height: 10,
            background: 'linear-gradient(90deg, var(--surface-raised), var(--accent))',
            borderRadius: 2,
          }}
        />
        <span>1.0 contact probability</span>
      </div>
      <div className="viz-frame" ref={frameRef}>
        <canvas
          ref={canvasRef}
          onMouseMove={handleMove}
          onMouseLeave={() => setHover(null)}
        />
        {hover && (
          <div
            className="tooltip"
            style={{ left: Math.min(hover.x + 14, size.width - 160), top: hover.y + 14 }}
          >
            <span className="k">res</span> {hover.row + 1}
            {sequence[hover.row]} <span className="k">×</span> {hover.col + 1}
            {sequence[hover.col]}
            <br />
            <span className="k">p =</span> {data.matrix[hover.row][hover.col].toFixed(3)}
          </div>
        )}
      </div>
    </div>
  )
}
