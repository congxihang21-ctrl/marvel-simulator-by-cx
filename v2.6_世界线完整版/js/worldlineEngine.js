/* ===== v2.6: 世界线引擎 (Worldline Engine) =====
   维护世界线变量、偏离度、正典完整性、已改变事件等 */
(function(){
  var WL = {
    /* 初始化世界线变量 */
    init: function(S){
      if(!S.worldline){
        S.worldline = {
          seed: S.seedKey || 'default',
          divergenceLevel: 0,       /* 0~100 偏离度 */
          canonIntegrity: 100,       /* 正典完整度 */
          playerInfluence: 0,        /* 玩家影响力 */
          worldChaos: 0,             /* 世界混乱度 */
          publicAwareness: 0,        /* 公众对超自然的认知度 */
          heroRelations: {},         /* 与各MCU角色的关系值 0~7 */
          factionRelations: {},      /* 与各阵营的关系 */
          majorFlags: {},            /* 重大Flag */
          deadCharacters: [],        /* 已死亡的MCU角色 */
          alteredEvents: [],         /* 被改变的正典事件 */
          completedArcs: []          /* 已完成的剧情弧 */
        };
      }
      if(!S.memory) S.memory = [];      /* 人生记忆 */
      if(!S.chapters) S.chapters = [];  /* 人生章节 */
      if(!S.eventHistory) S.eventHistory = []; /* 事件历史 */
      if(!S.cooldowns) S.cooldowns = {}; /* 事件冷却 */
    },

    /* 改变偏离度（带上下限） */
    addDivergence: function(S, delta){
      if(!S.worldline) this.init(S);
      S.worldline.divergenceLevel = Math.max(0, Math.min(100, S.worldline.divergenceLevel + delta));
      if(delta > 0){
        S.worldline.canonIntegrity = Math.max(0, S.worldline.canonIntegrity - delta * 0.5);
      }
    },

    /* 增加玩家影响力 */
    addInfluence: function(S, delta){
      if(!S.worldline) this.init(S);
      S.worldline.playerInfluence = Math.max(0, Math.min(100, S.worldline.playerInfluence + delta));
    },

    /* 记录改变的正典事件 */
    alterEvent: function(S, eventId, reason){
      if(!S.worldline) this.init(S);
      if(S.worldline.alteredEvents.indexOf(eventId) === -1){
        S.worldline.alteredEvents.push(eventId);
        this.addDivergence(S, 5);
      }
    },

    /* 设置/获取 Flag */
    setFlag: function(S, key, val){
      if(!S.worldline) this.init(S);
      S.worldline.majorFlags[key] = val;
    },
    getFlag: function(S, key, def){
      if(!S.worldline || !S.worldline.majorFlags) return def;
      var v = S.worldline.majorFlags[key];
      return v === undefined ? def : v;
    },
    hasFlag: function(S, key){
      return !!this.getFlag(S, key, false);
    },

    /* 角色关系 0~7 级：0-听说 1-见过 2-交流 3-认识 4-合作 5-信任 6-朋友 7-核心伙伴 */
    setHeroRelation: function(S, name, level){
      if(!S.worldline) this.init(S);
      S.worldline.heroRelations[name] = Math.max(0, Math.min(7, level));
    },
    getHeroRelation: function(S, name){
      if(!S.worldline || !S.worldline.heroRelations) return 0;
      return S.worldline.heroRelations[name] || 0;
    },
    addHeroRelation: function(S, name, delta){
      var cur = this.getHeroRelation(S, name);
      this.setHeroRelation(S, name, cur + delta);
    },

    /* 获取偏离度描述 */
    getDivergenceLabel: function(S){
      var d = (S.worldline && S.worldline.divergenceLevel) || 0;
      if(d < 10) return '原始世界线';
      if(d < 30) return '轻微偏离';
      if(d < 50) return '局部影响';
      if(d < 70) return '重大变化';
      if(d < 90) return '世界线改变';
      return '高度异常';
    },

    /* 记录人生记忆 */
    addMemory: function(S, year, text){
      if(!S.memory) S.memory = [];
      S.memory.push({year: year, text: text, turn: S.turn});
    },

    /* 添加人生章节 */
    addChapter: function(S, title, summary){
      if(!S.chapters) S.chapters = [];
      S.chapters.push({title: title, summary: summary, startTurn: S.turn});
    },

    /* v2.6: 每回合记录人生记忆摘要 */
    recordMemory: function(S){
      if(!S) return;
      if(!S.memory) S.memory = [];
      if((S.turn||0) % 3 !== 0) return;
      var age = S.age || 0;
      var parts = [];
      if(typeof CharacterEngine !== 'undefined'){
        var st = CharacterEngine.getLifeStage(age);
        if(st) parts.push(st.name);
      }
      if(S.player && S.player.职业) parts.push('职业：' + S.player.职业);
      var eco = S.player && S.player.经济;
      if(eco){
        var wealth = (eco.储蓄||0) + (eco.现金||0) - (eco.债务||0);
        if(wealth > 100000) parts.push('家境富裕');
        else if(wealth > 20000) parts.push('生活小康');
        else if(wealth < -10000) parts.push('负债累累');
        else parts.push('勉强糊口');
      }
      if(S.stats && S.stats.声望 > 60) parts.push('声名远播');
      if(S.flags && S.flags.injured) parts.push('身负伤病');
      if(S.rel && S.rel.length > 5) parts.push('交游广阔');
      if(S.worldline && S.worldline.divergenceLevel > 30) parts.push('世界线偏离');
      var text = age + '岁，' + (parts.length ? parts.join('，') : '平静度日') + '。';
      S.memory.push({turn: S.turn, age: age, text: text});
      if(S.memory.length > 80) S.memory.shift();

      /* v2.6: 自动分章节（每10回合或阶段变化） */
      if((S.turn||0) % 10 === 0 && S.turn > 0){
        var chTitle = '第' + (S.chapters.length + 1) + '章 · ' + age + '岁';
        var chSum = '截至' + age + '岁，已度过' + S.turn + '个月。' +
          (parts.length ? parts.join('；') : '生活平淡。');
        if(!S.chapters) S.chapters = [];
        S.chapters.push({title: chTitle, summary: chSum, startTurn: S.turn, age: age});
      }
    }
  };

  window.WorldlineEngine = WL;
})();
