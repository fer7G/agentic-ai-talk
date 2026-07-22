interface Props {
  kind: 'loading' | 'error' | 'empty'
  headline: string
  detail?: string
}

export function StateMessage({ kind, headline, detail }: Props) {
  return (
    <div className="state-message">
      {kind === 'loading' && <span className="spinner" />}
      <span className="headline" style={kind === 'error' ? { color: 'var(--magenta)' } : {}}>
        {headline}
      </span>
      {detail && <span className="detail">{detail}</span>}
    </div>
  )
}
