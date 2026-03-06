// PDF에서 텍스트 추출 (PDF.js CDN 사용)
export async function extractTextFromPDF(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        // PDF.js 동적 로드
        if (!window.pdfjsLib) {
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js')
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
        }
        const pdf = await window.pdfjsLib.getDocument({ data: e.target.result }).promise
        let fullText = ''
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          const pageText = content.items.map(item => item.str).join(' ')
          fullText += pageText + '\n\n'
        }
        resolve(fullText)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.onload = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })
}

// AI로 지문 자동 감지 분리
export async function splitPassagesWithAI(rawText, modelId) {
  const { callAI } = await import('./ai.js')
  const result = await callAI(
    '당신은 영어 지문 분리 전문가입니다. 반드시 JSON만 출력하세요.',
    `다음 텍스트에서 영어 지문들을 찾아 분리해주세요.
각 지문은 독립적인 영어 단락이어야 하며, 문제나 지시문은 제외하세요.
텍스트: """${rawText.slice(0, 8000)}"""
JSON 형식: { "passages": ["지문1 전체", "지문2 전체", "지문3 전체"] }`,
    modelId
  )
  return result?.passages || []
}

// --- 구분자로 분리
export function splitByDivider(text) {
  return text
    .split(/\n\s*---+\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 50)
}
