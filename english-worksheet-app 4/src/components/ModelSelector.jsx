import { MODELS } from '../utils/ai.js'

export default function ModelSelector({ selectedId, onChange }) {
  const selected = MODELS.find(m => m.id === selectedId) || MODELS[0]

  return (
    <div className="model-selector">
      <div className="model-selector-header">
        <h2>AI 모델 선택</h2>
        <span className="model-current-label">
          현재 선택: <strong>{selected.label}</strong>
          <span className="model-saved-hint"> — 앱을 닫아도 유지됩니다</span>
        </span>
      </div>

      <div className="model-cards">
        {MODELS.map(model => {
          const isActive = model.id === selectedId
          return (
            <div
              key={model.id}
              className={`model-card ${isActive ? 'model-card-active' : ''}`}
              onClick={() => onChange(model.id)}
            >
              <div className="model-card-top">
                <span className={`provider-dot ${model.provider === 'anthropic' ? 'dot-claude' : 'dot-openai'}`} />
                <span className="model-name">{model.label}</span>
                {model.badge && <span className="model-badge">{model.badge}</span>}
                {isActive && <span className="model-check">✓</span>}
              </div>
              <div className="model-note">{model.note}</div>
            </div>
          )
        })}
      </div>

      <div className="model-key-row">
        <KeyStatus label="Anthropic Key" envKey="VITE_ANTHROPIC_API_KEY" />
        <KeyStatus label="OpenAI Key" envKey="VITE_OPENAI_API_KEY" />
      </div>
    </div>
  )
}

function KeyStatus({ label, envKey }) {
  const hasKey = Boolean(import.meta.env[envKey])
  return (
    <div className={`key-status ${hasKey ? 'key-ok' : 'key-missing'}`}>
      <span className="key-dot" />
      {label}: {hasKey ? '설정됨 ✓' : '미설정 — .env 확인 필요'}
    </div>
  )
}
