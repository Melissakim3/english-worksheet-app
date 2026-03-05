import { useState } from 'react'

const MARK_STYLES = {
  highlight: null, // 기본 형광펜 (색상 배경)
  underline: 'underline',
  box: 'box',
  wave: 'wave',
  triangle: 'triangle',
}

const MARK_LABELS = {
  highlight: '🎨 형광펜',
  underline: '__ 밑줄',
  box: '□ 박스',
  wave: '〜 물결',
  triangle: '△ 세모',
}

// 형광펜 색상
const COLORS = ['#FFE066', '#85E89D', '#FFB3C6', '#79C8F5', '#D4AAFF']

// markStyle별 CSS 생성
function getMarkStyle(colorIdx, markStyle) {
  const color = COLORS[colorIdx % COLORS.length]
  switch(markStyle) {
    case 'underline':
      return { borderBottom: `2.5px solid ${color}`, paddingBottom: 1 }
    case 'box':
      return { border: `1.5px solid ${color}`, borderRadius: 2, padding: '0 2px' }
    case 'wave':
      return { borderBottom: `2px wavy ${color}`, paddingBottom: 2 }
    case 'triangle':
      return { position: 'relative', borderBottom: `2.5px solid ${color}`, paddingBottom: 1 }
    default: // highlight
      return { background: color, borderRadius: 2, padding: '0 1px' }
  }
}

// coloredPassage HTML에서 h1~h5 클래스를 markStyle에 맞게 재렌더링
function ColoredPassage({ html, markStyle, enSize }) {
  if (!html) return null
  // span.h1~h5 를 찾아서 인라인 스타일로 교체
  const processed = html.replace(
    /<span class=['"]h(\d)['"]>(.*?)<\/span>/g,
    (_, idx, text) => {
      const style = getMarkStyle(parseInt(idx)-1, markStyle)
      const styleStr = Object.entries(style).map(([k,v]) => {
        const kebab = k.replace(/([A-Z])/g, '-$1').toLowerCase()
        return `${kebab}:${v}`
      }).join(';')
      return `<span style="${styleStr}">${text}</span>`
    }
  )
  return (
    <div
      style={{fontFamily:'Georgia, serif', fontSize:enSize, lineHeight:2.1, marginBottom:12}}
      dangerouslySetInnerHTML={{__html: processed}}
    />
  )
}

export default function Stage2({ data, settings }) {
  const enSize = settings?.enSize ?? 11.5
  const koSize = settings?.koSize ?? 10

  const [lang, setLang] = useState('en')         // en / ko / both
  const [markStyle, setMarkStyle] = useState('highlight')

  return (
    <div>
      {/* ── 컨트롤 바 ── */}
      <div className="stage-control-bar no-print">
        {/* 언어 선택 */}
        <div className="control-group">
          <span className="control-label">지문 언어</span>
          <div className="control-chips">
            {[['en','영어'],['ko','한글'],['both','영어+한글']].map(([v,l]) => (
              <button key={v} className={`ctrl-chip ${lang===v?'active':''}`} onClick={() => setLang(v)}>{l}</button>
            ))}
          </div>
        </div>
        {/* 마킹 스타일 */}
        <div className="control-group">
          <span className="control-label">마킹 방식</span>
          <div className="control-chips">
            {Object.entries(MARK_LABELS).map(([v,l]) => (
              <button key={v} className={`ctrl-chip ${markStyle===v?'active':''}`} onClick={() => setMarkStyle(v)}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 범례 ── */}
      <div className="legend">
        {data.legend?.map((l, i) => {
          const style = getMarkStyle(i, markStyle)
          return (
            <div key={i} className="legend-item">
              <span style={{...style, fontSize: koSize, fontWeight:700, padding:'1px 6px'}}>{l.label}</span>
            </div>
          )
        })}
      </div>

      {/* ── 지문 ── */}
      {(lang === 'en' || lang === 'both') && (
        <ColoredPassage html={data.coloredPassage} markStyle={markStyle} enSize={enSize} />
      )}
      {(lang === 'ko' || lang === 'both') && data.coloredPassage && (
        <div style={{fontSize:koSize, lineHeight:2.0, marginBottom:12, color:'#444', fontStyle: lang==='both' ? 'italic' : 'normal'}}>
          {/* 한글 버전은 색상 없이 plain text — AI가 ko 버전 생성 안 했으므로 flowSummary 활용 */}
          <div style={{background:'#f9f6f0', border:'1px dotted #ddd', borderRadius:3, padding:'10px 14px'}}>
            <span style={{fontSize:koSize*0.85, color:'#aaa', display:'block', marginBottom:4}}>한글 해석</span>
            {data.flowSummary || '(한글 해석 준비 중)'}
          </div>
        </div>
      )}

      {/* ── 논리 흐름 ── */}
      <div className="flow-box">
        <div className="flow-label">논리 흐름 요약</div>
        <div className="flow-steps">
          {data.flowSteps?.map((step, i) => (
            <span key={i} style={{display:'flex', alignItems:'center', gap:5}}>
              {i > 0 && <span className="flow-arrow">→</span>}
              <span className="flow-step" style={{fontSize:enSize}}>
                {(lang === 'en' || lang === 'both') && step.label}
                {lang === 'both' && ' '}
                {(lang === 'ko' || lang === 'both') && <span className="flow-ko" style={{fontSize:koSize}}>({step.ko})</span>}
              </span>
            </span>
          ))}
        </div>
        {data.flowSummary && <p style={{fontSize:koSize, color:'#888', marginTop:8}}>{data.flowSummary}</p>}
      </div>
    </div>
  )
}
