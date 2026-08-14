export default function Stage6({ data, settings }) {
  const enSize = settings?.enSize ?? 11.5
  const koSize = settings?.koSize ?? 10

  if (!data || data.error) return null

  const { direction, evidence, options = [], answer, explanation } = data

  return (
    <div>
      {/* 문제 지시문 */}
      <div className="q-direction" style={{fontSize:koSize, fontWeight:700, marginBottom:10}}>
        {direction}
      </div>

      {/* 근거 문장 (교사용 표시, 참고용으로 노출) */}
      {evidence && (
        <div className="q-evidence" style={{
          fontFamily:'Georgia, serif', fontSize:enSize, lineHeight:1.7,
          padding:'10px 14px', background:'#f7f5f0', border:'1px solid #ddd',
          borderRadius:3, marginBottom:12
        }}>
          {evidence}
        </div>
      )}

      {/* 선택지 */}
      <div className="q-options" style={{display:'flex', flexDirection:'column', gap:6}}>
        {options.map((opt, i) => (
          <div key={i} style={{fontSize:koSize, lineHeight:1.7}}>{opt}</div>
        ))}
      </div>

      {/* 정답/해설 */}
      <div className="q-answer-block" style={{marginTop:14, paddingTop:10, borderTop:'1px dashed #ccc'}}>
        <div style={{fontSize:koSize, fontWeight:700}}>정답: {answer}</div>
        {explanation && (
          <p style={{fontSize:koSize, color:'#555', lineHeight:1.7, marginTop:4}}>{explanation}</p>
        )}
      </div>
    </div>
  )
}
