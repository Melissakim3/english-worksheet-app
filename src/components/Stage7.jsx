function renderPassageWithBlanks(text) {
  if (!text) return null
  return text
    .replace(/___BLANK___/g, '<span style="display:inline-block;border-bottom:1.5px solid #1a1a1a;min-width:80px;margin:0 3px;"></span>')
    .replace(/___BLANK_A___/g, '<span style="display:inline-block;border-bottom:1.5px solid #1a1a1a;min-width:60px;margin:0 3px;text-align:center;">(A)</span>')
    .replace(/___BLANK_B___/g, '<span style="display:inline-block;border-bottom:1.5px solid #1a1a1a;min-width:60px;margin:0 3px;text-align:center;">(B)</span>')
}

export default function Stage7({ data, settings }) {
  const { q1, q2, q3, q4, q5 } = data || {}
  const enSize = settings?.enSize ?? 11.5
  const koSize = settings?.koSize ?? 10
  const EN = { fontFamily:'Georgia, serif', fontSize:enSize, lineHeight:1.95 }
  const KO = { fontSize:koSize, lineHeight:1.6 }

  return (
    <div>
      {q1 && (
        <div className="question-block">
          <div className="section-title-q">빈칸 추론</div>
          <div className="q-header">
            <span className="q-num" style={{fontSize:enSize}}>1.</span>
            <span className="q-direction" style={KO}>{q1.direction}</span>
          </div>
          <div className="passage-box-q" style={EN} dangerouslySetInnerHTML={{__html: renderPassageWithBlanks(q1.passage)}} />
          <div className="options">
            {q1.options?.map((opt, i) => (
              <div key={i} className="option">
                <span className="option-num" style={KO}>{opt.slice(0,1)}</span>
                <span style={KO}>{opt.slice(1)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <hr style={{border:'none', borderTop:'1px dotted #ddd', margin:'12px 0'}} />
      {q2 && (
        <div className="question-block">
          <div className="q-header">
            <span className="q-num" style={{fontSize:enSize}}>2.</span>
            <span className="q-direction" style={KO}>{q2.direction}</span>
          </div>
          <div className="passage-box-q" style={EN} dangerouslySetInnerHTML={{__html: renderPassageWithBlanks(q2.passage)}} />
          <div className="options">
            {q2.options?.map((opt, i) => (
              <div key={i} className="option">
                <span className="option-num" style={KO}>{opt.slice(0,1)}</span>
                <span style={KO}>{opt.slice(1)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <hr style={{border:'none', borderTop:'1px dotted #ddd', margin:'12px 0'}} />
      {q3 && (
        <div className="question-block">
          <div className="section-title-q">어법</div>
          <div className="q-header">
            <span className="q-num" style={{fontSize:enSize}}>3.</span>
            <span className="q-direction" style={KO}>{q3.direction}</span>
          </div>
          <div className="passage-box-q" style={EN}>
            {q3.underlines?.map((u, i) => (
              <span key={i}>{i > 0 && ' '}
                <span style={{borderBottom:'2px solid #c00', fontWeight:700, color:'#c00', fontSize:enSize}}>{u.num} {u.word}</span>
              </span>
            ))}
          </div>
          <div className="grammar-note" style={KO}>
            {q3.underlines?.map((u, i) => (
              <span key={i}>{u.num} {u.word} — {u.note}{i < q3.underlines.length-1 ? ' | ' : ''}</span>
            ))}
          </div>
        </div>
      )}
      <hr style={{border:'none', borderTop:'1px dotted #ddd', margin:'12px 0'}} />
      {q4 && (
        <div className="question-block">
          <div className="q-header">
            <span className="q-num" style={{fontSize:enSize}}>4.</span>
            <span className="q-direction" style={KO}>{q4.direction || '다음 글의 괄호 안에서 어법상 알맞은 것을 고르시오.'}</span>
          </div>
          <div className="passage-box-q" style={EN}>
            {q4.choices?.map((c, i) => (
              <span key={i} style={{marginRight:4}}>
                <span style={{color:'#888', fontSize:koSize}}>{c.label}</span>
                <span style={{border:'1px solid #333', borderRadius:2, padding:'0 4px', fontSize:enSize*0.9, fontWeight:700, fontFamily:'var(--font-sans)', margin:'0 2px'}}>{c.options}</span>
              </span>
            ))}
          </div>
          <div className="grammar-note" style={KO}>
            {q4.choices?.map((c, i) => (
              <span key={i}>{c.label} <strong>{c.answer}</strong> — {c.note}{i < q4.choices.length-1 ? ' | ' : ''}</span>
            ))}
          </div>
        </div>
      )}
      <hr style={{border:'none', borderTop:'1px dotted #ddd', margin:'12px 0'}} />
      {q5 && (
        <div className="question-block">
          <div className="section-title-q">서술형 — 순서 배열</div>
          <div className="q-header">
            <span className="q-num" style={{fontSize:enSize}}>5.</span>
            <span className="q-direction" style={KO}>{q5.direction}</span>
          </div>
          <div className="passage-box-q" style={{display:'flex', flexDirection:'column', gap:7}}>
            {q5.sentences && Object.entries(q5.sentences).map(([k, v]) => (
              <div key={k} style={{display:'flex', gap:8}}>
                <span style={{fontWeight:800, color:'#2a5caa', minWidth:24, fontSize:enSize}}>({k})</span>
                <span style={{fontFamily:'Georgia,serif', fontSize:enSize}}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{marginTop:6, fontSize:koSize, fontWeight:600, color:'#444', padding:'6px 10px', border:'1px dotted #bbb', borderRadius:3}}>
            정답: ( &nbsp;&nbsp; ) → ( &nbsp;&nbsp; ) → ( &nbsp;&nbsp; ) → ( &nbsp;&nbsp; )
          </div>
        </div>
      )}
    </div>
  )
}
