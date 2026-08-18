// Word 다운로드 — docx 라이브러리 없이 순수 HTML → .doc 방식
// (Word에서 열 수 있는 HTML 파일로 저장)

export async function exportToWord(results, passage, title = "") {
  const rows1 = buildStage1(results[1])
  const rows4 = buildStage4(results[4])
  const kw5   = buildStage5(results[5])
  const q6    = buildStage6(results[6])
  const q7    = buildStage7(results[7])
  const q8    = buildStage8(results[8])
  const q9    = buildStage9(results[9])
  const ans   = buildAnswerKey(results)

  const docTitle = title || '영어 지문 분석 워크시트'

  const html = `
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<style>
  body { font-family: Arial, sans-serif; font-size: 10pt; margin: 2cm; }
  h2 { background: #1a1a1a; color: white; padding: 4px 8px; font-size: 11pt; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 12pt; }
  td, th { border: 1px solid #ccc; padding: 4px 6px; font-size: 9pt; vertical-align: top; }
  th { background: #f5f2ed; font-weight: bold; }
  .en { font-family: Georgia, serif; font-size: 10pt; }
  .ko { font-size: 9pt; color: #444; }
  .syn { font-size: 8pt; color: #1a6e3a; }
  .ant { font-size: 8pt; color: #b03030; }
  .q { margin-bottom: 10pt; }
  .q-num { font-weight: bold; }
  .passage { font-family: Georgia, serif; font-size: 10pt; line-height: 1.8;
             border: 1px solid #ddd; padding: 8px; background: #fafafa; margin: 6pt 0; }
  .answer { color: #c00000; font-weight: bold; }
  .page-break { page-break-before: always; }
</style>
</head>
<body>
<h1 style="font-size:14pt;">${esc(docTitle)}</h1>
<p style="color:#888;font-style:italic;font-size:9pt;">${esc((passage||'').slice(0,80))}...</p>

${rows1}
${rows4}
${kw5}
${q6}
${q7}
${q8}
${q9}
<div class="page-break"></div>
${ans}
</body></html>`

  const blob = new Blob(['\ufeff' + html], { type: 'application/msword;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title || 'worksheet'}_${new Date().toLocaleDateString('ko-KR').replace(/\. /g,'-').replace('.','')}.doc`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function esc(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

function buildStage1(data) {
  if (!data?.sentences) return ''
  let num = 0
  const rows = data.sentences.map((s) => {
    if (s.heading) {
      return `<tr><td colspan="4" style="font-weight:bold;font-size:10.5pt;border-top:2px solid #1a1a1a">${esc(s.heading)}</td></tr>`
    }
    num += 1
    return `
    <tr>
      <td style="color:#bbb;font-size:8pt;width:4%">${num}</td>
      <td class="en" style="width:42%;line-height:2">${esc(s.en)}</td>
      <td class="ko" style="width:26%">
        ${esc(s.ko)}
        ${s.synonyms?.length ? `<div style="border-top:1px dotted #ddd;margin-top:4pt;padding-top:3pt">
          ${s.synonyms.map(sw=>`<span style="font-size:8pt"><b>${esc(sw.word)}</b>
            ${sw.syn?`<span class="syn"> S:${esc(sw.syn)}</span>`:''}
            ${sw.ant?`<span class="ant"> A:${esc(sw.ant)}</span>`:''}
          </span>`).join(' ')}
        </div>` : ''}
      </td>
      <td style="font-size:8.5pt;width:28%">${esc(s.logic||'')} ${esc(s.grammar||'')}</td>
    </tr>`
  }).join('')
  return `<h2>Stage 1 · 문장 뜯어보기</h2>
  <table><tr><th>#</th><th>영어 원문</th><th>한글 해석 / 동·반의어</th><th>논리 / 어법</th></tr>${rows}</table>`
}

function buildStage4(data) {
  if (!data?.words) return ''
  const rows = data.words.map(w=>`
    <tr>
      <td style="color:#bbb;font-size:8pt">${w.num||''}</td>
      <td class="en"><b>${esc(w.word)}</b></td>
      <td style="font-size:8pt;color:#999;font-style:italic">${esc(w.pos||'')}</td>
      <td class="ko">${esc(w.meaning||'')}</td>
      <td class="syn">${esc(w.synonyms||'—')}</td>
      <td class="ant">${esc(w.antonyms||'—')}</td>
    </tr>`).join('')
  return `<h2>Stage 4 · 내 단어장</h2>
  <table><tr><th>#</th><th>단어</th><th>품사</th><th>뜻</th><th>동의어</th><th>반의어</th></tr>${rows}</table>`
}

function buildStage5(data) {
  if (!data?.keywords) return ''
  const items = data.keywords.map(kw=>
    `<tr><td class="en"><b>${esc(kw.word)}</b></td><td class="ko" style="color:#888">${esc(kw.ko)}</td><td class="ko">${esc(kw.role)}</td></tr>`
  ).join('')
  return `<h2>Stage 5 · 핵심 3단어</h2>
  <table><tr><th>키워드</th><th>한글</th><th>역할</th></tr>${items}</table>
  ${data.flowSummary?`<p style="font-size:9pt;color:#444;border:1px dotted #ddd;padding:6px"><b>논리 흐름:</b> ${esc(data.flowSummary)}</p>`:''}`
}

// ── Stage 6 : 주제 찾기 (객관식 1문항, 한글+영어 패러프레이징) ──
function buildStage6(data) {
  if (!data || data.error) return ''
  const opts = (data.options||[]).map(o =>
    `<p style="font-size:9pt;margin-left:12pt"><b>${esc(o.num)}</b> ${esc(o.ko)}
      <br><span class="en" style="font-size:9pt;color:#666">${esc(o.en)}</span></p>`
  ).join('')
  return `<h2>Stage 6 · 주제 찾기</h2>
  <p style="font-size:9pt"><b>${esc(data.direction||'')}</b></p>
  ${data.evidence?`<div class="passage">${esc(data.evidence)}</div>`:''}
  ${opts}`
}

// ── Stage 7 : 요약문 빈칸 ──
function buildStage7(data) {
  if (!data || data.error) return ''
  const blanked = (data.blankedSummary||'')
    .replace(/___BLANK_A___/g, '____(A)____')
    .replace(/___BLANK_B___/g, '____(B)____')
    .replace(/___BLANK_C___/g, '____(C)____')
  const opts = (data.options||[]).map(o => `<p style="font-size:9pt;margin-left:12pt">${esc(o)}</p>`).join('')
  return `<h2>Stage 7 · 요약문 빈칸</h2>
  <p style="font-size:9pt"><b>${esc(data.direction||'')}</b></p>
  <div class="passage">${esc(blanked)}</div>
  ${opts}`
}

// ── Stage 8 : 어법·어휘 10선 (지문 전체 + 인라인 선택형) ──
function buildStage8(data) {
  if (!data || data.error) return ''
  return `<h2>Stage 8 · 어법·어휘 10선</h2>
  ${data.passage?`<div class="passage">${data.passage}</div>`:''}`
}

// ── Stage 9 : 어구 배열 (2문항) ──
function buildStage9(data) {
  if (!data || data.error) return ''
  const q = (num, d) => !d ? '' : `
    <div class="q">
      <p><span class="q-num">논술형 ${num}.</span> <span style="font-size:9pt">${esc(d.direction||'')}</span>
        <span style="font-size:9pt;color:#888"> [${d.points||5}점]</span></p>
      <p style="font-size:9pt;border:1px solid #bbb;padding:6px;margin-left:12pt"><b>&lt;보기&gt;</b><br>
        <span class="en">${esc(d.wordBank||'')}</span></p>
    </div>`
  return `<h2>Stage 9 · 어구 배열</h2>
  ${q(1,data.q1)}${q(2,data.q2)}`
}

// ── 정답 (Stage6~9 통합) ──
function buildAnswerKey(results) {
  let html = '<h2 style="margin-top:20pt">정답</h2>'

  const q6 = results[6]
  if (q6 && !q6.error) {
    html += `<p style="font-size:9pt"><b>[Stage6 주제]</b> 정답 <span class="answer">${esc(q6.answer||'')}</span></p>`
  }

  const q7 = results[7]
  if (q7 && !q7.error) {
    const blanks = (q7.blanks||[]).map(b => `(${esc(b.key)}) ${esc(b.answer)}${b.ko?` (${esc(b.ko)})`:''}`).join('  ')
    html += `<p style="font-size:9pt"><b>[Stage7 요약문빈칸]</b> 정답 <span class="answer">${esc(q7.answer||'')}</span>  ${blanks}</p>`
  }

  const q8 = results[8]
  if (q8?.items) {
    const items = q8.items.map(it => {
      const word = it.answer || it.correctWord || ''
      return `<b>${it.num}.</b> <span class="answer">${esc(word)}</span>${it.ko?` (${esc(it.ko)})`:''}`
    }).join('  ')
    html += `<p style="font-size:9pt"><b>[Stage8 어법·어휘]</b> ${items}</p>`
  }

  const q9 = results[9]
  if (q9 && !q9.error) {
    const parts = []
    if (q9.q1) parts.push(`<b>1.</b> <span class="answer">${esc(q9.q1.answer||'')}</span>`)
    if (q9.q2) parts.push(`<b>2.</b> <span class="answer">${esc(q9.q2.answer||'')}</span>`)
    html += `<p style="font-size:9pt"><b>[Stage9 어구배열]</b> ${parts.join('  ')}</p>`
  }

  return html
}
