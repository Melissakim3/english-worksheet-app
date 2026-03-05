// Word(.docx) 내보내기 — docx 라이브러리 CDN 버전 사용
// 브라우저에서 직접 생성하므로 서버 불필요

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign,
  HeadingLevel, PageBreak, PageOrientation
} from 'docx'
import { saveAs } from 'file-saver'

// ── 색상 맵 ──────────────────────────────────────────
const HIGHLIGHT_COLORS = ['FFFF00', '00FF00', 'FF69B4', '00BFFF', 'DA70D6']
const STAGE_BG = 'F2F2F2'

// ── 공통 스타일 ──────────────────────────────────────
const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }
const borders = { top: border, bottom: border, left: border, right: border }
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 }
const PAGE_W = 11906  // A4
const CONTENT_W = 9826 // A4 1cm margins

function stageHeading(num, title) {
  return new Paragraph({
    children: [
      new TextRun({ text: `Stage ${num}  `, font: 'Courier New', size: 18, bold: true, color: 'FFFFFF' }),
      new TextRun({ text: title, font: 'Noto Serif KR', size: 22, bold: true, color: 'FFFFFF' }),
    ],
    shading: { fill: '1A1A1A', type: ShadingType.CLEAR },
    spacing: { before: 300, after: 100 },
    indent: { left: 160, right: 160 },
  })
}

function dividerLine() {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.DOTTED, size: 1, color: 'CCCCCC' } },
    spacing: { before: 60, after: 60 },
    children: [],
  })
}

// ── Stage 1 — 문장 뜯어보기 ──────────────────────────
function buildStage1(data) {
  if (!data?.sentences) return []
  const rows = [
    new TableRow({
      tableHeader: true,
      children: [
        headerCell('#', 400),
        headerCell('영어 원문', 4400),
        headerCell('한글 해석', 2600),
        headerCell('논리 구조 / 문법', 2426),
      ]
    }),
    ...data.sentences.map((s, i) => new TableRow({
      children: [
        new TableCell({
          borders, width: { size: 400, type: WidthType.DXA }, margins: cellMargins, verticalAlign: VerticalAlign.TOP,
          children: [new Paragraph({ children: [new TextRun({ text: String(i+1), font: 'Courier New', size: 16, color: 'BBBBBB' })], alignment: AlignmentType.CENTER })]
        }),
        new TableCell({
          borders, width: { size: 4400, type: WidthType.DXA }, margins: cellMargins, verticalAlign: VerticalAlign.TOP,
          children: [
            new Paragraph({ children: [new TextRun({ text: s.en || '', font: 'Georgia', size: 22 })], spacing: { line: 520 } }),
            ...(s.synonyms?.length > 0 ? [
              new Paragraph({
                border: { top: { style: BorderStyle.DOTTED, size: 1, color: 'DDDDDD' } },
                spacing: { before: 60 },
                children: s.synonyms.flatMap(sw => [
                  new TextRun({ text: sw.word + ' ', font: 'Georgia', size: 18, bold: true }),
                  sw.syn ? new TextRun({ text: `S:${sw.syn} `, size: 17, color: '1A6E3A' }) : null,
                  sw.ant ? new TextRun({ text: `A:${sw.ant} `, size: 17, color: 'B03030' }) : null,
                ].filter(Boolean))
              })
            ] : [])
          ]
        }),
        new TableCell({
          borders, width: { size: 2600, type: WidthType.DXA }, margins: cellMargins, verticalAlign: VerticalAlign.TOP,
          children: [new Paragraph({ children: [new TextRun({ text: s.ko || '', font: 'Malgun Gothic', size: 20, color: '444444' })], spacing: { line: 360 } })]
        }),
        new TableCell({
          borders, width: { size: 2426, type: WidthType.DXA }, margins: cellMargins, verticalAlign: VerticalAlign.TOP,
          children: [
            s.logic ? new Paragraph({ children: [
              new TextRun({ text: s.logic.split(' ')[0] + ' ', font: 'Malgun Gothic', size: 17, bold: true, color: '856404', highlight: 'yellow' }),
              new TextRun({ text: s.logic, font: 'Malgun Gothic', size: 17 }),
            ]}) : new Paragraph({ children: [] }),
            s.grammar ? new Paragraph({ spacing: { before: 40 }, children: [
              new TextRun({ text: '어법 ', font: 'Malgun Gothic', size: 17, bold: true, color: '0C5460', highlight: 'cyan' }),
              new TextRun({ text: s.grammar, font: 'Malgun Gothic', size: 17 }),
            ]}) : new Paragraph({ children: [] }),
          ].filter(Boolean)
        }),
      ]
    }))
  ]

  return [
    stageHeading(1, '문장 뜯어보기'),
    new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [400, 4400, 2600, 2426], rows }),
  ]
}

// ── Stage 2 — 흐름 지도 ──────────────────────────────
function buildStage2(data) {
  if (!data) return []
  const items = []

  // 범례
  if (data.legend?.length) {
    items.push(new Paragraph({
      spacing: { before: 100, after: 80 },
      children: data.legend.flatMap((l, i) => [
        new TextRun({ text: `  ${l.label}  `, font: 'Malgun Gothic', size: 18, highlight: ['yellow','green','pink','cyan','purple'][i] || 'yellow' }),
        new TextRun({ text: '  ', size: 18 }),
      ])
    }))
  }

  // 지문 (plain text, 색상 제거하고 텍스트만)
  const plainPassage = (data.coloredPassage || '').replace(/<[^>]+>/g, '')
  items.push(new Paragraph({
    children: [new TextRun({ text: plainPassage, font: 'Georgia', size: 22 })],
    spacing: { line: 460, before: 100, after: 100 }
  }))

  // 흐름 요약
  if (data.flowSummary) {
    items.push(new Paragraph({
      shading: { fill: 'F9F6F0', type: ShadingType.CLEAR },
      border: { left: { style: BorderStyle.SINGLE, size: 6, color: '1A1A1A' } },
      indent: { left: 240 },
      spacing: { before: 120, after: 80 },
      children: [new TextRun({ text: data.flowSummary, font: 'Malgun Gothic', size: 20, color: '444444' })]
    }))
  }

  return [stageHeading(2, '흐름 지도'), ...items]
}

// ── Stage 4 — 내 단어장 ──────────────────────────────
function buildStage4(data) {
  if (!data?.words) return []
  const colWidths = [400, 1600, 700, 1700, 2813, 2613]
  const rows = [
    new TableRow({
      tableHeader: true,
      children: [
        headerCell('#', 400), headerCell('단어', 1600), headerCell('품사', 700),
        headerCell('한글 뜻', 1700), headerCell('동의어', 2813), headerCell('반의어', 2613),
      ]
    }),
    ...data.words.map(w => new TableRow({
      children: [
        simpleCell(String(w.num||''), 400, 'BBBBBB', 'Courier New', 17),
        new TableCell({ borders, width: { size: 1600, type: WidthType.DXA }, margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: w.word||'', font: 'Georgia', size: 22, bold: true })] })] }),
        simpleCell(w.pos||'', 700, '999999', 'Malgun Gothic', 16),
        simpleCell(w.meaning||'', 1700, '222222', 'Malgun Gothic', 20),
        new TableCell({ borders, width: { size: 2813, type: WidthType.DXA }, margins: cellMargins,
          children: [new Paragraph({ children: [
            new TextRun({ text: 'S ', font: 'Courier New', size: 17, bold: true, color: '1A6E3A' }),
            new TextRun({ text: w.synonyms||'—', font: 'Malgun Gothic', size: 20, color: '1A6E3A' }),
          ]})] }),
        new TableCell({ borders, width: { size: 2613, type: WidthType.DXA }, margins: cellMargins,
          children: [new Paragraph({ children: [
            new TextRun({ text: 'A ', font: 'Courier New', size: 17, bold: true, color: 'B03030' }),
            new TextRun({ text: w.antonyms||'—', font: 'Malgun Gothic', size: 20, color: 'B03030' }),
          ]})] }),
      ]
    }))
  ]
  return [stageHeading(4, '내 단어장'), new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: colWidths, rows })]
}

// ── Stage 5 — 핵심 3단어 ─────────────────────────────
function buildStage5(data) {
  if (!data?.keywords) return []
  const items = [stageHeading(5, '이 글의 핵심 3단어')]
  data.keywords.forEach(kw => {
    items.push(new Paragraph({
      spacing: { before: 120, after: 60 },
      children: [
        new TextRun({ text: kw.word + '  ', font: 'Georgia', size: 26, bold: true }),
        new TextRun({ text: kw.ko + '  ', font: 'Malgun Gothic', size: 20, color: '888888' }),
        new TextRun({ text: '→  ', font: 'Arial', size: 20, color: 'AAAAAA' }),
        new TextRun({ text: kw.role || '', font: 'Malgun Gothic', size: 20, color: '444444' }),
      ]
    }))
  })
  if (data.flowSummary) {
    items.push(new Paragraph({
      shading: { fill: 'F9F6F0', type: ShadingType.CLEAR },
      border: { left: { style: BorderStyle.SINGLE, size: 6, color: '1A1A1A' } },
      indent: { left: 240 }, spacing: { before: 120, after: 80 },
      children: [new TextRun({ text: data.flowSummary, font: 'Malgun Gothic', size: 20 })]
    }))
  }
  return items
}

// ── Stage 6 — 주제 한 문장 ───────────────────────────
function buildStage6(data) {
  if (!data?.topicSentences) return []
  const colWidths = [1000, 1000, 4413, 3413]
  const rows = [
    new TableRow({ tableHeader: true, children: [headerCell('키워드',1000), headerCell('유형',1000), headerCell('주제 표현',4413), headerCell('한글 해석',3413)] }),
    ...data.topicSentences.map(s => new TableRow({ children: [
      simpleCell(s.keyword||'', 1000, '1A1A1A', 'Georgia', 20),
      simpleCell(s.type||'', 1000, '444444', 'Malgun Gothic', 18),
      new TableCell({ borders, width: { size: 4413, type: WidthType.DXA }, margins: cellMargins,
        children: [new Paragraph({ children: [new TextRun({ text: s.en||'', font: 'Georgia', size: 22 })] })] }),
      new TableCell({ borders, width: { size: 3413, type: WidthType.DXA }, margins: cellMargins,
        children: [new Paragraph({ children: [new TextRun({ text: s.ko||'', font: 'Malgun Gothic', size: 20, color: '555555' })] })] }),
    ]}))
  ]
  return [stageHeading(6, '주제 한 문장'), new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: colWidths, rows })]
}

// ── Stage 7 — 실전 문제 ──────────────────────────────
function buildStage7(data) {
  if (!data) return []
  const items = [stageHeading(7, '실전 문제')]
  const qs = [data.q1, data.q2, data.q3, data.q4, data.q5].filter(Boolean)
  qs.forEach((q, i) => {
    items.push(new Paragraph({
      spacing: { before: 160, after: 60 },
      children: [new TextRun({ text: `${i+1}. [${q.type}]  `, font: 'Malgun Gothic', size: 20, bold: true }),
                 new TextRun({ text: q.direction||'', font: 'Malgun Gothic', size: 19, color: '444444' })]
    }))
    // 지문
    const passageText = (q.passage||q.words||'').replace(/___BLANK___/g,'_______').replace(/___BLANK_[AB]___/g,'_______')
    if (passageText) items.push(new Paragraph({
      shading: { fill: 'FAFAFA', type: ShadingType.CLEAR },
      indent: { left: 240, right: 240 }, spacing: { before: 60, after: 60, line: 420 },
      children: [new TextRun({ text: passageText, font: 'Georgia', size: 21 })]
    }))
    // 선택지
    if (q.options) q.options.forEach(opt => items.push(new Paragraph({
      indent: { left: 480 }, spacing: { before: 30 },
      children: [new TextRun({ text: opt, font: 'Malgun Gothic', size: 20 })]
    })))
    items.push(dividerLine())
  })
  return items
}

// ── Stage 8 — 어법 총정리 ────────────────────────────
function buildStage8(data) {
  if (!data?.items) return []
  const items = [stageHeading(8, '어법 총정리')]
  const colWidths = [600, 1200, 3000, 2613, 2413]
  const rows = [
    new TableRow({ tableHeader: true, children: [
      headerCell('#',600), headerCell('유형',1200), headerCell('문제',3000), headerCell('정답',2613), headerCell('해설',2413)
    ]}),
    ...data.items.map(item => new TableRow({ children: [
      simpleCell(String(item.num||''), 600, 'BBBBBB', 'Courier New', 17),
      simpleCell(item.label||'', 1200, '444444', 'Malgun Gothic', 18),
      new TableCell({ borders, width: { size: 3000, type: WidthType.DXA }, margins: cellMargins,
        children: [new Paragraph({ children: [new TextRun({ text: item.choices||item.words||'___', font: 'Georgia', size: 20 })] })] }),
      new TableCell({ borders, width: { size: 2613, type: WidthType.DXA }, margins: cellMargins,
        shading: { fill: 'FFF9E6', type: ShadingType.CLEAR },
        children: [new Paragraph({ children: [new TextRun({ text: item.answer||'', font: 'Georgia', size: 20, bold: true, color: '1A1A1A' })] })] }),
      new TableCell({ borders, width: { size: 2413, type: WidthType.DXA }, margins: cellMargins,
        children: [new Paragraph({ children: [new TextRun({ text: item.note||'', font: 'Malgun Gothic', size: 17, color: '666666' })] })] }),
    ]}))
  ]
  return [stageHeading(8, '어법 총정리'), new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: colWidths, rows })]
}

// ── 헬퍼 함수 ─────────────────────────────────────────
function headerCell(text, width) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA }, margins: cellMargins,
    shading: { fill: STAGE_BG, type: ShadingType.CLEAR },
    children: [new Paragraph({ children: [new TextRun({ text, font: 'Malgun Gothic', size: 17, bold: true, color: '888888' })], alignment: AlignmentType.CENTER })]
  })
}

function simpleCell(text, width, color='222222', font='Malgun Gothic', size=20) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA }, margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, font, size, color })] })]
  })
}

// ── 메인 export 함수 ──────────────────────────────────
export async function exportToWord(results, passage, level) {
  const children = []

  // 제목
  children.push(new Paragraph({
    children: [new TextRun({ text: '영어 지문 분석 워크시트', font: 'Malgun Gothic', size: 32, bold: true })],
    spacing: { before: 0, after: 120 },
    alignment: AlignmentType.CENTER,
  }))
  children.push(new Paragraph({
    children: [new TextRun({ text: `난이도: ${level}  |  생성일: ${new Date().toLocaleDateString('ko-KR')}`, font: 'Malgun Gothic', size: 18, color: '888888' })],
    spacing: { after: 200 },
    alignment: AlignmentType.CENTER,
  }))

  // 원문 지문
  if (passage) {
    children.push(new Paragraph({
      children: [new TextRun({ text: '[ 지문 ]', font: 'Malgun Gothic', size: 18, bold: true, color: '888888' })],
      spacing: { before: 100, after: 60 },
    }))
    children.push(new Paragraph({
      shading: { fill: 'F9F6F0', type: ShadingType.CLEAR },
      border: { left: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' } },
      indent: { left: 240, right: 240 },
      spacing: { before: 80, after: 200, line: 420 },
      children: [new TextRun({ text: passage, font: 'Georgia', size: 20 })]
    }))
  }

  // 각 Stage 추가
  const builders = {
    1: buildStage1, 2: buildStage2, 4: buildStage4,
    5: buildStage5, 6: buildStage6, 7: buildStage7, 8: buildStage8
  }

  Object.entries(results).forEach(([id, data]) => {
    if (data?.error || data?.placeholder) return
    const builder = builders[parseInt(id)]
    if (builder) {
      children.push(new Paragraph({ children: [], spacing: { before: 300 } }))
      children.push(...builder(data))
    }
  })

  const doc = new Document({
    styles: {
      default: { document: { run: { font: 'Malgun Gothic', size: 20 } } }
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 720, right: 720, bottom: 720, left: 720 }
        }
      },
      children,
    }]
  })

  const buffer = await Packer.toBuffer(doc)
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
  saveAs(blob, `워크시트_${new Date().toLocaleDateString('ko-KR').replace(/\. /g,'-').replace('.','')}.docx`)
}
