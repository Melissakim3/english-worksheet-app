import { useState } from 'react'

export default function Stage9({ data, settings }) {
  const [showAnswer, setShowAnswer] = useState(false)
  const enSize = settings?.enSize ?? 11.5
  const koSize = settings?.koSize ?? 10
  const EN = { fontFamily:'Georgia, serif', fontSize:enSize, lineHeight:1.95 }
  const KO = { fontSize:koSize, lineHeight:1.65 }

  if (!data) return null

  const { q1, q2, q3 } = data

  return (
    <div>
      {/* ── 논술형 1: 조건부 빈칸 완성 ── */}
      {q1 && (
        <div style={{marginBottom:20}}>
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
            <span style={{background:'#2a5caa', color:'#fff', fontWeight:800, fontSize:koSize*0.85,
              padding:'2px 8px', borderRadius:2, fontFamily:'var(--font-sans)'}}>논술형 1</span>
            <span style={{...KO, fontWeight:600}}>{q1.direction}</span>
            <span style={{...KO, color:'#888', marginLeft:'auto'}}>[{q1.points || 5}점]</span>
          </div>

          {/* 지문 */}
          <div style={{...EN, border:'1px solid #ddd', borderRadius:3, padding:'10px 14px',
            background:'#fafafa', lineHeight:2.1, marginBottom:8}}
            dangerouslySetInnerHTML={{__html: (q1.passage||'').replace(
              /___BLANK___/g,
              `<span style="display:inline-block;border-bottom:2px solid #1a1a1a;min-width:140px;margin:0 3px;"></span>`
            )}}
          />

          {/* 조건 박스 */}
          <div style={{border:'1px solid #bbb', borderRadius:2, padding:'8px 12px', marginBottom:6}}>
            <div style={{fontWeight:700, fontSize:koSize*0.9, marginBottom:4, fontFamily:'var(--font-sans)'}}>〈조 건〉</div>
            {q1.conditions?.map((c,i) => (
              <div key={i} style={{...KO, color:'#333'}}>• {c}</div>
            ))}
          </div>

          {/* 보기 박스 */}
          {q1.wordBank && (
            <div style={{border:'1px solid #bbb', borderRadius:2, padding:'8px 12px', marginBottom:8}}>
              <div style={{fontWeight:700, fontSize:koSize*0.9, marginBottom:4, fontFamily:'var(--font-sans)'}}>〈보 기〉</div>
              <div style={{...EN, letterSpacing:1}}>{q1.wordBank}</div>
            </div>
          )}

          {/* 답안 작성란 */}
          <div style={{display:'flex', alignItems:'center', gap:8, marginTop:6}}>
            <span style={{...KO, fontWeight:600}}>정답:</span>
            <div style={{flex:1, borderBottom:'1.5px solid #1a1a1a', minHeight:24}} />
          </div>

          {/* 정답/해설 */}
          {showAnswer && (
            <div style={{marginTop:8, padding:'8px 12px', background:'#fff8f0',
              border:'1px solid #f0d090', borderRadius:3}}>
              <span style={{fontWeight:700, color:'#c00000', fontSize:koSize}}>정답: </span>
              <span style={{...EN, color:'#c00000'}}>{q1.answer}</span>
              <div style={{...KO, color:'#555', marginTop:4}}>{q1.explanation}</div>
            </div>
          )}
        </div>
      )}

      <hr style={{border:'none', borderTop:'1px dotted #ddd', margin:'16px 0'}} />

      {/* ── 논술형 2: 요약문 (A)(B) 완성 ── */}
      {q2 && (
        <div style={{marginBottom:20}}>
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
            <span style={{background:'#2a5caa', color:'#fff', fontWeight:800, fontSize:koSize*0.85,
              padding:'2px 8px', borderRadius:2, fontFamily:'var(--font-sans)'}}>논술형 2</span>
            <span style={{...KO, fontWeight:600}}>{q2.direction}</span>
            <span style={{...KO, color:'#888', marginLeft:'auto'}}>[{q2.points || 5}점]</span>
          </div>

          {/* 요약문 */}
          <div style={{border:'1px solid #bbb', borderRadius:2, padding:'10px 14px', marginBottom:8}}>
            <div style={{...EN, lineHeight:2.0}}
              dangerouslySetInnerHTML={{__html: (q2.summary||'').replace(
                /\(A\)/g, `<span style="font-weight:700">(A)</span><span style="display:inline-block;border-bottom:1.5px solid #1a1a1a;min-width:80px;margin:0 3px;"></span>`
              ).replace(
                /\(B\)/g, `<span style="font-weight:700">(B)</span><span style="display:inline-block;border-bottom:1.5px solid #1a1a1a;min-width:80px;margin:0 3px;"></span>`
              )}}
            />
          </div>

          {/* 보기 박스 */}
          {q2.wordBank && (
            <div style={{border:'1px solid #bbb', borderRadius:2, padding:'8px 12px', marginBottom:8}}>
              <div style={{fontWeight:700, fontSize:koSize*0.9, marginBottom:4, fontFamily:'var(--font-sans)'}}>〈보 기〉</div>
              <div style={{...EN, letterSpacing:1}}>{q2.wordBank}</div>
            </div>
          )}

          {/* 조건 */}
          {q2.conditions && (
            <div style={{border:'1px solid #bbb', borderRadius:2, padding:'8px 12px', marginBottom:8}}>
              <div style={{fontWeight:700, fontSize:koSize*0.9, marginBottom:4, fontFamily:'var(--font-sans)'}}>〈조 건〉</div>
              {q2.conditions.map((c,i) => <div key={i} style={{...KO, color:'#333'}}>• {c}</div>)}
            </div>
          )}

          <div style={{display:'flex', gap:24, marginTop:6}}>
            {['A','B'].map(k => (
              <div key={k} style={{display:'flex', alignItems:'center', gap:6}}>
                <span style={{...KO, fontWeight:700}}>({k})</span>
                <div style={{width:120, borderBottom:'1.5px solid #1a1a1a', minHeight:24}} />
              </div>
            ))}
          </div>

          {showAnswer && (
            <div style={{marginTop:8, padding:'8px 12px', background:'#fff8f0',
              border:'1px solid #f0d090', borderRadius:3}}>
              <span style={{fontWeight:700, color:'#c00000', fontSize:koSize}}>정답: </span>
              <span style={{...KO, color:'#c00000'}}>(A) {q2.answerA} &nbsp; (B) {q2.answerB}</span>
              <div style={{...KO, color:'#555', marginTop:4}}>{q2.explanation}</div>
            </div>
          )}
        </div>
      )}

      <hr style={{border:'none', borderTop:'1px dotted #ddd', margin:'16px 0'}} />

      {/* ── 논술형 3: 어법 오류 찾기 + 영작 ── */}
      {q3 && (
        <div style={{marginBottom:20}}>
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
            <span style={{background:'#2a5caa', color:'#fff', fontWeight:800, fontSize:koSize*0.85,
              padding:'2px 8px', borderRadius:2, fontFamily:'var(--font-sans)'}}>논술형 3</span>
            <span style={{...KO, fontWeight:600}}>{q3.direction}</span>
            <span style={{...KO, color:'#888', marginLeft:'auto'}}>[{q3.points || 5}점]</span>
          </div>

          {/* 지문 with 밑줄 */}
          <div style={{...EN, border:'1px solid #ddd', borderRadius:3, padding:'10px 14px',
            background:'#fafafa', lineHeight:2.2, marginBottom:8}}
            dangerouslySetInnerHTML={{__html: q3.passage||''}}
          />

          {/* 답안란 */}
          <div style={{display:'flex', gap:12, marginTop:6, flexWrap:'wrap'}}>
            <div style={{display:'flex', alignItems:'center', gap:6}}>
              <span style={{...KO, fontWeight:700}}>(1) 기호:</span>
              <div style={{width:60, borderBottom:'1.5px solid #1a1a1a', minHeight:24}} />
            </div>
            <div style={{display:'flex', alignItems:'center', gap:6}}>
              <span style={{...KO, fontWeight:700}}>(2) 바르게 고친 것:</span>
              <div style={{width:140, borderBottom:'1.5px solid #1a1a1a', minHeight:24}} />
            </div>
          </div>

          {showAnswer && (
            <div style={{marginTop:8, padding:'8px 12px', background:'#fff8f0',
              border:'1px solid #f0d090', borderRadius:3}}>
              <span style={{fontWeight:700, color:'#c00000', fontSize:koSize}}>정답: </span>
              <span style={{...KO, color:'#c00000'}}>(1) {q3.answerNum} &nbsp; (2) {q3.answerWord}</span>
              <div style={{...KO, color:'#555', marginTop:4}}>{q3.explanation}</div>
            </div>
          )}
        </div>
      )}

      {/* ── 정답/해설 토글 버튼 ── */}
      <div style={{textAlign:'center', marginTop:16}}>
        <button
          className="no-print"
          onClick={() => setShowAnswer(v => !v)}
          style={{
            padding:'6px 20px', border:'1.5px solid #1a1a1a', borderRadius:3,
            background: showAnswer ? '#1a1a1a' : '#fff',
            color: showAnswer ? '#fff' : '#1a1a1a',
            fontFamily:'var(--font-sans)', fontWeight:700, fontSize:koSize,
            cursor:'pointer'
          }}>
          {showAnswer ? '정답 숨기기' : '정답 및 해설 보기'}
        </button>
      </div>
    </div>
  )
}
