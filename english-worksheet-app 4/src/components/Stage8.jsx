const TAG_COLORS = {
  blank:   '#c00000',
  gram:    '#1a1a1a',
  active:  '#1a6e3a',   // 능동
  passive: '#2a5caa',   // 수동
  participle: '#7b3fa0',// 분사구문
  wrong:   '#e67e00',
  order:   '#2a5caa',
}

const TAG_LABELS = {
  blank: '빈칸', gram: '어법', active: '능동', passive: '수동',
  participle: '분사구문', wrong: '알맞지않은단어', order: '순서배열'
}

export default function Stage8({ data, settings }) {
  const enSize = settings?.enSize ?? 11.5
  const koSize = settings?.koSize ?? 10
  const items = data?.items || []
  const passage = data?.passage || ''   // ← 지문 필드

  return (
    <div>
      {/* 지문 전체 표시 — 문제 번호 표시 포함 */}
      {passage && (
        <div style={{
          fontFamily:'Georgia, serif', fontSize:enSize, lineHeight:2.2,
          marginBottom:16, padding:'12px 16px',
          border:'1px solid #ddd', borderRadius:4,
          background:'#fafafa'
        }}
          dangerouslySetInnerHTML={{__html: passage}}
        />
      )}

      {/* 문제 목록 */}
      {!passage && items.length > 0 && (
        <div style={{
          fontFamily:'Georgia, serif', fontSize:enSize, lineHeight:2.2,
          marginBottom:16, padding:'12px 16px',
          border:'1px solid #ddd', borderRadius:4, background:'#fafafa',
          color:'#aaa', fontSize:koSize
        }}>
          * 지문이 아직 로드되지 않았거나, AI가 passage 필드를 생성하지 않았습니다.
        </div>
      )}

      {/* 답안 작성 칸 */}
      <div className="answer-grid-f">
        {items.map((item, i) => (
          <div key={i} className="answer-item-f">
            <div className="q-label-f" style={{fontSize:koSize*0.8}}>
              <span style={{
                background: TAG_COLORS[item.type] || '#1a1a1a',
                color:'#fff', fontSize:koSize*0.75, fontWeight:800,
                padding:'0 4px', borderRadius:2, marginRight:3,
                fontFamily:'var(--font-sans)'
              }}>{TAG_LABELS[item.type] || item.label}</span>
              {item.num})
            </div>
            <div className="q-box-f" />
          </div>
        ))}
      </div>

      {items.find(it => it.type === 'order') && (
        <div style={{border:'1px dotted #bbb', borderRadius:3, padding:'5px 10px',
          fontSize:koSize, color:'#444', marginBottom:8}}>
          {items.find(it => it.type === 'order')?.num}) 완성된 문장: _______________________________________________________________
        </div>
      )}
    </div>
  )
}
