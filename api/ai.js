// AI 부르기 (Vercel 서버 함수) — 키는 서버에만 둠 (화면 파일에 키가 들어가지 않게, 2026-10-19)
//   POST { system, user, model, maxTokens } → { text, usage:{input, output} }
//   GET → { anthropic, openai, needsPassword } (키가 있는지만, 값은 안 보냄)
//   키: ANTHROPIC_API_KEY · OPENAI_API_KEY (옛 이름 VITE_… 도 서버에서는 읽음 — 화면 코드는 더 이상 안 씀)
//   비밀번호: APP_PASSWORD를 정하면 머리말 x-app-password가 같아야 함
import { MODELS } from '../src/utils/models.js'

const key = (name) => process.env[name] || process.env[`VITE_${name}`] || ''

export function passwordOk(req) {
  const pw = String(process.env.APP_PASSWORD || '').trim()
  if (!pw) return true
  const raw = String(req.headers['x-app-password'] || '')
  let got = raw
  try { got = decodeURIComponent(raw) } catch { /* 그대로 */ }
  return got.trim() === pw || raw.trim() === pw
}

async function claude({ system, user, model, maxTokens }) {
  const apiKey = key('ANTHROPIC_API_KEY')
  if (!apiKey) throw Object.assign(new Error('Anthropic 키가 서버에 없어요 (Vercel 환경변수 ANTHROPIC_API_KEY)'), { status: 400 })
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model, max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error?.message || `Anthropic API 오류 (${res.status})`), { status: 502 })
  return { text: (data.content || []).map((b) => b.text || '').join(''), usage: { input: data.usage?.input_tokens || 0, output: data.usage?.output_tokens || 0 } }
}

async function openai({ system, user, model, maxTokens }) {
  const apiKey = key('OPENAI_API_KEY')
  if (!apiKey) throw Object.assign(new Error('OpenAI 키가 서버에 없어요 (Vercel 환경변수 OPENAI_API_KEY)'), { status: 400 })
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, max_tokens: maxTokens, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error?.message || `OpenAI API 오류 (${res.status})`), { status: 502 })
  return { text: data.choices?.[0]?.message?.content || '', usage: { input: data.usage?.prompt_tokens || 0, output: data.usage?.completion_tokens || 0 } }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ anthropic: Boolean(key('ANTHROPIC_API_KEY')), openai: Boolean(key('OPENAI_API_KEY')), needsPassword: Boolean(String(process.env.APP_PASSWORD || '').trim()) })
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST만 돼요' })
  if (!passwordOk(req)) return res.status(401).json({ error: '비밀번호가 필요해요', code: 'unauthorized' })
  try {
    const { system = '', user = '', model: modelId, maxTokens } = req.body || {}
    // 정해 둔 모델만 · 답 길이는 16000까지 (남이 키를 마음대로 쓰지 못하게)
    const model = MODELS.find((m) => m.id === modelId) || MODELS[0]
    const max = Math.max(256, Math.min(16000, Number(maxTokens) || 4096))
    const args = { system: String(system), user: String(user), model: model.id, maxTokens: max }
    const out = model.provider === 'anthropic' ? await claude(args) : await openai(args)
    return res.status(200).json(out)
  } catch (e) {
    return res.status(e.status || 500).json({ error: e.message })
  }
}
