function renderSummaryWithBlanks(text) {
  if (!text) return null
  return text
    .replace(/___BLANK_A___/g, '<span style="display:inline-block;border-bottom:1.5px solid #1a1a1a;min-width:70px;margin:0 3px;text-align:center;">(A)</span>')
    .replace(/___BLANK_B___/g, '<span style="display:inline-block;border-bottom:1.5px solid #1a1a1a;min-width:70px;margin:0 3px;text-align:center;">(B)</span>')
    .replace(/___BLANK_C___/g, '<span style="display:inline-block;border-bottom:1.5px solid #1a1a1a;min-width:70px;margin:0 3px;text-align:center;">(C)</span>')
}

export default function Stage7({ data, settings }) {
  const enSize = settings?.enSize ?? 11.5
  const koSize = settings?.koSize ?? 10
  const EN = { fontFamily:'Georgia, serif', fontSize:enSize, lineHeight:1.95 }
  const KO = { fontSize:koSize, lineHeight:1.6 }

  if (!data || data.error) return null

  const { direction, blankedSummary, blanks = [], options = [], answer, explanation } = data

  return (
    <div>
      <div className="question-block">
        <div className="section-title-q">요약문 빈칸</div>

        <div className="q-header">
          <span className="q-direction" style={KO}>{direction}</span>
        </div>

        {/* 빈칸 처리된 요약문 */}
        <div className="passage-box-q" style={EN}
          dangerouslySetInnerHTML={{__html: renderSummaryWithBlanks(blankedSummary)}}
        />

        {/* 선택지 */}
        <div className="options" style={{marginTop:10}}>
          {options.map((opt, i) => (
            <div key={i} className="option" style={KO}>{opt}</div>
          ))}
        </div>

        {/* 정답/해설 */}
        <div className="q-answer-block" style={{marginTop:14, paddingTop:10, borderTop:'1px dashed #ccc'}}>
          <div style={{fontSize:koSize, fontWeight:700}}>
            정답: {answer}
            {blanks.length > 0 && (
              <span style={{fontWeight:400, color:'#666', marginLeft:8}}>
                ({blanks.map(b => `(${b.key}) ${b.answer}`).join(' / ')})
              </span>
            )}
          </div>
          {explanation && (
            <p style={{fontSize:koSize, color:'#555', lineHeight:1.7, marginTop:4}}>{explanation}</p>
          )}
        </div>
      </div>
    </div>
  )
}
