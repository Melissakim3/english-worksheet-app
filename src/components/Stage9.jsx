function QBlock({ num, q, enSize, koSize }) {
  if (!q) return null
  const EN = { fontFamily:'Georgia, serif', fontSize:enSize, lineHeight:1.95 }
  const KO = { fontSize:koSize, lineHeight:1.65 }

  return (
    <div style={{marginBottom:20}}>
      <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
        <span style={{
          background:'none', border:'1.5px solid #2a5caa', color:'#2a5caa',
          fontWeight:800, fontSize:koSize*0.85,
          padding:'1px 7px', borderRadius:2, fontFamily:'var(--font-sans)'
        }}>논술형 {num}</span>
        <span style={{...KO, fontWeight:600}}>{q.direction}</span>
        <span style={{...KO, color:'#888', marginLeft:'auto'}}>[{q.points || 5}점]</span>
      </div>

      {/* 보기: 뒤섞인 어구 (정답 순서 아님) */}
      {q.wordBank && (
        <div style={{border:'1px solid #bbb', borderRadius:2, padding:'10px 14px'}}>
          <div style={{fontWeight:700, fontSize:koSize*0.9, marginBottom:6, fontFamily:'var(--font-sans)'}}>〈보 기〉</div>
          <div style={{...EN, letterSpacing:0.5, lineHeight:1.9}}>{q.wordBank}</div>
        </div>
      )}
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
