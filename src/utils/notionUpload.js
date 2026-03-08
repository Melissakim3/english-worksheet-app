// 노션 자료 모음 DB에 자동 업로드
// DB: collection://2a06571d-61c0-8080-b7a0-000bc56f23dc
// 컬럼: 자료(title), 날짜(date), URL(url)

const NOTION_DATA_SOURCE = '2a06571d-61c0-8080-b7a0-000bc56f23dc'

export async function uploadToNotion(title, passage, results, selectedStages) {
  // 노션 MCP API 호출 (Claude API 통해서)
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      mcp_servers: [{
        type: 'url',
        url: 'https://mcp.notion.com/mcp',
        name: 'notion-mcp'
      }],
      messages: [{
        role: 'user',
        content: buildNotionContent(title, passage, results, selectedStages)
      }]
    })
  })

  const data = await response.json()
  if (!response.ok) throw new Error(data.error?.message || '노션 업로드 실패')
  return data
}

function buildNotionContent(title, passage, results, selectedStages) {
  const today = new Date().toISOString().split('T')[0]

  // 결과를 마크다운으로 변환
  let content = `## 원문\n\n${passage}\n\n`

  if (results[1]?.sentences) {
    content += `## Stage 1 — 문장 뜯어보기\n\n`
    results[1].sentences.forEach((s, i) => {
      content += `**${i+1}.** ${s.english}\n${s.korean}\n\n`
    })
  }

  if (results[4]?.words) {
    content += `## Stage 4 — 내 단어장\n\n`
    results[4].words.forEach(w => {
      content += `- **${w.word}** (${w.pos}) — ${w.meaning}\n`
    })
    content += '\n'
  }

  if (results[6]?.topic) {
    content += `## Stage 6 — 주제 한 문장\n\n${results[6].topic}\n\n`
  }

  if (results[7]) {
    content += `## Stage 7 — 실전 문제\n\n(실전 문제 포함)\n\n`
  }

  if (results[9]) {
    content += `## Stage 9 — 서술형 문제\n\n(서술형 문제 포함)\n\n`
  }

  return `다음 내용으로 노션 데이터베이스(data_source_id: ${NOTION_DATA_SOURCE})에 새 페이지를 만들어주세요.

properties:
- 자료 (title): "${title}"
- date:날짜 :start: "${today}"
- date:날짜 :is_datetime: 0

content (Notion Markdown):
${content}

바로 페이지를 생성해주세요. 설명 없이 도구만 사용하세요.`
}
