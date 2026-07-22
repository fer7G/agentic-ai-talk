export type TabId = 'contacts' | 'structure' | 'embedding' | 'mutations'

const TABS: { id: TabId; label: string }[] = [
  { id: 'contacts', label: 'Contact Map' },
  { id: 'structure', label: 'Structure' },
  { id: 'embedding', label: 'Embedding' },
  { id: 'mutations', label: 'Mutation Scan' },
]

interface Props {
  active: TabId
  onChange: (id: TabId) => void
}

export function Tabs({ active, onChange }: Props) {
  return (
    <nav className="tabs">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={`tab ${active === t.id ? 'active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  )
}
