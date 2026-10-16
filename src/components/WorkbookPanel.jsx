import { useRef, useState } from 'react'
import { workbookHtml, workbooksHtml, PARTS, BASE_PARTS } from '../workbook/workbook.js'
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
//   passages: [{ passage, title }] — 하나면 단일 지문, 여럿이면 지문마다 차례로 만들어 한 문서(PDF 하나)로
//   (여러 지문: 지문마다 새 쪽, 정답은 맨 뒤에 모음 · 한 지문이 실패해도 나머지는 계속 만들고 실패한 지문을 알려 줌)
export default function WorkbookPanel({ passages, title, level, modelId, modelLabel }) {
  const [parts, setParts] = useState(loadParts)
  const [busy, setBusy] = useState(false)
  const [step, setStep] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const frameRef = useRef()
  const list = passages.filter((p) => p.passage?.trim())
  const many = list.length > 1

  const toggle = (id) => {
    const next = parts.includes(id) ? parts.filter((p) => p !== id) : PARTS.map((p) => p.id).filter((p) => p === id || parts.includes(p))
    setParts(next)
    try { localStorage.setItem(PARTS_KEY, JSON.stringify(next)) } catch {}
  }

  const make = async () => {
    if (!list.length) { setError('지문을 입력해주세요.'); return }
    if (!parts.length) { setError('워크북 구성을 하나 이상 골라 주세요.'); return }
    setBusy(true); setError(''); setResult(null)
    const done = []
    const failed = []
    const usage = { input: 0, output: 0 }
    let cost = 0
    let retried = 0
    for (let i = 0; i < list.length; i++) {
      const { passage, title: t } = list[i]
      const head = many ? `${i + 1}/${list.length} ${t} · ` : ''
      try {
        const r = await generateWorkbook({ passage, title: t, level, modelId, parts, onStep: (s) => setStep(`${head}${s || '만드는 중…'}`) })
        done.push(r.data)
        usage.input += r.usage.input
        usage.output += r.usage.output
        cost += r.cost
        if (r.attempts > 1) retried++
      } catch (e) {
        failed.push(`${t}: ${e.message}`)
        if (e.usage) { usage.input += e.usage.input; usage.output += e.usage.output; cost += e.cost || 0 }
      }
    }
    if (done.length) {
      const html = many ? workbooksHtml(done, { parts, title }) : workbookHtml(done[0], { parts })
      setResult({ list: done, html, usage, cost, retried })
    }
    if (failed.length) setError(`${many ? `${failed.length}개 지문은 못 만들었어요 (나머지 ${done.length}개는 아래에):\n` : ''}${failed.join('\n')}`)
    setBusy(false); setStep('')
  }

  const print = async () => {
    const w = frameRef.current?.contentWindow
    if (!w) return
    await w.document.fonts?.ready
    w.focus()
    w.print()
  }

  // 여러 지문일 때 번호별로 따로: 그 지문 워크북만 숨은 창에 넣어 인쇄 (PDF 저장 이름 = 지문 이름)
  const printOne = (d) => {
    const f = document.createElement('iframe')
    f.style.cssText = 'position:fixed;width:0;height:0;border:0;right:0;bottom:0'
    f.srcdoc = workbookHtml(d, { parts })
    f.onload = async () => {
      const w = f.contentWindow
      await w.document.fonts?.ready
      // '다음 쪽에 이어집니다' 표시를 다 넣을 때까지 (최대 3초)
      for (let i = 0; i < 30 && w.document.documentElement.dataset.ready !== '1'; i++) await new Promise((r) => setTimeout(r, 100))
      w.focus()
      w.print()
      setTimeout(() => f.remove(), 60000)
    }
    document.body.appendChild(f)
  }

  const saveJson = () => {
    const data = result.list.length > 1 ? result.list : result.list[0]
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
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
          <h2>지문 완전정복 워크북{many ? ` · 지문 ${list.length}개` : ''}</h2>
          <p>{many
            ? '지문마다 차례로 만들어 PDF 하나로 모아요. 지문마다 새 쪽에서 시작하고, 정답은 맨 뒤에 지문 차례대로 모여요.'
            : '넣을 것을 골라서 한 번에 만들어요. 순서는 아래 차례 그대로, 정답은 맨 뒤에 모여요.'}</p>
        </div>
        <button className="analyze-btn workbook-btn" onClick={make} disabled={busy || !parts.length || !list.length}>
          {busy ? `⏳ ${step || '만드는 중…'}` : `📘 ${many ? `워크북 ${list.length}개 만들기` : '워크북 만들기'} (${modelLabel})`}
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
            <button className="print-btn" onClick={print}>{result.list.length > 1 ? `전체 ${result.list.length}개 이어서 인쇄 / PDF` : '인쇄 / PDF 저장'}</button>
            <button className="print-btn outline" onClick={saveJson}>내용 JSON 저장</button>
            <span className="workbook-cost">
              {result.list.length > 1 ? `워크북 ${result.list.length}개 · ` : '이번 워크북 '}약 {result.cost.toLocaleString()}원 · 입력 {result.usage.input.toLocaleString()} / 출력 {result.usage.output.toLocaleString()} 토큰{result.retried ? ` · ${result.list.length > 1 ? `${result.retried}개 ` : ''}한 번 고쳐 받음` : ''}
            </span>
          </div>
          {result.list.length > 1 && (
            <div className="workbook-each">
              <span>번호별로 따로:</span>
              {result.list.map((d, i) => <button key={i} className="print-btn outline" onClick={() => printOne(d)}>{d.title}</button>)}
            </div>
          )}
          <p className="workbook-tip">인쇄 창에서 '배경 그래픽'을 켜야 색 꼬리표·밑줄 색이 나와요.</p>
          <iframe ref={frameRef} className="workbook-frame" title="워크북 미리보기" srcDoc={result.html} />
        </>
      )}
    </div>
  )
}
