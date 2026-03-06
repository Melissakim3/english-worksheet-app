import { useState, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import {
  analyzeStage1, analyzeStage2, analyzeStage4, analyzeStage5,
  analyzeStage6, analyzeStage7, analyzeStage8, analyzeStage9
} from './utils/prompts.js'
import { MODELS, getSavedModelId, saveModelId } from './utils/ai.js'
import PrintControls, { loadSettings, DEFAULT_SETTINGS } from './components/PrintControls.jsx'
import { exportToWord } from './utils/exportWord.js'
import { extractTextFromPDF, splitPassagesWithAI, splitByDivider } from './utils/pdfExtract.js'

import Stage1 from './components/Stage1.jsx'
import Stage2 from './components/Stage2.jsx'
import Stage3 from './components/Stage3.jsx'
import Stage4 from './components/Stage4.jsx'
import Stage5 from './components/Stage5.jsx'
import Stage6 from './components/Stage6.jsx'
import Stage7 from './components/Stage7.jsx'
import Stage8 from './components/Stage8.jsx'
import Stage9 from './components/Stage9.jsx'
import AnswerKey from './components/AnswerKey.jsx'
import ModelSelector from './components/ModelSelector.jsx'

const STAGES = [
  { id: 1, label: '문장 뜯어보기' },
  { id: 2, label: '흐름 지도' },
  { id: 3, label: '4컷 만화' },
  { id: 4, label: '내 단어장' },
  { id: 5, label: '이 글의 핵심 3단어' },
  { id: 6, label: '주제 한 문장' },
  { id: 7, label: '실전 문제' },
  { id: 8, label: '어법 총정리' },
  { id: 9, label: '서술형 문제' },
]

// 각 Stage 별 초기 settings 불러오기
function loadStageSettings(id) {
  try {
    const saved = localStorage.getItem(`ws_stage_settings_${id}`)
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : loadSettings()
  } catch { return loadSettings() }
}

function saveStageSettings(id, s) {
  localStorage.setItem(`ws_stage_settings_${id}`, JSON.stringify(s))
}

export default function App() {
  const [passage, setPassage] = useState('')
  const [level, setLevel] = useState('고2')
  const [modelId, setModelId] = useState(getSavedModelId())
  const [selectedStages, setSelectedStages] = useState(new Set([1,2,3,4,5,6,7,8,9]))
  const [loading, setLoading] = useState(false)
  const [difficulty, setDifficulty] = useState('중')
  const [multiPassages, setMultiPassages] = useState([])   // 다중 지문 목록
  const [multiMode, setMultiMode] = useState(false)        // 다중 지문 모드
  const [multiResults, setMultiResults] = useState([])     // 각 지문 결과
  const [currentPassageIdx, setCurrentPassageIdx] = useState(0)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [wordDownloading, setWordDownloading] = useState(null)
  const [progress, setProgress] = useState([])
  const [results, setResults] = useState({})
  const [openStages, setOpenStages] = useState(new Set([1,2,3,4,5,6,7,8,9]))
  const [error, setError] = useState('')

  // 각 Stage 개별 settings
  const [stageSettings, setStageSettings] = useState(() =>
    Object.fromEntries(STAGES.map(s => [s.id, loadStageSettings(s.id)]))
  )

  const updateStageSetting = (id, newSettings) => {
    saveStageSettings(id, newSettings)
    setStageSettings(prev => ({ ...prev, [id]: newSettings }))
  }

  const [wordLoading, setWordLoading] = useState(false)
  const printRef = useRef()
  const handlePrint = useReactToPrint({ content: () => printRef.current })

  const handleWordExport = async () => {
    setWordLoading(true)
    try {
      await exportToWord(results, passage)
    } catch(e) {
      alert('Word 파일 생성 오류: ' + e.message)
    }
    setWordLoading(false)
  }

  const handleModelChange = (id) => { setModelId(id); saveModelId(id) }

  const toggleStage = (id) => {
    setSelectedStages(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setSelectedStages(selectedStages.size === STAGES.length ? new Set() : new Set(STAGES.map(s => s.id)))
  }

  const toggleOpenStage = (id) => {
    setOpenStages(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const setStageProgress = (id, status) => {
    setProgress(prev => {
      const exists = prev.find(p => p.id === id)
      if (exists) return prev.map(p => p.id === id ? { ...p, status } : p)
      return [...prev, { id, status }]
    })
  }

  const analyze = async () => {
    if (!passage.trim()) { setError('지문을 입력해주세요.'); return }
    const model = MODELS.find(m => m.id === modelId)
    // 선택한 모델의 provider에 해당하는 키만 확인
    if (model?.provider === 'anthropic' && !import.meta.env.VITE_ANTHROPIC_API_KEY) {
      setError('Anthropic API 키가 없습니다. GPT 모델을 선택하거나 Anthropic 키를 설정해주세요.'); return
    }
    if (model?.provider === 'openai' && !import.meta.env.VITE_OPENAI_API_KEY) {
      setError('OpenAI API 키가 없습니다. Claude 모델을 선택하거나 OpenAI 키를 설정해주세요.'); return
    }

    setError(''); setLoading(true); setProgress([]); setResults({}); setMultiResults([])
    const sorted = STAGES.filter(s => selectedStages.has(s.id))
    const newResults = {}
    let keywords = []

    for (const stage of sorted) {
      setStageProgress(stage.id, 'active')
      try {
        let data
        if (stage.id === 1) data = await analyzeStage1(passage, level, modelId)
        else if (stage.id === 2) data = await analyzeStage2(passage, level, modelId)
        else if (stage.id === 3) data = { placeholder: true }
        else if (stage.id === 4) data = await analyzeStage4(passage, level, modelId)
        else if (stage.id === 5) { data = await analyzeStage5(passage, level, modelId); keywords = data.keywords || [] }
        else if (stage.id === 6) data = await analyzeStage6(passage, keywords, level, modelId)
        else if (stage.id === 7) data = await analyzeStage7(passage, level, modelId)
        else if (stage.id === 8) data = await analyzeStage8(passage, level, modelId)
        else if (stage.id === 9) data = await analyzeStage9(passage, level, difficulty, modelId)
        newResults[stage.id] = data
        setResults({ ...newResults })
        setStageProgress(stage.id, 'done')
      } catch (e) {
        setStageProgress(stage.id, 'error')
        newResults[stage.id] = { error: e.message }
        setResults({ ...newResults })
      }
    }
    setLoading(false)
  }

  // PDF 업로드 처리
  const handlePDFUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPdfLoading(true)
    try {
      const rawText = await extractTextFromPDF(file)
      const passages = await splitPassagesWithAI(rawText, modelId)
      if (passages.length === 0) {
        setError('지문을 찾을 수 없어요. 텍스트로 직접 붙여넣어 주세요.')
      } else {
        setMultiPassages(passages)
        setMultiMode(true)
        setMultiResults([])
        setError('')
      }
    } catch (err) {
      setError('PDF 읽기 오류: ' + err.message)
    }
    setPdfLoading(false)
    e.target.value = ''
  }

  // 텍스트 붙여넣기 → --- 구분
  const handleMultiPaste = () => {
    const passages = splitByDivider(passage)
    if (passages.length <= 1) {
      setError('--- 구분자가 없어요. 지문 사이에 --- 를 넣어주세요.')
      return
    }
    setMultiPassages(passages)
    setMultiMode(true)
    setMultiResults([])
    setError('')
  }

  // 다중 지문 일괄 분석
  const analyzeAll = async () => {
    if (multiPassages.length === 0) return
    const model = MODELS.find(m => m.id === modelId)
    if (model?.provider === 'anthropic' && !import.meta.env.VITE_ANTHROPIC_API_KEY) {
      setError('API 키가 없습니다.'); return
    }
    setLoading(true)
    setError('')
    const allResults = []
    for (let pi = 0; pi < multiPassages.length; pi++) {
      const psg = multiPassages[pi]
      setCurrentPassageIdx(pi)
      const sorted = STAGES.filter(s => selectedStages.has(s.id))
      const newResults = {}
      let keywords = []
      setProgress([])
      for (const stage of sorted) {
        setStageProgress(stage.id, 'active')
        try {
          let data
          if (stage.id === 1) data = await analyzeStage1(psg, level, modelId)
          else if (stage.id === 2) data = await analyzeStage2(psg, level, modelId)
          else if (stage.id === 3) data = { placeholder: true }
          else if (stage.id === 4) data = await analyzeStage4(psg, level, modelId)
          else if (stage.id === 5) { data = await analyzeStage5(psg, level, modelId); keywords = data.keywords || [] }
          else if (stage.id === 6) data = await analyzeStage6(psg, keywords, level, modelId)
          else if (stage.id === 7) data = await analyzeStage7(psg, level, modelId)
          else if (stage.id === 8) data = await analyzeStage8(psg, level, modelId)
          else if (stage.id === 9) data = await analyzeStage9(psg, level, difficulty, modelId)
          newResults[stage.id] = data
          setStageProgress(stage.id, 'done')
        } catch (err) {
          newResults[stage.id] = { error: err.message }
          setStageProgress(stage.id, 'error')
        }
      }
      allResults.push({ passage: psg, results: newResults })
      setMultiResults([...allResults])
    }
    setLoading(false)
  }

  // 개별 Word 다운로드
  const downloadWordForPassage = async (psg, res, idx) => {
    setWordDownloading(idx)
    try {
      await exportToWord(res, psg)
    } catch (e) {
      setError('Word 생성 오류: ' + e.message)
    }
    setWordDownloading(null)
  }

  const currentModel = MODELS.find(m => m.id === modelId) || MODELS[0]
  const hasResults = Object.keys(results).length > 0

  return (
    <div className="app-wrap">
      <div className="top-bar">
        <h1>영어 지문 분석 워크시트</h1>
        <span className="version">v1.0 · {currentModel.label}</span>
      </div>

      <div className="main-content">
        <ModelSelector selectedId={modelId} onChange={handleModelChange} />

        <div className="input-section no-print">
          <h2>지문 입력</h2>

          {/* 탭: 단일 / 여러 지문 */}
          <div style={{display:'flex', gap:8, marginBottom:10}}>
            <button onClick={() => { setMultiMode(false); setMultiPassages([]); setMultiResults([]) }}
              style={{padding:'4px 14px', border:'1.5px solid #1a1a1a', borderRadius:3, cursor:'pointer',
                background: !multiMode ? '#1a1a1a' : '#fff', color: !multiMode ? '#fff' : '#1a1a1a',
                fontWeight:700, fontSize:12}}>단일 지문</button>
            <button onClick={() => setMultiMode(true)}
              style={{padding:'4px 14px', border:'1.5px solid #1a1a1a', borderRadius:3, cursor:'pointer',
                background: multiMode ? '#1a1a1a' : '#fff', color: multiMode ? '#fff' : '#1a1a1a',
                fontWeight:700, fontSize:12}}>여러 지문</button>
          </div>

          {!multiMode ? (
            <textarea className="passage-input" placeholder="분석할 영어 지문을 붙여넣으세요..."
              value={passage} onChange={e => setPassage(e.target.value)} />
          ) : (
            <div>
              <textarea className="passage-input"
                placeholder="여러 지문을 붙여넣을 때는 지문 사이에 --- 를 넣어주세요. 예) 지문1... --- 지문2... --- 지문3..."
                value={passage} onChange={e => setPassage(e.target.value)} />
              <div style={{display:'flex', gap:8, marginTop:8, flexWrap:'wrap'}}>
                <button onClick={handleMultiPaste}
                  style={{padding:'6px 14px', background:'#2a5caa', color:'#fff', border:'none',
                    borderRadius:3, cursor:'pointer', fontWeight:700, fontSize:12}}>
                  ✂️ --- 로 지문 분리
                </button>
                <label style={{padding:'6px 14px', background:'#1a6e3a', color:'#fff',
                  borderRadius:3, cursor:'pointer', fontWeight:700, fontSize:12}}>
                  📄 PDF 업로드
                  <input type="file" accept=".pdf" onChange={handlePDFUpload} style={{display:'none'}} />
                </label>
                {pdfLoading && <span style={{fontSize:12, color:'#888', alignSelf:'center'}}>⏳ PDF 분석 중...</span>}
              </div>
              {multiPassages.length > 0 && (
                <div style={{marginTop:10, padding:'10px 14px', background:'#f5f2ed',
                  borderRadius:3, border:'1px solid #ddd'}}>
                  <div style={{fontWeight:700, fontSize:12, marginBottom:8}}>
                    📚 감지된 지문 {multiPassages.length}개
                  </div>
                  {multiPassages.map((p, i) => (
                    <div key={i} style={{display:'flex', gap:8, alignItems:'flex-start', marginBottom:6}}>
                      <span style={{background:'#1a1a1a', color:'#fff', fontSize:10, fontWeight:800,
                        padding:'1px 6px', borderRadius:2, flexShrink:0, marginTop:2}}>#{i+1}</span>
                      <span style={{fontSize:11, color:'#555', lineHeight:1.5}}>
                        {p.slice(0, 80)}...
                      </span>
                      {multiResults[i] && (
                        <button onClick={() => downloadWordForPassage(multiPassages[i], multiResults[i].results, i)}
                          disabled={wordDownloading === i}
                          style={{marginLeft:'auto', padding:'2px 10px', background:'#2b579a', color:'#fff',
                            border:'none', borderRadius:2, cursor:'pointer', fontSize:11, flexShrink:0}}>
                          {wordDownloading === i ? '⏳' : '📄 Word'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="input-row" style={{marginTop:8}}>
            <select className="level-select" value={level} onChange={e => setLevel(e.target.value)}>
              <option>고1</option><option>고2</option><option>고3</option>
            </select>
            <select className="level-select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              <option value="중">서술형 중</option>
              <option value="상">서술형 상</option>
            </select>
            {error && <span style={{color:'#c00', fontSize:11}}>{error}</span>}
          </div>
        </div>

        <div className="stage-selector no-print">
          <div className="stage-selector-header">
            <h2>Stage 선택</h2>
            <button className="toggle-all-btn" onClick={toggleAll}>
              {selectedStages.size === STAGES.length ? '전체 해제' : '전체 선택'}
            </button>
          </div>
          <div className="stage-chips">
            {STAGES.map(s => (
              <div key={s.id} className={`stage-chip ${selectedStages.has(s.id) ? 'active' : 'inactive'}`} onClick={() => toggleStage(s.id)}>
                <span className="chip-num">{String(s.id).padStart(2,'0')}</span>
                {s.label}
                {s.id === 3 && <span style={{fontSize:9,opacity:0.5}}> (준비중)</span>}
              </div>
            ))}
          </div>
        </div>

        <button className="analyze-btn no-print"
          onClick={multiMode && multiPassages.length > 0 ? analyzeAll : analyze}
          disabled={loading || selectedStages.size === 0}>
          {loading
            ? multiMode
              ? `⏳ 지문 ${currentPassageIdx + 1}/${multiPassages.length} 분석 중...`
              : '분석 중...'
            : multiMode && multiPassages.length > 0
              ? `🚀 ${multiPassages.length}개 지문 일괄 분석 (${currentModel.label})`
              : `분석 시작 → (${currentModel.label})`
          }
        </button>

        {progress.length > 0 && (
          <div className="progress-wrap no-print">
            <div className="progress-title">진행 상황</div>
            <div className="progress-steps">
              {progress.map(p => {
                const stage = STAGES.find(s => s.id === p.id)
                return (
                  <div key={p.id} className={`progress-step ${p.status}`}>
                    <div className="step-dot" />
                    <span>{stage?.label}{p.status === 'active' && ' 분석 중...'}{p.status === 'done' && ' ✓'}{p.status === 'error' && ' ✗ 오류'}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 다중 지문 결과 */}
        {multiMode && multiResults.length > 0 && (
          <div className="worksheet-wrap">
            {/* 전체 다운로드 버튼 */}
            <div className="worksheet-toolbar no-print">
              <span style={{fontWeight:700, fontSize:13}}>
                📚 {multiResults.length}개 지문 분석 완료
                {multiResults.length < multiPassages.length && ` (${multiPassages.length - multiResults.length}개 분석 중...)`}
              </span>
              <button className="print-btn word-btn"
                onClick={async () => {
                  for (let i = 0; i < multiResults.length; i++) {
                    await downloadWordForPassage(multiPassages[i], multiResults[i].results, i)
                    await new Promise(r => setTimeout(r, 800))
                  }
                }}
                disabled={wordDownloading !== null}>
                {wordDownloading !== null ? `⏳ Word 생성 중 (${wordDownloading + 1}/${multiResults.length})...` : `📄 전체 Word 다운로드 (${multiResults.length}개)`}
              </button>
            </div>

            {/* 지문별 결과 */}
            {multiResults.map((mr, pi) => (
              <div key={pi} style={{marginBottom:32, borderTop: pi > 0 ? '3px solid #1a1a1a' : 'none', paddingTop: pi > 0 ? 24 : 0}}>
                <div className="no-print" style={{display:'flex', alignItems:'center', gap:12, marginBottom:12,
                  padding:'8px 14px', background:'#f5f2ed', borderRadius:3}}>
                  <span style={{background:'#1a1a1a', color:'#fff', fontWeight:800, fontSize:12,
                    padding:'2px 10px', borderRadius:2}}>지문 {pi + 1}</span>
                  <span style={{fontSize:12, color:'#666', flex:1}}>{mr.passage.slice(0, 60)}...</span>
                  <button onClick={() => downloadWordForPassage(mr.passage, mr.results, pi)}
                    disabled={wordDownloading === pi}
                    style={{padding:'4px 12px', background:'#2b579a', color:'#fff', border:'none',
                      borderRadius:2, cursor:'pointer', fontSize:12, fontWeight:700}}>
                    {wordDownloading === pi ? '⏳' : '📄 Word'}
                  </button>
                </div>
                <div ref={pi === 0 ? printRef : null}>
                  {STAGES.filter(s => mr.results[s.id]).map(s => (
                    <StageBlock
                      key={s.id}
                      stage={s}
                      data={mr.results[s.id]}
                      passage={mr.passage}
                      isOpen={openStages.has(s.id)}
                      onToggle={() => toggleOpenStage(s.id)}
                      settings={stageSettings[s.id]}
                      onSettingsChange={(ns) => updateStageSetting(s.id, ns)}
                    />
                  ))}
                  <AnswerKey results={mr.results} selectedStages={selectedStages} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 단일 지문 결과 */}
        {multiResults.length === 0 && hasResults && (
          <div className="worksheet-wrap">
            <div className="worksheet-toolbar no-print">
              <button className="print-btn" onClick={handlePrint}>인쇄 / PDF</button>
              <button className="print-btn word-btn" onClick={handleWordExport} disabled={wordLoading}>
                {wordLoading ? '⏳ Word 생성 중...' : '📄 Word 다운로드'}
              </button>
              <button className="print-btn outline" onClick={() => setOpenStages(new Set(STAGES.map(s=>s.id)))}>전체 펼치기</button>
              <button className="print-btn outline" onClick={() => setOpenStages(new Set())}>전체 접기</button>
            </div>
            <div ref={printRef}>
              {STAGES.filter(s => results[s.id]).map(s => (
                <StageBlock
                  key={s.id}
                  stage={s}
                  data={results[s.id]}
                  passage={passage}
                  isOpen={openStages.has(s.id)}
                  onToggle={() => toggleOpenStage(s.id)}
                  settings={stageSettings[s.id]}
                  onSettingsChange={(ns) => updateStageSetting(s.id, ns)}
                />
              ))}
              <AnswerKey results={results} selectedStages={selectedStages} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StageBlock({ stage, data, passage, isOpen, onToggle, settings, onSettingsChange }) {
  const components = { 1:Stage1, 2:Stage2, 3:Stage3, 4:Stage4, 5:Stage5, 6:Stage6, 7:Stage7, 8:Stage8, 9:Stage9 }
  const Component = components[stage.id]

  return (
    <div className="stage-block">
      <div className="stage-block-header" onClick={onToggle}>
        <span className="stage-badge">Stage {stage.id}</span>
        <span className="stage-block-title">{stage.label}</span>
        <span className="stage-toggle no-print">{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && (
        <>
          <PrintControls settings={settings} onChange={onSettingsChange} />
          <div className="stage-block-content">
            {data.error
              ? <p style={{color:'#c00', fontSize:11}}>오류: {data.error}</p>
              : <Component data={data} passage={passage} settings={settings} />
            }
          </div>
        </>
      )}
    </div>
  )
}
