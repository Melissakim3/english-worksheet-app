// 화면 잠금 (2026-11-08 선생님: "cm-worksheet도 잠가줘") — cm-variant public/lib/gate.js와 같은 방식
//   비밀번호(Vercel APP_PASSWORD)가 맞을 때만 화면을 보이고, 아니면 비밀번호 칸만 · 넣은 비밀번호는 AI · PDF 버튼과 같은 'ws_pw'에 기억
//   cm-variant '워크시트 앱으로 보내기'로 온 지문(#cm=…)은 잠겨 있는 동안 잠깐 맡겨 두었다가, 비밀번호를 넣은 뒤 다시 돌려줌
(function () {
  var root = document.documentElement;
  root.style.visibility = 'hidden';
  var KEY = 'ws_pw', HOLD = 'ws_hold_hash';
  var first = /[#&]cm=/.test(location.hash) ? location.hash : ''; // 앱이 주소에서 지우기 전에 먼저 잡아 둠
  try { // 비밀번호 넣고 다시 열 때: 맡겨 둔 지문을 주소에 다시 붙임 (앱이 읽기 전에)
    var held = sessionStorage.getItem(HOLD);
    if (held && !/[#&]cm=/.test(location.hash)) { history.replaceState(null, '', location.pathname + location.search + held); }
    sessionStorage.removeItem(HOLD);
  } catch (e) { /* 무시 */ }
  var pw = function () { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } };
  var whenReady = function (fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); };
  var open = function (warn) {
    root.style.visibility = '';
    if (warn) whenReady(function () { var b = document.createElement('div'); b.textContent = '⚠ 앱 비밀번호(APP_PASSWORD)가 설정되지 않아 이 화면을 누구나 볼 수 있어요. Vercel 환경변수에 넣어 주세요.'; b.style.cssText = 'background:#d94b4b;color:#fff;padding:8px 12px;text-align:center;font:14px sans-serif'; document.body.prepend(b); });
  };
  var lock = function (msg) {
    try { if (first) sessionStorage.setItem(HOLD, first); } catch (e) { /* 무시 */ }
    setInterval(function () { if (document.title !== '비밀번호') document.title = '비밀번호'; }, 300); // 잠긴 동안 탭 제목에도 아무것도 안 보이게
    whenReady(function () {
      document.title = '비밀번호';
      var st = document.createElement('style');
      st.textContent = 'body>:not(#gateBox){display:none!important}body{margin:0;min-height:100vh;display:grid!important;place-items:center;background:#f3f5f8!important}';
      document.head.append(st);
      var f = document.createElement('form'); f.id = 'gateBox';
      f.style.cssText = 'font:15px/1.5 -apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;display:grid;gap:10px;background:#fff;border:1px solid #e0e5ec;border-radius:14px;padding:22px 24px;min-width:260px';
      f.innerHTML = '<label for="gatePw" style="font-weight:700">비밀번호</label><input id="gatePw" type="password" autocomplete="current-password" style="font:inherit;padding:8px 10px;border:1px solid #cfd6e0;border-radius:8px"><button style="font:inherit;font-weight:700;padding:8px 10px;border:0;border-radius:10px;background:#1e3a5f;color:#fff;cursor:pointer">들어가기</button><span id="gateMsg" style="color:#c0392b;font-size:13px;min-height:18px"></span>';
      document.body.append(f);
      root.style.visibility = '';
      var input = f.querySelector('input'); input.focus();
      if (msg) f.querySelector('#gateMsg').textContent = msg;
      f.onsubmit = function (e) {
        e.preventDefault();
        try { localStorage.setItem(KEY, input.value.trim()); } catch (er) { /* 다시 물음 */ }
        check().then(function (ok) { if (ok) location.reload(); else f.querySelector('#gateMsg').textContent = '비밀번호가 틀렸어요.'; }).catch(function () { f.querySelector('#gateMsg').textContent = '연결이 안 돼요. 잠시 뒤 다시.'; });
      };
    });
  };
  var check = function () {
    return fetch('/api/ai?check=1', { headers: { 'x-app-password': encodeURIComponent(pw()) }, cache: 'no-store' })
      .then(function (r) { return r.status === 401 ? false : r.json().then(function (j) { return j && j.ok ? j : false; }); });
  };
  check().then(function (j) { if (j) open(!j.needsPassword); else lock(pw() ? '비밀번호가 바뀌었어요. 다시 넣어 주세요.' : ''); }).catch(function () { lock('연결이 안 돼요. 잠시 뒤 다시.'); });
})();
