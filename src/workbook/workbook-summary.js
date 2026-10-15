// 원본: Melissakim3/cm-variant public/lib/workbook-summary.js — 모양을 바꿀 때는 두 곳을 같이 고칠 것
// 종합 한 장 (Summary) — 한 지문에 어법·어휘 괄호 · 첫 글자 빈칸 · 지칭 · 배열, 접는 선 아래(지문 가리고) 순서 · 주제/제목 배열 · 요약 · 핵심 질문
//   선생님 견본(영어2 미래엔 4과 본문4 종합)을 따져 보고 고친 규칙 (2026-10-15)
//   - 번호 · [맞는 것 / 틀린 것] 순서 · 배열 낱말 섞기 · 순서 카드 기호는 코드가 정함 (AI는 문장 번호와 낱말만)
//   - 배열 낱말은 문장부호를 떼고 문장 첫 대문자를 소문자로 (끝자리·첫자리 힌트 없앰)
//   - 어법 설명 · 해석은 정답 쪽에만 (학생 쪽에 답이 새지 않게), 요약문에는 한글 해석을 안 붙임
//   - 같은 어법 포인트는 2번까지, 빈칸은 지문에 한 번만 나오는 내용어만
//   - 순서는 단락을 가리고 카드로 (카드 묶음이 1번 문장부터 끝까지 빠짐없이)
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const REF = ['❶', '❷', '❸', '❹', '❺'];
const LABEL = ['A', 'B', 'C', 'D', 'E'];
export const MARK_TYPES = ['어법', '어휘', '빈칸'];
const BLANK = '__________';
// 빈칸으로 비우지 않는 낱말 (시험에 안 나오는 기능어)
const STOP = new Set(('the a an and or but nor if of in on at to for with from by as is are was were be been being have has had do does did it its this that these those they them their there here what which who whom whose when where why how not no can could will would may might must should shall than then so such very more most much many some any all each every other also only just into onto over under about after before because while although though since until upon out up down off yet still even ever never').split(' '));
// 순서 카드에 쓰면 자리가 보이는 말
const ORDER_HINTS = ['처음', '먼저', '마지막', '결론', '끝으로', '이어서', '다음으로', '도입', '마무리', '서론', '본론'];

// 같은 지문이면 늘 같은 자리 (generate.js와 같은 방식)
function seeded(seed) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296;
}
const flat = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// 낱말 경계로 찾기 (대소문자 그대로) → [시작, 끝] 또는 null
export function findIn(sentence, target) {
  const t = flat(target);
  if (!t) return null;
  const m = new RegExp(`(?<![A-Za-z’'])${reEsc(t)}(?![A-Za-z])`).exec(sentence);
  return m ? [m.index, m.index + t.length] : null;
}
const bare = (w) => w.replace(/^[“"‘'(]+|[”"’')\].,;:!?]+$/g, '');

// 문장 가운데서 대문자로 나오는 낱말 = 고유명사 (배열할 때 소문자로 바꾸지 않음)
function properNouns(sentences) {
  const set = new Set();
  for (const s of sentences) s.split(' ').slice(1).forEach((w) => { const b = bare(w); if (/^[A-Z]/.test(b)) set.add(b); });
  return set;
}
const lowerHint = (w, proper) => (w !== 'I' && !proper.has(w) && !/^[A-Z]{2,}$/.test(w) && /^[A-Z]/.test(w) ? w[0].toLowerCase() + w.slice(1) : w);

// 섞기 — 원래 순서와 같으면 한 칸 돌림
function shuffle(arr, rnd) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  if (a.length > 1 && a.every((x, i) => x === arr[i])) a.push(a.shift());
  return a;
}

// {묶음} 표시 문장 → 고정 글 / 섞을 낱말 조각
export function parseFrame(frame) {
  const parts = [];
  String(frame ?? '').split(/(\{[^{}]*\})/).forEach((p) => {
    if (!p) return;
    if (p.startsWith('{')) parts.push({ words: flat(p.slice(1, -1)).split(' ').filter(Boolean) });
    else parts.push({ text: p });
  });
  return parts;
}
const frameText = (frame) => flat(String(frame ?? '').replace(/[{}]/g, ''));

// 묶음 하나 → [ a / b / c ] + 끝 문장부호는 괄호 밖으로
function scrambled(words, rnd, proper, change = []) {
  let tail = '';
  const shown = words.map((w, i) => {
    let b = bare(w);
    if (i === words.length - 1) tail = (w.match(/[.,;:!?]+["”’)]*$/) || [''])[0];
    for (const [from, to] of change) if (b.toLowerCase() === String(from).toLowerCase()) b = to;
    return lowerHint(b, proper);
  });
  return `<span class="sm-ar">[&nbsp;${shuffle(shown, rnd).map(esc).join(' / ')}&nbsp;]</span>${esc(tail)}`;
}
function frameHtml(frame, rnd, proper, change) {
  return parseFrame(frame).map((p) => (p.words ? scrambled(p.words, rnd, proper, change) : esc(p.text))).join('');
}

// 내용이 모양에 맞는지 — 틀린 곳을 모두 모아 알려 줌 (빈 배열이면 통과)
export function checkSummary(d) {
  const errs = [];
  const sm = d?.summary;
  const S = d?.sentences || [];
  const n = S.length;
  if (!sm) return ['summary: 없음'];
  const ok = (k) => Number.isInteger(k) && k >= 1 && k <= n;
  const passage = S.join(' ').toLowerCase();
  const arr = sm.arrange || [];
  const arrS = new Set(arr.map((a) => a.s));
  if (arr.length < 1 || arr.length > 2) errs.push('arrange: 배열 문장은 1~2개 (주제문 + 핵심 구문)');
  arr.forEach((a, i) => {
    const w = `arrange ${i + 1}`;
    if (!ok(a.s)) return errs.push(`${w}: 문장 번호 ${a.s}가 1~${n} 밖`);
    if (frameText(a.frame) !== flat(S[a.s - 1])) errs.push(`${w}: frame에서 { }를 빼면 ${a.s}번 원문과 글자까지 같아야 함`);
    const groups = parseFrame(a.frame).filter((p) => p.words);
    if (!groups.length) errs.push(`${w}: 섞을 { } 묶음이 없음`);
    if (groups.some((g) => g.words.length < 2)) errs.push(`${w}: { } 묶음마다 2낱말 이상`);
    if (groups.reduce((t, g) => t + g.words.length, 0) < 5) errs.push(`${w}: 섞는 낱말이 모두 5개 이상`);
    if (!a.ko) errs.push(`${w}: ko(해석) 없음`);
  });
  if (arrS.size !== arr.length) errs.push('arrange: 같은 문장을 두 번 쓰지 않음');

  // 지문 안 문제 (어법 · 어휘 · 빈칸) + 지칭 — 같은 문장 안에서 겹치면 안 됨
  const spans = {};
  const place = (s, target, w) => {
    if (!ok(s)) { errs.push(`${w}: 문장 번호 ${s}가 1~${n} 밖`); return; }
    if (arrS.has(s)) { errs.push(`${w}: ${s}번은 배열 문장이라 다른 문제를 못 넣음`); return; }
    const at = findIn(S[s - 1], target);
    if (!at) { errs.push(`${w}: "${target}"가 ${s}번 문장에 그대로 없음`); return; }
    const list = (spans[s] ||= []);
    if (list.some(([a, b]) => at[0] < b && a < at[1])) errs.push(`${w}: ${s}번 문장에서 다른 문제와 겹침`);
    list.push(at);
  };
  const marks = sm.marks || [];
  const count = { 어법: 0, 어휘: 0, 빈칸: 0 };
  const points = {};
  marks.forEach((m, i) => {
    const w = `marks ${i + 1}(${m.target ?? '?'})`;
    if (!MARK_TYPES.includes(m.type)) return errs.push(`${w}: type은 어법·어휘·빈칸 중 하나`);
    count[m.type]++;
    place(m.s, m.target, w);
    if (!m.why) errs.push(`${w}: why(정답 이유) 없음`);
    if (m.type === '빈칸') {
      const t = flat(m.target);
      if (!/^[A-Za-z-]+$/.test(t)) errs.push(`${w}: 빈칸은 한 낱말만`);
      else if (t.length < 4 || STOP.has(t.toLowerCase())) errs.push(`${w}: 빈칸은 시험에 나올 내용어로 (기능어·짧은 낱말 X)`);
      else if ((passage.match(new RegExp(`(?<![a-z])${reEsc(t.toLowerCase())}(?![a-z])`, 'g')) || []).length > 1) errs.push(`${w}: 지문 다른 곳에도 나와서 답이 보임 — 한 번만 나오는 낱말로`);
    } else {
      if (!flat(m.wrong) || flat(m.wrong).toLowerCase() === flat(m.target).toLowerCase()) errs.push(`${w}: wrong(틀린 것)이 없거나 정답과 같음`);
      if (m.type === '어법') {
        const p = flat(m.point).replace(/\s/g, '').toLowerCase();
        if (!p) errs.push(`${w}: point(어법 포인트) 없음`);
        else if ((points[p] = (points[p] || 0) + 1) === 3) errs.push(`어법 포인트 "${m.point}"가 3번 이상 — 같은 포인트는 2번까지`);
      }
    }
  });
  const avail = n - arr.length;
  const want = { 어법: [Math.min(12, Math.max(3, Math.round(avail * 0.8))), 25], 어휘: [2, 6], 빈칸: [2, 8] };
  for (const [k, [lo, hi]] of Object.entries(want)) if (count[k] < lo || count[k] > hi) errs.push(`${k} 문제는 ${lo}~${hi}개 (지금 ${count[k]}개)`);
  const refs = sm.refs || [];
  if (refs.length < 2 || refs.length > 4) errs.push('refs: 지칭은 2~4개');
  refs.forEach((r, i) => { place(r.s, r.target, `refs ${i + 1}(${r.target ?? '?'})`); if (!r.answer) errs.push(`refs ${i + 1}: answer 없음`); });

  const order = sm.order || [];
  const seen = order.flatMap((o) => o.s || []);
  if (order.length < 3 || order.length > 5) errs.push('order: 순서 카드는 3~5개');
  if (seen.length !== n || seen.some((k, i) => k !== i + 1)) errs.push(`order: 카드 묶음(s)이 1번부터 ${n}번까지 빠짐없이 차례로`);
  order.forEach((o, i) => {
    if (!o.card) errs.push(`order ${i + 1}: card 없음`);
    const hint = ORDER_HINTS.find((h) => String(o.card || '').includes(h));
    if (hint) errs.push(`order ${i + 1}: 카드에 자리 힌트 '${hint}'를 쓰지 않음`);
  });

  for (const k of ['topic', 'title']) {
    const t = sm[k];
    const words = flat(t?.en).split(' ').filter(Boolean);
    if (!t?.ko) errs.push(`${k}.ko 없음`);
    if (words.length < 3 || words.length > 10) errs.push(`${k}.en: 3~10낱말`);
  }

  const sum = sm.sum;
  if (!sum?.sentence) errs.push('sum: 요약문 없음');
  else {
    const tags = [...sum.sentence.matchAll(/\(([A-E])\)/g)].map((m) => m[1]);
    const ans = sum.answers || [];
    if (ans.length < 2 || ans.length > 3) errs.push('sum: 빈칸은 2~3개');
    if (tags.join('') !== LABEL.slice(0, ans.length).join('')) errs.push('sum: 요약문에 (A)(B)(C)가 차례로 한 번씩, 정답 수와 같게');
    ans.forEach((a, i) => {
      const t = flat(a);
      if (!/^[A-Za-z-]+$/.test(t)) errs.push(`sum (${LABEL[i]}): 정답은 한 낱말`);
      else if (!passage.includes(t.toLowerCase().slice(0, Math.min(5, Math.max(3, t.length - 2))))) errs.push(`sum (${LABEL[i]}): "${t}"는 지문에 나온 낱말(어형 변형 가능)이어야 함`);
    });
    if (new Set(ans.map((a) => flat(a).toLowerCase())).size !== ans.length) errs.push('sum: 정답이 서로 달라야 함');
  }

  const key = sm.key;
  if (!key?.question) errs.push('key.question 없음');
  if (!key?.answer) errs.push('key.answer 없음');
  else {
    const groups = parseFrame(key.answer).filter((p) => p.words);
    if (groups.length < 2 || groups.length > 5) errs.push('key.answer: { } 묶음은 2~5개');
    if (groups.some((g) => g.words.length < 2)) errs.push('key.answer: { } 묶음마다 2낱말 이상');
    if (!/^why\b/i.test(flat(key.question)) && /^(this is because|because)\b/i.test(frameText(key.answer))) errs.push('key: 질문에 바로 답하는 문장으로 (Why 질문이 아니면 because로 시작하지 않음)');
    const inGroups = groups.flatMap((g) => g.words.map((w) => bare(w).toLowerCase()));
    (key.changes || []).forEach(([from, to], i) => {
      if (!to) errs.push(`key.changes ${i + 1}: 원형이 없음`);
      if (!inGroups.includes(String(from || '').toLowerCase())) errs.push(`key.changes ${i + 1}: "${from}"가 { } 묶음 안에 없음`);
    });
    if ((key.changes || []).length > 2) errs.push('key.changes: 어형 바꾸기는 2개까지');
  }
  return errs;
}

// 학생 쪽 한 장
export function summaryHtml(d) {
  const sm = d.summary;
  const S = d.sentences;
  const rnd = seeded(`${d.title}|summary|${S.join(' ')}`);
  const proper = properNouns(S);
  const arrBy = Object.fromEntries((sm.arrange || []).map((a) => [a.s, a]));
  let no = 0;
  let refNo = 0;
  const blocks = [];
  let para = [];
  const flush = () => { if (para.length) blocks.push(`<p class="sm-p">${para.join(' ')}</p>`); para = []; };
  S.forEach((sent, i) => {
    const s = i + 1;
    const a = arrBy[s];
    if (a) {
      flush();
      a.no = ++no;
      blocks.push(`<div class="sm-box"><b class="sm-lab">[${esc(a.kind || '배열')}]</b> <span class="sm-en">${frameHtml(a.frame, rnd, proper)}</span><sup>${no}</sup><div class="sm-ko">${esc(a.ko)}</div><div class="sm-line"></div></div>`);
      return;
    }
    const items = [
      ...(sm.marks || []).filter((m) => m.s === s).map((m) => ({ m, at: findIn(sent, m.target) })),
      ...(sm.refs || []).filter((r) => r.s === s).map((r) => ({ r, at: findIn(sent, r.target) })),
    ].sort((x, y) => x.at[0] - y.at[0]);
    let out = '';
    let pos = 0;
    for (const it of items) {
      out += esc(sent.slice(pos, it.at[0]));
      const t = sent.slice(it.at[0], it.at[1]);
      if (it.r) { it.r.no = REF[refNo++]; out += `<span class="sm-ref">${it.r.no}<u>${esc(t)}</u></span>`; }
      else {
        it.m.no = ++no;
        if (it.m.type === '빈칸') out += `<b>${esc(t[0])}</b>${BLANK}<sup>${no}</sup>`;
        else {
          const pair = rnd() < 0.5 ? [t, it.m.wrong] : [it.m.wrong, t];
          out += `<span class="sm-ch">[&nbsp;<b>${esc(pair[0])}</b> / <b>${esc(pair[1])}</b>&nbsp;]</span><sup>${no}</sup>`;
        }
      }
      pos = it.at[1];
    }
    para.push(out + esc(sent.slice(pos)));
  });
  flush();
  // 순서 카드: 기호는 섞어서 (정답 순서는 sm.orderAnswer로 남김)
  const cards = shuffle(sm.order.map((o, i) => ({ ...o, i })), rnd);
  cards.forEach((c, k) => { c.label = LABEL[k]; });
  sm.orderAnswer = sm.order.map((_, i) => cards.find((c) => c.i === i).label);
  const words = (t) => shuffle(flat(t).split(' ').map(bare).filter(Boolean).map((w) => lowerHint(w, proper)), rnd).map(esc).join(' / ');
  const sumLine = esc(sm.sum.sentence).replace(/\(([A-E])\)/g, '(<b>$1</b>) ________');
  const hasChange = (sm.key.changes || []).length > 0;
  return `
<div class="sm">
<div class="sm-head">${esc(d.title)}　종합(Summary)</div>
<div class="sm-guide">■ 괄호 [ ] 안에서 알맞은 것을 고르고, 첫 글자 빈칸을 채우고, [배열] 문장은 [ ] 안 낱말을 배열해 아래 줄에 쓰시오. 밑줄 친 ❶❷ 어구가 가리키는 것은 아래에 우리말로 쓰시오.</div>
${blocks.join('\n')}
<div class="sm-sec">지칭 — 무엇을 가리키는지 우리말로</div>
${(sm.refs || []).map((r) => `<div class="sm-row"><span>${r.no} <u>${esc(r.target)}</u></span><span class="sm-fill"></span></div>`).join('')}
<div class="sm-fold">✂ 여기서 접어 위 지문을 가리고 아래를 푸세요</div>
<div class="sm-sec">글의 순서 — (A)~(${LABEL[cards.length - 1]})를 글의 흐름에 맞게 배열하시오</div>
<div class="sm-cards">${cards.map((c) => `<div><b>(${c.label})</b> ${esc(c.card)}</div>`).join('')}</div>
<div class="sm-ansrow">${cards.map(() => '(　　)').join(' → ')}</div>
<div class="sm-sec">주제 · 제목 — 주어진 낱말을 모두 배열하시오</div>
<div class="sm-q"><b>&lt;주제&gt;</b> ${esc(sm.topic.ko)}</div>
<div class="sm-dash">${words(sm.topic.en)}</div>
<div class="sm-q"><b>&lt;제목&gt;</b> ${esc(sm.title.ko)}</div>
<div class="sm-dash">${words(sm.title.en)}</div>
<div class="sm-sec">요약 — 지문에 나온 낱말로 (A)·(B)${sm.sum.answers.length > 2 ? '·(C)' : ''}를 채우시오 (어형 변형 가능)</div>
<div class="sm-dash en">${sumLine}</div>
<div class="sm-sec">이 글의 핵심 질문 — [ ] 안 낱말을 배열하여 답을 완성하시오${hasChange ? ' (필요하면 어형을 바꾸시오)' : ''}</div>
<div class="sm-q en"><b>Q.</b> ${esc(sm.key.question)}</div>
<div class="sm-box en">${frameHtml(sm.key.answer, rnd, proper, sm.key.changes || [])}</div>
<div class="sm-line"></div><div class="sm-line"></div>
</div>`;
}

// 정답 쪽 줄들 — [칸 이름, 내용 html] (summaryHtml을 먼저 불러야 번호가 붙어 있음)
export function summaryAnswers(d) {
  const sm = d.summary;
  const S = d.sentences;
  const rows = [];
  const marks = (sm.marks || []).filter((m) => m.no).sort((a, b) => a.no - b.no);
  rows.push(['지문', marks.map((m) => `<span>${m.no}) <b>${esc(m.target)}</b>${m.type === '어휘' ? ' (어휘)' : ''} ${esc(m.point ? `${m.point} — ` : '')}${esc(m.why)}</span>`).join('')]);
  rows.push(['배열', (sm.arrange || []).map((a) => `<span>${a.no}) <b>${esc(S[a.s - 1])}</b> ${esc(a.why || '')}</span>`).join('')]);
  rows.push(['지칭', (sm.refs || []).map((r) => `<span>${r.no} ${esc(r.target)} → <b>${esc(r.answer)}</b></span>`).join('')]);
  const range = (s) => (s.length > 1 ? `${s[0]}~${s[s.length - 1]}번` : `${s[0]}번`);
  rows.push(['순서', `<span><b>${sm.orderAnswer.map((l) => `(${l})`).join(' → ')}</b> ${sm.order.map((o, i) => `(${sm.orderAnswer[i]}) ${range(o.s)}`).join(' · ')}</span>`]);
  rows.push(['주제', `<span><b>${esc(sm.topic.en)}</b></span>`]);
  rows.push(['제목', `<span><b>${esc(sm.title.en)}</b></span>`]);
  rows.push(['요약', `<span>${sm.sum.answers.map((a, i) => `(${LABEL[i]}) <b>${esc(a)}</b>`).join('　')} ${esc(sm.sum.why || '')}</span>`]);
  rows.push(['핵심', `<span><b>${esc(frameText(sm.key.answer))}</b> ${esc(sm.key.ko || '')}</span>`]);
  return rows;
}

export const SUMMARY_CSS = `
.sm{font-size:8.4pt;line-height:1.55;color:#111111}
.sm-head{background:#3a5a98;color:#ffffff;font-weight:700;font-size:10pt;text-align:right;padding:7px 12px;margin-bottom:8px}
.sm-guide{border:1px solid #555555;border-radius:3px;padding:5px 9px;font-weight:700;font-size:7.6pt;margin-bottom:6px}
.sm-p{font-family:"Source Serif 4", serif;font-size:8.6pt;line-height:2.05;text-align:justify;margin:4px 0px}
.sm-p sup,.sm-box sup{font-size:5.6pt;color:#555555;margin-left:1px}
.sm-ch b{font-weight:600}
.sm-ref{font-weight:600}
.sm-ref u{text-underline-offset:2px}
.sm-box{border-left:3px solid #3a5a98;background:#f4f6fa;padding:5px 10px 6px;margin:5px 0px;break-inside:avoid}
.sm-box.en,.sm-en{font-family:"Source Serif 4", serif;font-size:8.4pt;line-height:1.9}
.sm-lab{color:#3a5a98;font-family:"Noto Sans KR", sans-serif;font-size:7.6pt}
.sm-ar{font-weight:600}
.sm-ko{font-size:7.4pt;color:#444444;margin-top:2px}
.sm-line{border-bottom:0.8px solid #9a9a9a;height:18px}
.sm-sec{font-weight:700;font-size:8.2pt;border-top:1.2px solid #222222;padding-top:4px;margin:10px 0px 4px;break-after:avoid}
.sm-row{display:flex;gap:8px;align-items:baseline;margin:3px 0px}
.sm-row span:first-child{white-space:nowrap}
.sm-fill{flex:1 1 auto;border-bottom:0.6px solid #9a9a9a;height:14px}
.sm-fold{margin:12px 0px 0px;border-top:1.2px dashed #777777;text-align:center;font-size:7pt;color:#777777;padding-top:2px}
.sm-cards{display:grid;grid-template-columns:1fr 1fr;gap:4px 8px;break-inside:avoid}
.sm-cards div{border:0.8px solid #9a9a9a;border-radius:3px;padding:4px 7px;font-size:7.8pt}
.sm-ansrow{text-align:center;margin:5px 0px 2px;color:#555555}
.sm-q{margin:4px 0px 2px;font-size:7.8pt}
.sm-q.en{font-family:"Source Serif 4", serif;font-size:8.4pt}
.sm-dash{border:0.8px dashed #9a9a9a;border-radius:3px;padding:4px 8px;margin:2px 0px 4px}
.sm-dash.en{font-family:"Source Serif 4", serif;font-size:8.4pt}
`;
