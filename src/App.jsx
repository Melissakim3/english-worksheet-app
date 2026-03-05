import { useState, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import {
  analyzeStage1, analyzeStage2, analyzeStage4, analyzeStage5,
  analyzeStage6, analyzeStage7, analyzeStage8
} from './utils/prompts.js'
import { MODELS, getSavedModelId, saveModelId } from './utils/ai.js'

import Stage1 from './components/Stage1.jsx'
import Stage2 from './components/Stage2.jsx'
import Stage3 from './components/Stage3.jsx'
import Stage4 from './components/Stage4.jsx'
import Stage5 from './components/Stage5.jsx'
import Stage6 from './components/Stage6.jsx'
import Stage7 from './components/Stage7.jsx'
import Stage8 from './components/Stage8.jsx'
import AnswerKey from './components/AnswerKey.jsx'
import ModelSelector from './components/ModelSelector.jsx'

const STAGES = [
  { id: 1, label: '구조 분석표' },
  { id: 2, label: '논리 흐름 색깔' },
  { id: 3, label: '4컷 만화' },
  { id: 4, label: '단어장' },
  { id: 5, label: '핵심 키워드' },
  { id: 6, label: '주제 분석' },
  { id: 7, label: '수능형 문제' },
  { id: 8, label: '어법 Final' },
]

export default function App() {
  const [passage, setPassage] = useState('')
  const [level, setLevel] = useState('고2')
  const [modelId, setModelId] = useState(getSavedModelId())
  const [selectedStages, setSelectedStages] = useState(new Set([1,2,3,4,5,6,7,8]))
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState([])
  const [results, setResults] = useState({})
  const [openStages, setOpenStages] = useState(new Set([1,2,3,4,5,6,7,8]))
  const [error, setError] = useState('')

  const printRef = useRef()
  const handlePrint = useReactToPrint({ content: () => printRef.current })

  const handleModelChange = (id) => {
    setModelId(id)
    saveModelId(id)
  }

  const toggleStage = (id) => {
    setSelectedStages(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setSelectedStages(
      selectedStages.size === STAGES.length
        ? new Set()
        : new Set(STAGES.map(s => s.id))
    )
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
    const needsAnthropic = model?.provider === 'anthropic'
    const needsOpenAI = model?.provider === 'openai'
    if (needsAnthropic && !import.meta.env.VITE_ANTHROPIC_API_KEY) {
      setError('.env에 VITE_ANTHROPIC_API_KEY를 설정해주세요.'); return
    }
    if (needsOpenAI && !import.meta.env.VITE_OPENAI_API_KEY) {
      setError('.env에 VITE_OPENAI_API_KEY를 설정해주세요.'); return
    }

    setError('')
    setLoading(true)
    setProgress([])
    setResults({})

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
        else if (stage.id === 5) {
          data = await analyzeStage5(passage, level, modelId)
          keywords = data.keywords || []
        }
        else if (stage.id === 6) data = await analyzeStage6(passage, keywords, level, modelId)
        else if (stage.id === 7) data = await analyzeStage7(passage, level, modelId)
        else if (stage.id === 8) data = await analyzeStage8(passage, level, modelId)

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

  const currentModel = MODELS.find(m => m.id === modelId) || MODELS[0]
  const hasResults = Object.keys(results).length > 0

  return (
    <div className="app-wrap">
      <div className="top-bar">
        <h1>영어 지문 분석 워크시트</h1>
        <span className="version">v1.0 · {currentModel.label}</span>
      </div>

      <div className="main-content">

        {/* ── 모델 선택 ── */}
        <ModelSelector selectedId={modelId} onChange={handleModelChange} />

        {/* ── 지문 입력 ── */}
        <div className="input-section no-print">
          <h2>지문 입력</h2>
          <textarea
            className="passage-input"
            placeholder="분석할 영어 지문을 붙여넣으세요..."
            value={passage}
            onChange={e => setPassage(e.target.value)}
          />
          <div className="input-row">
            <select className="level-select" value={level} onChange={e => setLevel(e.target.value)}>
              <option>고1</option>
              <option>고2</option>
              <option>고3</option>
            </select>
            {error && <span style={{ color: '#c00', fontSize: 11 }}>{error}</span>}
          </div>
        </div>

        {/* ── Stage 선택 ── */}
        <div className="stage-selector no-print">
          <div className="stage-selector-header">
            <h2>Stage 선택</h2>
            <button className="toggle-all-btn" onClick={toggleAll}>
              {selectedStages.size === STAGES.length ? '전체 해제' : '전체 선택'}
            </button>
          </div>
          <div className="stage-chips">
            {STAGES.map(s => (
              <div
                key={s.id}
                className={`stage-chip ${selectedStages.has(s.id) ? 'active' : 'inactive'}`}
                onClick={() => toggleStage(s.id)}
              >
                <span className="chip-num">{String(s.id).padStart(2,'0')}</span>
                {s.label}
                {s.id === 3 && <span style={{fontSize:9,opacity:0.5}}> (준비중)</span>}
              </div>
            ))}
          </div>
        </div>

        {/* ── 분석 버튼 ── */}
        <button
          className="analyze-btn no-print"
          onClick={analyze}
          disabled={loading || selectedStages.size === 0}
        >
          {loading ? '분석 중...' : `분석 시작 → (${currentModel.label})`}
        </button>

        {/* ── 진행 상황 ── */}
        {progress.length > 0 && (
          <div className="progress-wrap no-print">
            <div className="progress-title">진행 상황</div>
            <div className="progress-steps">
              {progress.map(p => {
                const stage = STAGES.find(s => s.id === p.id)
                return (
                  <div key={p.id} className={`progress-step ${p.status}`}>
                    <div className="step-dot" />
                    <span>
                      Stage {p.id} — {stage?.label}
                      {p.status === 'active' && ' 분석 중...'}
                      {p.status === 'done' && ' ✓'}
                      {p.status === 'error' && ' ✗ 오류'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── 워크시트 ── */}
        {hasResults && (
          <div className="worksheet-wrap">
            <div className="worksheet-toolbar no-print">
              <button className="print-btn" onClick={handlePrint}>인쇄 / PDF</button>
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

function StageBlock({ stage, data, passage, isOpen, onToggle }) {
  const components = { 1:Stage1, 2:Stage2, 3:Stage3, 4:Stage4, 5:Stage5, 6:Stage6, 7:Stage7, 8:Stage8 }
  const Component = components[stage.id]
  return (
    <div className="stage-block">
      <div className="stage-block-header" onClick={onToggle}>
        <span className="stage-badge">Stage {stage.id}</span>
        <span className="stage-block-title">{stage.label}</span>
        <span className="stage-toggle no-print">{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && (
        <div className="stage-block-content">
          {data.error
            ? <p style={{color:'#c00',fontSize:11}}>오류: {data.error}</p>
            : <Component data={data} passage={passage} />
          }
        </div>
      )}
    </div>
  )
}
