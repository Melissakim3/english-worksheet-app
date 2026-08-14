import { useState } from 'react'

function QBlock({ num, q, enSize, koSize, showAnswer }) {
  if (!q) return null
  const EN = { fontFamily:'Georgia, serif', fontSize:enSize, lineHeight:1.95 }
  const KO = { fontSize:koSize, lineHeight:1.65 }

  return (
    <div style={{marginBottom:20}}>
      <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
        <span style={{background:'#2a5caa', color:'#fff', fontWeight:800, fontSize:koSize*0.85,
          padding:'2px 8px', borderRadius:2, fontFamily:'var(--font-sans)'}}>논술형 {num}</span>
        <span style={{...KO, fontWeight:600}}>{q.direction}</span>
        <span style={{...KO, color:'#888', marginLeft:'auto'}}>[{q.points || 5}점]</span>
      </div>

      {/* 선정된 원문 문장 */}
      <div style={{...EN, border:'1px solid #ddd', borderRadius:3, padding:'10px 14px',
        background:'#fafafa', lineHeight:2.1, marginBottom:8}}>
        {q.sourceSentence}
      </div>

      {/* 조건 박스 */}
      {q.conditions?.length > 0 && (
        <div style={{border:'1px solid #bbb', borderRadius:2, padding:'8px 12px', marginBottom:6}}>
          <div style={{fontWeight:700, fontSize:koSize*0.9, marginBottom:4, fontFamily:'var(--font-sans)'}}>〈조 건〉</div>
          {q.conditions.map((c, i) => (
            <div key={i} style={{...KO, color:'#333'}}>• {c}</div>
          ))}
        </div>
      )}

      {/* 보기 박스 (있을 때만) */}
      {q.wordBank && (
        <div style={{border:'1px solid #bbb', borderRadius:2, padding:'8px 12px', marginBottom:8}}>
          <div style={{fontWeight:700, fontSize:koSize*0.9, marginBottom:4, fontFamily:'var(--font-sans)'}}>〈보 기〉</div>
          <div style={{...EN, letterSpacing:1}}>{q.wordBank}</div>
        </div>
      )}

      {/* 답안 작성란 */}
      <div style={{display:'flex', alignItems:'center', gap:8, marginTop:6}}>
        <span style={{...KO, fontWeight:600}}>정답:</span>
        <div style={{flex:1, borderBottom:'1.5px solid #1a1a1a', minHeight:24}} />
      </div>

      {/* 정답/해설 (교사용 토글) */}
      {showAnswer && (
        <div style={{marginTop:8, padding:'8px 12px', background:'#fff8f0',
          border:'1px solid #f0d090', borderRadius:3}}>
          <span style={{fontWeight:700, color:'#c00000', fontSize:koSize}}>정답: </span>
          <span style={{...EN, color:'#c00000'}}>{q.answer}</span>
          <div style={{...KO, color:'#555', marginTop:4}}>{q.explanation}</div>
          {q.reason && (
            <div style={{...KO, color:'#888', marginTop:4, fontSize:koSize*0.85}}>
              (선정 이유: {q.reason})
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Stage9({ data, settings }) {
  const [showAnswer, setShowAnswer] = useState(false)
  const enSize = settings?.enSize ?? 11.5
  const koSize = settings?.koSize ?? 10

  if (!data || data.error) return null

  const { q1, q2 } = data

  return (
    <div>
      <QBlock num={1} q={q1} enSize={enSize} koSize={koSize} showAnswer={showAnswer} />

      {q1 && q2 && <hr style={{border:'none', borderTop:'1px dotted #ddd', margin:'16px 0'}} />}

      <QBlock num={2} q={q2} enSize={enSize} koSize={koSize} showAnswer={showAnswer} />

      {/* 정답/해설 토글 버튼 */}
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
