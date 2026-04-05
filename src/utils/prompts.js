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

export async function analyzeStage6(passage, keywords, level, modelId) {
  return callAI(SYSTEM_BASE, `
다음 지문의 핵심 주제를 4가지 다른 방식으로 표현해주세요.
같은 주제를 다양한 문장 구조로 표현하는 법을 학생들에게 보여주는 것이 목적입니다.
난이도: ${level} / 지문: """${passage}"""
JSON 형식:
{
  "topicSentences": [
    {"type":"직접형","typeBadge":"type-direct","en":"주제를 핵심 단어 그대로 직접 서술한 문장","ko":"한글 해석","tip":"수능에서 가장 자주 출제되는 주제문 형태"},
    {"type":"반대형","typeBadge":"type-counter","en":"반의어로 대비 구조를 만들어 주제를 강조한 문장 (Without/Unless 등)","ko":"한글 해석","tip":"대비 구조로 주제를 강조하는 방법"},
    {"type":"비유형","typeBadge":"type-metaphor","en":"상의어 또는 비유적 표현으로 주제를 표현한 문장 (Like/As/Just as 등)","ko":"한글 해석","tip":"비유로 주제를 기억에 남기는 방법"},
    {"type":"요약형","typeBadge":"type-summary","en":"동의어 수준의 유사 표현으로 지문 전체를 한 문장으로 압축","ko":"한글 해석","tip":"글 전체의 핵심을 한 문장으로 정리하는 방법"}
  ],
  "teacherNote": "네 문장이 모두 같은 주제를 담고 있음을 한 줄로 설명"
}
규칙:
- 직접형은 지문의 핵심 단어를 그대로 사용할 것
- 반대형은 반의어로 대비 구조를 만들 것
- 비유형은 상의어 또는 비유적 표현 사용 가능, 단 학생이 주제를 바로 알아볼 수 있는 수준으로
- 요약형은 동의어 수준의 유사 표현만 허용
- 네 문장 모두 문장 구조와 어휘는 달라야 함
`, modelId)
}

export async function analyzeStage7(passage, level, modelId) {
  return callAI(SYSTEM_BASE, `
다음 지문으로 수능형 문제 5개를 만들어주세요.
난이도: ${level} / 지문: """${passage}"""

중요 규칙:
- q1, q2: passage 필드에 실제 지문 전체를 넣고 빈칸을 ___BLANK___ 또는 ___BLANK_A___, ___BLANK_B___로 표시
- q3: passage 필드에 지문 전체를 넣고 밑줄 단어 앞에 [①] 형식으로 번호 표시. underlines 배열에도 동일하게 포함
- q4: passage 필드에 지문 전체를 넣고 괄호 부분을 (선택지A / 선택지B) 형식으로 지문 안에 직접 삽입. choices 배열도 포함
- q5: intro 필드에 도입 문장, sentences 객체에 (A)~(D) 완전한 문장 포함

JSON 형식:
{
  "q1":{"type":"빈칸 추론","direction":"다음 글의 빈칸에 들어갈 말로 가장 적절한 것을 고르시오.","passage":"지문 전체(빈칸은 ___BLANK___ 표시)","options":["① 선택지","② 선택지","③ 선택지","④ 선택지","⑤ 선택지"],"answer":"②","explanation":"해설"},
  "q2":{"type":"이중 빈칸","direction":"다음 글의 빈칸 (A), (B)에 들어갈 말로 가장 적절한 것을 고르시오.","passage":"지문 전체(빈칸은 ___BLANK_A___, ___BLANK_B___ 표시)","options":["① (A)단어 — (B)단어","② (A)단어 — (B)단어","③ (A)단어 — (B)단어","④ (A)단어 — (B)단어","⑤ (A)단어 — (B)단어"],"answer":"②","explanation":"해설"},
  "q3":{"type":"어법","direction":"다음 글의 밑줄 친 부분 중, 어법상 틀린 것을 고르시오.","passage":"지문 전체([①]밑줄단어 형식으로 표시)","underlines":[{"num":"①","word":"밑줄단어","correct":true,"note":"설명"},{"num":"②","word":"밑줄단어","correct":true,"note":"설명"},{"num":"③","word":"밑줄단어","correct":true,"note":"설명"},{"num":"④","word":"밑줄단어","correct":true,"note":"설명"},{"num":"⑤","word":"밑줄단어","correct":false,"note":"오류설명"}],"answer":"⑤","explanation":"해설"},
  "q4":{"type":"어법 선택","direction":"다음 글의 괄호 안에서 어법상 알맞은 것을 고르시오.","passage":"지문 전체, 괄호 부분은 (A)(선택지1 / 선택지2) 형식으로 지문 안에 삽입","choices":[{"label":"(A)","options":"which / that","answer":"which","note":"근거"},{"label":"(B)","options":"opening / opened","answer":"opening","note":"근거"},{"label":"(C)","options":"viewed / viewing","answer":"viewed","note":"근거"}]},
  "q5":{"type":"순서 배열","direction":"주어진 문장 다음에 이어질 글의 순서로 가장 적절한 것을 고르시오.","intro":"도입 문장 (순서 배열에서 제외되는 첫 문장)","sentences":{"A":"완전한 문장 A","B":"완전한 문장 B","C":"완전한 문장 C","D":"완전한 문장 D"},"options":["① (A)-(C)-(B)","② (B)-(A)-(C)","③ (C)-(A)-(B)","④ (B)-(C)-(A)","⑤ (C)-(B)-(A)"],"answer":"③","explanation":"순서 근거"}
}
`, modelId)
}

export async function analyzeStage8(passage, level, modelId) {
  return callAI(SYSTEM_BASE, `
다음 지문으로 어법 종합 문제지를 만들어주세요.
난이도: ${level} / 지문: """${passage}"""

중요 규칙:
- passage 필드에 반드시 지문 전체를 HTML 형식으로 넣고 각 문제 번호를 지문 안에 직접 표시
- 빈칸(blank): 해당 단어 자리에 <u>①</u> 형식으로 표시
- 어법(gram): 해당 단어에 (①선택지A/선택지B) 형식으로 표시
- 능동(active): 동사 부분에 (①능동형/수동형) 형식
- 수동(passive): 동사 부분에 (②수동형/능동형) 형식
- 분사구문(participle): 분사 부분에 (③현재분사/과거분사) 형식
- 알맞지않은단어(wrong): 해당 단어 앞에 ①번호 표시
- 총 8~11문항, 유형 골고루 배치

JSON 형식:
{
  "passage": "지문 전체 HTML (문제 번호 포함, 예: He was (①influencing/influenced) by the result. The plant (②that/which) begins to grow)",
  "items": [
    {"num":1,"type":"active","label":"능동","choices":"influencing / influenced","answer":"influencing","note":"능동 분사 근거"},
    {"num":2,"type":"gram","label":"어법","choices":"that / which","answer":"that","note":"관계대명사 근거"},
    {"num":3,"type":"blank","label":"빈칸","answer":"정답단어","note":"해설"},
    {"num":4,"type":"passive","label":"수동","choices":"was seen / saw","answer":"was seen","note":"수동태 근거"},
    {"num":5,"type":"participle","label":"분사구문","choices":"opening / opened","answer":"opened","note":"분사구문 근거"},
    {"num":6,"type":"wrong","label":"알맞지않은단어","choices":"선택지1 / 선택지2 / 선택지3","answer":"정답","note":"해설"},
    {"num":7,"type":"order","label":"순서배열","words":"배열할 단어들","answer":"완성 문장","note":"해설"}
  ]
}
`, modelId)
}

export async function analyzeStage9(passage, level, difficulty, modelId) {
  return callAI(SYSTEM_BASE, `
다음 지문으로 고등학교 서술형 문제 3개를 만들어주세요.
난이도: ${level} / 서술형 난이도: ${difficulty} / 지문: """${passage}"""

중요 규칙:
- 정답은 지문의 단어를 그대로 쓰지 말고, 반드시 어형 변화(동명사/분사/시제/수동태 등) 또는 동의어/반의어/상위어로 변형
- 논리적으로 타당한 정답이어야 함
- 난이도 '상'이면 어형 변화 + 복합 조건 추가

JSON 형식:
{
  "q1": {
    "direction": "다음 글을 읽고 <조건>에 맞게 빈칸을 완성하시오.",
    "points": 5,
    "passage": "지문 전체 (핵심 문장의 빈칸 부분만 ___BLANK___ 표시)",
    "conditions": ["<보기>의 단어를 모두 한 번씩만 사용할 것", "필요시 어형 변화 할 것", "8개 이하의 단어로 작성할 것"],
    "wordBank": "단어1 / 단어2 / 단어3 / 단어4 / 단어5",
    "answer": "정답 (어형변화/동의어 적용)",
    "explanation": "정답 근거 설명"
  },
  "q2": {
    "direction": "아래의 요약문 (A), (B)에 적절한 말을 <보기>의 표현들만을 모두 한 번씩 그대로 사용하여 완성하시오.",
    "points": 5,
    "summary": "지문 전체 내용을 2~3문장으로 요약한 영어문장. (A)와 (B) 빈칸 포함",
    "wordBank": "단어1 / 단어2 / 단어3 / 단어4 / 단어5 / 단어6",
    "conditions": ["(A)와 (B)는 한 단어로 작성할 것", "지문의 단어를 활용하되 반드시 변형하여 작성할 것"],
    "answerA": "(A) 정답",
    "answerB": "(B) 정답",
    "explanation": "정답 근거"
  },
  "q3": {
    "direction": "다음 글의 밑줄 친 ①~⑤ 중 어법상 틀린 것을 골라 기호를 쓰고, 이를 바르게 고치시오.",
    "points": 5,
    "passage": "지문 전체 HTML. 밑줄 단어는 <u>①단어</u> 형식으로 표시. 4개는 올바르고 1개만 틀리게",
    "answerNum": "틀린 기호 (예: ③)",
    "answerWord": "바르게 고친 단어",
    "explanation": "어법 오류 설명"
  }
}
`, modelId)
}
