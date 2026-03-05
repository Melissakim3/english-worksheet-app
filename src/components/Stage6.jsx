export default function Stage6({ data }) {
  const sentences = data?.topicSentences || []

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
            <td>
              <span className={`kw-inline ${s.kwClass}-color`}>{s.keyword}</span>
            </td>
            <td>
              <span className={`type-badge ${s.typeBadge}`}>{s.type}</span>
            </td>
            <td className="en-text">{s.en}</td>
            <td className="ko-text">{s.ko}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
