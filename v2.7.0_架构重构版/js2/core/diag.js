/* ============================================================================
 * diag.js · v2.7.0 全局诊断系统
 * 替代旧代码里遍地的 catch(_){} 静默吞错：
 *   - 最早在 <head> 加载，连启动期错误都能抓到；
 *   - window.onerror / unhandledrejection 统一进环形缓冲（最多 80 条）；
 *   - 设置 →「🩺 诊断日志」可查看 / 一键复制发给作者；
 *   - 业务代码也可主动记录：MCU.diag.log('模块名', '内容')。
 * 本文件不依赖任何其他脚本，不操作游戏状态，加载失败也不影响游戏。
 * ==========================================================================*/
(function (w) {
  'use strict';
  if (w.MCU && w.MCU.diag) return;
  var MCU = w.MCU || (w.MCU = {});

  var CAP = 80;
  var buf = [];
  function rec(level, tag, msg){
    var at = new Date();
    function p(n){ return (n < 10 ? '0' : '') + n; }
    var ts = at.getFullYear() + '-' + p(at.getMonth() + 1) + '-' + p(at.getDate()) +
      ' ' + p(at.getHours()) + ':' + p(at.getMinutes()) + ':' + p(at.getSeconds());
    buf.push({ level: level, tag: tag || '', msg: String(msg == null ? '' : msg), at: ts });
    if (buf.length > CAP) buf.shift();
  }
  var diag = {
    log: function (tag, msg) { rec('LOG', tag, msg); },
    warn: function (msg) { rec('WARN', 'app', msg); console.warn('[diag]', msg); },
    error: function (msg) { rec('ERR', 'app', msg); },
    list: function () { return buf.slice(); },
    clear: function () { buf = []; },
    text: function () {
      var ua = '';
      try { ua = navigator.userAgent; } catch (_) {}
      var ver = '';
      try { ver = (w.APP_VERSION || '') + ' ' + (w.CX_BETA_TAG || ''); } catch (_) {}
      var head = '=== 漫威模拟器 诊断日志 ' + ver + ' ===\n' + ua + '\n\n';
      return head + buf.map(function (e) {
        return '[' + e.at + '] ' + e.level + ' ' + (e.tag ? e.tag + ': ' : '') + e.msg;
      }).join('\n');
    }
  };
  MCU.diag = diag;
  w.MCU = MCU;

  w.addEventListener('error', function (ev) {
    try {
      var loc = ev.filename ? ('@' + String(ev.filename).split('/').pop() +
        (ev.lineno ? ':' + ev.lineno : '')) : '';
      rec('ERR', 'onerror', (ev.message || '未知错误') + ' ' + loc);
    } catch (_) {}
  }, true);
  w.addEventListener('unhandledrejection', function (ev) {
    try {
      var r = ev.reason;
      rec('ERR', 'promise', (r && (r.stack || r.message)) ? (r.message || r) : String(r));
    } catch (_) {}
  });

  /* ---- 查看器（自包含 DOM，不依赖 app.js） ---- */
  diag.open = function () {
    var old = document.getElementById('mcuDiagOv');
    if (old) old.remove();
    var ov = document.createElement('div');
    ov.id = 'mcuDiagOv';
    ov.className = 'mcu-diag-ov';
    ov.innerHTML =
      '<div class="mcu-diag-card">' +
        '<div class="mcu-diag-hd"><b>🩺 诊断日志</b>' +
          '<div class="mcu-diag-btns">' +
            '<button id="mcuDiagCopy">复制全部</button>' +
            '<button id="mcuDiagClear">清空</button>' +
            '<button id="mcuDiagX" class="x">✕</button>' +
          '</div>' +
        '</div>' +
        '<div class="mcu-diag-body" id="mcuDiagBody"></div>' +
        '<div class="mcu-diag-tip">把这里的内容复制发给作者（抖音同名 CX），能帮助快速定位 Bug。</div>' +
      '</div>';
    document.body.appendChild(ov);
    function paint(){
      var items = buf.length
        ? buf.map(function (e) {
          return '<div class="mcu-diag-line lvl-' + e.level + '"><span class="t">' + e.at + '</span>' +
            '<span class="lv">' + e.level + '</span>' +
            (e.tag ? '<span class="tag">' + esc(e.tag) + '</span>' : '') +
            '<span class="m">' + esc(e.msg) + '</span></div>';
        }).join('')
        : '<div class="mcu-diag-empty">暂无错误记录。一切正常 ✅</div>';
      document.getElementById('mcuDiagBody').innerHTML = items;
    }
    function esc(s){
      return String(s == null ? '' : s).replace(/[&<>"]/g, function (m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m];
      });
    }
    paint();
    document.getElementById('mcuDiagX').onclick = function () { ov.remove(); };
    ov.addEventListener('click', function (e) { if (e.target === ov) ov.remove(); });
    document.getElementById('mcuDiagClear').onclick = function () {
      diag.clear(); paint();
    };
    document.getElementById('mcuDiagCopy').onclick = function () {
      var btn = this;
      function done(){ btn.textContent = '✅ 已复制'; setTimeout(function () { btn.textContent = '复制全部'; }, 1600); }
      var txt = diag.text();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(done, function () { fallback(); });
      } else { fallback(); }
      function fallback(){
        var ta = document.createElement('textarea');
        ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (_) { btn.textContent = '复制失败，请长按全选'; }
        document.body.removeChild(ta);
      }
    };
  };
  w.openDiag = function () { diag.open(); };

  /* 诊断查看器样式（自包含） */
  try {
    var st = document.createElement('style');
    st.textContent =
      '.mcu-diag-ov{position:fixed;inset:0;z-index:6000;background:rgba(4,5,12,.7);display:flex;align-items:center;justify-content:center;padding:16px}' +
      '.mcu-diag-card{width:100%;max-width:640px;max-height:84vh;display:flex;flex-direction:column;background:#10121f;border:1px solid #2a2d44;border-radius:16px;overflow:hidden}' +
      '.mcu-diag-hd{display:flex;align-items:center;justify-content:space-between;padding:13px 15px;border-bottom:1px solid #23263a;color:#f2f3f8;font-size:15px}' +
      '.mcu-diag-btns{display:flex;gap:7px}' +
      '.mcu-diag-btns button{padding:6px 11px;border-radius:8px;border:1px solid #2a2d44;background:#171a2e;color:#c6cadb;font-size:12.5px;cursor:pointer}' +
      '.mcu-diag-btns button.x{border-color:#5a3a3a;color:#ffb3ae}' +
      '.mcu-diag-body{flex:1;overflow:auto;padding:10px 14px;font:11.5px/1.7 ui-monospace,Menlo,Consolas,monospace}' +
      '.mcu-diag-line{padding:6px 8px;border-bottom:1px solid #1b1e30;word-break:break-all}' +
      '.mcu-diag-line .t{color:#767b95;margin-right:8px}' +
      '.mcu-diag-line .lv{display:inline-block;min-width:38px;font-weight:700;margin-right:8px}' +
      '.mcu-diag-line .tag{color:#c9b4ff;margin-right:8px}' +
      '.mcu-diag-line.lvl-ERR .lv{color:#ff7a73}' +
      '.mcu-diag-line.lvl-WARN .lv{color:#e8b25a}' +
      '.mcu-diag-line.lvl-LOG .lv{color:#7ec8e3}' +
      '.mcu-diag-line .m{color:#d4d7e6;white-space:pre-wrap}' +
      '.mcu-diag-empty{text-align:center;color:#767b95;padding:50px 0;line-height:2}' +
      '.mcu-diag-tip{padding:10px 15px calc(12px + env(safe-area-inset-bottom));border-top:1px solid #23263a;color:#8b90a8;font-size:12px;line-height:1.7}';
    (document.head || document.documentElement).appendChild(st);
  } catch (_) {}
})(window);
