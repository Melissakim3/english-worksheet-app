// 모델 목록 — 화면(src/utils/ai.js)과 서버(api/ai.js)가 같이 씀 (서버는 이 목록에 있는 모델만 부름)
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
