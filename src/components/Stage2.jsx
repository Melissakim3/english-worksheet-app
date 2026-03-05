export default function Stage2({ data }) {
  return (
    <div>
      {/* Legend */}
      <div className="legend">
        {data.legend?.map((l, i) => (
          <div key={i} className="legend-item">
            <div className="legend-dot" style={{background: l.colorName}} />
            <span>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Colored passage */}
      <div style={{fontFamily:'Georgia, serif', fontSize:13, lineHeight:2.2, marginBottom:12}}
        dangerouslySetInnerHTML={{__html: data.coloredPassage || ''}}
      />

      {/* Flow */}
      <div className="flow-box">
        <div className="flow-label">논리 흐름 요약</div>
        <div className="flow-steps">
          {data.flowSteps?.map((step, i) => (
            <span key={i} style={{display:'flex', alignItems:'center', gap:5}}>
              {i > 0 && <span className="flow-arrow">→</span>}
              <span className="flow-step">{step.label} <span className="flow-ko">({step.ko})</span></span>
            </span>
          ))}
        </div>
        {data.flowSummary && <p style={{fontSize:11, color:'#888', marginTop:8}}>{data.flowSummary}</p>}
      </div>
    </div>
  )
}
