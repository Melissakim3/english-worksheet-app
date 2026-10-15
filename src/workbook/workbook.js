// 원본: Melissakim3/cm-variant public/lib/workbook.js — 모양을 바꿀 때는 두 곳을 같이 고칠 것
// 지문 완전정복 워크북 (종이 절약형) — 선생님이 고른 모양 그대로 (2026-10-08, 올림포스1 Ch.05 견본)
//   1쪽 STAGE 1 문장 뜯어보기 · 2쪽 STAGE 2 흐름 지도 + Lv1~4 · 3쪽 Lv5 + 쉬운 말로 다시 읽기 · 4쪽 정답
//   모양(칸 비율·글꼴·색·순서)은 여기서만 정하고, 지문마다 바뀌는 내용은 워크북.json으로 받음 (모양 설명: docs/workbook.md)
//   번호(문장 번호, 선지 ①~⑤, 끼울 자리)는 코드가 붙이고, json에는 글만 둠
import { checkSummary, summaryHtml, summaryAnswers, SUMMARY_CSS, findIn, seeded } from './workbook-summary.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// __밑줄__ → <u>밑줄</u> (요약 상자·한 줄 요지에서 핵심어 표시)
const marked = (s) => esc(s).replace(/__(.+?)__/g, '<u>$1</u>');
const CIRCLE = ['①', '②', '③', '④', '⑤'];
const FLOW_COLORS = ['#e8c547', '#5bb974', '#e8829a', '#5b9bd5', '#a07cc5', '#e39b4f', '#4fb3b3'];

// 워크북 구성 — 선생님이 골라서 만듦 (keys = 그 부분에 필요한 json 칸). 고르지 않으면 BASE 다섯 개 (원래 4쪽 워크북)
export const PARTS = [
  { id: 'study', name: '문장 뜯어보기', keys: ['study'], desc: '문장마다 해석 · 논리 꼬리표 · 어법 · 단어/동의어/반의어' },
  { id: 'flow', name: '흐름 지도', keys: ['flow', 'core'], desc: '흐름 단계별 문장 묶음 + 주제 · 요지 · 핵심 대조' },
  { id: 'basic', name: 'Lv1~3 기본', keys: ['lv1', 'lv2', 'lv3'], desc: '단어 · 내용 O/X · 지칭 · 쉬운 말↔원문 · 흐름 3계단 · 문장 역할 · 연결어' },
  { id: 'exam', name: 'Lv4~5 수능·변형', keys: ['lv4', 'lv5'], desc: '지문 가리고: 제목 · 빈칸 · 문장 넣기 · 요약문 · 어법 · 어휘 · 바뀐 문장' },
  { id: 'wrap', name: '쉬운 말로 다시 읽기', keys: ['wrap'], desc: '1번부터 쉬운 말로 소리 내어 읽기 + 주제 · 제목 영어/한글 + 한 줄 요지' },
  { id: 'summary', name: '종합 한 장', keys: ['summary'], desc: '지문에 어법·어휘 괄호 · 첫 글자 빈칸 · 지칭 · 배열 → 접어서 순서 · 주제/제목 배열 · 요약 · 핵심 질문 영작' },
];
export const BASE_PARTS = ['study', 'flow', 'basic', 'exam', 'wrap'];

// 내용이 모양에 맞는지 먼저 봄 — 틀린 곳을 모두 모아 알려 줌 (빈 배열이면 통과)
//   parts: 고른 구성만 검사 (안 주면 BASE_PARTS)
export function checkWorkbook(d, parts = BASE_PARTS) {
  const errs = [];
  const has = (p) => parts.includes(p);
  const n = d?.sentences?.length || 0;
  const inRange = (k, where) => { if (!(Number.isInteger(k) && k >= 1 && k <= n)) errs.push(`${where}: 문장 번호 ${k}가 1~${n} 밖`); };
  const five = (q, where) => {
    if (!q) return errs.push(`${where}: 없음`);
    if (q.options?.length !== 5) errs.push(`${where}: 선지는 5개`);
    if (!(q.answer >= 1 && q.answer <= 5)) errs.push(`${where}: 정답 번호는 1~5`);
  };
  if (!d?.title) errs.push('title: 지문 이름 없음');
  if (!n) errs.push('sentences: 영어 문장 없음');
  if (has('study')) {
    if (d?.study?.length !== n) errs.push(`study: 문장 ${n}개마다 하나씩 (지금 ${d?.study?.length ?? 0}개)`);
    (d?.study || []).forEach((s, i) => {
      for (const k of ['ko', 'tag', 'logic', 'grammar']) if (!s[k]) errs.push(`study ${i + 1}번: ${k} 없음`);
      for (const w of s.words || []) {
        if (!w.en || !w.ko) errs.push(`study ${i + 1}번: 단어와 뜻을 모두`);
        for (const [en, ko] of [...(w.syn || []), ...(w.ant || [])]) if (!en || !ko) errs.push(`study ${i + 1}번 ${w.en}: 동·반의어마다 뜻을 꼭 (${en || '?'})`);
      }
    });
  }
  if (has('flow')) {
    const seen = (d?.flow || []).flatMap((f) => f.s || []);
    seen.forEach((k) => inRange(k, 'flow'));
    if (seen.length !== n || new Set(seen).size !== n) errs.push('flow: 모든 문장이 한 번씩 들어가야 함');
    for (const k of ['topic', 'gist', 'contrast']) if (!d?.core?.[k]) errs.push(`core.${k} 없음`);
  }
  if (has('basic')) {
    (d?.lv1?.ox || []).forEach(([, a, k], i) => { if (!['O', 'X'].includes(a)) errs.push(`1-B ${i + 1}: 답은 O 또는 X`); inRange(k, `1-B ${i + 1}`); });
    (d?.lv2?.easy || []).forEach(([, k], i) => inRange(k, `2-B ${i + 1}`));
    if ((d?.lv3?.roles || []).length !== n) errs.push(`3-B: 문장 ${n}개마다 역할 하나씩`);
    if ((d?.lv3?.order || []).length !== (d?.lv3?.cards || []).length) errs.push('3-A: 순서와 카드 개수가 다름');
  }
  if (has('exam')) {
    five(d?.lv4?.title, '4-A');
    five(d?.lv4?.blank, '4-B');
    five(d?.lv5?.summary, '5-A');
    const ins = d?.lv4?.insert;
    if (!ins) errs.push('4-C: 없음');
    else {
      inRange(ins.given, '4-C given');
      if (ins.given === 1) errs.push('4-C: 첫 문장은 주어진 문장으로 쓰지 않음 (앞에 끼울 자리가 없음)');
      if (n - 1 < 6) errs.push('4-C: 주어진 문장을 뺀 뒤 6문장 이상 있어야 ①~⑤ 자리를 만듦');
    }
    (d?.lv5?.para || []).forEach(([, k], i) => inRange(k, `5-D ${i + 1}`));
    if (grammarInPassage(d?.lv5?.grammar) || grammarInPassage(d?.lv5?.vocab)) checkPassageMarks(d, errs);
  }
  if (has('wrap')) {
    if ((d?.wrap?.easy || []).length !== n) errs.push(`쉬운 말로 다시 읽기: 문장 ${n}개마다 하나씩`);
    for (const k of ['topicEn', 'topicKo', 'titleEn', 'titleKo', 'oneLine']) if (!d?.wrap?.[k]) errs.push(`wrap.${k} 없음`);
  }
  if (has('summary') && n) errs.push(...checkSummary(d).map((e) => `종합: ${e}`));
  return errs;
}

// 5-B 어법 · 5-C 어휘: 지문 전체 한 번에 어법 [ 맞는 것 / 틀린 것 ]¹ · 어휘 〈 맞는 것 / 헷갈리는 것 〉ⓐ 촘촘하게
//   (선생님: '…'로 잘린 문장이 별로, 자리는 적게, 2단 안에) — 2026-10-15
//   grammar = [{ s, target, wrong, point, why }] · vocab = [{ s, target, wrong, why }] (target은 그 문장에 그대로 있는 말)
//   예전 모양 [[문장, 답, 이유]]도 그대로 읽음
export const grammarInPassage = (g) => Array.isArray(g) && g.length > 0 && !Array.isArray(g[0]);
// 개수 범위 · 같은 포인트 허용 수 (촘촘하면 같은 포인트가 더 나올 수밖에 없어 17개부터 3번까지)
export const grammarRange = (n) => [Math.min(25, Math.max(5, Math.round(n * 0.8))), Math.min(40, Math.max(12, Math.round(n * 1.6)))];
const pointLimit = (count) => (count >= 17 ? 3 : 2);
const VOCAB_NO = 'ⓐⓑⓒⓓⓔⓕⓖⓗ';
function checkPassageMarks(d, errs) {
  const S = d.sentences || [];
  const n = S.length;
  const gIn = grammarInPassage(d.lv5?.grammar);
  const g = gIn ? d.lv5.grammar : [];
  const v = grammarInPassage(d.lv5?.vocab) ? d.lv5.vocab : [];
  const [lo, hi] = grammarRange(n);
  if (gIn && (g.length < lo || g.length > hi)) errs.push(`5-B: 어법 고르기는 ${lo}~${hi}개 (지금 ${g.length}개)`);
  if (v.length && (v.length < 2 || v.length > 6)) errs.push(`5-C: 어휘 고르기는 2~6개 (지금 ${v.length}개)`);
  const spans = {};
  const points = {};
  [...g.map((m, i) => ['5-B', m, i]), ...v.map((m, i) => ['5-C', m, i])].forEach(([q, m, i]) => {
    const w = `${q} ${i + 1}(${m.target ?? '?'})`;
    if (!(Number.isInteger(m.s) && m.s >= 1 && m.s <= n)) return errs.push(`${w}: 문장 번호 ${m.s}가 1~${n} 밖`);
    const at = findIn(S[m.s - 1], m.target);
    if (!at) return errs.push(`${w}: "${m.target}"가 ${m.s}번 문장에 그대로 없음`);
    const list = (spans[m.s] ||= []);
    if (list.some(([a, b]) => at[0] < b && a < at[1])) errs.push(`${w}: ${m.s}번 문장에서 다른 괄호와 겹침`);
    list.push(at);
    if (!String(m.wrong || '').trim() || String(m.wrong).trim().toLowerCase() === String(m.target).trim().toLowerCase()) errs.push(`${w}: wrong(틀린 것)이 없거나 정답과 같음`);
    if (!m.why) errs.push(`${w}: why(이유) 없음`);
    if (q === '5-C') return;
    const p = String(m.point || '').replace(/\s/g, '').toLowerCase();
    if (!p) errs.push(`${w}: point(어법 포인트) 없음`);
    else if ((points[p] = (points[p] || 0) + 1) === pointLimit(g.length) + 1) errs.push(`5-B: 어법 포인트 "${m.point}"가 ${pointLimit(g.length) + 1}번 이상 — ${pointLimit(g.length)}번까지`);
  });
  const covered = new Set(g.map((m) => m.s)).size;
  if (gIn && n >= 5 && covered < Math.ceil(n * 0.7)) errs.push(`5-B: 지문 전체에 고르게 — 괄호가 있는 문장이 ${covered}개뿐 (${Math.ceil(n * 0.7)}개 이상)`);
  if (Object.values(spans).some((l) => l.length > 3)) errs.push('5-B: 한 문장에 괄호는 3개까지');
}

// 지문 전체에 괄호 — 번호는 지문 차례대로(어법 1·2·3, 어휘 ⓐⓑⓒ), 앞뒤 순서는 같은 지문이면 늘 같게. 정답 목록도 돌려줌
export function grammarPassage(d) {
  const rnd = seeded(`${d.title}|grammar|${d.sentences.join(' ')}`);
  const marks = [
    ...(grammarInPassage(d.lv5.grammar) ? d.lv5.grammar.map((m) => ({ ...m, v: false })) : []),
    ...(grammarInPassage(d.lv5.vocab) ? d.lv5.vocab.map((m) => ({ ...m, v: true })) : []),
  ];
  const grammar = [];
  const vocab = [];
  const html = d.sentences.map((sent, i) => {
    const items = marks.filter((m) => m.s === i + 1).map((m) => ({ m, at: findIn(sent, m.target) })).sort((x, y) => x.at[0] - y.at[0]);
    let out = '';
    let pos = 0;
    for (const { m, at } of items) {
      const t = sent.slice(at[0], at[1]);
      const [a, b] = rnd() < 0.5 ? [t, m.wrong] : [m.wrong, t];
      out += esc(sent.slice(pos, at[0]));
      if (m.v) { const no = VOCAB_NO[vocab.length]; vocab.push({ ...m, no }); out += `<span class="gv">〈&nbsp;${esc(a)} / ${esc(b)}&nbsp;〉<sup>${no}</sup></span>`; }
      else { const no = grammar.length + 1; grammar.push({ ...m, no }); out += `<span class="gp">[&nbsp;${esc(a)} / ${esc(b)}&nbsp;]<sup>${no}</sup></span>`; }
      pos = at[1];
    }
    return out + esc(sent.slice(pos));
  }).join(' ');
  return { html, grammar, vocab, answers: grammar };
}

// 4-C 문장 넣기: 주어진 문장을 빼고, 남은 문장 사이에 ①~⑤ — 정답 자리가 주어진 문장 원래 자리와 같은지도 봄
export function insertPassage(sentences, given) {
  const rest = sentences.filter((_, i) => i !== given - 1);
  // 자리 후보 = 문장과 문장 사이 (원래 자리가 맨 끝이면 끝자리도). 5개를 넘으면 원래 자리가 가운데쯤 오도록 5개를 고름
  const at = given - 1; // 원래 자리 = rest의 at번째 문장 앞 (rest.length면 맨 끝)
  const gaps = rest.map((_, i) => i).slice(1);
  if (at === rest.length) gaps.push(at);
  const start = Math.min(Math.max(0, gaps.indexOf(at) - 2), Math.max(0, gaps.length - 5));
  const pick = gaps.slice(start, start + 5);
  const slot = (i) => { const k = pick.indexOf(i); return k >= 0 ? ` ( ${CIRCLE[k]} ) ` : (i && i < rest.length ? ' ' : ''); };
  const html = rest.map((s, i) => slot(i) + esc(s)).join('') + slot(rest.length).trimEnd();
  return { html, answer: pick.indexOf(at) + 1 };
}

const n2 = (i) => `<span class="n">${i + 1}</span>`;
const LV = (n, name, note = '') => `<div class="w-lv"><b>Lv${n}</b><span>${name}</span>${note ? `<i>${note}</i>` : ''}</div>`;
const Q = (no, title, guide = '') => `<div class="w-q"><b>${no}</b><b>${title}</b><span>${guide}</span></div>`;
const LIST = (rows, { mark = '', fill = '', nw = false, cls = '' } = {}) => `<ol class="w-list ${nw ? 'nw' : ''} ${cls}">${rows.map((r, i) => `<li>${n2(i)}<span class="x">${r}</span>${fill ? `<span class="w-fill" style="flex:0 0 ${fill}"></span>` : ''}${mark ? `<span class="m">${mark}</span>` : ''}</li>`).join('')}</ol>`;
const FILL = '<span class="w-fill"></span>';
const EN = (t) => `<div class="w-en">${esc(t)}</div>`;
const OPTS = (arr, inline = false) => `<div class="w-opt ${inline ? 'in' : ''}">${arr.map((o, i) => `<span>${CIRCLE[i]} ${esc(o)}</span>`).join('')}</div>`;

// 단어 칸: 영어 · 뜻 두 줄로 세로 맞춤, S(동의어 초록) · A(반의어 빨강) 글자는 첫 줄에만
const wordRows = (k, list) => list.map(([en, ko], j) => `<span class="lb ${k}">${j ? '' : (k === 'syn' ? 'S' : 'A')}</span><span class="e ${k}">${esc(en)}</span><span class="k">${esc(ko)}</span>`).join('');
const wordBlock = (w) => `<div class="wg"><span class="lb"></span><b class="e">${esc(w.en)}</b><span class="k hk">${esc(w.ko)}</span>${wordRows('syn', w.syn || [])}${wordRows('ant', w.ant || [])}</div>`;
const range = (s) => (s.length > 1 ? `${s[0]}~${s[s.length - 1]}` : `${s[0]}`);

function studyPage(d) {
  const T = esc(d.title);
  return `
<div class="stage first"><span>STAGE 1</span>문장 뜯어보기<em class="pname">${T}</em></div>
<table class="study"><thead><tr><th>영어 원문</th><th>한글 해석 · 논리 · 문법</th><th>단어 · 동의어 · 반의어</th></tr></thead><tbody>
${d.sentences.map((s, i) => { const t = d.study[i]; return `<tr><td class="en"><span class="n">${i + 1}</span>${esc(s)}</td><td class="ko"><div class="tr">${esc(t.ko)}</div><div class="lgin"><div><span class="tag">${esc(t.tag)}</span>${esc(t.logic)}</div><div><span class="tag g">어법</span>${esc(t.grammar)}</div></div></td><td class="wd">${(t.words || []).map(wordBlock).join('')}</td></tr>`; }).join('\n')}
</tbody></table>`;
}

function flowPage(d) {
  const T = esc(d.title);
  return `
<div class="stage first"><span>STAGE 2</span>흐름 지도<em class="pname">${T}</em></div>
<div class="fmap">${d.flow.map((f, i) => `<div class="fl" style="border-left-color:${FLOW_COLORS[i % FLOW_COLORS.length]}"><b>${esc(f.label)}</b><i>${range(f.s)}번</i></div><div class="ft">${f.s.map((k) => esc(d.sentences[k - 1])).join(' ')}</div>`).join('')}</div>
<div class="core"><div><b>주제</b><span>${esc(d.core.topic)}</span></div><div><b>요지</b><span>${esc(d.core.gist)}</span></div><div><b>핵심 대조</b><span>${marked(d.core.contrast)}</span></div></div>
`;
}

function problemPages(d, has) {
  const { lv1, lv2, lv3, lv4, lv5, wrap } = d;
  const ins = has('exam') && insertPassage(d.sentences, lv4.insert.given);
  const gIn = has('exam') && grammarInPassage(lv5.grammar);
  const vIn = has('exam') && grammarInPassage(lv5.vocab);
  const basic = () => `
${LV(1, '읽고 기억하기')}
${Q('1-A', '단어', '뜻을 쓰세요.')}
<div class="w-words">${lv1.words.map(([w], i) => `<span class="w">${n2(i)}${esc(w)}</span>${FILL}`).join('')}</div>
${Q('1-B', '내용 O / X', '맞으면 O, 틀리면 X와 근거 문장 번호')}
${LIST(lv1.ox.map(([t]) => esc(t)), { mark: 'O · X　(　)', nw: true })}

${LV(2, '정확히 이해하기')}
${Q('2-A', '지칭', '가리키는 것을 우리말로')}
${LIST(lv2.refs.map(([w]) => esc(w)), { fill: '62%' })}
${Q('2-B', '쉬운 말 ↔ 원문', '원문 몇 번 문장인지')}
${LIST(lv2.easy.map(([t]) => esc(t)), { mark: '(　　)', nw: true })}

${LV(3, '흐름 잡기')}
${Q('3-A', '흐름 3계단', '카드 순서 → 핵심어 → 내 말로 한 줄')}
<div class="w-box">${lv3.cards.map(([k, t]) => `<div>(${esc(k)}) ${esc(t)}</div>`).join('')}</div>
<div class="w-sub">① 순서　${lv3.cards.map(() => '(　　)').join(' → ')}</div>
<div class="w-sub keep">② 핵심어 빈칸 <span class="g">첫 글자 힌트</span></div>
${LIST(lv3.steps.map(([h, t]) => `<b>${esc(h)}</b>　${esc(t)}`), { nw: true })}
<div class="w-sub keep">③ 내 말로 한 줄씩</div>
<div class="w-write">${lv3.steps.map(([h]) => `<span>${esc(h.split(' ')[0])}</span>${FILL}`).join('')}</div>
${Q('3-B', '문장별 역할', '같은 보기를 여러 번 써도 됨')}
<div class="w-box c">${esc(lv3.roleChoices)}</div>
<div class="w-sub">${d.sentences.map((_, i) => `${i + 1}번 (　)`).join('　 ')}</div>
${Q('3-C', '연결어 빈칸', '빈칸에 쓰고, 오른쪽에 하는 일')}
${LIST(lv3.conn.map(([t]) => esc(t)), { fill: '40px', nw: true })}
`;
  const exam = () => `
${LV(4, '수능형으로 풀기', '지문을 가리고 풀기')}
${Q('4-A', '제목', '가장 적절한 것은?')}
${OPTS(lv4.title.options)}
<div class="w-sub">오답 선지 하나를 골라 틀린 이유와 근거 번호</div><div class="w-write one">${FILL}</div>
${Q('4-B', '빈칸 추론', '가장 적절한 것은?')}
${EN(lv4.blank.sentence)}
${OPTS(lv4.blank.options, true)}
${Q('4-C', '문장 넣기', '주어진 문장이 들어갈 곳은?')}
${EN(d.sentences[lv4.insert.given - 1])}
<div class="w-box en">${ins.html}</div>

${LV(5, '변형까지 대비하기', '지문을 가리고 풀기')}
${Q('5-A', '요약문', '(A), (B)에 들어갈 말은?')}
${EN(lv5.summary.sentence)}
${OPTS(lv5.summary.options, true)}
${gIn || vIn ? `${Q(gIn && vIn ? '5-B · 5-C' : gIn ? '5-B' : '5-C', gIn && vIn ? '어법 · 어휘' : gIn ? '어법' : '어휘', `${gIn ? '[ ] 어법상 맞는 것' : ''}${gIn && vIn ? ' · ' : ''}${vIn ? '〈 〉 문맥에 맞는 낱말' : ''}에 ○`)}\n<div class="w-gp">${grammarPassage(d).html}</div>` : ''}
`;
  const examFull = () => `
<div class="w-full">
${gIn ? '' : `${Q('5-B', '어법', '( ) 안에서 맞는 것을 고르고, 오른쪽에 이유')}\n${LIST(lv5.grammar.map(([t]) => esc(t)), { fill: '32%', nw: true, cls: 'en' })}`}
${vIn ? '' : `${Q('5-C', '어휘', '문맥에 맞는 낱말에 ○')}\n${LIST(lv5.vocab.map(([t]) => esc(t)), { nw: true, cls: 'en' })}`}
${Q('5-D', '바뀐 문장 찾기', '원문 번호를 쓰고, 바뀐 말에 밑줄 긋고 위에 원래 말')}
${LIST(lv5.para.map(([t]) => esc(t)), { mark: '(　　)번', nw: true, cls: 'en tall' })}
</div>`;
  const wrapUp = () => `
<div class="w-chk">
<div class="w-q"><b>쉬운 말로 다시 읽기</b><span>문제를 다 푼 뒤, 1번부터 차례로 소리 내어 읽어 보세요.</span></div>
<ol class="easy">${wrap.easy.map(([role, t], i) => `<li><span class="c">${i + 1}</span><span class="t">${esc(t)}</span><span class="x">${esc(role)}</span></li>`).join('')}</ol>
<div class="tt">
<div><b>주제</b><span class="en">${esc(wrap.topicEn)}</span><span class="ko">${esc(wrap.topicKo)}</span></div>
<div><b>제목</b><span class="en">${esc(wrap.titleEn)}</span><span class="ko">${esc(wrap.titleKo)}</span></div>
<div><b>한 줄로</b><span class="ko k1">${marked(wrap.oneLine)}</span></div>
</div></div>`;
  const cols = (has('basic') ? basic() : '') + (has('exam') ? exam() : '');
  return `
<div class="wb">${cols ? `<div class="cols">${cols}</div>` : ''}${has('exam') ? examFull() : ''}${has('wrap') ? wrapUp() : ''}
</div>`;
}

function answerPage(d, has) {
  const { lv1, lv2, lv3, lv4, lv5 } = d;
  const A = (k, v) => `<div class="k">${k}</div><div class="v">${v}</div>`;
  const AL = (arr) => arr.map((v, i) => `<span>${i + 1}) ${v}</span>`).join('');
  const one = (q, opt = false) => `<span><b>${CIRCLE[q.answer - 1]}${opt ? ` ${esc(q.options[q.answer - 1])}` : ''}</b> ${esc(q.why || '')}</span>`;
  const ins = has('exam') && insertPassage(d.sentences, lv4.insert.given);
  const basic = () => `
${A('1-A', AL(lv1.words.map(([, k]) => esc(k))))}
${A('1-B', AL(lv1.ox.map(([, a, n]) => `${a} (${n}번)`)))}
${A('2-A', AL(lv2.refs.map(([, a]) => esc(a))))}
${A('2-B', AL(lv2.easy.map(([, n]) => `${n}번`)))}
${A('3-A', `<span>① ${lv3.order.map((k) => `(${esc(k)})`).join(' → ')}</span><span>② ${lv3.steps.map(([, , a]) => esc(a)).join(' / ')}</span>${lv3.ownWords ? `<span>③ 예: ${esc(lv3.ownWords)}</span>` : ''}`)}
${A('3-B', AL(lv3.roles.map(esc)))}
${A('3-C', AL(lv3.conn.map(([, a, w]) => `<b>${esc(a)}</b> ${esc(w)}`)))}`;
  const exam = () => `
${A('4-A', one(lv4.title))}
${A('4-B', one(lv4.blank, true))}
${A('4-C', `<span><b>${CIRCLE[ins.answer - 1]}</b> ${esc(lv4.insert.why || '')}</span>`)}
${A('5-A', one(lv5.summary, true))}
${A('5-B', grammarInPassage(lv5.grammar)
    ? AL(grammarPassage(d).grammar.map((m) => `<b>${esc(m.target)}</b> ${esc(m.point)} — ${esc(m.why)}`))
    : AL(lv5.grammar.map(([, a, w]) => `<b>${esc(a)}</b> ${esc(w)}`)))}
${A('5-C', grammarInPassage(lv5.vocab)
    ? grammarPassage(d).vocab.map((m) => `<span>${m.no} <b>${esc(m.target)}</b> ${esc(m.why)}</span>`).join('')
    : AL(lv5.vocab.map(([, a, w]) => `<b>${esc(a)}</b> ${esc(w)}`)))}
${A('5-D', AL(lv5.para.map(([, n, w]) => `<b>${n}번</b> ${esc(w)}`)))}`;
  const summary = () => `
<div class="k sm-k">종합</div><div class="v sm-k"><span>${esc(d.title)} 종합(Summary)</span></div>
${summaryAnswers(d).map(([k, v]) => A(k, v)).join('\n')}`;
  const rows = (has('basic') ? basic() : '') + (has('exam') ? exam() : '') + (has('summary') ? summary() : '');
  if (!rows) return '';
  return `
<section class="answers-start"><div class="wb">
<div class="w-lv"><span>정답</span><i>${esc(d.title)}</i></div>
<div class="w-ans${has('summary') && (has('basic') || has('exam')) ? ' tight' : ''}">${rows}
</div></div></section>`;
}

// 글꼴: 기본은 Google Fonts (Noto Sans KR · Source Serif 4). 인터넷이 막힌 곳은 fontCss로 @font-face를 직접 넣음
export const FONT_LINK = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Source+Serif+4:wght@400;600&display=swap">';

//   parts: 넣을 구성 (안 주면 원래 4쪽 + json에 summary가 있으면 종합 한 장도)
export function workbookHtml(d, { fontCss = '', parts } = {}) {
  parts = parts || [...BASE_PARTS, ...(d?.summary ? ['summary'] : [])];
  const has = (p) => parts.includes(p);
  const errs = checkWorkbook(d, parts);
  if (errs.length) throw new Error(`워크북 내용 확인:\n- ${errs.join('\n- ')}`);
  // 앞쪽(문장 뜯어보기 → 흐름 지도 → 문제)은 이어서, 종합 한 장과 정답은 새 쪽에서
  const front = [
    has('study') && studyPage(d),
    has('flow') && flowPage(d),
    (has('basic') || has('exam') || has('wrap')) && problemPages(d, has),
  ].filter(Boolean);
  // 문장 뜯어보기 뒤에 다른 것이 오면 쪽을 넘김
  const frontHtml = front.length ? `<section>${front.map((h, i) => (i === 0 && has('study') && front.length > 1 ? `${h}\n<div class="pb"></div>` : h)).join('')}</section>` : '';
  const summary = has('summary') ? `<section class="${frontHtml ? 'answers-start' : ''}">${summaryHtml(d)}</section>` : '';
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${esc(d.title)} 워크북</title>${fontCss ? '' : FONT_LINK}<style>
${fontCss}
${WORKBOOK_CSS}
${has('summary') ? SUMMARY_CSS : ''}
</style></head><body>
${frontHtml}${summary}${answerPage(d, has)}</body></html>`;
}

export const WORKBOOK_CSS = `
@page { size: a4; margin: 6mm 9mm 9mm; }
body{font-family:"Noto Sans KR", sans-serif;font-size:8.1pt;color:#111111;line-height:1.32}
table{width:100%;border-collapse:collapse;margin:2px 0px}
.cols{column-count:2;column-gap:7mm;column-rule:1px solid #dddddd}
td{border-bottom:1px solid #dddddd;vertical-align:top;padding:1.5px 4px}
section{break-after:auto}
.answers-start{break-before:page}
.pb{break-after:page}
.stage{padding-bottom:2px;display:flex;align-items:center;gap:8px;font-weight:700;font-size:10.5pt;border-bottom:1.3px solid #333333;padding:4px 0px 6px;margin:4px 0px 0px}
.stage span{display:inline-block;margin-right:6px;border:1.3px solid #222222;font-size:7pt;letter-spacing:2px;padding:1px 7px;margin:0px;font-family:"Liberation Mono", "Courier New", monospace}
table.study tr{break-inside:avoid}
table.study{width:100%;border-collapse:collapse;table-layout:fixed}
table.study th{text-align:left;font-size:6.5pt;color:#888888;font-weight:500;padding:12px 6px 5px;border-bottom:1.3px solid #222222}
table.study td{vertical-align:top;border-bottom:1px dotted #d6d6d6;padding:8px 5px 6px}
.tr{border-bottom:1px dotted #cfcfcf;padding-bottom:5px;margin-bottom:5px}
.tag{display:inline-block;font-weight:700;border-radius:2px;font-size:6pt !important;padding:1px 4px !important;margin-right:6px !important;color:#a5770a !important;background:#fcefc7 !important}
.tag.g{color:#2a5d8f !important;background:#dcebf6 !important}
.stage.first{margin-top:0px;padding-top:0px}
.stage .pname{margin-left:auto;font-style:normal;font-weight:700;font-size:8.5pt;color:#222222}
.nw{white-space:nowrap}
.wb{font-size:7.6pt;line-height:1.5;color:#1a1a1a}
.wb .cols{column-count:2;column-gap:9mm;column-rule:medium;margin-top:12px}
.wb b{font-weight:700}
.w-lv{display:flex;align-items:baseline;gap:8px;border-bottom:0.8px solid #111111;padding-bottom:3px;margin:15px 0px 5px;break-after:avoid}
.wb .cols > .w-lv:first-child{margin-top:0px}
.w-lv b{font-size:6.4pt;letter-spacing:1px;border:0.8px solid #111111;padding:0px 4px;line-height:1.45}
.w-lv span{font-size:9pt;font-weight:700}
.w-lv i{margin-left:auto;font-style:normal;color:#999999;font-size:6.6pt}
.w-q{display:flex;align-items:baseline;gap:6px;margin:9px 0px 3px;break-after:avoid}
.w-q b{font-size:7.9pt}
.w-q span{color:#8a8a8a;font-size:6.8pt;margin-left:3px}
.w-list{list-style:none;margin:0px;padding:0px}
.w-list li{display:flex;align-items:baseline;gap:6px;padding:1.6px 0px;break-inside:avoid}
.wb .n{color:#aaaaaa;font-size:6.3pt;flex:0 0 7px;text-align:right}
.w-list .x{flex:1 1 auto;min-width:0px}
.w-list.nw .x{white-space:nowrap;overflow:hidden;text-overflow:clip}
.w-list .m{flex:0 0 auto;color:#b0b0b0;font-size:6.6pt;margin-left:6px;white-space:nowrap}
.w-list.en .x{font-family:"Source Serif 4", serif;font-size:8pt}
.w-list.tall li{padding:7px 0px 1px}
.w-fill{flex:1 1 auto;border-bottom:0.6px solid #c6c6c6;min-width:24px;align-self:stretch}
.w-words{display:grid;grid-template-columns:auto 1fr auto 1fr;gap:5px 6px;align-items:end}
.w-words .w{display:flex;gap:6px;align-items:baseline}
.w-words .w-fill{height:12px;margin-right:6px}
.w-box{border:0.6px solid #9a9a9a;padding:4px 9px;margin:3px 0px 5px;break-inside:avoid}
.w-box.c{text-align:center;white-space:nowrap}
.w-box.en{font-family:"Source Serif 4", serif;font-size:7.9pt;line-height:1.55;text-align:justify}
.w-sub{margin:5px 0px 2px}
.w-sub .g{color:#8a8a8a;font-size:6.8pt;margin-left:4px}
.keep{break-after:avoid}
.w-write{display:grid;grid-template-columns:auto 1fr;gap:6px 8px;align-items:end;margin:2px 0px 4px}
.w-write span:not(.w-fill){font-weight:700;font-size:7.2pt}
.w-write .w-fill{height:13px}
.w-write.one{grid-template-columns:1fr}
.w-write.one .w-fill{height:16px}
.w-en{font-family:"Source Serif 4", serif;font-size:8.2pt;line-height:1.5;border-left:1.2px solid #111111;padding:1px 0px 1px 8px;margin:3px 0px 4px;break-after:avoid;break-inside:avoid}
.w-opt{font-family:"Source Serif 4", serif;font-size:8pt;line-height:1.55;margin:0px 0px 2px 2px;break-before:avoid;break-inside:avoid}
.w-opt span{display:block}
.w-opt.in span{display:inline-block;margin-right:9px;white-space:nowrap}
.w-full{border-top:0.8px solid #111111;margin-top:12px;padding-top:1px}
.w-full .w-list li{padding:2.6px 0px}
.w-full .w-list.tall li{padding:8px 0px 1px}
.w-full .w-list.nw .x{white-space:nowrap}
.w-gp{font-family:"Source Serif 4", serif;font-size:7.9pt;line-height:1.85;text-align:justify;margin:2px 0px 4px}
.w-gp .gp{font-weight:600}
.w-gp .gv{font-weight:600;color:#2a5d8f}
.w-gp sup{font-family:"Noto Sans KR", sans-serif;font-size:5.4pt;font-weight:400;color:#777777;margin-left:1px}
.w-chk{border-top:0.8px solid #111111;margin-top:14px;padding-top:1px;break-inside:avoid}
.w-chk ol{list-style:none;padding:0px;margin:3px 0px 0px;column-count:2;column-gap:9mm}
.w-chk li{font-size:7pt;padding:2px 0px;break-inside:avoid;display:flex;gap:6px}
.w-ans{display:grid;grid-template-columns:30px 1fr;row-gap:0px}
.w-ans .k{font-weight:700;font-size:7.6pt;padding:5px 0px;border-bottom:0.5px solid #e4e4e4}
.w-ans .v{padding:5px 0px;border-bottom:0.5px solid #e4e4e4;line-height:1.6}
.w-ans .v span{display:inline-block;margin-right:14px}
.w-ans .v b{font-weight:700}
/* 워크북 + 종합 정답을 한 쪽에: 글씨·간격을 조금 줄임 */
.w-ans.tight{font-size:6.9pt;line-height:1.4}
.w-ans.tight .k,.w-ans.tight .v{padding:2.4px 0px;line-height:1.4}
.w-ans.tight .k{font-size:7pt}
.w-ans.tight .v span{margin-right:10px}
.w-ans .sm-k{border-top:1.2px solid #111111;margin-top:6px;font-weight:700}
.fmap{display:grid;grid-template-columns:62px 1fr;column-gap:10px;margin:7px 0px}
.fmap .fl b{font-size:7pt;font-weight:700;white-space:nowrap}
.fmap .fl i{font-style:normal;font-size:6pt;color:#999999}
.fmap .ft{font-family:"Source Serif 4", serif;font-size:7.8pt;line-height:1.45;padding:2.5px 0px;border-bottom:0.5px solid #e6e6e6;text-align:justify}
.fmap .ft:nth-last-child(1){border-bottom:none}
.fmap .fl{border-left:2.5px solid;padding:2px 0px 2px 6px;display:flex;flex-direction:column;justify-content:center;line-height:1.25;border-bottom:0.5px solid #e6e6e6}
.fmap .fl:nth-last-child(2){border-bottom:none}
.core{border:1px solid #333333;border-radius:3px;padding:4px 12px;margin-bottom:12px;break-inside:avoid}
.core div{display:grid;grid-template-columns:52px 1fr;align-items:baseline;padding:2px 0px;border-bottom:0.5px solid #e6e6e6}
.core div:last-child{border-bottom:none}
.core b{font-size:7pt;letter-spacing:1px;color:#555555}
.core span{font-size:8.2pt;font-weight:500}
.core u{text-decoration-thickness:1px;text-underline-offset:3px}
table.study th:nth-child(1){width:53% !important}
table.study th:nth-child(2){width:28% !important}
table.study th:nth-child(3){width:19% !important}
table.study td.en{font-family:"Source Serif 4", serif;width:auto;padding:5px 12px 4px 6px;color:#111111;line-height:3 !important;font-size:10pt !important}
table.study td.ko{width:auto;color:#555555;padding-left:5px;padding-right:8px;font-size:6.6pt !important;line-height:1.7 !important}
table.study td.ko .tr{border-bottom:none !important;margin:0px !important;padding:0px !important}
.lgin{margin-top:6px;padding-top:5px;border-top:1px dotted #d6d6d6;font-size:6.5pt;line-height:1.6;color:#333333}
.lgin div{margin-bottom:4px}
.wg{display:grid;grid-template-columns:7px 66px 1fr;gap:0px 3px;line-height:1.5;margin-top:7px;align-items:baseline}
.wg:first-child{margin-top:0px}
.wg .e{font-size:6.4pt;color:#222222;white-space:nowrap}
.wg b.e{font-family:"Source Serif 4", serif;font-weight:600;font-size:6.8pt;color:#111111}
.wg .k{font-size:5.9pt;color:#888888;word-break:keep-all}
.wg .hk{align-self:baseline}
.wg .lb{font-size:5.6pt;font-weight:700}
.wg .lb.syn,.wg .e.syn{color:#2e7d4a}
.wg .lb.ant,.wg .e.ant{color:#c0392b}
.wg .lb.syn:not(:empty),.wg .lb.ant:not(:empty){padding-top:0px}
table.study td.wd{border-left:1px dotted #e0e0e0;padding:8px 0px 6px 8px !important}
table.study td.en .n{display:inline-block;width:13px;height:13px;line-height:12px;border:1px solid #222222;border-radius:50%;text-align:center;font-family:"Noto Sans KR", sans-serif;font-size:7pt !important;font-weight:700 !important;color:#111111 !important;margin-right:6px !important;vertical-align:1px !important}
ol.easy{list-style:none;padding:0px;margin:4px 0px 0px;column-count:1 !important}
ol.easy li{display:grid;grid-template-columns:16px 1fr 34px;align-items:baseline;padding:3px 0px;border-bottom:0.5px solid #ececec;line-height:1.5;font-size:7.8pt !important}
ol.easy .c{display:inline-block;width:11px;height:11px;line-height:10px;border:0.8px solid #222222;border-radius:50%;text-align:center;font-size:6pt;font-weight:700}
ol.easy .x{text-align:right;color:#999999;font-size:6.4pt}
.tt{margin-top:6px;border:0.6px solid #9a9a9a;padding:3px 10px}
.tt div{display:grid;grid-template-columns:40px auto 1fr;column-gap:12px;align-items:baseline;padding:2.5px 0px;border-bottom:0.5px solid #ececec}
.tt div:last-child{border-bottom:none}
.tt b{font-size:6.6pt;letter-spacing:1px;color:#555555}
.tt .en{font-family:"Source Serif 4", serif;font-size:8.6pt;font-weight:600;color:#111111}
.tt .ko{font-size:7pt;color:#777777}
.tt .k1{grid-column:2 / 4;font-size:7.8pt;color:#222222}
.tt u{text-decoration-thickness:1px;text-underline-offset:3px}
`;
