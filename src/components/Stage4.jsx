export default function Stage4({ data }) {
  const words = data?.words || []

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
            <td style={{color:'#bbb', fontSize:9.5, textAlign:'center'}}>{w.num}</td>
            <td style={{fontWeight:700, fontFamily:'Georgia, serif', fontSize:12.5}}>{w.word}</td>
            <td style={{fontSize:9, color:'#999', fontStyle:'italic'}}>{w.pos}</td>
            <td style={{fontSize:11}}>{w.meaning}</td>
            <td className="syn" style={{fontSize:11}}>
              {w.synonyms && w.synonyms !== '—' && <><span className="tag-s">S</span>{w.synonyms}</>}
            </td>
            <td className="ant" style={{fontSize:11}}>
              {w.antonyms && w.antonyms !== '—' && <><span className="tag-a">A</span>{w.antonyms}</>}
              {w.antonyms === '—' && <span style={{color:'#ddd'}}>—</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
