export default function Stage1({ data, settings }) {
  const sentences = data?.sentences || []
  const enSize = settings?.enSize ?? 11.5
  const koSize = settings?.koSize ?? 10
  const lh     = settings?.lineHeight ?? 3.0
  const synSize = koSize * 0.82  // 1. 동의어/반의어 글자 크기 축소

  return (
    <table>
      <thead>
        <tr>
          <th style={{width:'46%'}}>영어 원문</th>
          <th style={{width:'26%'}}>한글 해석 / 동·반의어</th>
          <th style={{width:'28%'}}>논리 구조 / 문법</th>
        </tr>
      </thead>
      <tbody>
        {sentences.map((s, i) => (
          <tr key={i}>
            {/* 2. 영어 문장에 번호 */}
            <td style={{fontFamily:'Georgia, serif', fontSize:enSize, lineHeight:lh, padding:'6px 8px 0 8px', verticalAlign:'top'}}>
              <span style={{
                fontFamily:'var(--font-mono)',
                fontSize: enSize * 0.72,
                fontWeight: 800,
                color: '#bbb',
                marginRight: 5,
                verticalAlign: 'middle',
                userSelect: 'none',
              }}>{i + 1}</span>
              {s.en}
            </td>

            {/* 한글 + 동의어/반의어 (글자 작게) */}
            <td style={{fontSize:koSize, padding:'6px 8px 0 8px', verticalAlign:'top'}}>
              <div style={{display:'flex', flexDirection:'column', height:'100%'}}>
                <div style={{color:'#444', lineHeight:1.7, flex:1}}>{s.ko}</div>
                {s.synonyms?.length > 0 && (
                  <div style={{display:'flex', flexWrap:'wrap', gap:'2px 6px', marginTop:8, paddingTop:4, paddingBottom:6, borderTop:'1px dotted #ddd'}}>
                    {s.synonyms.map((sw, j) => (
                      <span key={j} style={{display:'inline-flex', gap:3, alignItems:'center', fontSize:synSize}}>
                        <span style={{fontWeight:700, fontSize:synSize}}>{sw.word}</span>
                        {sw.syn && <span className="syn" style={{fontSize:synSize}}><span className="tag-s">S</span>{sw.syn}</span>}
                        {sw.ant && <span className="ant" style={{fontSize:synSize}}><span className="tag-a">A</span>{sw.ant}</span>}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </td>

            <td style={{fontSize:koSize * 0.95, lineHeight:1.65, padding:'6px 8px 0 8px', verticalAlign:'top'}}>
              {s.logic && (
                <span>
                  <span className="badge b-logic" style={{fontSize:koSize * 0.85, padding:'1px 4px'}}>{s.logic.split(' ')[0]}</span>
                  {s.logic}
                </span>
              )}
              {s.grammar && (
                <div style={{marginTop:3}}>
                  <span className="badge b-gram" style={{fontSize:koSize * 0.85, padding:'1px 4px'}}>어법</span>
                  {s.grammar}
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
