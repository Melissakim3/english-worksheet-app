// 지원 모델 목록 — 여기서 추가/제거 가능
export const MODELS = [
  {
    id: 'claude-haiku-4-5-20251001',
    label: 'Claude Haiku 4.5',
    provider: 'anthropic',
    note: '빠름 · 저렴 · 약 70원/지문',
    badge: '⚡ 추천',
  },
  {
    id: 'claude-sonnet-4-5-20251101',
    label: 'Claude Sonnet 4.5',
    provider: 'anthropic',
    note: '고품질 · 수능 최적 · 약 200원/지문',
    badge: '🏆 최고품질',
  },
  {
    id: 'claude-sonnet-4-20250514',
    label: 'Claude Sonnet 4',
    provider: 'anthropic',
    note: '균형 · 약 200원/지문',
    badge: '',
  },
  {
    id: 'gpt-4.1-mini',
    label: 'GPT-4.1 mini',
    provider: 'openai',
    note: '가성비 최고 · 약 35원/지문',
    badge: '💰 가성비',
  },
  {
    id: 'gpt-4.1',
    label: 'GPT-4.1',
    provider: 'openai',
    note: '고성능 · 약 130원/지문',
    badge: '',
  },
  {
    id: 'gpt-4.1-nano',
    label: 'GPT-4.1 nano',
    provider: 'openai',
    note: '초저가 · 약 10원/지문',
    badge: '',
  },
]

export const DEFAULT_MODEL_ID = 'claude-haiku-4-5-20251001'

// ── 저장/불러오기 (localStorage) ──────────────────────
export function getSavedModelId() {
  return localStorage.getItem('ws_model_id') || DEFAULT_MODEL_ID
}

export function saveModelId(id) {
  localStorage.setItem('ws_model_id', id)
}

// ── 공통 호출 함수 ─────────────────────────────────────
export async function callAI(systemPrompt, userPrompt, modelId) {
  const model = MODELS.find(m => m.id === modelId) || MODELS[0]

  if (model.provider === 'anthropic') {
    return callClaude(systemPrompt, userPrompt, model.id)
  } else {
    return callOpenAI(systemPrompt, userPrompt, model.id)
  }
}

// ── Anthropic API ──────────────────────────────────────
async function callClaude(systemPrompt, userPrompt, modelId) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('VITE_ANTHROPIC_API_KEY가 .env에 없습니다.')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `Anthropic API 오류 (${res.status})`)
  }

  const data = await res.json()
  const text = data.content.map(b => b.text || '').join('')
  return parseJSON(text)
}

// ── OpenAI API ─────────────────────────────────────────
async function callOpenAI(systemPrompt, userPrompt, modelId) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) throw new Error('VITE_OPENAI_API_KEY가 .env에 없습니다.')

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: 4096,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `OpenAI API 오류 (${res.status})`)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content || ''
  return parseJSON(text)
}

// ── JSON 파싱 헬퍼 ─────────────────────────────────────
function parseJSON(text) {
  try {
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(clean)
  } catch {
    return { raw: text }
  }
}
