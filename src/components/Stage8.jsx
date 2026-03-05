const TAG_STYLES = {
  blank: { bg: '#ff4444', label: '빈칸' },
  gram:  { bg: '#1a1a1a', label: '어법' },
  wrong: { bg: '#e67e00', label: '알맞지않은단어' },
  order: { bg: '#2a5caa', label: '순서배열' },
}

export default function Stage8({ data }) {
  const items = data?.items || []

  return (
    <div>
      <div className="passage-wrap-f">
        {items.map((item, i) => (
          <span key={i} style={{marginRight:4}}>
            <span className="tag-f" style={{background: TAG_STYLES[item.type]?.bg, color:'#fff', fontSize:'8.5px', fontWeight:800, padding:'0 4px', borderRadius:2, verticalAlign:'middle', marginRight:1, fontFamily:'var(--font-sans)'}}>
              {item.label}
            </span>
            {item.type === 'blank' && (
              <span>
                <span className="blank-f"><span className="blank-num">{item.num})</span></span>
              </span>
            )}
            {(item.type === 'gram' || item.type === 'wrong') && (
              <span className="gram">{item.choices}<sup style={{fontSize:8, fontFamily:'var(--font-mono)', color:'#e00'}}>{item.num})</sup></span>
            )}
            {item.type === 'order' && (
              <span className="order-words">({item.words})<sup style={{fontSize:8, fontFamily:'var(--font-mono)', color:'#2a5caa'}}>{item.num})</sup></span>
            )}
          </span>
        ))}
      </div>

      {/* Answer grid */}
      <div className="answer-grid-f">
        {items.map((item, i) => (
          <div key={i} className="answer-item-f">
            <div className="q-label-f">{item.num}) {item.label}</div>
            <div className="q-box-f" />
          </div>
        ))}
      </div>

      {/* Ordering line */}
      {items.find(it => it.type === 'order') && (
        <div style={{border:'1px dotted #bbb', borderRadius:3, padding:'5px 10px', fontSize:11.5, color:'#444', marginBottom:8}}>
          {items.find(it => it.type === 'order')?.num}) 완성된 문장: _______________________________________________________________
        </div>
      )}
    </div>
  )
}
