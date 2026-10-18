import { DEFAULT_MODEL_ID } from './models.js'
export { MODELS, DEFAULT_MODEL_ID } from './models.js'

// ── 저장/불러오기 (localStorage) ──────────────────────
export function getSavedModelId() {
  return localStorage.getItem('ws_model_id') || DEFAULT_MODEL_ID
}

export function saveModelId(id) {
  localStorage.setItem('ws_model_id', id)
}

// ── 공통 호출 함수 ─────────────────────────────────────
// AI는 서버(api/ai.js)가 부름 — 키는 서버에만 있고 화면 파일에는 없음 (2026-10-19)
// opts.maxTokens: 긴 답(워크북 등)일 때 늘림 · opts.withUsage: { data, usage:{input, output} }로 돌려줌 (비용 계산용)
export async function callAI(systemPrompt, userPrompt, modelId, opts = {}) {
  const { maxTokens = 4096, withUsage = false } = opts
  const send = (pw) => fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-app-password': encodeURIComponent(pw) },
    body: JSON.stringify({ system: systemPrompt, user: userPrompt, model: modelId, maxTokens }),
  })
  const used = getPassword()
  let res = await send(used)
  // 여러 단계가 한꺼번에 돌 때 비밀번호를 한 번만 묻게: 그새 다른 호출이 받아 뒀으면 그걸로 다시
  if (res.status === 401 && (getPassword() !== used || askPassword())) res = await send(getPassword())
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `AI 오류 (${res.status})`)
  if (withUsage) return { data: parseJSON(data.text), usage: data.usage || { input: 0, output: 0 } }
  return parseJSON(data.text)
}

// ── 앱 비밀번호 (Vercel 환경변수 APP_PASSWORD를 정했을 때만 물음) ──
export function getPassword() {
  try { return localStorage.getItem('ws_pw') || '' } catch { return '' }
}
export function askPassword() {
  const pw = window.prompt('앱 비밀번호를 넣어 주세요')
  if (!pw) return false
  try { localStorage.setItem('ws_pw', pw.trim()) } catch { /* 무시 */ }
  return true
}

// 서버에 키가 있는지 (값은 안 옴)
let statusP = null
export function keyStatus() {
  statusP ||= fetch('/api/ai').then((r) => r.json()).catch(() => ({ anthropic: false, openai: false }))
  return statusP
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
