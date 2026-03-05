export default function Stage2({ data, settings }) {
  const enSize = settings?.enSize ?? 11.5
  const koSize = settings?.koSize ?? 10

  return (
    <div>
      <div className="legend">
        {data.legend?.map((l, i) => (
          <div key={i} className="legend-item">
            <div className="legend-dot" style={{background: l.colorName}} />
            <span style={{fontSize:koSize}}>{l.label}</span>
          </div>
        ))}
      </div>
      <div style={{fontFamily:'Georgia, serif', fontSize:enSize, lineHeight:2.1, marginBottom:12}}
        dangerouslySetInnerHTML={{__html: data.coloredPassage || ''}}
      />
      <div className="flow-box">
        <div className="flow-label">논리 흐름 요약</div>
        <div className="flow-steps">
          {data.flowSteps?.map((step, i) => (
            <span key={i} style={{display:'flex', alignItems:'center', gap:5}}>
              {i > 0 && <span className="flow-arrow">→</span>}
              <span className="flow-step" style={{fontSize:enSize}}>{step.label} <span className="flow-ko" style={{fontSize:koSize}}>({step.ko})</span></span>
            </span>
          ))}
        </div>
        {data.flowSummary && <p style={{fontSize:koSize, color:'#888', marginTop:8}}>{data.flowSummary}</p>}
      </div>
    </div>
  )
}
