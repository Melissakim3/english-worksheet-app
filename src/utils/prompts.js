import { callAI } from './ai.js'

const SYSTEM_BASE = `당신은 한국 고등학교 영어 선생님을 위한 영어 지문 분석 전문가입니다.
모든 분석은 수능 영어 기준에 맞게, 정확하고 교육적으로 작성하세요.
반드시 JSON 형식으로만 응답하세요. 다른 텍스트나 마크다운 없이 순수 JSON만 출력하세요.`

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
`, modelId)
}

export async function analyzeStage2(passage, level, modelId) {
  return callAI(SYSTEM_BASE, `
다음 영어 지문의 논리 흐름을 색깔로 표시해주세요.
난이도: ${level} / 지문: """${passage}"""
JSON 형식:
{
  "legend": [{"color":"h1","label":"개념명","colorName":"#FFE066"},{"color":"h2","label":"개념명","colorName":"#85E89D"},{"color":"h3","label":"개념명","colorName":"#FFB3C6"},{"color":"h4","label":"개념명","colorName":"#79C8F5"},{"color":"h5","label":"개념명","colorName":"#D4AAFF"}],
  "coloredPassage": "지문 HTML (<span class='h1'>단어</span> 형식)",
  "flowSteps": [{"label":"단계명","ko":"한글설명"}],
  "flowSummary": "논리 흐름 한 줄 요약"
}
`, modelId)
}

export async function analyzeStage4(passage, level, modelId) {
  return callAI(SYSTEM_BASE, `
다음 지문에서 중요 단어를 추출해 단어장을 만들어주세요.
난이도: ${level} / 지문: """${passage}"""
JSON 형식:
{
  "words": [{"num":1,"word":"단어","pos":"품사","meaning":"한글뜻","synonyms":"동의어","antonyms":"반의어 또는 —"}]
}
규칙: 등장 순서, 구동사 포함, 최소 12개, 쉬운 단어 제외.
`, modelId)
}

export async function analyzeStage5(passage, level, modelId) {
  return callAI(SYSTEM_BASE, `
다음 지문에서 핵심 키워드 3개를 추출하고 분석해주세요.
난이도: ${level} / 지문: """${passage}"""
JSON 형식:
{
  "keywords": [{"word":"키워드(단일단어)","ko":"한글뜻","role":"지문 논리에서의 역할(1문장)"}],
  "flowSummary": "세 키워드 논리 흐름(1~2문장)"
}
`, modelId)
}

export async function analyzeStage6(passage, keywords, level, modelId) {
  return callAI(SYSTEM_BASE, `
다음 지문과 핵심 키워드 3개로 주제 표현 3개를 만들어주세요.
난이도: ${level} / 지문: """${passage}""" / 키워드: ${keywords.map(k => k.word).join(', ')}
JSON 형식:
{
  "topicSentences": [
    {"keyword":"키워드","kwClass":"kw1","type":"반대형","typeBadge":"type-counter","en":"영어문장","ko":"한글해석"},
    {"keyword":"키워드","kwClass":"kw2","type":"빈칸형","typeBadge":"type-blank","en":"영어문장(___ 포함)","ko":"한글해석"},
    {"keyword":"키워드","kwClass":"kw3","type":"요약형","typeBadge":"type-summary","en":"영어문장","ko":"한글해석"}
  ]
}
규칙: 키워드 단어를 직접 쓰지 말고 동의어/반의어/상위어 사용.
`, modelId)
}

export async function analyzeStage7(passage, level, modelId) {
  return callAI(SYSTEM_BASE, `
다음 지문으로 수능형 문제 5개를 만들어주세요.
난이도: ${level} / 지문: """${passage}"""
JSON 형식:
{
  "q1":{"type":"빈칸 추론","direction":"다음 글의 빈칸에 들어갈 말로 가장 적절한 것을 고르시오.","passage":"지문(___BLANK___ 표시)","options":["① 선택지","② 선택지","③ 선택지","④ 선택지","⑤ 선택지"],"answer":"②","explanation":"해설"},
  "q2":{"type":"이중 빈칸","direction":"다음 글의 빈칸 (A), (B)에 들어갈 말로 가장 적절한 것을 고르시오.","passage":"지문(___BLANK_A___ ___BLANK_B___ 표시)","options":["① (A) 단어 — (B) 단어","② (A) 단어 — (B) 단어","③ (A) 단어 — (B) 단어","④ (A) 단어 — (B) 단어","⑤ (A) 단어 — (B) 단어"],"answer":"②","explanation":"해설"},
  "q3":{"type":"어법","direction":"다음 글의 밑줄 친 부분 중, 어법상 틀린 것을 고르시오.","underlines":[{"num":"①","word":"단어","correct":true,"note":"설명"},{"num":"②","word":"단어","correct":true,"note":"설명"},{"num":"③","word":"단어","correct":true,"note":"설명"},{"num":"④","word":"단어","correct":true,"note":"설명"},{"num":"⑤","word":"단어","correct":false,"note":"오류설명"}],"answer":"⑤","explanation":"해설"},
  "q4":{"type":"어법 선택","direction":"다음 글의 괄호 안에서 어법상 알맞은 것을 고르시오.","choices":[{"label":"(A)","options":"which / that","answer":"which","note":"근거"},{"label":"(B)","options":"opening / opened","answer":"opening","note":"근거"},{"label":"(C)","options":"viewed / viewing","answer":"viewed","note":"근거"}]},
  "q5":{"type":"순서 배열","direction":"다음 문장 (A)~(D)를 논리적 흐름에 맞게 순서대로 배열하시오.","sentences":{"A":"문장A","B":"문장B","C":"문장C","D":"문장D"},"answer":"(C)→(B)→(D)→(A)","explanation":"순서 근거"}
}
`, modelId)
}

export async function analyzeStage8(passage, level, modelId) {
  return callAI(SYSTEM_BASE, `
다음 지문으로 어법 종합 문제지(Final)를 만들어주세요.
난이도: ${level} / 지문: """${passage}"""
JSON 형식:
{
  "items": [
    {"num":1,"type":"blank","label":"빈칸","answer":"정답","note":"해설"},
    {"num":2,"type":"blank","label":"빈칸","answer":"정답","note":"해설"},
    {"num":3,"type":"gram","label":"어법","choices":"which / that","answer":"which","note":"해설"},
    {"num":4,"type":"gram","label":"어법","choices":"which / that","answer":"that","note":"해설"},
    {"num":5,"type":"gram","label":"어법","choices":"which / that","answer":"which","note":"해설"},
    {"num":6,"type":"gram","label":"어법","choices":"opening / opened","answer":"opening","note":"해설"},
    {"num":7,"type":"wrong","label":"알맞지않은단어","choices":"선택지1 / 선택지2 / 선택지3","answer":"정답","note":"해설"},
    {"num":8,"type":"gram","label":"어법","choices":"viewed / viewing","answer":"viewed","note":"해설"},
    {"num":9,"type":"gram","label":"어법","choices":"enough / too","answer":"enough","note":"해설"},
    {"num":10,"type":"order","label":"순서배열","words":"배열할 단어들","answer":"완성 문장","note":"해설"},
    {"num":11,"type":"gram","label":"어법","choices":"view / viewing","answer":"viewing","note":"해설"}
  ]
}
`, modelId)
}
