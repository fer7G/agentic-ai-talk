import { useEffect, useState } from 'react'
import { api, type HealthResponse, type Preset } from './api/client'
import { ContactMapPanel } from './components/ContactMapPanel'
import { EmbeddingPanel } from './components/EmbeddingPanel'
import { Header } from './components/Header'
import { MutationPanel } from './components/MutationPanel'
import { SequenceInput } from './components/SequenceInput'
import { StateMessage } from './components/StateMessage'
import { StructurePanel } from './components/StructurePanel'
import { Tabs, type TabId } from './components/Tabs'
import { cleanSequence } from './lib/validateSequence'

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [healthError, setHealthError] = useState<string | null>(null)
  const [presets, setPresets] = useState<Preset[]>([])
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)
  const [raw, setRaw] = useState('')
  const [tab, setTab] = useState<TabId>('contacts')

  useEffect(() => {
    api
      .health()
      .then(setHealth)
      .catch((e) => setHealthError(String(e)))
    api.presets().then((ps) => {
      setPresets(ps)
      if (ps.length > 0) {
        setSelectedPresetId(ps[0].id)
        setRaw(ps[0].sequence)
      }
    })
  }, [])

  const { sequence, error } = cleanSequence(raw)

  function handlePresetSelect(id: string) {
    setSelectedPresetId(id)
    const preset = presets.find((p) => p.id === id)
    if (preset) setRaw(preset.sequence)
  }

  function handleRawChange(v: string) {
    setRaw(v)
    setSelectedPresetId(null)
  }

  const activeSequence = !error ? sequence : ''

  return (
    <div className="app-shell">
      <Header health={health} healthError={healthError} />
      <div className="app-body">
        <aside className="rail">
          <SequenceInput
            raw={raw}
            onRawChange={handleRawChange}
            cleaned={sequence}
            error={error}
            presets={presets}
            selectedPresetId={selectedPresetId}
            onSelectPreset={handlePresetSelect}
          />
        </aside>
        <section className="main">
          <Tabs active={tab} onChange={setTab} />
          {!activeSequence ? (
            <StateMessage
              kind="empty"
              headline="Waiting for a sequence"
              detail="Choose a preset or paste an amino acid sequence to begin exploring."
            />
          ) : (
            <>
              {tab === 'contacts' && <ContactMapPanel sequence={activeSequence} />}
              {tab === 'structure' && <StructurePanel sequence={activeSequence} />}
              {tab === 'embedding' && <EmbeddingPanel sequence={activeSequence} />}
              {tab === 'mutations' && <MutationPanel sequence={activeSequence} />}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
