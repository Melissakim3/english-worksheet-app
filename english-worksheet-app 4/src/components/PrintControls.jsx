import { useState } from 'react'

// 전역 기본값
export const DEFAULT_SETTINGS = {
  enSize: 11.5,
  koSize: 10,
  lineHeight: 3.0,
}

// localStorage 키
const LS_KEY = 'ws_print_settings'

export function loadSettings() {
  try {
    const saved = localStorage.getItem(LS_KEY)
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : { ...DEFAULT_SETTINGS }
  } catch { return { ...DEFAULT_SETTINGS } }
}

export function saveSettings(s) {
  localStorage.setItem(LS_KEY, JSON.stringify(s))
}

// ── 컴포넌트 ──────────────────────────────────────────
export default function PrintControls({ settings, onChange }) {
  const [open, setOpen] = useState(false)

  const set = (key, val) => {
    const next = { ...settings, [key]: val }
    onChange(next)
    saveSettings(next)
  }

  const reset = () => {
    onChange({ ...DEFAULT_SETTINGS })
    saveSettings({ ...DEFAULT_SETTINGS })
  }

  return (
    <div className="print-controls no-print">
      <button className="pc-toggle" onClick={() => setOpen(o => !o)}>
        ⚙ 글자 크기 / 줄간격 조정 {open ? '▲' : '▼'}
      </button>

      {open && (
        <div className="pc-panel">
          <Slider
            label="영어 글자 크기"
            value={settings.enSize}
            min={8} max={16} step={0.5}
            unit="px"
            onChange={v => set('enSize', v)}
          />
          <Slider
            label="한글 글자 크기"
            value={settings.koSize}
            min={7} max={14} step={0.5}
            unit="px"
            onChange={v => set('koSize', v)}
          />
          <Slider
            label="줄 간격 (필기 공간)"
            value={settings.lineHeight}
            min={1.5} max={4.0} step={0.1}
            unit="×"
            onChange={v => set('lineHeight', v)}
          />
          <button className="pc-reset" onClick={reset}>기본값으로 초기화</button>
        </div>
      )}
    </div>
  )
}

function Slider({ label, value, min, max, step, unit, onChange }) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className="pc-row">
      <div className="pc-label">
        <span>{label}</span>
        <span className="pc-val">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="pc-slider"
        style={{'--pct': `${pct}%`}}
      />
      <div className="pc-minmax">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  )
}
