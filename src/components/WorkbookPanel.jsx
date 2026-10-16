import { useRef, useState } from 'react'
import { workbookHtml, PARTS, BASE_PARTS } from '../workbook/workbook.js'
import { generateWorkbook } from '../workbook/generate.js'

// 고른 구성은 다음에도 그대로 (브라우저에 기억)
const PARTS_KEY = 'workbookParts'
function loadParts() {
  try {
    const v = JSON.parse(localStorage.getItem(PARTS_KEY))
    if (Array.isArray(v)) return v.filter((id) => PARTS.some((p) => p.id === id))
  } catch {}
  return [...BASE_PARTS]
}

// 지문 완전정복 워크북 — 고른 구성만 AI로 받고, 선생님이 고른 모양 그대로 미리보기 · 인쇄
export default function WorkbookPanel({ passage, title, level, modelId, modelLabel }) {
  const [parts, setParts] = useState(loadParts)
  const [busy, setBusy] = useState(false)
  const [step, setStep] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const frameRef = useRef()

  const toggle = (id) => {
    const next = parts.includes(id) ? parts.filter((p) => p !== id) : PARTS.map((p) => p.id).filter((p) => p === id || parts.includes(p))
    setParts(next)
    try { localStorage.setItem(PARTS_KEY, JSON.stringify(next)) } catch {}
  }

  const make = async () => {
    if (!passage.trim()) { setError('지문을 입력해주세요.'); return }
    if (!parts.length) { setError('워크북 구성을 하나 이상 골라 주세요.'); return }
    setBusy(true); setError(''); setResult(null)
    try {
      const r = await generateWorkbook({ passage, title, level, modelId, parts, onStep: setStep })
      setResult({ ...r, html: workbookHtml(r.data, { parts: r.parts }) })
    } catch (e) {
      setError(e.message)
    }
    setBusy(false); setStep('')
  }

  const print = async () => {
    const w = frameRef.current?.contentWindow
    if (!w) return
    await w.document.fonts?.ready
    w.focus()
    w.print()
  }

  const saveJson = () => {
    const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${title || '워크북'}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="workbook-panel no-print">
      <div className="workbook-head">
        <div>
          <h2>지문 완전정복 워크북</h2>
          <p>넣을 것을 골라서 한 번에 만들어요. 순서는 아래 차례 그대로, 정답은 맨 뒤에 모여요.</p>
        </div>
        <button className="analyze-btn workbook-btn" onClick={make} disabled={busy || !parts.length}>
          {busy ? `⏳ ${step || '만드는 중…'}` : `📘 워크북 만들기 (${modelLabel})`}
        </button>
      </div>
      <div className="workbook-parts">
        {PARTS.map((p, i) => (
          <label key={p.id} className={`workbook-part ${parts.includes(p.id) ? 'on' : ''}`}>
            <input type="checkbox" checked={parts.includes(p.id)} onChange={() => toggle(p.id)} disabled={busy} />
            <span className="wp-name"><b>{i + 1}</b>{p.name}</span>
            <span className="wp-desc">{p.desc}</span>
          </label>
        ))}
      </div>
      {error && <pre className="workbook-error">{error}</pre>}
      {result && (
        <>
          <div className="worksheet-toolbar">
            <button className="print-btn" onClick={print}>인쇄 / PDF 저장</button>
            <button className="print-btn outline" onClick={saveJson}>내용 JSON 저장</button>
            <span className="workbook-cost">
              이번 워크북 약 {result.cost.toLocaleString()}원 · 입력 {result.usage.input.toLocaleString()} / 출력 {result.usage.output.toLocaleString()} 토큰{result.attempts > 1 ? ' · 한 번 고쳐 받음' : ''}
            </span>
          </div>
          <p className="workbook-tip">인쇄 창에서 '배경 그래픽'을 켜야 색 꼬리표·밑줄 색이 나와요.</p>
          <iframe ref={frameRef} className="workbook-frame" title="워크북 미리보기" srcDoc={result.html} />
        </>
      )}
    </div>
  )
}
