export default function Stage5({ data }) {
  const keywords = data?.keywords || []
  return (
    <div>
      <div className="kw-row">
        <span className="kw-title" style={{fontSize:10}}>핵심 키워드</span>
        <div className="kw-chips">
          {keywords.map((kw, i) => (
            <span key={i} style={{display:'flex', alignItems:'center', gap:5}}>
              {i > 0 && <span className="kw-div">/</span>}
              <span className="kw-chip" style={{fontSize:11.5}}>{kw.word}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="kw-logic">
        {keywords.map((kw, i) => (
          <div key={i} className="logic-row">
            <span className="logic-word" style={{fontSize:11.5}}>{kw.word} <span style={{fontSize:10, color:'#888', fontFamily:'var(--font-sans)'}}>{kw.ko}</span></span>
            <span className="logic-arrow">→</span>
            <span style={{color:'#444', fontSize:10}}>{kw.role}</span>
          </div>
        ))}
      </div>
      {data.flowSummary && (
        <div className="flow-box" style={{marginTop:14}}>
          <div className="flow-label">전체 논리 흐름</div>
          <p style={{fontSize:10, lineHeight:1.7}}>{data.flowSummary}</p>
        </div>
      )}
    </div>
  )
}
