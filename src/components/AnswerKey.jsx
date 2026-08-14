export default function AnswerKey({ results, selectedStages }) {
  const q6 = results[6]
  const q7 = results[7]
  const q8 = results[8]
  const q9 = results[9]

  const hasQ6 = q6 && !q6.error
  const hasQ7 = q7 && !q7.error
  const hasQ8 = q8 && !q8.error && q8.items
  const hasQ9 = q9 && !q9.error

  if (!hasQ6 && !hasQ7 && !hasQ8 && !hasQ9) return null

  const rowStyle = { display:'flex', flexWrap:'wrap', gap:'6px 16px', fontSize:11, lineHeight:1.8 }
  const chipStyle = { whiteSpace:'nowrap' }
  const stageLabel = { fontWeight:800, marginRight:4 }

  return (
    <div className="answer-key-section">
      <div className="answer-key-header">정답 — 교사용 (학생 배부 금지)</div>

      {/* Stage 6 — 주제 (선택지 1문항) */}
      {hasQ6 && (
        <div style={rowStyle}>
          <span style={stageLabel}>[Stage6 주제]</span>
          <span style={chipStyle}>정답 {q6.answer}</span>
        </div>
      )}

      {/* Stage 7 — 요약문 빈칸 */}
      {hasQ7 && (
        <div style={rowStyle}>
          <span style={stageLabel}>[Stage7 요약문빈칸]</span>
          <span style={chipStyle}>정답 {q7.answer}</span>
          {q7.blanks?.map((b, i) => (
            <span key={i} style={chipStyle}>({b.key}) {b.answer}</span>
          ))}
        </div>
      )}

      {/* Stage 8 — 어법 10문항 */}
      {hasQ8 && (
        <div style={rowStyle}>
          <span style={stageLabel}>[Stage8 어법]</span>
          {q8.items.map((item, i) => (
            <span key={i} style={chipStyle}>
              {item.num}. {item.answer || item.correctWord}
            </span>
          ))}
        </div>
      )}

      {/* Stage 9 — 서술형 2문항 */}
      {hasQ9 && (
        <div style={rowStyle}>
          <span style={stageLabel}>[Stage9 서술형]</span>
          {q9.q1 && <span style={chipStyle}>1. {q9.q1.answer}</span>}
          {q9.q2 && <span style={chipStyle}>2. {q9.q2.answer}</span>}
        </div>
      )}
    </div>
  )
}
