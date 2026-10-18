// 워크북 PDF 만들기 (Vercel 서버 함수) — 워크북 내용(json)만 받아 우리 모양 코드로 그리고, 크롬으로 A4 PDF를 돌려줌
//   POST { data } → 워크북 하나 · POST { list } → 여러 지문 이어 붙인 전체본 (정답은 맨 뒤) · parts: 고른 구성
//   아무 HTML이나 받지 않음 (그리는 건 src/workbook/workbook.js). 밖으로 나가는 요청은 Google Fonts만 허용
import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'
import { workbookHtml, workbooksHtml } from '../src/workbook/workbook.js'
import { passwordOk } from './ai.js'

const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com']
// 글꼴은 TTF로 (웹 글꼴 woff2로 찍으면 PDF 글자 간격이 어긋남 — cm-variant docs/workbook.md). Google Fonts에 옛 브라우저처럼 물으면 TTF 주소를 줌
const FONTS_URL = 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Source+Serif+4:wght@400;600'
let fontCssP = null
function fontCss() {
  fontCssP ||= fetch(FONTS_URL, { headers: { 'User-Agent': 'Wget/1.0' } })
    .then((r) => (r.ok ? r.text() : ''))
    .then((css) => (/\.ttf\)/.test(css) ? css : ''))
    .catch(() => '')
  return fontCssP
}
let browserP = null // 따뜻할 때는 크롬을 다시 띄우지 않음
async function browser() {
  if (browserP) {
    const b = await browserP.catch(() => null)
    if (b?.connected) return b
  }
  browserP = puppeteer.launch({
    args: process.env.CHROME_PATH ? ['--no-sandbox'] : chromium.args,
    executablePath: process.env.CHROME_PATH || (await chromium.executablePath()),
    headless: true,
  })
  return browserP
}

export function htmlFor(body, css = '') {
  const parts = Array.isArray(body?.parts) && body.parts.length ? body.parts : undefined
  if (Array.isArray(body?.list)) {
    if (!body.list.length || body.list.length > 40) throw new Error('지문은 1~40개까지')
    return workbooksHtml(body.list, { parts, title: String(body.title || ''), fontCss: css })
  }
  if (body?.data) return workbookHtml(body.data, { parts, fontCss: css })
  throw new Error('data 또는 list가 없어요')
}

export async function renderPdf(html) {
  const page = await (await browser()).newPage()
  try {
    await page.setRequestInterception(true)
    page.on('request', (r) => {
      const u = r.url()
      if (u.startsWith('about:') || u.startsWith('data:') || FONT_HOSTS.some((h) => new URL(u).hostname === h)) r.continue()
      else r.abort()
    })
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 })
    await page.evaluate(() => document.fonts.ready)
    // '다음 쪽에 이어집니다' 표시가 끝날 때까지
    await page.waitForFunction(() => document.documentElement.dataset.ready === '1', { timeout: 10000 }).catch(() => {})
    return await page.pdf({ format: 'A4', printBackground: true })
  } finally {
    await page.close().catch(() => {})
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST만 돼요' }); return }
  if (!passwordOk(req)) { res.status(401).json({ error: '비밀번호가 필요해요' }); return }
  let html
  try {
    html = htmlFor(typeof req.body === 'string' ? JSON.parse(req.body) : req.body, await fontCss())
  } catch (e) {
    res.status(400).json({ error: e.message })
    return
  }
  try {
    const pdf = await renderPdf(html)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).send(Buffer.from(pdf))
  } catch (e) {
    browserP = null
    res.status(500).json({ error: `PDF를 만들지 못했어요: ${e.message}` })
  }
}
