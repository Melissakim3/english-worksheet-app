export default function Stage2({ data }) {
  return (
    <div>
      <div className="legend">
        {data.legend?.map((l, i) => (
          <div key={i} className="legend-item">
            <div className="legend-dot" style={{background: l.colorName}} />
            <span style={{fontSize:10}}>{l.label}</span>
          </div>
        ))}
      </div>
      <div style={{fontFamily:'Georgia, serif', fontSize:11.5, lineHeight:2.2, marginBottom:12}}
        dangerouslySetInnerHTML={{__html: data.coloredPassage || ''}}
      />
      <div className="flow-box">
        <div className="flow-label">논리 흐름 요약</div>
        <div className="flow-steps">
          {data.flowSteps?.map((step, i) => (
            <span key={i} style={{display:'flex', alignItems:'center', gap:5}}>
              {i > 0 && <span className="flow-arrow">→</span>}
              <span className="flow-step" style={{fontSize:11.5}}>{step.label} <span className="flow-ko" style={{fontSize:10}}>({step.ko})</span></span>
            </span>
          ))}
        </div>
        {data.flowSummary && <p style={{fontSize:10, color:'#888', marginTop:8}}>{data.flowSummary}</p>}
      </div>
    </div>
  )
}
