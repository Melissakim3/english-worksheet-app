function QBlock({ num, q, enSize, koSize }) {
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
    </div>
  )
}

export default function Stage9({ data, settings }) {
  const enSize = settings?.enSize ?? 11.5
  const koSize = settings?.koSize ?? 10

  if (!data || data.error) return null

  const { q1, q2 } = data

  return (
    <div>
      <QBlock num={1} q={q1} enSize={enSize} koSize={koSize} />

      {q1 && q2 && <hr style={{border:'none', borderTop:'1px dotted #ddd', margin:'16px 0'}} />}

      <QBlock num={2} q={q2} enSize={enSize} koSize={koSize} />
    </div>
  )
}
