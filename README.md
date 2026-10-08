# 영어 지문 분석 워크시트

고등학교 영어 선생님을 위한 AI 기반 워크시트 자동 생성 앱입니다.

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경변수 설정
`.env.example` 파일을 `.env`로 복사한 후 API 키를 입력하세요.

```bash
cp .env.example .env
```

`.env` 파일:
```
VITE_ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
```

> **API 키 발급**: https://console.anthropic.com

### 3. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 http://localhost:5173 을 열면 됩니다.

---

## Vercel 배포 방법

### 방법 1 — GitHub 연동 (추천)
1. 이 폴더를 GitHub 레포지토리에 올리기
2. https://vercel.com 접속 → New Project
3. GitHub 레포 선택 → Import
4. **Environment Variables** 섹션에서 `VITE_ANTHROPIC_API_KEY` 추가
5. Deploy 클릭

### 방법 2 — Vercel CLI
```bash
npm install -g vercel
vercel
# 환경변수 추가
vercel env add VITE_ANTHROPIC_API_KEY
```

---

## 기능

| Stage | 내용 |
|-------|------|
| 1 | 구조 분석표 (문장별 한글 해석 + 어법) |
| 2 | 논리 흐름 색깔 표시 |
| 3 | 4컷 만화 (준비중 — DALL-E 추가 예정) |
| 4 | 단어장 |
| 5 | 핵심 키워드 나열 |
| 6 | 핵심 키워드 & 주제 분석 |
| 7 | 수능형 문제 (빈칸/어법/선택/순서배열) |
| 8 | 어법 Final 종합 문제지 |

- **📘 지문 완전정복 워크북** (단일 지문): AI를 한 번만 불러 A4 4쪽 워크북 — 1쪽 문장 뜯어보기(영어 · 해석·논리·어법 · 단어/동의어/반의어 뜻) · 2쪽 흐름 지도 + Lv1~4 · 3쪽 Lv5 + 쉬운 말로 다시 읽기 · 4쪽 정답. 모양은 `src/workbook/workbook.js`(원본: cm-variant `public/lib/workbook.js`, 견본 `src/workbook/sample.json`), 내용 지시문은 `src/workbook/generate.js`. 문장 나누기 · 선지 정답 자리 · 문장 넣기 자리는 코드가 정하고, 모양에 안 맞는 답은 한 번 더 받음. 만든 뒤 비용(원)을 화면에 보여 줌
- **Stage 선택**: 원하는 Stage만 체크해서 생성
- **인쇄/PDF**: 교사용 정답은 맨 마지막 페이지에 자동 배치
- **잉크 절약**: 흰 배경, 점선 테두리, 최소 음영

---

## API 비용 참고
- 지문 1개 분석 (전체 Stage): 약 $0.05~0.10 (약 70~140원)
- 워크북 1개 (Haiku 4.5, AI 1번): 약 40~60원 예상 — 실제 값은 만든 뒤 화면에 나옴
- 월 200회 사용 기준: 약 $10~20 (약 1.5~3만원)
