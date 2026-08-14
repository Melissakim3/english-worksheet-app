export default function Stage6({ data, settings }) {
  const enSize = settings?.enSize ?? 11.5
  const koSize = settings?.koSize ?? 10

  if (!data || data.error) return null

  const { direction, evidence, options = [] } = data

  return (
    <div>
      {/* 문제 지시문 */}
      <div className="q-direction" style={{fontSize:koSize, fontWeight:700, marginBottom:10}}>
        {direction}
      </div>

      {/* 근거 문장 (원문 인용) */}
      {evidence && (
        <div className="q-evidence" style={{
          fontFamily:'Georgia, serif', fontSize:enSize, lineHeight:1.7,
          padding:'10px 14px', background:'#f7f5f0', border:'1px solid #ddd',
          borderRadius:3, marginBottom:12
        }}>
          {evidence}
        </div>
      )}

      {/* 선택지: 한글 + 영어 패러프레이징 (정답 표시 없음) */}
      <div className="q-options" style={{display:'flex', flexDirection:'column', gap:8}}>
        {options.map((opt, i) => (
          <div key={i} style={{display:'flex', gap:8, alignItems:'flex-start'}}>
            <span style={{fontSize:koSize, fontWeight:700, flexShrink:0}}>{opt.num}</span>
            <div>
              <div style={{fontSize:koSize, lineHeight:1.6}}>{opt.ko}</div>
              <div style={{
                fontFamily:'Georgia, serif', fontSize:enSize*0.92, lineHeight:1.5,
                color:'#666', marginTop:2
              }}>{opt.en}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
