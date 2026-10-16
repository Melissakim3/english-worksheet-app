// 워크북 만드는 순서 — 선생님이 자꾸 까먹어서 앱 맨 위에 짧게 (눌러서 펼침, 펼친 상태는 기억)
const KEY = 'howtoOpen'

export default function HowTo() {
  let open = true
  try { open = localStorage.getItem(KEY) !== '0' } catch {}
  return (
    <details className="howto no-print" open={open}
      onToggle={(e) => { try { localStorage.setItem(KEY, e.currentTarget.open ? '1' : '0') } catch {} }}>
      <summary>📖 워크북 만드는 순서</summary>
      <div className="howto-cols">
        <div>
          <b>A. cm-variant에서 보내기 (번호가 파일 이름에 붙음)</b>
          <ol>
            <li>cm-variant 자료실에서 표 열기 (예: Basic › 모의고사 › 2025년 › 고1 › 10월)</li>
            <li>지문 체크 → <b>'워크시트 앱으로 보내기'</b> (새 창이 안 뜨면 팝업 허용)</li>
            <li>이 앱이 열리면 아래 <b>📘 워크북</b> 칸에서 구성 체크</li>
            <li><b>'📘 워크북 N개 만들기'</b> → 다 되면 <b>'📦 PDF zip으로 받기'</b></li>
          </ol>
        </div>
        <div>
          <b>B. 여기에 직접 넣기</b>
          <ol>
            <li>맨 위 <b>지문 제목</b> 쓰기 (파일 이름 앞에 붙음)</li>
            <li>하나: <b>단일 지문</b>에 붙여 넣기 / 여럿: <b>여러 지문</b>에 <code>---</code>로 나눠 넣고 <b>'✂ --- 로 지문 분리'</b> (또는 PDF 업로드)</li>
            <li>아래 <b>📘 워크북</b> 칸 → 만들기 → <b>'📄 PDF 받기'</b> / <b>'📦 zip 받기'</b></li>
          </ol>
        </div>
      </div>
      <p className="howto-note">파일 이름 앞 글자(기본 <b>[Basic]</b>)는 받기 버튼 옆에서 바꿔요. 위쪽 'STAGE 선택 · 분석 시작'은 구버전이에요.</p>
    </details>
  )
}
