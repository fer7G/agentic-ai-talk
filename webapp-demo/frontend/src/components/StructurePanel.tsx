import { useEffect, useRef, useState } from 'react'
import { api } from '../api/client'
import { themeColor } from '../lib/themeColors'
import { useCachedFetch } from '../lib/useCachedFetch'
import { MAX_STRUCTURE_LEN } from '../lib/validateSequence'
import { StateMessage } from './StateMessage'

type Style = 'cartoon' | 'stick' | 'sphere'

function confColor(b: number): string {
  if (b > 0.9) return themeColor('--conf-veryhigh')
  if (b > 0.7) return themeColor('--conf-high')
  if (b > 0.5) return themeColor('--conf-low')
  return themeColor('--conf-verylow')
}

export function StructurePanel({ sequence }: { sequence: string }) {
  const tooLong = sequence.length > MAX_STRUCTURE_LEN
  const { data, loading, error } = useCachedFetch(
    sequence && !tooLong ? `structure:${sequence}` : null,
    () => api.structure(sequence),
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<any>(null)
  const [style, setStyle] = useState<Style>('cartoon')
  const [spinning, setSpinning] = useState(false)

  useEffect(() => {
    if (!containerRef.current || !window.$3Dmol) return
    viewerRef.current = window.$3Dmol.createViewer(containerRef.current, {
      backgroundColor: themeColor('--surface') || '#12150f',
    })
    const observer = new ResizeObserver(() => viewerRef.current?.resize())
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !data) return
    viewer.removeAllModels()
    viewer.addModel(data.pdb, 'pdb')
    applyStyle(viewer, style)
    viewer.zoomTo()
    viewer.render()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !data) return
    applyStyle(viewer, style)
    viewer.render()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [style])

  useEffect(() => {
    viewerRef.current?.spin(spinning)
  }, [spinning])

  function applyStyle(viewer: any, s: Style) {
    viewer.setStyle({}, {})
    const spec = { colorfunc: (atom: { b: number }) => confColor(atom.b) }
    if (s === 'cartoon') viewer.setStyle({}, { cartoon: spec })
    if (s === 'stick') viewer.setStyle({}, { stick: spec })
    if (s === 'sphere') viewer.setStyle({}, { sphere: { ...spec, scale: 0.3 } })
  }

  function download() {
    if (!data) return
    const blob = new Blob([data.pdb], { type: 'chemical/x-pdb' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'esmfold_prediction.pdb'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!sequence) return null

  if (tooLong) {
    return (
      <StateMessage
        kind="empty"
        headline="Sequence too long to fold"
        detail={`The public ESMFold API caps input at ${MAX_STRUCTURE_LEN} residues (this sequence is ${sequence.length}). Try a shorter preset or trim your sequence.`}
      />
    )
  }

  return (
    <div className="panel-canvas-wrap">
      <div className="btn-row">
        {(['cartoon', 'stick', 'sphere'] as Style[]).map((s) => (
          <button key={s} className={`btn ${style === s ? 'active' : ''}`} onClick={() => setStyle(s)}>
            {s}
          </button>
        ))}
        <button className={`btn ${spinning ? 'active' : ''}`} onClick={() => setSpinning((v) => !v)}>
          spin
        </button>
        <button className="btn" onClick={download} disabled={!data}>
          download pdb
        </button>
        <span style={{ flex: 1 }} />
        <div className="legend-scale">
          <span>confidence</span>
          <span className="swatch" style={{ background: 'var(--conf-verylow)' }} />
          <span className="swatch" style={{ background: 'var(--conf-low)' }} />
          <span className="swatch" style={{ background: 'var(--conf-high)' }} />
          <span className="swatch" style={{ background: 'var(--conf-veryhigh)' }} />
          <span>very high</span>
        </div>
      </div>
      <div className="viz-frame" style={{ position: 'relative' }}>
        <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />
        {loading && (
          <div style={{ position: 'relative', zIndex: 1 }}>
            <StateMessage kind="loading" headline="Folding with ESMFold…" detail="Calling Meta's public structure API" />
          </div>
        )}
        {error && (
          <div style={{ position: 'relative', zIndex: 1 }}>
            <StateMessage kind="error" headline="Structure prediction failed" detail={error} />
          </div>
        )}
      </div>
      <p className="footnote">
        Structure predicted by ESMFold (Meta AI), not the local ESM-2 model — folding requires
        the much larger ESMFold network, called here via the public API.
      </p>
    </div>
  )
}
