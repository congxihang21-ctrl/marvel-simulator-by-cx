/* ================================================================
   世界时钟引擎 · WorldClock   (v2.6.2 世界自主运转底层)
   ----------------------------------------------------------------
   设计目标（玩家设定）：
   1) 世界自己在运行：正典事件【到点一定发生】，不管玩家在干嘛，
      以「📺 世界头条」的形式出现在他人生时间线里（新闻/间接波及）。
   2) 世界不围着玩家转：普通人默认只是旁观者，只有自愿靠近/具备能力
      才会拿到「卷入/干预」的机会。
   3) 正典可被改写：玩家的选择若提前达成某条因果 flag（如 2017 年
      阻止了灭霸），后续事件被取消或改写，头条标注「已被你改写」。

   纯函数 + 挂在 S.worldClock 上的状态，不依赖 DOM，离线/AI 两条
   时间线都在推进日期后调用 WorldClock.tick(S)。
   ================================================================ */
(function () {
  'use strict';

  /* ---- 稳定 id（不改原数据）：起始日期@事件名 ---- */
  function aid(a) { return a.range[0] + '@' + a.name; }
  function ymOf(str) { // 'YYYY-MM-DD' -> y*12+(m-1)
    var p = String(str).split('-');
    return parseInt(p[0], 10) * 12 + (parseInt(p[1], 10) - 1);
  }
  function ymOfDate(d) { return d.getFullYear() * 12 + d.getMonth(); }
  function ymToStr(v) { var y = Math.floor(v / 12), m = (v % 12) + 1; return y + '-' + (m < 10 ? '0' + m : m); }

  /* ---- 正典因果改写规则 ----
     match：命中事件名（任一正则）
     flag ：玩家世界线里出现该 flag 即视为事件被提前阻止/改写
     avert：被改写后给普通人看的头条正文
     kind ：'cancel' 整条取消（不发生） / 'alter' 以另一种形态发生 */
  var ALTER_RULES = [
    {
      match: [/无限战争·灭霸响指/, /灭霸响指/],
      flag: 'thanos_thwarted',
      kind: 'cancel',
      avert: '那个被称为灭霸的泰坦霸主，最终没能踏上地球。有消息说，他在集齐宝石之前就被人阻止——没人知道是谁。没有响指，没有灰烬。这一天，世界照常车水马龙，仿佛躲过了一场无人知晓的浩劫。'
    },
    {
      match: [/烁灭五年·世界重组/],
      flag: 'thanos_thwarted',
      kind: 'cancel',
      avert: '因为响指从未响起，世界没有失去那一半人。没有空椅子，没有「烁灭」这个词，没有五年的废墟与重建。新闻里在讨论别的烦恼——平凡的、活着的烦恼。'
    },
    {
      match: [/量子时间劫案/],
      flag: 'thanos_thwarted',
      kind: 'cancel',
      avert: '复仇者没有必要再穿越回过去偷取宝石——那场不可能的「时空劫持」从未被提上日程。斯科特·朗安心陪着女儿长大。'
    },
    {
      match: [/终局之战·托尼打响指/, /终局之战/],
      flag: 'thanos_thwarted',
      kind: 'alter',
      avert: '没有终局之战，也没有那句 I am Iron Man 的告别。托尼·斯塔克活了下来，在乡下陪女儿吃了一顿又一顿晚饭。世界欠某个无名之人一条命，但永远不会有人知道。'
    },
    {
      match: [/烁灭者回归·社会冲击/],
      flag: 'thanos_thwarted',
      kind: 'cancel',
      avert: '没有人消失过，自然也没有人回归。「回归者」「留世者」这些词从未被发明，身份证上不会印着两种命运。'
    },
    {
      match: [/纽约之战·齐塔瑞入侵/, /齐塔瑞/],
      flag: 'chitauri_thwarted',
      kind: 'alter',
      avert: '纽约上空的虫洞在完全打开前就被关闭了。零星的齐塔瑞残骸落进东河，被连夜打捞。一场本该让全世界认识复仇者的入侵，最终只成了几个论坛里的都市传说。'
    },
    {
      match: [/奥创诞生·索科维亚/, /奥创诞生/],
      flag: 'ultron_thwarted',
      kind: 'cancel',
      avert: '那个失控的 AI 在成形前就被掐灭在摇篮里。索科维亚的城市没有起飞，联合国那场催生了《索科维亚协议》的惨剧，也失去了导火索。'
    }
  ];

  function ruleFor(name) {
    for (var i = 0; i < ALTER_RULES.length; i++) {
      var rs = ALTER_RULES[i].match;
      for (var j = 0; j < rs.length; j++) if (rs[j].test(name)) return ALTER_RULES[i];
    }
    return null;
  }
  function hasFlag(S, key) {
    try {
      if (S && S.worldline && S.worldline.majorFlags && S.worldline.majorFlags[key]) return true;
    } catch (_) {}
    // 兼容直接挂在 S.flags 上的写法
    try { if (S && S.flags && S.flags[key]) return true; } catch (_) {}
    return false;
  }

  /* ---- 普通人视角的「间接波及」一句话（按事件气质） ---- */
  function rippleOf(a) {
    var n = a.name || '';
    if (/响指|烁灭|灭绝|入侵|战争|轰炸|爆炸|奥创|终局/.test(n)) return '📺 新闻被反复插播，城市气氛紧张，物价与人心一起浮动';
    if (/协议|神盾局|联合国|秘密入侵|斯库鲁/.test(n)) return '📰 报纸头版与社交网络吵成一片，身边人各有立场';
    if (/多元宇宙|魔法|奇异|阿斯加德|雷神|彩虹桥/.test(n)) return '🌌 超自然现象上了热搜，科学界与教会各执一词';
    if (/钢铁侠|斯塔克|博览会|蜘蛛侠|黑豹|蚁人/.test(n)) return '🛰️ 英雄的名字占据了广告牌和孩子的午餐盒';
    if (/招募|神盾局|特工|黑寡妇|鹰眼/.test(n)) return '🕵️ 坊间流传着某些「不存在的机构」在暗中招人';
    return '📺 滚动新闻里反复出现，街头巷尾都在议论';
  }

  var ANCHORS_REF = null;
  function anchors() { return ANCHORS_REF || (typeof CANON_ANCHORS !== 'undefined' ? CANON_ANCHORS : []); }

  var WC = {
    version: '1.0',
    _setAnchors: function (arr) { ANCHORS_REF = arr; },

    ensure: function (S) {
      if (!S) S = {};
      if (!S.worldClock) {
        var start = S.date ? ymOfDate(_d(S.date)) : (S.setup && S.setup.sdate ? ymOf(String(S.setup.sdate).slice(0, 10)) : ymOfDate(new Date()));
        S.worldClock = { ym: start, fired: {}, headlines: [], oppShown: {} };
      }
      if (!S.worldClock.fired) S.worldClock.fired = {};
      if (!S.worldClock.headlines) S.worldClock.headlines = [];
      if (!S.worldClock.oppShown) S.worldClock.oppShown = {};
      return S.worldClock;
    },

    /* 设置因果 flag（供「干预」选择调用），并尝试同步到世界线引擎 */
    setCausalFlag: function (S, key, val) {
      if (!key) return;
      try { if (typeof WorldlineEngine !== 'undefined' && WorldlineEngine.setFlag) WorldlineEngine.setFlag(S, key, val === undefined ? true : val); } catch (_) {}
      if (!S.flags) S.flags = {};
      S.flags[key] = (val === undefined ? true : val);
    },

    /* 核心：时间推进后调用。遍历跨过的每个月，把到期正典事件变成头条。
       返回 {headlines:[{entry,...}], fired:0, averted:0} */
    tick: function (S) {
      var out = { headlines: [], fired: 0, averted: 0 };
      if (!S || !S.date) return out;
      var wc = this.ensure(S);
      var now = ymOfDate(_d(S.date));
      var from = wc.ym;
      if (now <= from) return out;
      if (now - from > 240) { // 异常大跳（>20年），只对齐不补播，防止爆量
        wc.ym = now; return out;
      }
      var list = anchors();

      for (var m = from + 1; m <= now; m++) {
        for (var i = 0; i < list.length; i++) {
          var a = list[i];
          if (!a || !a.range || !a.range[0]) continue;
          var startYM = ymOf(a.range[0]);
          if (startYM !== m) continue;                 // 只在「起始月」播一次
          var key = aid(a);
          if (wc.fired[key]) continue;

          var rule = ruleFor(a.name);
          var altered = !!(rule && hasFlag(S, rule.flag));
          var canceled = altered && rule.kind === 'cancel';

          wc.fired[key] = canceled ? 'averted' : 'fired';
          if (canceled) { out.averted++; continue; }   // 被彻底阻止：世界里没有这件事

          // 选一条旁观者视角的种子文案（按影响等级做确定性轮换）
          var seed = (a.seeds && a.seeds.length) ? a.seeds[(a.impact || 1) % a.seeds.length] : (a.name + '发生了。');
          var channel = altered ? 'altered' : (a.impact >= 5 ? 'crisis' : 'world');
          var title = a.name + (altered ? '（已被你改写）' : '');
          var text = altered && rule ? rule.avert : seed;

          var entry = {
            time: _dateLabel(a.range[0]),
            channel: channel,            // world 世界 / crisis 大事件 / altered 被改写
            canon: true,
            impact: a.impact || 3,
            title: title,
            text: text,
            ripple: rippleOf(a),
            self: false
          };
          S.log.push(entry);
          wc.headlines.push({ key: key, name: a.name, altered: altered, t: a.range[0] });
          out.headlines.push(entry);
          out.fired++;

          // 同步世界线偏离度
          try {
            if (altered && typeof WorldlineEngine !== 'undefined' && WorldlineEngine.alterEvent) {
              WorldlineEngine.alterEvent(S, key, '玩家提前达成 ' + rule.flag + '，事件被改写');
            }
          } catch (_) {}
        }
      }
      wc.ym = now;
      return out;
    },

    /* 干预机会：未来 lead 个月内存在【带因果规则】的 impact>=5 大事件，
       且玩家已上英雄轨 / 有足够参与度，则返回一个可玩节点（否则 null）。
       每个大事件只提示一次。 */
    opportunity: function (S) {
      if (!S || !S.date) return null;
      this.ensure(S);
      var now = ymOfDate(_d(S.date));
      var LEAD = 18;
      var involved = hasFlag(S, 'seekHero') || hasFlag(S, 'hero_track') ||
        (S.worldline && typeof S.worldline.divergenceLevel === 'number' && S.worldline.divergenceLevel >= 35);
      if (!involved) return null;
      var list = anchors(), wc = S.worldClock;
      for (var i = 0; i < list.length; i++) {
        var a = list[i];
        if (!a || !a.range || (a.impact || 0) < 5) continue;
        var rule = ruleFor(a.name);
        if (!rule || hasFlag(S, rule.flag)) continue;   // 已阻止就不再提示
        var startYM = ymOf(a.range[0]);
        var key = aid(a);
        if (wc.fired[key] || wc.oppShown[key]) continue;
        if (startYM > now && startYM - now <= LEAD) {
          wc.oppShown[key] = true;
          return this._buildOpp(S, a, rule);
        }
      }
      return null;
    },

    _buildOpp: function (S, a, rule) {
      var when = a.range[0].slice(0, 7);
      return {
        id: 'wc_opp',
        title: '🌪 风雨欲来',
        level: '命运',
        text: '所有线报都指向同一件事：' + when + ' 前后，「' + a.name + '」将席卷世界。按现在的轨迹，无人能挡。\n但你已经站在了棋盘边上——如果你愿意付出代价，或许能在一切发生之前，改变它。',
        __wcOpp: true, __wcFlag: rule.flag,
        choices: [
          { label: '不惜一切，提前阻止它（极高风险）', next: '__wcJudge__', base: 28,
            check: 'wil',
            success: { next: '__wcThwart__', text: '你赌上一切布局，竟真的撼动了历史的走向。' },
            fail: { next: '__resume__', text: '你竭尽全力，却只是让自己深陷险境——风暴依旧在逼近。', effects: { stress: 15 } } },
          { label: '记录情报、联络盟友，先做好准备', next: '__resume__', effects: { wil: 1, int: 1 } },
          { label: '这不是我能插手的事，过好当下', next: '__resume__', effects: { stress: -3 } }
        ]
      };
    },

    /* 判定成功后：真正写入「改写历史」的因果 flag */
    applyThwart: function (S, flag) {
      this.setCausalFlag(S, flag, true);
      try { if (typeof WorldlineEngine !== 'undefined' && WorldlineEngine.addDivergence) WorldlineEngine.addDivergence(S, 30); } catch (_) {}
    }
  };

  /* ---- 小工具 ---- */
  function _d(iso) { var d = new Date(iso); return isNaN(d) ? new Date() : d; }
  function _dateLabel(s) { var p = String(s).split('-'); return parseInt(p[0], 10) + '年' + parseInt(p[1], 10) + '月' + parseInt(p[2] || 1, 10) + '日'; }

  /* 暴露 */
  if (typeof window !== 'undefined') window.WorldClock = WC;
  if (typeof globalThis !== 'undefined') globalThis.WorldClock = WC;
})();
