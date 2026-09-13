/* ============================================================================
 * store.js · v2.7.0 模块化架构内核（一）：发布订阅状态仓库 + 事件总线
 * 零依赖、无构建工具，浏览器原生 <script> 直接可用。
 *
 * 设计目的（v2.7 架构改造）：
 *   旧代码所有模块直接读写全局大对象 S，改完只能全量 renderAll() 兜底。
 *   新功能（编年史/章节回溯等）逐步改为：状态走 store、UI 订阅变更做局部更新。
 *   旧代码不强制迁移，按模块改造时再接入，保证线上始终可玩。
 *
 * 用法：
 *   var ui = MCU.createStore({tab:'home'});
 *   ui.subscribe(function(state, changed){ console.log('changed:', changed); });
 *   ui.set({tab:'world'});           // 通知订阅者
 *   ui.get().tab;                    // 'world'
 *
 *   MCU.bus.on('turn:end', fn);      // 跨模块松耦合事件
 *   MCU.bus.emit('turn:end', data);
 * ==========================================================================*/
(function (w) {
  'use strict';
  if (w.MCU && w.MCU.createStore) return;
  var MCU = w.MCU || (w.MCU = {});

  function createStore(initial){
    var state = initial || {};
    var subs = [];
    function notify(changed, prev){
      /* 复制一份遍历，回调内允许退订 */
      subs.slice().forEach(function (fn) {
        try { fn(state, changed, prev); } catch (e) {
          if (MCU.diag) MCU.diag.warn('store subscriber error: ' + (e && e.message));
          else console.warn('store subscriber error', e);
        }
      });
    }
    return {
      get: function () { return state; },
      /* 浅合并 patch；返回新状态 */
      set: function (patch) {
        if (!patch) return state;
        var prev = state;
        state = {};
        for (var k in prev) { if (Object.prototype.hasOwnProperty.call(prev, k)) state[k] = prev[k]; }
        for (var p in patch) { if (Object.prototype.hasOwnProperty.call(patch, p)) state[p] = patch[p]; }
        notify(patch, prev);
        return state;
      },
      /* 整体替换（读档/回溯时使用） */
      replace: function (next) {
        var prev = state;
        state = next || {};
        notify(null, prev);
        return state;
      },
      subscribe: function (fn) {
        if (typeof fn !== 'function') return function () {};
        subs.push(fn);
        return function unsubscribe(){
          var i = subs.indexOf(fn);
          if (i >= 0) subs.splice(i, 1);
        };
      }
    };
  }

  function createBus(){
    var map = {};
    return {
      on: function (ev, fn) {
        if (!ev || typeof fn !== 'function') return function () {};
        (map[ev] = map[ev] || []).push(fn);
        return function off(){
          var arr = map[ev] || [];
          var i = arr.indexOf(fn);
          if (i >= 0) arr.splice(i, 1);
        };
      },
      emit: function (ev, payload) {
        (map[ev] || []).slice().forEach(function (fn) {
          try { fn(payload); } catch (e) {
            if (MCU.diag) MCU.diag.warn('bus[' + ev + '] error: ' + (e && e.message));
            else console.warn('bus listener error', ev, e);
          }
        });
      }
    };
  }

  MCU.createStore = createStore;
  MCU.bus = MCU.bus || createBus();
  w.MCU = MCU;
})(window);
