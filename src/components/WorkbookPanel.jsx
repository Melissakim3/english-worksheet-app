import { useRef, useState } from 'react'
import { workbookHtml, workbooksHtml, PARTS, BASE_PARTS } from '../workbook/workbook.js'
import { generateWorkbook } from '../workbook/generate.js'
import { makeZip, safeName } from '../utils/zip.js'
import { getPassword, askPassword } from '../utils/ai.js'

// 고른 구성은 다음에도 그대로 (브라우저에 기억)
const PARTS_KEY = 'workbookParts'
function loadParts() {
  try {
    const v = JSON.parse(localStorage.getItem(PARTS_KEY))
    if (Array.isArray(v)) return v.filter((id) => PARTS.some((p) => p.id === id))
  } catch {}
  return [...BASE_PARTS]
}

// 파일 이름 앞 글자 (선생님: '[Basic]') — 바꾸면 기억
const PREFIX_KEY = 'workbookFilePrefix'
const loadPrefix = () => { try { return localStorage.getItem(PREFIX_KEY) ?? '[Basic]' } catch { return '[Basic]' } }

// 서버(api/pdf.js)가 크롬으로 A4 PDF를 만들어 줌 — 워크북 내용(json)만 보냄
async function fetchPdf(body) {
  const send = (pw) => fetch('/api/pdf', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-app-password': encodeURIComponent(pw) }, body: JSON.stringify(body) })
  const used = getPassword()
  let r = await send(used)
  if (r.status === 401 && (getPassword() !== used || askPassword())) r = await send(getPassword())
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `PDF 서버 오류 (${r.status})`)
  return new Uint8Array(await r.arrayBuffer())
}
function download(blob, name) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 60000)
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
  const [prefix, setPrefix] = useState(loadPrefix)
  const [pdfStep, setPdfStep] = useState('')
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

  // PDF 파일로 받기: 하나면 PDF 하나, 여럿이면 zip(전체본 1개 + 번호별) — 실패한 파일은 빼고 알려 줌
  const fileName = (t, tail = '워크북') => `${safeName(`${prefix.trim() ? `${prefix.trim()} ` : ''}${t}`)}_${tail}.pdf`
  const savePdfs = async () => {
    setPdfStep('PDF 만드는 중…'); setError('')
    try {
      if (result.list.length === 1) {
        const d = result.list[0]
        download(new Blob([await fetchPdf({ data: d, parts })], { type: 'application/pdf' }), fileName(d.title))
      } else {
        const files = []
        const failed = []
        const n = result.list.length
        setPdfStep(`PDF 만드는 중… 전체본 (1/${n + 1})`)
        try { files.push({ name: fileName(title || '지문', '전체_워크북'), data: await fetchPdf({ list: result.list, parts, title }) }) }
        catch (e) { failed.push(`전체본: ${e.message}`) }
        for (let i = 0; i < n; i++) {
          const d = result.list[i]
          setPdfStep(`PDF 만드는 중… ${d.title} (${i + 2}/${n + 1})`)
          try { files.push({ name: fileName(d.title), data: await fetchPdf({ data: d, parts }) }) }
          catch (e) { failed.push(`${d.title}: ${e.message}`) }
        }
        if (files.length) download(makeZip(files), `${safeName(`${prefix.trim() ? `${prefix.trim()} ` : ''}${title || '워크북'}`)}_워크북.zip`)
        if (failed.length) setError(`PDF로 못 만든 파일 ${failed.length}개 (나머지는 zip에 들어 있어요):\n${failed.join('\n')}`)
      }
    } catch (e) {
      setError(`PDF를 만들지 못했어요: ${e.message}\n(인쇄 버튼 → 'PDF로 저장'은 그대로 쓸 수 있어요)`)
    }
    setPdfStep('')
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
            <button className="print-btn" onClick={savePdfs} disabled={!!pdfStep}>{pdfStep ? `⏳ ${pdfStep}` : result.list.length > 1 ? `📦 PDF ${result.list.length + 1}개 zip으로 받기` : '📄 PDF 파일로 받기'}</button>
            <label className="workbook-prefix">파일 이름 앞<input value={prefix} onChange={(e) => { setPrefix(e.target.value); try { localStorage.setItem(PREFIX_KEY, e.target.value) } catch {} }} placeholder="(없음)" /></label>
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
