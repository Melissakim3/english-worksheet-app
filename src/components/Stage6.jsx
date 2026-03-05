export default function Stage6({ data, settings }) {
  const sentences = data?.topicSentences || []
  const enSize = settings?.enSize ?? 11.5
  const koSize = settings?.koSize ?? 10

  return (
    <table>
      <thead>
        <tr>
          <th style={{width:'10%'}}>키워드</th>
          <th style={{width:'10%'}}>유형</th>
          <th style={{width:'43%'}}>주제 표현</th>
          <th style={{width:'37%'}}>한글 해석</th>
        </tr>
      </thead>
      <tbody>
        {sentences.map((s, i) => (
          <tr key={i}>
            <td><span className={`kw-inline ${s.kwClass}-color`} style={{fontSize:enSize}}>{s.keyword}</span></td>
            <td><span className={`type-badge ${s.typeBadge}`}>{s.type}</span></td>
            <td style={{fontFamily:'Georgia, serif', fontSize:enSize, lineHeight:1.7}}>{s.en}</td>
            <td style={{fontSize:koSize, lineHeight:1.7, color:'#555'}}>{s.ko}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
