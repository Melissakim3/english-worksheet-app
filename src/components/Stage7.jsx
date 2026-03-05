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
      {/* 1. 빈칸 추론 */}
      {q1 && (
        <div className="question-block">
          <div className="section-title-q">빈칸 추론</div>
          <div className="q-header">
            <span className="q-num" style={{fontSize:enSize}}>1.</span>
            <span className="q-direction" style={KO}>{q1.direction}</span>
          </div>
          <div className="passage-box-q" style={EN}
            dangerouslySetInnerHTML={{__html: renderPassageWithBlanks(q1.passage)}}
          />
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

      {/* 2. 이중 빈칸 */}
      {q2 && (
        <div className="question-block">
          <div className="q-header">
            <span className="q-num" style={{fontSize:enSize}}>2.</span>
            <span className="q-direction" style={KO}>{q2.direction}</span>
          </div>
          <div className="passage-box-q" style={EN}
            dangerouslySetInnerHTML={{__html: renderPassageWithBlanks(q2.passage)}}
          />
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

      {/* 3. 어법 — 검은색, 볼드 없이 */}
      {q3 && (
        <div className="question-block">
          <div className="section-title-q">어법</div>
          <div className="q-header">
            <span className="q-num" style={{fontSize:enSize}}>3.</span>
            <span className="q-direction" style={KO}>{q3.direction}</span>
          </div>
          <div className="passage-box-q" style={{...EN, lineHeight:2.1}}>
            {/* 지문 전체를 밑줄 번호로 표시 — 검은색, 볼드 없음 */}
            {q3.passage ? (
              <span dangerouslySetInnerHTML={{__html:
                q3.passage.replace(/\[([①②③④⑤])\]([^\[]+)/g,
                  (_, num, word) =>
                    `<span style="border-bottom:1.5px solid #1a1a1a; padding-bottom:1px;">${num}${word.trim()}</span> `)
              }} />
            ) : (
              q3.underlines?.map((u, i) => (
                <span key={i} style={{marginRight:6}}>
                  <span style={{
                    borderBottom:'1.5px solid #1a1a1a',
                    paddingBottom:1,
                    color:'#1a1a1a',
                    fontWeight:'normal',
                    fontSize:enSize
                  }}>
                    {u.num} {u.word}
                  </span>
                  {' '}
                </span>
              ))
            )}
          </div>
          <div style={{...KO, marginTop:6, color:'#666', fontSize:koSize*0.9}}>
            {q3.underlines?.map((u, i) => (
              <span key={i}>{u.num} {u.word} — {u.note}{i < q3.underlines.length-1 ? ' | ' : ''}</span>
            ))}
          </div>
        </div>
      )}

      <hr style={{border:'none', borderTop:'1px dotted #ddd', margin:'12px 0'}} />

      {/* 4. 어법 선택 — 지문 포함 */}
      {q4 && (
        <div className="question-block">
          <div className="q-header">
            <span className="q-num" style={{fontSize:enSize}}>4.</span>
            <span className="q-direction" style={KO}>{q4.direction || '다음 글의 괄호 안에서 어법상 알맞은 것을 고르시오.'}</span>
          </div>
          {/* 지문 (passage 필드 있으면 표시, 없으면 choices 나열) */}
          {q4.passage ? (
            <div className="passage-box-q" style={{...EN, lineHeight:2.1}}
              dangerouslySetInnerHTML={{__html: q4.passage.replace(
                /\(([^)]+)\)/g,
                (_, inner) => `<span style="border:1.5px solid #444;border-radius:3px;padding:0 5px;font-size:${enSize*0.9}px;font-family:var(--font-sans);margin:0 2px;">${inner}</span>`
              )}}
            />
          ) : (
            <div className="passage-box-q" style={{...EN, lineHeight:2.1}}>
              {q4.choices?.map((c, i) => (
                <span key={i} style={{marginRight:8}}>
                  <span style={{color:'#888', fontSize:koSize}}>{c.label}</span>
                  <span style={{
                    border:'1.5px solid #444', borderRadius:3,
                    padding:'0 5px', fontSize:enSize*0.9,
                    fontFamily:'var(--font-sans)', margin:'0 2px'
                  }}>{c.options}</span>
                </span>
              ))}
            </div>
          )}
          <div style={{...KO, marginTop:6, color:'#666', fontSize:koSize*0.9}}>
            {q4.choices?.map((c, i) => (
              <span key={i}>{c.label} <strong>{c.answer}</strong> — {c.note}{i < q4.choices.length-1 ? ' | ' : ''}</span>
            ))}
          </div>
        </div>
      )}

      <hr style={{border:'none', borderTop:'1px dotted #ddd', margin:'12px 0'}} />

      {/* 5. 순서 배열 — 질문 + 문장 포함 */}
      {q5 && (
        <div className="question-block">
          <div className="section-title-q">서술형 — 순서 배열</div>
          <div className="q-header">
            <span className="q-num" style={{fontSize:enSize}}>5.</span>
            <span className="q-direction" style={KO}>{q5.direction || '다음 (A)~(D)를 논리적 흐름에 맞게 순서대로 배열하시오.'}</span>
          </div>
          {/* 도입 문장 있으면 표시 */}
          {q5.intro && (
            <div style={{...EN, marginBottom:8, lineHeight:1.9}}>{q5.intro}</div>
          )}
          <div className="passage-box-q" style={{display:'flex', flexDirection:'column', gap:8}}>
            {q5.sentences && Object.entries(q5.sentences).map(([k, v]) => (
              <div key={k} style={{display:'flex', gap:8, alignItems:'flex-start'}}>
                <span style={{fontWeight:800, color:'#2a5caa', minWidth:28, fontSize:enSize, flexShrink:0}}>({k})</span>
                <span style={{fontFamily:'Georgia,serif', fontSize:enSize, lineHeight:1.85}}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{marginTop:8, fontSize:koSize, fontWeight:600, color:'#444',
            padding:'6px 12px', border:'1px dotted #bbb', borderRadius:3}}>
            정답: ( &nbsp;&nbsp; ) → ( &nbsp;&nbsp; ) → ( &nbsp;&nbsp; ) → ( &nbsp;&nbsp; )
          </div>
        </div>
      )}
    </div>
  )
}
