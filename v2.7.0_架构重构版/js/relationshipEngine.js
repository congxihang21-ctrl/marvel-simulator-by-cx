/* ===== v2.6: NPC 关系引擎 (Relationship Engine) =====
   NPC 长期记忆、关系等级、信任/恐惧/尊重、秘密、冲突 */
(function(){
  var REL = {
    /* 关系等级 0~7 */
    REL_LEVELS: ['陌生人','听说过','见过','交流过','认识','合作过','信任','挚友'],

    /* 初始化 NPC 关系数据 */
    initNPC: function(npc){
      if(!npc._rel) npc._rel = {
        level: 0,          /* 0~7 */
        trust: 30,         /* 0~100 */
        fear: 0,
        respect: 20,
        memories: [],
        secrets: [],
        conflicts: [],
        lastInteraction: null
      };
      return npc;
    },

    /* 获取 NPC（不存在则创建） */
    getNPC: function(S, name){
      if(!S.rel) S.rel = [];
      var npc = S.rel.find(function(r){return r.姓名 === name});
      if(!npc){
        npc = {姓名: name, 身份:'未知', 关系:'陌生人', 信任:'中等', 利益:'无', 敌意:'无', 最近动态:''};
        S.rel.push(npc);
      }
      this.initNPC(npc);
      return npc;
    },

    /* 改变关系等级 */
    changeLevel: function(S, name, delta){
      var npc = this.getNPC(S, name);
      var newLevel = Math.max(0, Math.min(7, npc._rel.level + delta));
      npc._rel.level = newLevel;
      npc.关系 = this.REL_LEVELS[newLevel];
      /* 更新信任 */
      npc._rel.trust = Math.min(100, npc._rel.trust + delta * 15);
      return newLevel;
    },

    /* 添加记忆 */
    addMemory: function(S, name, text){
      var npc = this.getNPC(S, name);
      npc._rel.memories.push({text: text, turn: S.turn});
      npc._rel.lastInteraction = S.turn;
      /* 只保留最近 10 条 */
      if(npc._rel.memories.length > 10) npc._rel.memories.shift();
    },

    /* 添加秘密 */
    addSecret: function(S, name, secret){
      var npc = this.getNPC(S, name);
      npc._rel.secrets.push({text: secret, turn: S.turn});
    },

    /* 互动后更新 */
    interact: function(S, name, type){
      var npc = this.getNPC(S, name);
      npc._rel.lastInteraction = S.turn;
      switch(type){
        case 'help':
          npc._rel.trust = Math.min(100, npc._rel.trust + 8);
          npc._rel.respect = Math.min(100, npc._rel.respect + 5);
          this.addMemory(S, name, '你帮助了'+name);
          if(npc._rel.trust > 50 && npc._rel.level < 4) this.changeLevel(S, name, 1);
          break;
        case 'hurt':
          npc._rel.trust = Math.max(0, npc._rel.trust - 15);
          npc._rel.fear = Math.min(100, npc._rel.fear + 10);
          this.addMemory(S, name, '你伤害了'+name);
          this.changeLevel(S, name, -1);
          break;
        case 'talk':
          npc._rel.trust = Math.min(100, npc._rel.trust + 3);
          break;
        case 'deep_talk':
          npc._rel.trust = Math.min(100, npc._rel.trust + 10);
          if(npc._rel.level < 3) this.changeLevel(S, name, 1);
          break;
      }
    },

    /* 获取信任等级文字 */
    getTrustLabel: function(npc){
      if(!npc._rel) return '中等';
      var t = npc._rel.trust;
      if(t < 20) return '极低';
      if(t < 40) return '偏低';
      if(t < 60) return '中等';
      if(t < 80) return '中等偏高';
      return '高';
    },

    /* 检查是否可以触发深层关系事件（项38） */
    canTriggerDeepEvent: function(S, name, type){
      var npc = this.getNPC(S, name);
      var r = npc._rel;
      switch(type){
        case 'secret': return r.trust >= 70;
        case 'romance': return r.level >= 3 && r.trust >= 50;
        case 'mission': return r.level >= 4 && r.trust >= 60;
        case 'betrayal': return r.fear > 50 || r.trust < 20;
        default: return r.level >= 3;
      }
    },

    /* 生成对话上下文（给 AI 用） */
    getContextForAI: function(S, name){
      var npc = this.getNPC(S, name);
      var r = npc._rel;
      var ctx = '你与'+name+'的关系：'+this.REL_LEVELS[r.level]+
                '（信任'+r.trust+'、尊重'+r.respect+'、恐惧'+r.fear+'）。\n';
      if(r.memories.length){
        ctx += '你们之间的过往：\n';
        r.memories.slice(-5).forEach(function(m){ ctx += '- '+m.text+'\n'; });
      }
      return ctx;
    }
  };

  window.RelationshipEngine = REL;
})();
