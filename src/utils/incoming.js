// 다른 앱(cm-variant 등)이 넘겨준 지문 받기 — 주소 끝 #cm=… (서버·노션 연결 없이 브라우저 안에서만)
//   cm-variant '워크시트 앱으로 보내기'가 { title, passages: [영어 지문…], names?: [지문 이름…] }를 base64url로 붙여서 새 창을 엶
//   읽은 뒤에는 주소에서 지움 (새로고침해도 다시 덮어쓰지 않게)
export function decodeIncoming(hash) {
  const m = String(hash || '').match(/[#&]cm=([A-Za-z0-9_-]+)/)
  if (!m) return null
  try {
    const b64 = m[1].replace(/-/g, '+').replace(/_/g, '/')
    const bytes = Uint8Array.from(atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4)), (c) => c.charCodeAt(0))
    const data = JSON.parse(new TextDecoder().decode(bytes))
    const passages = (Array.isArray(data.passages) ? data.passages : []).map((p) => String(p || '').trim()).filter(Boolean)
    if (!passages.length) return null
    // names: 지문마다 이름(예: '29번') — 있으면 여러 지문 워크북 제목에 씀
    const names = Array.isArray(data.names) && data.names.length === passages.length ? data.names.map((n) => String(n || '').slice(0, 100)) : []
    // heads: 지문마다 교과서 소제목 [{ at: 그 부분 첫 문장 앞부분, no, en, ko }] — 워크북 STAGE 1 · 흐름 지도에 (cm-variant '워크북 묶음', 선생님 2026-11-05)
    const clip = (v, n) => String(v || '').slice(0, n)
    const heads = Array.isArray(data.heads) && data.heads.length === passages.length
      ? data.heads.map((hs) => (Array.isArray(hs) ? hs : []).filter((h) => h && h.at && h.en).map((h) => ({ at: clip(h.at, 80), no: clip(h.no, 6), en: clip(h.en, 100), ko: clip(h.ko, 100) })))
      : passages.map(() => [])
    return { title: String(data.title || '').slice(0, 200), passages, names, heads }
  } catch {
    return null
  }
}

export function takeIncoming() {
  if (typeof window === 'undefined') return null
  const got = decodeIncoming(window.location.hash)
  if (got) {
    try { window.history.replaceState(null, '', window.location.pathname + window.location.search) } catch {}
  }
  return got
}
