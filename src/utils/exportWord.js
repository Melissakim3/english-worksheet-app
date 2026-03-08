// Word 다운로드 — docx 라이브러리 없이 순수 HTML → .doc 방식
// (Word에서 열 수 있는 HTML 파일로 저장)

export async function exportToWord(results, passage, title = "") {
  const rows1 = buildStage1(results[1])
  const rows4 = buildStage4(results[4])
  const kw5   = buildStage5(results[5])
  const rows6 = buildStage6(results[6])
  const q7    = buildStage7(results[7])
  const q8    = buildStage8(results[8])
  const ans   = buildAnswerKey(results)

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
<h1 style="font-size:14pt;">영어 지문 분석 워크시트</h1>
<p style="color:#888;font-style:italic;font-size:9pt;">${(passage||'').slice(0,80)}...</p>

${rows1}
${rows4}
${kw5}
${rows6}
${q7}
${q8}
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
  const rows = data.sentences.map((s,i) => `
    <tr>
      <td style="color:#bbb;font-size:8pt;width:4%">${i+1}</td>
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
    </tr>`).join('')
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

function buildStage6(data) {
  if (!data?.topicSentences) return ''
  const rows = data.topicSentences.map(s=>
    `<tr><td style="font-size:8pt">${esc(s.keyword||'')}</td><td style="font-size:8pt">${esc(s.type||'')}</td>
     <td class="en">${esc(s.en||'')}</td><td class="ko">${esc(s.ko||'')}</td></tr>`
  ).join('')
  return `<h2>Stage 6 · 주제 한 문장</h2>
  <table><tr><th>키워드</th><th>유형</th><th>영어 표현</th><th>한글 해석</th></tr>${rows}</table>`
}

function buildStage7(data) {
  if (!data) return ''
  const q = (num, d) => !d ? '' : `
    <div class="q">
      <p><span class="q-num">${num}.</span> <span style="font-size:9pt">${esc(d.direction||'')}</span></p>
      ${d.passage?`<div class="passage">${esc(d.passage)}</div>`:''}
      ${d.sentences?Object.entries(d.sentences).map(([k,v])=>`<p style="font-size:9pt"><b>(${k})</b> ${esc(v)}</p>`).join(''):''}
      ${d.options?d.options.map(o=>`<p style="font-size:9pt;margin-left:12pt">${esc(o)}</p>`).join(''):''}
      ${d.intro?`<p class="en" style="font-size:9pt">${esc(d.intro)}</p>`:''}
    </div>`
  return `<h2>Stage 7 · 실전 문제</h2>
  ${q(1,data.q1)}${q(2,data.q2)}${q(3,data.q3)}${q(4,data.q4)}${q(5,data.q5)}`
}

function buildStage8(data) {
  if (!data?.items) return ''
  const items = data.items.map(it=>
    `<span style="font-size:9pt;margin-right:10pt"><b>${it.num})</b> [${esc(it.label)}] ${esc(it.choices||it.words||'')}</span>`
  ).join('')
  return `<h2>Stage 8 · 어법 총정리</h2>
  ${data.passage?`<div class="passage">${data.passage}</div>`:''}
  <p>${items}</p>
  <table style="margin-top:6pt"><tr>${data.items.map(it=>`<td style="width:${90/data.items.length}%;font-size:8pt">${it.num})</td>`).join('')}</tr>
  <tr>${data.items.map(()=>`<td style="height:20pt;border-bottom:1px solid #999"></td>`).join('')}</tr></table>`
}

function buildAnswerKey(results) {
  let html = '<h2 style="margin-top:20pt">정답 및 해설 (교사용)</h2>'
  if (results[7]) {
    html += '<h3 style="font-size:10pt">Stage 7 정답</h3>'
    ;[results[7].q1,results[7].q2,results[7].q3,results[7].q4,results[7].q5].forEach((q,i)=>{
      if(q) html+=`<p style="font-size:9pt"><b>${i+1}.</b> <span class="answer">${esc(q.answer||'')}</span> — ${esc(q.explanation||q.note||'')}</p>`
    })
  }
  if (results[8]?.items) {
    html += '<h3 style="font-size:10pt">Stage 8 정답</h3>'
    html += `<p style="font-size:9pt">${results[8].items.map(it=>`<b>${it.num})</b> <span class="answer">${esc(it.answer)}</span>`).join('  ')}</p>`
  }
  return html
}
