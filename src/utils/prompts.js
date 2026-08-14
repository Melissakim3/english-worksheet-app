import { callAI } from './ai.js'

const SYSTEM_BASE = `당신은 한국 고등학교 영어 선생님을 위한 영어 지문 분석 전문가입니다.
모든 분석은 수능 영어 기준에 맞게, 정확하고 교육적으로 작성하세요.
반드시 JSON 형식으로만 응답하세요. 다른 텍스트나 마크다운 없이 순수 JSON만 출력하세요.`

// ─────────────────────────────────────────
// Stage 1~5 : 원본 그대로 (수정 없음)
// ─────────────────────────────────────────

export async function analyzeStage1(passage, level, modelId) {
  return callAI(SYSTEM_BASE, `
다음 영어 지문을 문장 단위로 분석하여 구조 분석표를 만들어주세요.
난이도: ${level} / 지문: """${passage}"""
JSON 형식:
{
  "sentences": [
    { "en": "원문", "ko": "한글 해석", "logic": "논리구조", "grammar": "어법포인트", "synonyms": [{"word":"단어","syn":"동의어","ant":"반의어"}] }
  ]
}
규칙: 관계대명사절/대시/동격어구는 앞 문장과 같은 칸. synonyms는 핵심 단어 1~2개만.
번역 규칙:
- 관용어구·숙어는 직역 금지, 한국어에서 굳어진 표현으로 번역할 것
  (예: family leave → 육아휴직, on maternity leave → 출산휴가 중,
       come to terms with → 받아들이다, break the ice → 어색함을 깨다)
- 번역은 수능 교재·교육 현장에서 실제 쓰이는 표현 기준으로 작성할 것
- 단어 뜻이 아닌 문맥상 자연스러운 한국어로 번역할 것
`, modelId)
}

export async function analyzeStage2(passage, level, modelId) {
  return callAI(SYSTEM_BASE, `
다음 영어 지문의 논리 흐름을 색깔로 표시해주세요.
난이도: ${level} / 지문: """${passage}"""
JSON 형식:
{
  "legend":
