import type { HealthResponse } from '../api/client'

interface Props {
  health: HealthResponse | null
  healthError: string | null
}

export function Header({ health, healthError }: Props) {
  const status = healthError ? 'error' : health ? (health.accelerator === 'cpu' ? 'cpu' : 'online') : ''

  return (
    <header className="header">
      <div className="wordmark display">
        ESM<span className="dot">·</span>2 EXPLORER
        <span className="subtitle">protein language model</span>
      </div>
      <div className={`gpu-badge ${status}`}>
        <span className="led" />
        <span className="label">
          {healthError ? (
            <span>backend unavailable</span>
          ) : health ? (
            <>
              <strong>{health.device}</strong> · {(health.num_params / 1e6).toFixed(1)}M params
              {health.accelerator === 'cpu' && <span> · CPU (slower)</span>}
            </>
          ) : (
            <span>connecting…</span>
          )}
        </span>
      </div>
    </header>
  )
}
