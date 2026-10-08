// 워크북 내용 만들기 — 지문 하나에 AI를 한 번만 부름 (실패하면 틀린 곳을 알려 주고 한 번 더)
//   문장 나누기 · 선지 정답 자리 · 문장 넣기 자리는 코드가 정하고, AI는 글만 씀
import { callAI } from '../utils/ai.js'
import { checkWorkbook } from './workbook.js'
import SAMPLE from './sample.json'

// 1백만 토큰당 달러 (입력, 출력) — 비용 표시용
const PRICE = {
  'claude-haiku-4-5-20251001': [1, 5],
  'claude-sonnet-4-5-20251101': [3, 15],
  'claude-sonnet-4-20250514': [3, 15],
  'gpt-4.1-mini': [0.4, 1.6],
  'gpt-4.1': [2, 8],
  'gpt-4.1-nano': [0.1, 0.4],
}
const WON_PER_DOLLAR = 1400

export function costWon(modelId, usage) {
  const [i, o] = PRICE[modelId] || [3, 15]
  return Math.round(((usage.input * i + usage.output * o) / 1e6) * WON_PER_DOLLAR)
}

// 문장 나누기: . ? ! (따옴표·괄호 닫힘 포함) 뒤 + 대문자·따옴표로 시작하는 곳. 흔한 줄임말은 넘김
const ABBR = /\b(?:Mr|Mrs|Ms|Dr|Prof|St|Jr|Sr|vs|etc|e\.g|i\.e|U\.S|U\.K|No)\.$/
export function splitSentences(passage) {
  const text = String(passage || '').replace(/\s+/g, ' ').trim()
  const out = []
  let cur = ''
  const parts = text.split(/(?<=[.!?]["”’)]?)\s+(?=["“‘(]?[A-Z0-9])/)
  for (const p of parts) {
    cur = cur ? `${cur} ${p}` : p
    if (!ABBR.test(cur)) { out.push(cur); cur = '' }
  }
  if (cur) out.push(cur)
  return out
}

// 정답을 options[0]에 둔 선지를 섞어 정답 번호를 정함 (같은 지문은 늘 같은 자리)
function seeded(seed) {
  let h = 2166136261
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296
}
function placeAnswer(q, rnd) {
  if (!q?.options?.length) return q
  const [right, ...wrong] = q.options
  const at = Math.floor(rnd() * q.options.length)
  const options = [...wrong]
  options.splice(at, 0, right)
  // 오답 설명(why)에 '①'처럼 선지 번호를 쓰지 않게 했으므로 그대로 둠
  return { ...q, options, answer: at + 1 }
}

// 예시는 견본을 AI가 쓸 모양으로: 정답을 options[0]에, answer 칸 없이, 설명에 선지 번호 없이
const firstRight = (q, why) => {
  const options = [q.options[q.answer - 1], ...q.options.filter((_, i) => i !== q.answer - 1)]
  return { sentence: q.sentence, options, why: why ?? q.why }
}
function exampleForPrompt() {
  const { title, sentences, ...rest } = SAMPLE
  const t = firstRight(rest.lv4.title, '기대(6번)에서 걱정(7번)으로 바뀌는 글. 오답: 옛사람은 걱정이 아니라 변화 없음을 예상(3번) / 경제적 불평등 언급 없음 / 느린 변화는 과거 이야기(3번) / 지금은 혁신을 기대함(6번)')
  delete t.sentence
  return {
    ...rest,
    lv4: { ...rest.lv4, title: t, blank: firstRight(rest.lv4.blank) },
    lv5: { ...rest.lv5, summary: firstRight(rest.lv5.summary) },
  }
}

const SYSTEM = `당신은 한국 고등학교 영어 선생님의 '지문 완전정복 워크북' 내용을 쓰는 사람입니다.
반드시 JSON 하나만 출력하세요. 마크다운·설명 없이 순수 JSON만.`

function prompt(sentences, title, level, fix = []) {
  const n = sentences.length
  const example = exampleForPrompt()
  return `지문: ${title || '(제목 없음)'} · 난이도 ${level}
문장 번호는 코드가 붙였습니다 (모두 ${n}문장):
${sentences.map((s, i) => `${i + 1}) ${s}`).join('\n')}

아래 예시(다른 지문)와 **똑같은 칸 이름·모양**으로 이 지문의 워크북 내용을 JSON으로 쓰세요. title·sentences는 쓰지 마세요.

규칙
- study: 문장마다 하나씩 정확히 ${n}개. ko 자연스러운 해석, tag 논리 꼬리표(주장·대조·과거·강조·전환점·결과·반전·예시·이유 등 2~3글자), logic 한 줄, grammar 어법 핵심을 짧게 '/'로 끊어서. words는 그 문장 핵심 단어 1~2개, syn·ant는 각 1~2개이며 [영어, 한글 뜻] — 뜻을 절대 빼지 말 것 (반의어가 없으면 빈 배열).
- flow: 3~6단계, 모든 문장 번호가 한 번씩 순서대로 (s는 문장 번호 배열). label은 2~6글자.
- core: topic 주제(한국어), gist 요지 한 문장, contrast 핵심 대조 한 줄 — 핵심어는 __밑줄__.
- lv1.words: 핵심 단어 10개 [단어, 뜻]. lv1.ox: 5개 [한국어 문장, "O"|"X", 근거 문장 번호], O와 X를 섞음.
- lv2.refs: 지칭어 4~5개 ["N번 지칭어", 가리키는 것]. lv2.easy: 문장마다 쉬운 말 한 줄(32자 안쪽) [쉬운 말, 원문 번호], 순서는 섞음.
- lv3.cards: 흐름 카드 5개 [가~마, "단계: 내용"] 순서를 섞어서, order는 정답 순서. steps 5개 [단계 (번호), 첫 글자 힌트 빈칸 문장(영어, 예: i________), 답]. ownWords 예시 답. roleChoices "A 주장　B …" 한 줄, roles 문장마다 기호. conn 3~4개 [연결어 빈칸 영어 문장 55자 안쪽(…로 줄임), 답, "N번 · 하는 일"].
- lv4.title: options 5개 영어 제목, **options[0]이 정답**, why에 정답 근거와 오답 이유(근거 문장 번호, 선지 번호 대신 '오답 1·2…'처럼 쓰지 말고 제목 내용으로). lv4.blank: 지문 문장 하나의 핵심 낱말을 ________로 비운 sentence, options 5개 낱말(options[0] 정답), why. lv4.insert: given = 주어진 문장 번호(2~${n}, 앞뒤 단서가 분명한 문장), why.
- lv5.summary: 요약문 (A) ________ (B) ________, options 5개 "A — B" (options[0] 정답), why. grammar 4~5개: **지문 원문 문장만**, (맞는 것 / 틀린 것) 고르기, 80자 안쪽(…로 줄임) [문장, 답, 이유]. vocab 3개 [(맞는 낱말 / 헷갈리는 낱말) 문장, 답, 이유]. para 3~4개: 원문을 동의어로 바꾼 문장 [바꾼 문장, 원문 번호, "새 말 ← 원래 말 / …"].
- wrap.easy: 문장마다 [tag, 쉬운 말] 1번부터 순서대로, 그래서·그런데·하지만 같은 연결어로 흐름이 이어지게. topicEn·topicKo, titleEn은 lv4.title 정답과 같게, titleKo, oneLine 한 줄 요지(__밑줄__).
- 선지는 길이를 비슷하게, 겹치는 선지 없이.
${fix.length ? `\n지난 답에서 고칠 곳:\n- ${fix.join('\n- ')}\n` : ''}
예시:
${JSON.stringify(example)}`
}

export async function generateWorkbook({ passage, title, level, modelId, onStep = () => {} }) {
  const sentences = splitSentences(passage)
  if (sentences.length < 7) throw new Error(`문장이 ${sentences.length}개뿐이에요. 워크북은 7문장 이상 지문에 맞춰져 있어요.`)
  const rnd = seeded(`${title}|${sentences.join(' ')}`)
  const usage = { input: 0, output: 0 }
  let fix = []
  for (let attempt = 1; attempt <= 2; attempt++) {
    onStep(attempt === 1 ? '워크북 내용 쓰는 중…' : '빠진 곳 고쳐서 다시 받는 중…')
    const res = await callAI(SYSTEM, prompt(sentences, title, level, fix), modelId, { maxTokens: 12000, withUsage: true })
    usage.input += res.usage.input
    usage.output += res.usage.output
    const ai = res.data || {}
    if (ai.raw) { fix = ['JSON이 아니었음 — 순수 JSON만']; continue }
    const lv4 = ai.lv4 || {}
    const lv5 = ai.lv5 || {}
    const data = {
      ...ai,
      title: title || '지문',
      sentences,
      lv4: { ...lv4, title: placeAnswer(lv4.title, rnd), blank: placeAnswer(lv4.blank, rnd) },
      lv5: { ...lv5, summary: placeAnswer(lv5.summary, rnd) },
    }
    const errs = checkWorkbook(data)
    if (!errs.length) return { data, usage, cost: costWon(modelId, usage), attempts: attempt }
    fix = errs
  }
  throw new Error(`AI 답이 워크북 모양에 맞지 않아요:\n- ${fix.join('\n- ')}`)
}
