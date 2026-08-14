import { useState } from 'react'
export default function Stage5({ data, settings }) {
  const keywords = data?.keywords || []
  const enSize = settings?.enSize ?? 11.5
  const koSize = settings?.koSize ?? 10
  const [lang, setLang] = useState('en') // en / ko / both
  return (
    <div>
      {/* ── 언어 선택 ── */}
      <div className="stage-control-bar no-print">
        <div className="control-group">
          <span className="control-label">표시 언어</span>
          <div className="control-chips">
            {[['en','영어'],['ko','한글'],['both','영어+한글']].map(([v,l]) => (
              <button key={v} className={`ctrl-chip ${lang===v?'active':''}`} onClick={() => setLang(v)}>{l}</button>
            ))}
          </div>
        </div>
      </div>
      {/* ── 키워드 칩 ── */}
      <div className="kw-row">
        <span className="kw-title" style={{fontSize:koSize}}>핵심 키워드</span>
        <div className="kw-chips">
          {keywords.map((kw, i) => (
            <span key={i} style={{display:'flex', alignItems:'center', gap:5}}>
              {i > 0 && <span className="kw-div">/</span>}
              <span className="kw-chip" style={{fontSize:enSize}}>
                {(lang === 'en' || lang === 'both') && kw.word}
                {lang === 'both' && ' '}
                {(lang === 'ko' || lang === 'both') && <span style={{fontSize:koSize, fontFamily:'var(--font-sans)', fontWeight:400}}>{kw.ko}</span>}
              </span>
            </span>
          ))}
        </div>
      </div>
      {/* ── 키워드 역할 ── */}
      <div className="kw-logic">
        {keywords.map((kw, i) => (
          <div key={i} className="logic-row">
            <span className="logic-word" style={{fontSize:enSize}}>
              {(lang === 'en' || lang === 'both') && kw.word}
              {(lang === 'ko' || lang === 'both') && (
                <span style={{fontSize:koSize, color:'#888', fontFamily:'var(--font-sans)', marginLeft: lang==='both'?4:0}}>
                  {kw.ko}
                </span>
              )}
            </span>
            <span className="logic-arrow">→</span>
            <span style={{color:'#444', fontSize:koSize}}>{kw.role}</span>
          </div>
        ))}
      </div>
      {/* ── 논리 흐름 ── */}
      {data.flowSummary && (
        <div className="flow-box" style={{marginTop:14}}>
          <div className="flow-label">전체 논리 흐름</div>
          <p style={{fontSize:koSize, lineHeight:1.7}}>{data.flowSummary}</p>
        </div>
      )}
    </div>
  )
}
