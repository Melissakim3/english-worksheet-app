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

// ─────────────────────────────────────────
// Stage 6 : 주제 한 문장 → 주제 객관식 문제 (고2 수준)
// ─────────────────────────────────────────
export async function analyzeStage6(passage, keywords, level, modelId) {
  return callAI(SYSTEM_BASE, `
다음 지문의 주제를 묻는 수능형 객관식 문제 1개를 만들어주세요.
난이도: ${level} / 지문: """${passage}"""

작업 순서 (반드시 순서대로 수행, 순서를 바꾸면 오류가 발생함):
1단계 - 먼저 지문에서 주제를 가장 잘 담고 있는 문장 1~2개를 "그대로" 찾아 evidence에 인용
2단계 - evidence에 근거해서만 정답 선택지를 ${level} 수준 어휘로 작성 (지문에 없는 내용 추가 금지)
3단계 - 나머지 4개 오답은 evidence와 모순되지 않는 범위에서 그럴듯하게 작성
  (지나치게 좁은 범위 / 지나치게 넓은 범위 / 지문에 없는 내용 / 지엽적 세부사항 각 1개씩)
4단계 - 출력 전, 정답 선택지가 evidence 내용과 실제로 일치하는지 스스로 재확인

JSON 형식:
{
  "type": "주제",
  "direction": "다음 글의 주제로 가장 적절한 것은?",
  "evidence": "지문에서 그대로 인용한 근거 문장",
  "options": ["① 선택지","② 선택지","③ 선택지","④ 선택지","⑤ 선택지"],
  "answer": "②",
  "explanation": "evidence를 근거로 한 해설 (왜 다른 선택지가 오답인지도 1줄씩)"
}
`, modelId)
}

// ─────────────────────────────────────────
// Stage 7 : 실전 문제 → 요약문 + 빈칸 2~3개
// ─────────────────────────────────────────
export async function analyzeStage7(passage, level, modelId) {
  return callAI(SYSTEM_BASE, `
다음 지문을 요약문으로 압축하고, 요약문 안에서 빈칸 문제를 만들어주세요.
난이도: ${level} / 지문: """${passage}"""

작업 순서 (반드시 순서대로 수행, 순서를 바꾸면 정답 오류가 발생함):
1단계 - 지문 전체 내용을 영어 요약문 2~3문장으로 압축 작성 (summary 필드에 완성된 문장으로)
2단계 - 완성된 summary 문장 "안에서만" 핵심 단어 2~3개를 골라 빈칸으로 치환
  ★ summary에 없는 단어를 정답으로 만드는 것 절대 금지 (반드시 summary 원문에서 그대로 추출)
  ★ 빈칸 정답은 summary 원문 단어와 철자까지 정확히 일치해야 함 (동의어로 바꾸지 말 것)
3단계 - 출력 전, blankedSummary의 빈칸을 answer로 다시 채웠을 때 summary와 완전히 같은 문장이 되는지 스스로 검증

JSON 형식:
{
  "type": "요약문 빈칸",
  "direction": "다음 글을 요약한 문장의 빈칸 (A), (B)에 들어갈 말로 가장 적절한 것은?",
  "summary": "빈칸 없는 완성된 요약문 원문 (채점/검증용)",
  "blankedSummary": "빈칸 처리된 요약문 (___BLANK_A___, ___BLANK_B___ 형식)",
  "blanks": [
    {"key":"A","answer":"정답단어(summary 원문과 철자 동일)"},
    {"key":"B","answer":"정답단어(summary 원문과 철자 동일)"}
  ],
  "options": ["① (A)단어 — (B)단어","② (A)단어 — (B)단어","③ (A)단어 — (B)단어","④ (A)단어 — (B)단어","⑤ (A)단어 — (B)단어"],
  "answer": "②",
  "explanation": "정답 근거"
}
규칙: 빈칸은 최소 2개, 최대 3개.
`, modelId)
}

// ─────────────────────────────────────────
// Stage 8 : 어법 총정리 → 중요 어법 포인트 10개
// ─────────────────────────────────────────
export async function analyzeStage8(passage, level, modelId) {
  return callAI(SYSTEM_BASE, `
다음 지문에서 어법 포인트 10개를 골라 정리해주세요.
난이도: ${level} / 지문: """${passage}"""

작업 순서 (반드시 순서대로 수행):
1단계 - 지문 문장들 중 어법적으로 설명 가능한 포인트를 최대한 많이 후보로 나열 (지문에 실제 존재하는 표현만, 최소 15개 목표)
2단계 - 후보 중 학생에게 가장 중요하고 시험에 자주 나오는 대표 포인트 정확히 10개만 선별
  (같은 유형 어법이 중복되지 않도록 다양한 포인트 우선: 관계사/분사/시제/수동태/도치/비교/접속사 등)
3단계 - 선별한 10개 각각에 대해 해당 지문 문장을 "그대로" 인용하고 어법 설명 작성
4단계 - 출력 전, 각 sentence가 지문 원문에 실제로 존재하는 문장인지 스스로 재확인 (지문에 없는 문장 절대 금지)

JSON 형식:
{
  "type": "어법 10선",
  "items": [
    {"num":1,"sentence":"지문에서 그대로 인용한 문장 (밑줄 부분은 <u>단어</u> 형식)","point":"어법 포인트명(예: 관계대명사 계속적 용법)","explanation":"왜 이 형태가 맞는지 설명"}
  ]
}
규칙: items는 정확히 10개.
`, modelId)
}

// ─────────────────────────────────────────
// Stage 9 : 서술형 문제 → 가장 나올만한 문장 2개로 서술형 2문항
// ─────────────────────────────────────────
export async function analyzeStage9(passage, level, difficulty, modelId) {
  return callAI(SYSTEM_BASE, `
다음 지문에서 서술형으로 출제하기 가장 적합한 문장 2개를 뽑아 문제를 만들어주세요.
난이도: ${level} / 서술형 난이도: ${difficulty} / 지문: """${passage}"""

작업 순서 (반드시 순서대로 수행):
1단계 - 지문 문장들 중 서술형 출제 가치가 높은 문장 2개 선정
  선정 기준: (1) 지문의 핵심 내용을 담고 있을 것 (2) 어법/구문 포인트를 포함할 것
  각 문장을 선정한 이유(reason)를 1줄로 작성
2단계 - 선정한 문장 각각을 바탕으로 빈칸완성형 서술형 문제 작성
  ★ 정답은 지문 단어를 그대로 쓰지 말고 반드시 어형 변화(시제/수동태/분사/동명사 등) 또는 동의어로 변형
  ★ 난이도가 '상'이면 어형 변화 + 조건 2개 이상 결합
3단계 - 출력 전, 각 answer가 sourceSentence의 내용과 논리적으로 일치하는지, 조건(conditions)을 실제로 만족하는지 스스로 검증

JSON 형식:
{
  "type": "서술형 2선",
  "q1": {
    "sourceSentence": "선정한 지문 원문 문장",
    "reason": "이 문장을 선정한 이유",
    "direction": "다음 문장을 <조건>에 맞게 완성하시오.",
    "points": 5,
    "conditions": ["필요시 어형 변화 할 것", "8단어 이내로 작성할 것"],
    "wordBank": "단어1 / 단어2 / 단어3 (필요시, 없으면 생략 가능)",
    "answer": "정답 (어형변화 적용된 최종 정답)",
    "explanation": "정답 근거"
  },
  "q2": { "sourceSentence":"...", "reason":"...", "direction":"...", "points":5, "conditions":[...], "wordBank":"...", "answer":"...", "explanation":"..." }
}
`, modelId)
}
