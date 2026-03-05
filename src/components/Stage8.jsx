const TAG_STYLES = {
  blank: { bg: '#ff4444' },
  gram:  { bg: '#1a1a1a' },
  wrong: { bg: '#e67e00' },
  order: { bg: '#2a5caa' },
}

export default function Stage8({ data, settings }) {
  const items = data?.items || []
  const enSize = settings?.enSize ?? 11.5
  const koSize = settings?.koSize ?? 10

  return (
    <div>
      <div className="passage-wrap-f" style={{fontSize:enSize, lineHeight:2.05}}>
        {items.map((item, i) => (
          <span key={i} style={{marginRight:4}}>
            <span style={{background: TAG_STYLES[item.type]?.bg, color:'#fff', fontSize:koSize*0.85, fontWeight:800, padding:'0 4px', borderRadius:2, verticalAlign:'middle', marginRight:1, fontFamily:'var(--font-sans)', display:'inline-block'}}>
              {item.label}
            </span>
            {item.type === 'blank' && <span className="blank-f"><span className="blank-num">{item.num})</span></span>}
            {(item.type === 'gram' || item.type === 'wrong') && (
              <span className="gram" style={{fontSize:enSize}}>{item.choices}<sup style={{fontSize:koSize*0.8, fontFamily:'var(--font-mono)', color:'#e00'}}>{item.num})</sup></span>
            )}
            {item.type === 'order' && (
              <span className="order-words" style={{fontSize:enSize}}>({item.words})<sup style={{fontSize:koSize*0.8, fontFamily:'var(--font-mono)', color:'#2a5caa'}}>{item.num})</sup></span>
            )}
          </span>
        ))}
      </div>
      <div className="answer-grid-f">
        {items.map((item, i) => (
          <div key={i} className="answer-item-f">
            <div className="q-label-f" style={{fontSize:koSize*0.8}}>{item.num}) {item.label}</div>
            <div className="q-box-f" />
          </div>
        ))}
      </div>
      {items.find(it => it.type === 'order') && (
        <div style={{border:'1px dotted #bbb', borderRadius:3, padding:'5px 10px', fontSize:koSize, color:'#444', marginBottom:8}}>
          {items.find(it => it.type === 'order')?.num}) 완성된 문장: _______________________________________________________________
        </div>
      )}
    </div>
  )
}
