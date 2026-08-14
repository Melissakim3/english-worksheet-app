import { useState } from 'react'

const FONT_WEIGHTS = [
  { label: '보통', value: 400 },
  { label: '중간', value: 500 },
  { label: 'Semi-bold', value: 600 },
  { label: 'Bold', value: 700 },
]

export default function Stage1({ data, settings }) {
  const sentences = data?.sentences || []
  const enSize = settings?.enSize ?? 11.5
  const koSize = settings?.koSize ?? 10
  const lh     = settings?.lineHeight ?? 3.0
  const synSize = koSize * 0.80

  const [enWeight, setEnWeight] = useState(500)
  const [enScale, setEnScale]   = useState(1.1)  // 1.0 ~ 1.4

  let sentenceNum = 0

  return (
    <div>
      {/* ── 영어 본문 스타일 컨트롤 ── */}
      <div className="stage-control-bar no-print">
        <div className="control-group">
          <span className="control-label">영어 굵기</span>
          <div className="control-chips">
            {FONT_WEIGHTS.map(fw => (
              <button key={fw.value}
                className={`ctrl-chip ${enWeight === fw.value ? 'active' : ''}`}
                onClick={() => setEnWeight(fw.value)}>
                {fw.label}
              </button>
            ))}
          </div>
        </div>
        <div className="control-group">
          <span className="control-label">영어 크기 {Math.round(enSize * enScale * 10) / 10}px</span>
          <input type="range" min={0.9} max={1.5} step={0.05} value={enScale}
            onChange={e => setEnScale(parseFloat(e.target.value))}
            style={{width:100, accentColor:'#1a1a1a'}}
          />
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style={{width:'46%'}}>영어 원문</th>
            <th style={{width:'26%'}}>한글 해석 / 동·반의어</th>
            <th style={{width:'28%'}}>논리 구조 / 문법</th>
          </tr>
        </thead>
        <tbody>
          {sentences.map((s, i) => {
            // ── 소제목(heading) 행: 표 전체 너비로 별도 표시 ──
            if (s.heading) {
              return (
                <tr key={i}>
                  <td colSpan={3} style={{
                    padding:'10px 8px 6px 8px',
                    borderTop: i === 0 ? 'none' : '1.5px solid #1a1a1a',
                  }}>
                    <span style={{
                      fontFamily:'Georgia, serif',
                      fontSize: enSize * enScale * 1.05,
                      fontWeight: 800,
                      color:'#1a1a1a',
                      letterSpacing: 0.3,
                    }}>{s.heading}</span>
                  </td>
                </tr>
              )
            }

            sentenceNum += 1
            const num = sentenceNum

            return (
              <tr key={i}>
                {/* 영어 원문 */}
                <td style={{
                  fontFamily:'Georgia, serif',
                  fontSize: enSize * enScale,
                  lineHeight: lh,
                  padding:'6px 8px 0 8px',
                  verticalAlign:'top',
                  color:'#1a1a1a',
                  fontWeight: enWeight,
                }}>
                  <span style={{
                    fontFamily:'var(--font-mono)',
                    fontSize: enSize * 0.82,
                    fontWeight: 900,
                    color: '#1a1a1a',
                    marginRight: 5,
                    verticalAlign: 'middle',
                    userSelect: 'none',
                  }}>{num}.</span>
                  {s.en}
                </td>

                {/* 한글 + 동의어/반의어 */}
                <td style={{fontSize:koSize, padding:'6px 8px 0 8px', verticalAlign:'top'}}>
                  <div style={{display:'flex', flexDirection:'column', height:'100%'}}>
                    <div style={{color:'#444', lineHeight:1.7, flex:1}}>{s.ko}</div>
                    {s.synonyms?.length > 0 && (
                      <div style={{
                        display:'flex', flexWrap:'wrap', gap:'2px 6px',
                        marginTop:8, paddingTop:4, paddingBottom:6,
                        borderTop:'1px dotted #ddd'
                      }}>
                        {s.synonyms.map((sw, j) => (
                          <span key={j} style={{display:'inline-flex', gap:2, alignItems:'center', fontSize:synSize}}>
                            <span style={{fontWeight:700, fontFamily:'Georgia, serif'}}>{sw.word}</span>
                            {sw.syn && (
                              <span style={{color:'#1a6e3a', fontSize:synSize}}>
                                <span style={{border:'1px solid #1a6e3a', borderRadius:2, fontSize:synSize*0.85, padding:'0 2px', marginRight:1, fontFamily:'var(--font-sans)'}}>S</span>
                                {sw.syn}
                              </span>
                            )}
                            {sw.ant && (
                              <span style={{color:'#b03030', fontSize:synSize}}>
                                <span style={{border:'1px solid #b03030', borderRadius:2, fontSize:synSize*0.85, padding:'0 2px', marginRight:1, fontFamily:'var(--font-sans)'}}>A</span>
                                {sw.ant}
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </td>

                {/* 논리/문법 */}
                <td style={{fontSize:koSize * 0.95, lineHeight:1.65, padding:'6px 8px 0 8px', verticalAlign:'top'}}>
                  {s.logic && (
                    <div>
                      <span className="badge b-logic" style={{fontSize:koSize * 0.85, padding:'1px 4px'}}>{s.logic.split(' ')[0]}</span>
                      {' '}{s.logic}
                    </div>
                  )}
                  {s.grammar && (
                    <div style={{marginTop:3}}>
                      <span className="badge b-gram" style={{fontSize:koSize * 0.85, padding:'1px 4px'}}>어법</span>
                      {' '}{s.grammar}
                    </div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
