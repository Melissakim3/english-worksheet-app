function renderPassageWithBlanks(text) {
  if (!text) return null
  return text
    .replace(/___BLANK___/g, '<span style="display:inline-block;border-bottom:1.5px solid #1a1a1a;min-width:80px;margin:0 3px;"></span>')
    .replace(/___BLANK_A___/g, '<span style="display:inline-block;border-bottom:1.5px solid #1a1a1a;min-width:60px;margin:0 3px;text-align:center;">(A)</span>')
    .replace(/___BLANK_B___/g, '<span style="display:inline-block;border-bottom:1.5px solid #1a1a1a;min-width:60px;margin:0 3px;text-align:center;">(B)</span>')
}

function renderUnderlines(text, underlines) {
  if (!text || !underlines) return text
  let result = text
  underlines.forEach(u => {
    const color = u.correct ? '#c00' : '#c00'
    result = result.replace(
      new RegExp(`___UL_${u.num.replace(/[①②③④⑤]/g, m => ({'①':'1','②':'2','③':'3','④':'4','⑤':'5'}[m]))}___(.*?)___\\/UL___`),
      `<span style="border-bottom:2px solid ${color};font-weight:700;color:${color};">${u.num} $1</span>`
    )
  })
  return result
}

export default function Stage7({ data }) {
  const { q1, q2, q3, q4, q5 } = data || {}

  return (
    <div>
      {/* Q1 빈칸 추론 */}
      {q1 && (
        <div className="question-block">
          <div className="section-title-q">빈칸 추론</div>
          <div className="q-header">
            <span className="q-num">1.</span>
            <span className="q-direction">{q1.direction}</span>
          </div>
          <div className="passage-box-q"
            dangerouslySetInnerHTML={{__html: renderPassageWithBlanks(q1.passage)}}
          />
          <div className="options">
            {q1.options?.map((opt, i) => (
              <div key={i} className="option">
                <span className="option-num">{opt.slice(0,1)}</span>
                <span>{opt.slice(1)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <hr style={{border:'none', borderTop:'1px dotted #ddd', margin:'12px 0'}} />

      {/* Q2 이중 빈칸 */}
      {q2 && (
        <div className="question-block">
          <div className="q-header">
            <span className="q-num">2.</span>
            <span className="q-direction">{q2.direction}</span>
          </div>
          <div className="passage-box-q"
            dangerouslySetInnerHTML={{__html: renderPassageWithBlanks(q2.passage)}}
          />
          <div className="options">
            {q2.options?.map((opt, i) => (
              <div key={i} className="option">
                <span className="option-num">{opt.slice(0,1)}</span>
                <span>{opt.slice(1)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <hr style={{border:'none', borderTop:'1px dotted #ddd', margin:'12px 0'}} />

      {/* Q3 어법 */}
      {q3 && (
        <div className="question-block">
          <div className="section-title-q">어법</div>
          <div className="q-header">
            <span className="q-num">3.</span>
            <span className="q-direction">{q3.direction}</span>
          </div>
          <div className="passage-box-q">
            {q3.underlines?.map((u, i) => (
              <span key={i}>
                {i > 0 && ' '}
                <span style={{borderBottom:'2px solid #c00', fontWeight:700, color:'#c00'}}>
                  {u.num} {u.word}
                </span>
              </span>
            ))}
            {q3.passage && <span> {q3.passage}</span>}
          </div>
          <div className="grammar-note">
            {q3.underlines?.map((u, i) => (
              <span key={i}>{u.num} {u.word} — {u.note}{i < q3.underlines.length-1 ? ' | ' : ''}</span>
            ))}
          </div>
        </div>
      )}

      <hr style={{border:'none', borderTop:'1px dotted #ddd', margin:'12px 0'}} />

      {/* Q4 어법 선택 */}
      {q4 && (
        <div className="question-block">
          <div className="q-header">
            <span className="q-num">4.</span>
            <span className="q-direction">{q4.direction || '다음 글의 괄호 안에서 어법상 알맞은 것을 고르시오.'}</span>
          </div>
          <div className="passage-box-q" style={{fontFamily:'Georgia,serif', fontSize:12, lineHeight:1.95}}>
            {q4.choices?.map((c, i) => (
              <span key={i} style={{marginRight:4}}>
                <span style={{color:'#888', fontSize:10}}>{c.label}</span>
                <span style={{border:'1px solid #333', borderRadius:2, padding:'0 4px', fontSize:11, fontWeight:700, fontFamily:'var(--font-sans)', margin:'0 2px'}}>{c.options}</span>
              </span>
            ))}
          </div>
          <div className="grammar-note">
            {q4.choices?.map((c, i) => (
              <span key={i}>{c.label} <strong>{c.answer}</strong> — {c.note}{i < q4.choices.length-1 ? ' | ' : ''}</span>
            ))}
          </div>
        </div>
      )}

      <hr style={{border:'none', borderTop:'1px dotted #ddd', margin:'12px 0'}} />

      {/* Q5 순서 배열 */}
      {q5 && (
        <div className="question-block">
          <div className="section-title-q">서술형 — 순서 배열</div>
          <div className="q-header">
            <span className="q-num">5.</span>
            <span className="q-direction">{q5.direction}</span>
          </div>
          <div className="passage-box-q" style={{display:'flex', flexDirection:'column', gap:7}}>
            {q5.sentences && Object.entries(q5.sentences).map(([k, v]) => (
              <div key={k} style={{display:'flex', gap:8}}>
                <span style={{fontWeight:800, color:'#2a5caa', minWidth:24}}>({k})</span>
                <span style={{fontFamily:'Georgia,serif', fontSize:12}}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{marginTop:6, fontSize:11.5, fontWeight:600, color:'#444', padding:'6px 10px', border:'1px dotted #bbb', borderRadius:3}}>
            정답: ( &nbsp;&nbsp; ) → ( &nbsp;&nbsp; ) → ( &nbsp;&nbsp; ) → ( &nbsp;&nbsp; )
          </div>
        </div>
      )}
    </div>
  )
}
