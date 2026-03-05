export default function Stage1({ data }) {
  const sentences = data?.sentences || []

  return (
    <table>
      <thead>
        <tr>
          <th style={{width:'48%'}}>영어 원문</th>
          <th style={{width:'24%'}}>한글 해석</th>
          <th style={{width:'28%'}}>논리 구조 / 문법</th>
        </tr>
      </thead>
      <tbody>
        {sentences.map((s, i) => (
          <tr key={i}>
            {/* 영어 원문 — 9px */}
            <td style={{fontFamily:'Georgia, serif', fontSize:9, lineHeight:1.7}}>
              {s.en}
              {s.synonyms?.length > 0 && (
                <div style={{marginTop:3}}>
                  {s.synonyms.map((sw, j) => (
                    <span key={j} style={{display:'inline-flex', gap:3, marginRight:6, fontSize:8}}>
                      <span style={{fontWeight:700}}>{sw.word}</span>
                      {sw.syn && <span className="syn"><span className="tag-s">S</span>{sw.syn}</span>}
                      {sw.ant && <span className="ant"><span className="tag-a">A</span>{sw.ant}</span>}
                    </span>
                  ))}
                </div>
              )}
            </td>
            {/* 한글 해석 — 8px */}
            <td style={{color:'#444', fontSize:8, lineHeight:1.65}}>
              {s.ko}
            </td>
            {/* 논리/문법 — 7.5px */}
            <td style={{fontSize:7.5, lineHeight:1.6}}>
              {s.logic && (
                <span>
                  <span className="badge b-logic" style={{fontSize:7, padding:'1px 4px'}}>
                    {s.logic.split(' ')[0]}
                  </span>
                  {s.logic}
                </span>
              )}
              {s.grammar && (
                <div style={{marginTop:2}}>
                  <span className="badge b-gram" style={{fontSize:7, padding:'1px 4px'}}>어법</span>
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
