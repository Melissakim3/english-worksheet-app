// AI가 실수로 넣은 강조/하이라이트 태그 제거 (mark, b, strong, 배경색 span 등)
function stripEmphasisTags(html) {
  if (!html) return ''
  return html
    .replace(/<mark[^>]*>/gi, '')
    .replace(/<\/mark>/gi, '')
    .replace(/<span[^>]*style=["'][^"']*background[^"']*["'][^>]*>/gi, '')
    .replace(/<b>/gi, '').replace(/<\/b>/gi, '')
    .replace(/<strong>/gi, '').replace(/<\/strong>/gi, '')
}

// ①~⑩(선택지A / 선택지B) 또는 ①선택지A / 선택지B(괄호 없는 경우) 모두 인식해서 밑줄 처리
function underlineChoices(html) {
  const cleaned = stripEmphasisTags(html)
  return cleaned.replace(
    /([①②③④⑤⑥⑦⑧⑨⑩])\s*\(?\s*([A-Za-z][A-Za-z\s'-]*?)\s*\/\s*([A-Za-z][A-Za-z\s'-]*?)\s*\)?(?=[\s.,;:!?]|$)/g,
    (match, num, a, b) =>
      `<span style="border-bottom:2px solid #1a1a1a; padding-bottom:1px;">${num}(${a.trim()} / ${b.trim()})</span>`
  )
}

export default function Stage8({ data, settings }) {
  const enSize = settings?.enSize ?? 11.5
  const koSize = settings?.koSize ?? 10

  if (!data || data.error) return null

  const passage = data.passage || ''

  return (
    <div>
      {passage ? (
        <div style={{
          fontFamily:'Georgia, serif', fontSize:enSize, lineHeight:2.2,
          padding:'12px 16px',
          border:'1px solid #ddd', borderRadius:4,
          background:'#fafafa'
        }}
          dangerouslySetInnerHTML={{__html: underlineChoices(passage)}}
        />
      ) : (
        <div style={{fontSize:koSize, color:'#aaa'}}>
          * 지문이 아직 로드되지 않았거나, AI가 passage 필드를 생성하지 않았습니다.
        </div>
      )}
    </div>
  )
}
