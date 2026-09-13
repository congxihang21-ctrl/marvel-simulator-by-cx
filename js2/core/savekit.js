/* ============================================================================
 * savekit.js · v2.7.0 模块化架构内核（二）：存档 schema 版本 + 迁移 + 配额安全写入
 *
 * - SCHEMA_VERSION：存档结构版本（与玩法版本 APP_VERSION 分离）；
 * - migrate(S)：旧档进入新代码时的统一迁移入口（幂等，可安全重复调用）；
 * - safeWrite(key, json)：localStorage 写满时返回 false，由调用方降级
 *   （章节存档点很大，必须显式处理配额失败，不能静默吞掉）。
 * ==========================================================================*/
(function (w) {
  'use strict';
  if (w.MCU && w.MCU.SaveKit) return;
  var MCU = w.MCU || (w.MCU = {});

  var SCHEMA_VERSION = '2.7.0';
  var migrations = [
    {
      to: '2.6.4',
      note: 'chronicle container is lazily migrated by Chronicle.ensure',
      run: function (S) {
        if (!Array.isArray(S.chronicle)) { /* handled in chronicle.js */ }
      }
    },
    {
      to: '2.7.0',
      note: 'chapter replay checkpoints container',
      run: function (S) {
        if (!Array.isArray(S._chkpoints)) S._chkpoints = [];
      }
    }
  ];

  function migrate(S) {
    if (!S || typeof S !== 'object') return S;
    try {
      migrations.forEach(function (m) {
        var done = S._vDone || (S._vDone = []);
        if (done.indexOf(m.to) < 0) {
          try { m.run(S); } catch (e) { if (MCU.diag) MCU.diag.warn('migrate ' + m.to + ': ' + (e && e.message)); }
          done.push(m.to);
        }
      });
      S._schemaV = SCHEMA_VERSION;
    } catch (e) {
      if (MCU.diag) MCU.diag.warn('migrate fatal: ' + (e && e.message));
    }
    return S;
  }

  function stamp(S) {
    if (S && typeof S === 'object') S._schemaV = SCHEMA_VERSION;
    return S;
  }

  function safeWrite(key, json) {
    try {
      localStorage.setItem(key, json);
      return true;
    } catch (e) {
      if (MCU.diag) MCU.diag.warn('safeWrite quota: ' + key + ' (' + (json ? json.length : 0) + ' bytes)');
      return false;
    }
  }

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : (fallback === undefined ? null : fallback);
    } catch (e) {
      if (MCU.diag) MCU.diag.warn('readJSON parse: ' + key + ' ' + (e && e.message));
      return fallback === undefined ? null : fallback;
    }
  }

  MCU.SaveKit = {
    SCHEMA_VERSION: SCHEMA_VERSION,
    migrate: migrate,
    stamp: stamp,
    safeWrite: safeWrite,
    readJSON: readJSON
  };
  w.MCU = MCU;
})(window);
