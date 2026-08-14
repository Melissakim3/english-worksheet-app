export default function Stage8({ data, settings }) {
  const enSize = settings?.enSize ?? 11.5
  const koSize = settings?.koSize ?? 10

  if (!data || data.error) return null

  const items = data.items || []

  return (
    <div>
      {items.length === 0 && (
        <div style={{fontSize:koSize, color:'#aaa'}}>
          * 어법 포인트가 아직 생성되지 않았습니다.
        </div>
      )}

      <div style={{display:'flex', flexDirection:'column', gap:12}}>
        {items.map((item, i) => (
          <div key={i} style={{
            border:'1px solid #ddd', borderRadius:4, padding:'10px 14px', background:'#fafafa'
          }}>
            <div style={{display:'flex', alignItems:'baseline', gap:8, marginBottom:6}}>
              <span style={{
                background:'#1a1a1a', color:'#fff', fontSize:koSize*0.8, fontWeight:800,
                padding:'1px 6px', borderRadius:2, flexShrink:0
              }}>{item.num}</span>
              <span style={{fontSize:koSize, fontWeight:700}}>{item.point}</span>
            </div>

            <div style={{
              fontFamily:'Georgia, serif', fontSize:enSize, lineHeight:1.85, marginBottom:6
            }} dangerouslySetInnerHTML={{__html: item.sentence}} />

            <div style={{fontSize:koSize*0.95, color:'#555', lineHeight:1.6}}>
              {item.explanation}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
