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

★★★ 중요: 지문 안에 소제목(굵은 글씨 제목, 예: "Set Up Goals", "Fill in the Gaps" 같은 섹션 헤딩)이 있으면
절대 빠뜨리지 말고, 해당 소제목이 나오는 위치에 {"heading": "소제목 원문"} 형태로 sentences 배열 안에 그대로 삽입할 것.
소제목은 분석 대상이 아니라 구조 표시용이므로 en/ko/logic/grammar 필드 없이 heading 필드만 넣을 것.

JSON 형식:
{
  "sentences": [
    { "heading": "소제목 원문 (있을 경우에만, 나오는 순서 그대로)" },
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
// Stage 6 : 주제 한 문장 → 주제 객관식 문제 (고2 수준, 한글+영어 패러프레이징)
// ─────────────────────────────────────────
export async function analyzeStage6(passage, keywords, level, modelId) {
  return callAI(SYSTEM_BASE, `
다음 지문의 주제를 묻는 수능형 객관식 문제 1개를 만들어주세요.
난이도: ${level} / 지문: """${passage}"""

작업 순서 (반드시 순서대로 수행, 순서를 바꾸면 오류가 발생함):
1단계 - 먼저 지문에서 주제를 가장 잘 담고 있는 문장 1~2개를 "그대로" 찾아 evidence에 인용
2단계 - evidence에 근거해서만 각 선택지를 한글로 작성 (지문에 없는 내용 추가 금지)
3단계 - 각 선택지마다 같은 의미를 담은 영어 문장(en)을 함께 작성
  ★ en은 지문에 나온 단어를 그대로 쓰지 말고, 반드시 동의어/패러프레이징으로 변형할 것
  ★ ko와 en은 같은 내용을 담아야 함 (뜻이 어긋나면 안 됨)
4단계 - 나머지 4개 오답은 evidence와 모순되지 않는 범위에서 그럴듯하게 작성
  (지나치게 좁은 범위 / 지나치게 넓은 범위 / 지문에 없는 내용 / 지엽적 세부사항 각 1개씩)
5단계 - 출력 전, 정답 선택지(ko, en 둘 다)가 evidence 내용과 실제로 일치하는지 스스로 재확인

JSON 형식:
{
  "type": "주제",
  "direction": "다음 글의 주제로 가장 적절한 것은?",
  "evidence": "지문에서 그대로 인용한 근거 문장",
  "options": [
    {"num":"①","ko":"한글 선택지","en":"같은 뜻의 패러프레이징된 영어 문장"},
    {"num":"②","ko":"한글 선택지","en":"같은 뜻의 패러프레이징된 영어 문장"},
    {"num":"③","ko":"한글 선택지","en":"같은 뜻의 패러프레이징된 영어 문장"},
    {"num":"④","ko":"한글 선택지","en":"같은 뜻의 패러프레이징된 영어 문장"},
    {"num":"⑤","ko":"한글 선택지","en":"같은 뜻의 패러프레이징된 영어 문장"}
  ],
  "answer": "②",
  "explanation": "evidence를 근거로 한 해설 (왜 다른 선택지가 오답인지도 1줄씩)"
}
`, modelId)
}

// ─────────────────────────────────────────
// Stage 7 : 실전 문제 → 요약문 + 빈칸 2~3개 (정답 단어 한글 뜻 포함)
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
  ★ 각 정답 단어의 한글 뜻(문맥에 맞는 뜻)도 함께 작성
3단계 - 출력 전, blankedSummary의 빈칸을 answer로 다시 채웠을 때 summary와 완전히 같은 문장이 되는지 스스로 검증

JSON 형식:
{
  "type": "요약문 빈칸",
  "direction": "다음 글을 요약한 문장의 빈칸 (A), (B)에 들어갈 말로 가장 적절한 것은?",
  "summary": "빈칸 없는 완성된 요약문 원문 (채점/검증용)",
  "blankedSummary": "빈칸 처리된 요약문 (___BLANK_A___, ___BLANK_B___ 형식)",
  "blanks": [
    {"key":"A","answer":"정답단어(summary 원문과 철자 동일)","ko":"문맥에 맞는 한글 뜻"},
    {"key":"B","answer":"정답단어(summary 원문과 철자 동일)","ko":"문맥에 맞는 한글 뜻"}
  ],
  "options": ["① (A)단어 — (B)단어","② (A)단어 — (B)단어","③ (A)단어 — (B)단어","④ (A)단어 — (B)단어","⑤ (A)단어 — (B)단어"],
  "answer": "②",
  "explanation": "정답 근거"
}
규칙: 빈칸은 최소 2개, 최대 3개.
`, modelId)
}

// ─────────────────────────────────────────
// Stage 8 : 어법 총정리 → 어법·문맥어휘·철자혼동 선택형 10문항 (고등 수준, 빈칸 쓰기 없음, 정답 단어 한글 뜻 포함)
// ─────────────────────────────────────────
export async function analyzeStage8(passage, level, modelId) {
  return callAI(SYSTEM_BASE, `
다음 지문으로 어법·어휘 통합 선택형 문제지를 만들어주세요. (고등학교 수준)
난이도: ${level} / 지문: """${passage}"""

작업 순서 (반드시 순서대로 수행):
1단계 - 지문 안에서 다음 2가지 유형의 포인트를 후보로 최대한 많이 찾기
  - gram(어법): 문장 구조를 정확히 분석해야만 답을 고를 수 있는 지점만 사용. 반드시 아래 목록에서 다양하게 골라 쓸 것
    (관계대명사 that/which/what/who 구별, 관계대명사 vs 관계부사, 주어-동사 수 일치, 시제 일치,
     능동태/수동태, 원형부정사 vs to부정사,
     조동사+완료형 "may/must/should have p.p." vs "조동사+동사원형", 도치구문,
     비교급/최상급 구조, 가정법, 접속사 vs 전치사 구별,

     ★ 동명사·to부정사: 난이도 있는 경우만 사용할 것 — 단순 "동사+동명사/to부정사" 구별 금지.
       remember/forget/stop/try + 동명사·to부정사의 의미 차이, 전치사 뒤 동명사(단순 동사원형과의 구별),
       동명사 관용표현(on -ing, look forward to -ing 등)처럼 헷갈리기 쉬운 경우만 출제

     ★ 분사구문: 전체 유형을 폭넓게 다룰 것 — 능동(-ing)/수동(p.p.) 기본형뿐 아니라
       완료형 분사구문(having p.p.), 수동완료(having been p.p.), 부대상황·동시동작,
       원인·이유·조건·양보를 나타내는 분사구문, 독립분사구문(의미상 주어가 다른 경우)까지 포함)
    ★ 절대 금지: 뜻이 비슷한 두 단어 중 하나를 고르는 어휘성 문제 (예: "discover/unearth", "requires/necessitates")
      — 이런 건 gram이 아니라 문법 오류가 없으면 만들지 말 것
    ★ 같은 문법 포인트를 두 번 이상 반복하지 말 것 (다양하게 분산)
  - spell(철자 혼동 어휘): 철자가 비슷해서 헷갈리는 어려운 단어 짝 (예: affect/effect, principal/principle, quite/quiet, through/though, adopt/adapt, economic/economical, sensible/sensitive 등 고등 수준 이상 어휘)
2단계 - gram 6~7개, spell 3~4개로 정확히 10개 구성
3단계 - passage 필드에 지문 "전체"를 이어서 순수 텍스트로 작성하고, 10개 포인트 전부를 지문 안에서 정확히 "①(선택지A / 선택지B)" 형식으로 인라인 삽입
  ★★★ 매우 중요: passage 안에 <mark>, <b>, <strong>, <span style="background..."> 등 어떤 강조/하이라이트 태그도 절대 사용하지 말 것.
      순수 텍스트와 ①(A / B) 형식만 사용할 것. 문단 구분이 필요하면 <br><br>만 사용 가능.
  ★★★ 구동사(fill in, look forward to 등) 관련 포인트는 두 선택지 모두 구동사 전체를 완전히 포함해서 괄호 안에 작성할 것
      (예: "①(Having filled in / Filling in)" ← 두 선택지 모두 "in"까지 포함. "①(Having filled in / Filling) in)"처럼
      괄호 밖에 조각 단어가 남는 것 절대 금지)
  ★ 오답 선택지는 실제로 헷갈릴 만큼 그럴듯해야 함 (너무 쉬운 오답 금지)
  ★ 각 정답 단어의 한글 뜻(문맥에 맞는 뜻)도 함께 작성
4단계 - 출력 전, passage 안의 번호와 items의 num이 1:1로 정확히 대응하는지, 각 정답이 문맥상 명확히 하나로 정해지는지,
  gram 항목이 진짜 문법 분석을 요구하는지, 그리고 각 ①~⑩ 괄호 표시 바로 뒤에 조각 단어나 여분의 괄호가 남아있지 않은지 스스로 재확인

JSON 형식:
{
  "type": "어법·어휘 10선",
  "passage": "지문 전체 순수 텍스트 (①~⑩ 10개, 전부 (선택지A/선택지B) 형식으로 인라인 삽입, 강조 태그 없음)",
  "items": [
    {"num":1,"type":"gram","label":"어법","choices":"선택지A / 선택지B","answer":"정답","ko":"정답 단어의 한글 뜻","note":"근거"},
    {"num":2,"type":"spell","label":"철자혼동","choices":"단어A / 단어B","answer":"정답","ko":"정답 단어의 한글 뜻","note":"근거 (두 단어의 뜻 차이 설명)"}
  ]
}
규칙: items는 정확히 10개, num은 1~10 순서대로. order·빈칸(쓰기) 유형 절대 사용 금지.
`, modelId)
}
// ─────────────────────────────────────────
// Stage 9 : 서술형 문제 → 가장 나올만한 문장 2개로 어구 배열형 2문항
// ─────────────────────────────────────────
export async function analyzeStage9(passage, level, difficulty, modelId) {
  return callAI(SYSTEM_BASE, `
다음 지문에서 서술형으로 출제하기 가장 적합한 문장 2개를 뽑아, 어구 배열(단어 배열) 문제로 만들어주세요.
난이도: ${level} / 서술형 난이도: ${difficulty} / 지문: """${passage}"""

작업 순서 (반드시 순서대로 수행):
1단계 - 지문 문장들 중 서술형 출제 가치가 높은 문장 2개 선정 (8~16단어 권장)
  선정 기준: (1) 지문의 핵심 내용을 담고 있을 것 (2) 어법/구문 포인트를 포함할 것
  각 문장을 선정한 이유(reason)를 1줄로 작성
2단계 - 선정한 문장을 아래 "분리 기준"에 따라 8~12개 조각으로 나누기 (chunks)

  【분리 기준 — 반드시 이 순서로 적용】
  ① 주어(S)와 동사(V)는 절대 한 조각에 묶지 말고 반드시 분리할 것
  ② 문법 포인트가 있는 자리는 반드시 끊어서 독립된 조각으로 만들고,
     그 조각은 "동사 원형(기본형)"으로 제시할 것 — 학생이 정답을 쓸 때 올바른 형태로 직접 바꿔야 함
     - to부정사 포인트: wordBank에는 원형(예: "take")으로 제시 → answer에서는 "to take"로 완성
     - 동명사 포인트: wordBank에는 원형(예: "take")으로 제시 → answer에서는 "taking"으로 완성
     - 분사구문 포인트: wordBank에는 원형으로 제시 → answer에서는 현재분사/과거분사로 완성
     - 수동태/시제 등 다른 어법 포인트도 동일한 방식(원형 제시 → 정답에서 올바른 형태로 완성)
  ③ 명사구는 통째로 묶지 말고 핵심 명사와 수식어로 나누어 최소 2조각 이상으로 분리
     (예: "a blank piece of paper" 금지 → "a blank piece of" | "paper"로 분리)
  ④ 전치사구도 ③ 기준과 동일하게 세분화해서 나눌 것
  ⑤ 접속사(and/but/so 등)는 절대 단독 조각으로 만들지 말고, 반드시 뒤따르는 어구와 붙여서 한 조각으로 만들 것
  ⑥ 목표 조각 수: 8~12개. 이보다 적으면 ③④ 기준을 더 세밀하게 적용해 다시 나눌 것
3단계 - 나눈 조각(일부는 원형)을 무작위 순서로 섞어 wordBank에 " / "로 구분해 나열 (실제 정답 순서와 반드시 다르게 섞을 것)
4단계 - answer 필드에는 조각을 올바른 순서로 배열하고, 원형으로 제시한 조각은 문법에 맞는 형태로 바꿔서 완전한 문장을 작성 (마침표 포함, sourceSentence와 최종적으로 동일해야 함)
5단계 - 출력 전, answer 문장이 sourceSentence와 정확히 일치하는지, wordBank의 각 조각이 (형태 변형을 거쳐) answer 안에서 빠짐없이 사용되었는지 스스로 검증

JSON 형식:
{
  "type": "서술형 2선 (어순배열)",
  "q1": {
    "sourceSentence": "선정한 지문 원문 문장 (교사용 채점 참고, 학생에게는 노출하지 않음)",
    "reason": "이 문장을 선정한 이유",
    "direction": "다음 <보기>의 어구를 문맥과 어법에 맞게 배열하고, 필요한 경우 어형을 바꾸어 문장을 완성하시오.",
    "points": 5,
    "wordBank": "조각1 / 조각2 / 조각3 / 조각4",
    "answer": "정답 문장 (조각을 올바른 순서로 배열하고 필요한 형태 변형까지 적용한 완전한 문장)"
  },
  "q2": { "sourceSentence":"...", "reason":"...", "direction":"...", "points":5, "wordBank":"...", "answer":"..." }
}
`, modelId)
}
