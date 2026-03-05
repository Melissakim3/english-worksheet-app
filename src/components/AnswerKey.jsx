export default function AnswerKey({ results, selectedStages }) {
  const hasQ7 = results[7] && !results[7].error
  const hasQ8 = results[8] && !results[8].error
  if (!hasQ7 && !hasQ8) return null

  const q7 = results[7] || {}
  const q8 = results[8] || {}

  return (
    <div className="answer-key-section">
      <div className="answer-key-header">정답 및 해설 — 교사용 (학생 배부 금지)</div>

      {/* Stage 7 answers */}
      {hasQ7 && (
        <>
          <div className="ans-stage-title">Stage 7 — 수능형 문제</div>
          <table>
            <thead>
              <tr>
                <th>#</th><th>유형</th><th>정답</th><th>해설</th>
              </tr>
            </thead>
            <tbody>
              {['q1','q2','q3','q4','q5'].map((qk, i) => {
                const q = q7[qk]
                if (!q) return null
                return (
                  <tr key={qk}>
                    <td className="ans-num">{i+1}</td>
                    <td className="ans-type">{q.type}</td>
                    <td className="ans-answer">{q.answer}</td>
                    <td className="ans-note">{q.explanation}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </>
      )}

      {/* Stage 8 answers */}
      {hasQ8 && q8.items && (
        <>
          <div className="ans-stage-title" style={{marginTop:14}}>Stage 8 — 어법 Final</div>
          <table>
            <thead>
              <tr>
                <th>#</th><th>유형</th><th>정답</th><th>해설</th>
              </tr>
            </thead>
            <tbody>
              {q8.items.map((item, i) => (
                <tr key={i}>
                  <td className="ans-num">{item.num}</td>
                  <td className="ans-type">{item.label}</td>
                  <td className="ans-answer" style={{fontSize:10}}>{item.answer}</td>
                  <td className="ans-note">{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
