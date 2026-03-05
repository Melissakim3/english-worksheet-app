export default function Stage5({ data, settings }) {
  const keywords = data?.keywords || []
  const enSize = settings?.enSize ?? 11.5
  const koSize = settings?.koSize ?? 10

  return (
    <div>
      <div className="kw-row">
        <span className="kw-title" style={{fontSize:koSize}}>핵심 키워드</span>
        <div className="kw-chips">
          {keywords.map((kw, i) => (
            <span key={i} style={{display:'flex', alignItems:'center', gap:5}}>
              {i > 0 && <span className="kw-div">/</span>}
              <span className="kw-chip" style={{fontSize:enSize}}>{kw.word}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="kw-logic">
        {keywords.map((kw, i) => (
          <div key={i} className="logic-row">
            <span className="logic-word" style={{fontSize:enSize}}>{kw.word} <span style={{fontSize:koSize, color:'#888', fontFamily:'var(--font-sans)'}}>{kw.ko}</span></span>
            <span className="logic-arrow">→</span>
            <span style={{color:'#444', fontSize:koSize}}>{kw.role}</span>
          </div>
        ))}
      </div>
      {data.flowSummary && (
        <div className="flow-box" style={{marginTop:14}}>
          <div className="flow-label">전체 논리 흐름</div>
          <p style={{fontSize:koSize, lineHeight:1.7}}>{data.flowSummary}</p>
        </div>
      )}
    </div>
  )
}
