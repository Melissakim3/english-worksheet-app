// 브라우저에서 직접 .docx 생성 (docx 라이브러리 CDN 버전)
// CDN: https://unpkg.com/docx@8.5.0/build/index.js

const COLORS = {
  h1: 'FFE066',
  h2: '85E89D',
  h3: 'FFB3C6',
  h4: '79C8F5',
  h5: 'D4AAFF',
}

// HTML에서 텍스트만 추출
function stripHtml(html) {
  return html?.replace(/<[^>]*>/g, '') || ''
}

// coloredPassage HTML → docx TextRun 배열
function parseColoredPassage(html, docx) {
  if (!html) return [new docx.TextRun('')]
  const runs = []
  const regex = /<span class=['"]h(\d)['"]>(.*?)<\/span>|([^<]+)/g
  let match
  while ((match = regex.exec(html)) !== null) {
    if (match[1]) {
      // 색상 span
      const color = COLORS[`h${match[1]}`] || 'FFFFFF'
      runs.push(new docx.TextRun({
        text: match[2],
        highlight: colorToHighlight(color),
        font: 'Georgia',
        size: 22,
      }))
    } else if (match[3]?.trim()) {
      runs.push(new docx.TextRun({
        text: match[3],
        font: 'Georgia',
        size: 22,
      }))
    }
  }
  return runs.length ? runs : [new docx.TextRun('')]
}

// hex 색상 → docx highlight 이름 근사값
function colorToHighlight(hex) {
  const map = {
    'FFE066': 'yellow',
    '85E89D': 'green',
    'FFB3C6': 'pink',
    '79C8F5': 'cyan',
    'D4AAFF': 'magenta',
  }
  return map[hex] || 'yellow'
}

// 공통 셀 border
function makeBorder() {
  return {
    top: { style: 'single', size: 1, color: 'CCCCCC' },
    bottom: { style: 'single', size: 1, color: 'CCCCCC' },
    left: { style: 'single', size: 1, color: 'CCCCCC' },
    right: { style: 'single', size: 1, color: 'CCCCCC' },
  }
}

function cellMargins() {
  return { top: 80, bottom: 80, left: 120, right: 120 }
}

function headerPara(text, docx) {
  return new docx.Paragraph({
    children: [new docx.TextRun({ text, bold: true, size: 26, font: 'Arial', color: 'FFFFFF' })],
    shading: { fill: '1a1a1a', type: docx.ShadingType.CLEAR },
    spacing: { before: 240, after: 120 },
  })
}

function sectionTitle(text, docx) {
  return new docx.Paragraph({
    children: [new docx.TextRun({ text, bold: true, size: 22, font: 'Arial' })],
    spacing: { before: 200, after: 80 },
    border: { bottom: { style: 'single', size: 4, color: '1a1a1a' } },
  })
}

// ── Stage 1 ───────────────────────────────────────────
function buildStage1(data, docx) {
  if (!data?.sentences) return []
  const TW = 9026
  const cols = [300, 2200, 3500, 1500, 1526]
  const rows = [
    new docx.TableRow({
      tableHeader: true,
      children: ['#', '영어 원문', '한글 해석', '논리/구조', '문법'].map((t, i) =>
        new docx.TableCell({
          borders: makeBorder(), margins: cellMargins(),
          width: { size: cols[i], type: docx.WidthType.DXA },
          shading: { fill: 'F5F2ED', type: docx.ShadingType.CLEAR },
          children: [new docx.Paragraph({ children: [new docx.TextRun({ text: t, bold: true, size: 18, font: 'Arial' })] })]
        })
      )
    }),
    ...data.sentences.map((s, i) => new docx.TableRow({
      children: [
        // 번호
        new docx.TableCell({
          borders: makeBorder(), margins: cellMargins(),
          width: { size: cols[0], type: docx.WidthType.DXA },
          children: [new docx.Paragraph({ children: [new docx.TextRun({ text: String(i+1), size: 18, color: 'BBBBBB', font: 'Courier New' })] })]
        }),
        // 영어
        new docx.TableCell({
          borders: makeBorder(), margins: cellMargins(),
          width: { size: cols[1], type: docx.WidthType.DXA },
          children: [
            new docx.Paragraph({ children: [new docx.TextRun({ text: s.en || '', font: 'Georgia', size: 22, spacing: { line: 480 } })] }),
            ...(s.synonyms?.length ? [new docx.Paragraph({
              children: s.synonyms.flatMap(sw => [
                new docx.TextRun({ text: sw.word + ' ', bold: true, size: 18, font: 'Georgia', color: '1a1a1a' }),
                sw.syn ? new docx.TextRun({ text: `S:${sw.syn} `, size: 17, color: '1a6e3a', font: 'Arial' }) : null,
                sw.ant ? new docx.TextRun({ text: `A:${sw.ant} `, size: 17, color: 'b03030', font: 'Arial' }) : null,
              ].filter(Boolean))
            })] : [])
          ]
        }),
        // 한글
        new docx.TableCell({
          borders: makeBorder(), margins: cellMargins(),
          width: { size: cols[2], type: docx.WidthType.DXA },
          children: [new docx.Paragraph({ children: [new docx.TextRun({ text: s.ko || '', size: 20, font: 'Arial', color: '444444' })] })]
        }),
        // 논리
        new docx.TableCell({
          borders: makeBorder(), margins: cellMargins(),
          width: { size: cols[3], type: docx.WidthType.DXA },
          children: [new docx.Paragraph({ children: [new docx.TextRun({ text: s.logic || '', size: 18, font: 'Arial' })] })]
        }),
        // 문법
        new docx.TableCell({
          borders: makeBorder(), margins: cellMargins(),
          width: { size: cols[4], type: docx.WidthType.DXA },
          children: [new docx.Paragraph({ children: [new docx.TextRun({ text: s.grammar || '', size: 18, font: 'Arial' })] })]
        }),
      ]
    }))
  ]
  return [
    headerPara('Stage 1 · 문장 뜯어보기', docx),
    new docx.Table({ width: { size: TW, type: docx.WidthType.DXA }, columnWidths: cols, rows }),
    new docx.Paragraph({ children: [new docx.TextRun('')], spacing: { after: 240 } }),
  ]
}

// ── Stage 2 ───────────────────────────────────────────
function buildStage2(data, docx) {
  if (!data) return []
  const children = [headerPara('Stage 2 · 흐름 지도', docx)]
  if (data.legend?.length) {
    children.push(new docx.Paragraph({
      children: data.legend.map(l =>
        new docx.TextRun({ text: `■ ${l.label}  `, highlight: colorToHighlight(l.colorName?.replace('#','')), size: 20, font: 'Arial' })
      )
    }))
  }
  if (data.coloredPassage) {
    children.push(new docx.Paragraph({
      children: parseColoredPassage(data.coloredPassage, docx),
      spacing: { line: 480, after: 120 },
    }))
  }
  if (data.flowSteps?.length) {
    children.push(new docx.Paragraph({
      children: data.flowSteps.flatMap((step, i) => [
        i > 0 ? new docx.TextRun({ text: ' → ', bold: true, size: 20 }) : null,
        new docx.TextRun({ text: step.label, bold: true, size: 22, font: 'Georgia' }),
        new docx.TextRun({ text: ` (${step.ko})`, size: 20, font: 'Arial', color: '888888' }),
      ].filter(Boolean)),
      spacing: { before: 120, after: 80 },
    }))
  }
  children.push(new docx.Paragraph({ children: [new docx.TextRun('')], spacing: { after: 240 } }))
  return children
}

// ── Stage 4 ───────────────────────────────────────────
function buildStage4(data, docx) {
  if (!data?.words) return []
  const TW = 9026
  const cols = [400, 1500, 700, 1600, 2413, 2413]
  const rows = [
    new docx.TableRow({
      tableHeader: true,
      children: ['#', '단어', '품사', '한글 뜻', '동의어', '반의어'].map((t, i) =>
        new docx.TableCell({
          borders: makeBorder(), margins: cellMargins(),
          width: { size: cols[i], type: docx.WidthType.DXA },
          shading: { fill: 'F5F2ED', type: docx.ShadingType.CLEAR },
          children: [new docx.Paragraph({ children: [new docx.TextRun({ text: t, bold: true, size: 18, font: 'Arial' })] })]
        })
      )
    }),
    ...data.words.map(w => new docx.TableRow({
      children: [
        new docx.TableCell({ borders: makeBorder(), margins: cellMargins(), width: { size: cols[0], type: docx.WidthType.DXA },
          children: [new docx.Paragraph({ children: [new docx.TextRun({ text: String(w.num||''), size: 18, color: 'BBBBBB' })] })] }),
        new docx.TableCell({ borders: makeBorder(), margins: cellMargins(), width: { size: cols[1], type: docx.WidthType.DXA },
          children: [new docx.Paragraph({ children: [new docx.TextRun({ text: w.word||'', bold: true, size: 22, font: 'Georgia' })] })] }),
        new docx.TableCell({ borders: makeBorder(), margins: cellMargins(), width: { size: cols[2], type: docx.WidthType.DXA },
          children: [new docx.Paragraph({ children: [new docx.TextRun({ text: w.pos||'', size: 17, italics: true, color: '999999' })] })] }),
        new docx.TableCell({ borders: makeBorder(), margins: cellMargins(), width: { size: cols[3], type: docx.WidthType.DXA },
          children: [new docx.Paragraph({ children: [new docx.TextRun({ text: w.meaning||'', size: 20, font: 'Arial' })] })] }),
        new docx.TableCell({ borders: makeBorder(), margins: cellMargins(), width: { size: cols[4], type: docx.WidthType.DXA },
          children: [new docx.Paragraph({ children: [new docx.TextRun({ text: w.synonyms||'—', size: 20, color: '1a6e3a', font: 'Arial' })] })] }),
        new docx.TableCell({ borders: makeBorder(), margins: cellMargins(), width: { size: cols[5], type: docx.WidthType.DXA },
          children: [new docx.Paragraph({ children: [new docx.TextRun({ text: w.antonyms||'—', size: 20, color: 'b03030', font: 'Arial' })] })] }),
      ]
    }))
  ]
  return [
    headerPara('Stage 4 · 내 단어장', docx),
    new docx.Table({ width: { size: TW, type: docx.WidthType.DXA }, columnWidths: cols, rows }),
    new docx.Paragraph({ children: [new docx.TextRun('')], spacing: { after: 240 } }),
  ]
}

// ── Stage 5 ───────────────────────────────────────────
function buildStage5(data, docx) {
  if (!data?.keywords) return []
  const children = [headerPara('Stage 5 · 이 글의 핵심 3단어', docx)]
  data.keywords.forEach(kw => {
    children.push(new docx.Paragraph({
      children: [
        new docx.TextRun({ text: kw.word, bold: true, size: 24, font: 'Georgia' }),
        new docx.TextRun({ text: `  ${kw.ko}`, size: 20, color: '888888', font: 'Arial' }),
        new docx.TextRun({ text: `  →  ${kw.role}`, size: 20, font: 'Arial', color: '444444' }),
      ],
      spacing: { before: 100, after: 100 },
    }))
  })
  if (data.flowSummary) {
    children.push(new docx.Paragraph({
      children: [new docx.TextRun({ text: '전체 논리 흐름: ', bold: true, size: 20, font: 'Arial' }),
                 new docx.TextRun({ text: data.flowSummary, size: 20, font: 'Arial', color: '444444' })],
      spacing: { before: 120, after: 80 },
      shading: { fill: 'F5F2ED', type: docx.ShadingType.CLEAR },
    }))
  }
  children.push(new docx.Paragraph({ children: [new docx.TextRun('')], spacing: { after: 240 } }))
  return children
}

// ── Stage 6 ───────────────────────────────────────────
function buildStage6(data, docx) {
  if (!data?.topicSentences) return []
  const TW = 9026
  const cols = [900, 900, 3913, 3313]
  const rows = [
    new docx.TableRow({
      tableHeader: true,
      children: ['키워드', '유형', '주제 표현', '한글 해석'].map((t, i) =>
        new docx.TableCell({
          borders: makeBorder(), margins: cellMargins(),
          width: { size: cols[i], type: docx.WidthType.DXA },
          shading: { fill: 'F5F2ED', type: docx.ShadingType.CLEAR },
          children: [new docx.Paragraph({ children: [new docx.TextRun({ text: t, bold: true, size: 18, font: 'Arial' })] })]
        })
      )
    }),
    ...data.topicSentences.map(s => new docx.TableRow({
      children: [
        new docx.TableCell({ borders: makeBorder(), margins: cellMargins(), width: { size: cols[0], type: docx.WidthType.DXA },
          children: [new docx.Paragraph({ children: [new docx.TextRun({ text: s.keyword||'', bold: true, size: 20, font: 'Georgia' })] })] }),
        new docx.TableCell({ borders: makeBorder(), margins: cellMargins(), width: { size: cols[1], type: docx.WidthType.DXA },
          children: [new docx.Paragraph({ children: [new docx.TextRun({ text: s.type||'', size: 18, font: 'Arial' })] })] }),
        new docx.TableCell({ borders: makeBorder(), margins: cellMargins(), width: { size: cols[2], type: docx.WidthType.DXA },
          children: [new docx.Paragraph({ children: [new docx.TextRun({ text: s.en||'', size: 22, font: 'Georgia' })] })] }),
        new docx.TableCell({ borders: makeBorder(), margins: cellMargins(), width: { size: cols[3], type: docx.WidthType.DXA },
          children: [new docx.Paragraph({ children: [new docx.TextRun({ text: s.ko||'', size: 20, font: 'Arial', color: '555555' })] })] }),
      ]
    }))
  ]
  return [
    headerPara('Stage 6 · 주제 한 문장', docx),
    new docx.Table({ width: { size: TW, type: docx.WidthType.DXA }, columnWidths: cols, rows }),
    new docx.Paragraph({ children: [new docx.TextRun('')], spacing: { after: 240 } }),
  ]
}

// ── Stage 7 ───────────────────────────────────────────
function buildStage7(data, docx) {
  if (!data) return []
  const children = [headerPara('Stage 7 · 실전 문제', docx)]
  const addQ = (num, q) => {
    if (!q) return
    children.push(new docx.Paragraph({
      children: [new docx.TextRun({ text: `${num}. ${q.type}`, bold: true, size: 22, font: 'Georgia' })],
      spacing: { before: 200, after: 60 },
    }))
    children.push(new docx.Paragraph({
      children: [new docx.TextRun({ text: q.direction||'', size: 20, font: 'Arial', color: '444444' })],
      spacing: { after: 80 },
    }))
    if (q.passage) {
      children.push(new docx.Paragraph({
        children: [new docx.TextRun({ text: stripHtml(q.passage), size: 22, font: 'Georgia' })],
        spacing: { line: 420, after: 80 },
        shading: { fill: 'FAFAFA', type: docx.ShadingType.CLEAR },
      }))
    }
    if (q.options) {
      q.options.forEach(opt => {
        children.push(new docx.Paragraph({
          children: [new docx.TextRun({ text: opt, size: 20, font: 'Arial' })],
          spacing: { before: 40, after: 40 },
          indent: { left: 360 },
        }))
      })
    }
  }
  addQ(1, data.q1); addQ(2, data.q2); addQ(3, data.q3); addQ(4, data.q4); addQ(5, data.q5)
  children.push(new docx.Paragraph({ children: [new docx.TextRun('')], spacing: { after: 240 } }))
  return children
}

// ── Stage 8 ───────────────────────────────────────────
function buildStage8(data, docx) {
  if (!data?.items) return []
  const children = [headerPara('Stage 8 · 어법 총정리', docx)]
  data.items.forEach(item => {
    children.push(new docx.Paragraph({
      children: [
        new docx.TextRun({ text: `${item.num}) [${item.label}]  `, bold: true, size: 20, font: 'Arial' }),
        new docx.TextRun({ text: item.choices || item.words || '', size: 22, font: 'Georgia' }),
      ],
      spacing: { before: 80, after: 80 },
    }))
  })
  children.push(new docx.Paragraph({ children: [new docx.TextRun('')], spacing: { after: 240 } }))
  return children
}

// ── 정답 ──────────────────────────────────────────────
function buildAnswerKey(results, docx) {
  const children = [
    new docx.Paragraph({ pageBreakBefore: true }),
    headerPara('정답 및 해설 (교사용)', docx),
  ]

  // Stage 1 동의어 정답
  if (results[1]?.sentences) {
    children.push(sectionTitle('Stage 1 · 동의어/반의어', docx))
    results[1].sentences.forEach((s, i) => {
      if (s.synonyms?.length) {
        s.synonyms.forEach(sw => {
          children.push(new docx.Paragraph({
            children: [
              new docx.TextRun({ text: `${i+1}. ${sw.word}  `, bold: true, size: 20, font: 'Georgia' }),
              new docx.TextRun({ text: `동의어: ${sw.syn||'—'}  `, size: 20, color: '1a6e3a', font: 'Arial' }),
              new docx.TextRun({ text: `반의어: ${sw.ant||'—'}`, size: 20, color: 'b03030', font: 'Arial' }),
            ],
            spacing: { before: 60, after: 60 },
          }))
        })
      }
    })
  }

  // Stage 7 정답
  if (results[7]) {
    children.push(sectionTitle('Stage 7 · 실전 문제 정답', docx))
    const q = results[7]
    ;[q.q1, q.q2, q.q3, q.q4, q.q5].forEach((qi, i) => {
      if (!qi) return
      children.push(new docx.Paragraph({
        children: [
          new docx.TextRun({ text: `${i+1}. `, bold: true, size: 20 }),
          new docx.TextRun({ text: qi.answer||'', bold: true, size: 20, color: 'c00000', font: 'Georgia' }),
          new docx.TextRun({ text: `  ${qi.explanation||''}`, size: 18, font: 'Arial', color: '444444' }),
        ],
        spacing: { before: 80, after: 80 },
      }))
    })
  }

  // Stage 8 정답
  if (results[8]?.items) {
    children.push(sectionTitle('Stage 8 · 어법 총정리 정답', docx))
    children.push(new docx.Paragraph({
      children: results[8].items.map(item =>
        new docx.TextRun({ text: `${item.num}) ${item.answer}  `, size: 20, font: 'Arial', bold: true, color: 'c00000' })
      ),
      spacing: { before: 80, after: 80 },
    }))
  }

  return children
}

// ── 메인 export 함수 ──────────────────────────────────
export async function exportToWord(results, passage) {
  // docx 라이브러리를 동적으로 로드
  const docx = await import('https://unpkg.com/docx@8.5.0/build/index.js')

  const allChildren = [
    // 표지
    new docx.Paragraph({
      children: [new docx.TextRun({ text: '영어 지문 분석 워크시트', bold: true, size: 36, font: 'Arial' })],
      spacing: { before: 0, after: 120 },
    }),
    new docx.Paragraph({
      children: [new docx.TextRun({ text: passage?.slice(0, 80) + '...', size: 18, color: '888888', font: 'Georgia', italics: true })],
      spacing: { after: 360 },
    }),

    // 각 Stage
    ...( results[1] ? buildStage1(results[1], docx) : [] ),
    ...( results[2] ? buildStage2(results[2], docx) : [] ),
    ...( results[4] ? buildStage4(results[4], docx) : [] ),
    ...( results[5] ? buildStage5(results[5], docx) : [] ),
    ...( results[6] ? buildStage6(results[6], docx) : [] ),
    ...( results[7] ? buildStage7(results[7], docx) : [] ),
    ...( results[8] ? buildStage8(results[8], docx) : [] ),

    // 정답
    ...buildAnswerKey(results, docx),
  ]

  const doc = new docx.Document({
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 }, // A4
          margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 }, // 2cm
        }
      },
      children: allChildren,
    }]
  })

  const buffer = await docx.Packer.toBlob(doc)
  const url = URL.createObjectURL(buffer)
  const a = document.createElement('a')
  a.href = url
  a.download = `worksheet_${new Date().toLocaleDateString('ko-KR').replace(/\. /g,'-').replace('.','')}.docx`
  a.click()
  URL.revokeObjectURL(url)
}
