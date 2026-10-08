import { useRef, useState } from 'react'
import { workbookHtml } from '../workbook/workbook.js'
import { generateWorkbook } from '../workbook/generate.js'

// 지문 완전정복 워크북 — AI 한 번으로 내용을 받고, 선생님이 고른 4쪽 모양 그대로 미리보기 · 인쇄
export default function WorkbookPanel({ passage, title, level, modelId, modelLabel }) {
  const [busy, setBusy] = useState(false)
  const [step, setStep] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const frameRef = useRef()

  const make = async () => {
    if (!passage.trim()) { setError('지문을 입력해주세요.'); return }
    setBusy(true); setError(''); setResult(null)
    try {
      const r = await generateWorkbook({ passage, title, level, modelId, onStep: setStep })
      setResult({ ...r, html: workbookHtml(r.data) })
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
          <p>문장 뜯어보기 · 흐름 지도 · Lv1~5 문제 · 쉬운 말로 다시 읽기 · 정답 (A4 4쪽). AI를 한 번만 불러요.</p>
        </div>
        <button className="analyze-btn workbook-btn" onClick={make} disabled={busy}>
          {busy ? `⏳ ${step || '만드는 중…'}` : `📘 워크북 만들기 (${modelLabel})`}
        </button>
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
