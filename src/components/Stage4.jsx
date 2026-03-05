export default function Stage4({ data, settings }) {
  const words = data?.words || []
  const enSize = settings?.enSize ?? 11.5
  const koSize = settings?.koSize ?? 10

  return (
    <table>
      <thead>
        <tr>
          <th style={{width:'4%'}}>#</th>
          <th style={{width:'16%'}}>단어</th>
          <th style={{width:'7%'}}>품사</th>
          <th style={{width:'17%'}}>한글 뜻</th>
          <th style={{width:'28%'}}>동의어</th>
          <th style={{width:'28%'}}>반의어</th>
        </tr>
      </thead>
      <tbody>
        {words.map((w, i) => (
          <tr key={i}>
            <td style={{color:'#bbb', fontSize:koSize*0.9, textAlign:'center'}}>{w.num}</td>
            <td style={{fontWeight:700, fontFamily:'Georgia, serif', fontSize:enSize}}>{w.word}</td>
            <td style={{fontSize:koSize*0.85, color:'#999', fontStyle:'italic'}}>{w.pos}</td>
            <td style={{fontSize:koSize}}>{w.meaning}</td>
            <td className="syn" style={{fontSize:koSize}}>
              {w.synonyms && w.synonyms !== '—' && <><span className="tag-s">S</span>{w.synonyms}</>}
            </td>
            <td className="ant" style={{fontSize:koSize}}>
              {w.antonyms && w.antonyms !== '—' && <><span className="tag-a">A</span>{w.antonyms}</>}
              {w.antonyms === '—' && <span style={{color:'#ddd'}}>—</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
