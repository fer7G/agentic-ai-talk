import { useMemo } from 'react'
import type { Preset } from '../api/client'
import { CATEGORY_COLOR, CATEGORY_LABEL, composition } from '../lib/aminoAcids'
import { MAX_ANALYSIS_LEN } from '../lib/validateSequence'

interface Props {
  raw: string
  onRawChange: (v: string) => void
  cleaned: string
  error: string | null
  presets: Preset[]
  selectedPresetId: string | null
  onSelectPreset: (id: string) => void
}

export function SequenceInput({
  raw,
  onRawChange,
  cleaned,
  error,
  presets,
  selectedPresetId,
  onSelectPreset,
}: Props) {
  const comp = useMemo(() => composition(cleaned), [cleaned])
  const selectedPreset = presets.find((p) => p.id === selectedPresetId)

  return (
    <>
      <div className="rail-section">
        <span className="eyebrow">Sample</span>
        <select
          className="control mono"
          value={selectedPresetId ?? ''}
          onChange={(e) => onSelectPreset(e.target.value)}
        >
          <option value="" disabled>
            choose a preset…
          </option>
          {presets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {selectedPreset && <p className="preset-desc">{selectedPreset.description}</p>}
      </div>

      <div className="rail-section">
        <span className="eyebrow">Sequence</span>
        <textarea
          className="control"
          value={raw}
          onChange={(e) => onRawChange(e.target.value)}
          placeholder="Paste an amino acid sequence or FASTA record…"
          spellCheck={false}
        />
        <div className="seq-meta">
          <span>{cleaned.length} residues</span>
          <span>max {MAX_ANALYSIS_LEN}</span>
        </div>
        {error && <span className="error-text">{error}</span>}
      </div>

      {cleaned.length > 0 && !error && (
        <div className="rail-section">
          <span className="eyebrow">Composition</span>
          <div className="comp-bar">
            {comp.map(({ category, count }) => (
              <span
                key={category}
                style={{
                  width: `${(count / cleaned.length) * 100}%`,
                  background: CATEGORY_COLOR[category],
                }}
                title={`${CATEGORY_LABEL[category]}: ${count}`}
              />
            ))}
          </div>
          <div className="comp-legend">
            {comp.map(({ category, count }) => (
              <span className="comp-legend-item" key={category}>
                <span className="swatch" style={{ background: CATEGORY_COLOR[category] }} />
                {CATEGORY_LABEL[category]} · {count}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
