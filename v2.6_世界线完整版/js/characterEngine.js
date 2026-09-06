/* ===== v2.6: 角色引擎 (Character Engine) =====
   人生阶段、属性、经济、家庭、伤病 */
(function(){
  var LIFE_STAGES = [
    {id:'infant',   name:'婴幼儿',  min:0,  max:6},
    {id:'child',    name:'童年',    min:7,  max:12},
    {id:'teen',     name:'青少年',  min:13, max:17},
    {id:'young',    name:'青年',    min:18, max:24},
    {id:'early',    name:'成年早期',min:25, max:34},
    {id:'adult',    name:'成年',    min:35, max:49},
    {id:'middle',   name:'中年',    min:50, max:64},
    {id:'elder',    name:'晚年',    min:65, max:200}
  ];

  var CE = {
    /* 获取当前人生阶段 */
    getLifeStage: function(age){
      age = parseInt(age) || 0;
      for(var i=0;i<LIFE_STAGES.length;i++){
        if(age >= LIFE_STAGES[i].min && age <= LIFE_STAGES[i].max) return LIFE_STAGES[i];
      }
      return LIFE_STAGES[LIFE_STAGES.length-1];
    },

    /* 初始化/扩展角色属性 */
    initCharacter: function(S){
      if(!S.player) S.player = {};
      var p = S.player;
      /* 核心数值属性（0~100） */
      if(p.属性 === undefined) p.属性 = {
        体能: 50, 智力: 50, 魅力: 50, 意志: 50,
        格斗: 10, 科技: 10, 医学: 5,  驾驶: 5,
        潜行: 5,  演讲: 10, 艺术: 5
      };
      /* 经济 */
      if(p.经济 === undefined) p.经济 = {现金: 1000, 月收入: 0, 月支出: 0, 储蓄: 0, 债务: 0};
      /* 压力/健康 */
      if(p.压力 === undefined) p.压力 = 0;
      if(p.健康 === undefined) p.健康 = 100;
      if(p.伤病 === undefined) p.伤病 = []; /* {部位,程度,恢复回合,永久影响} */
      if(p.声望 === undefined) p.声望 = 0;
      /* 家庭 */
      if(p.家庭 === undefined) p.家庭 = {
        父亲: null, 母亲: null, 配偶: null,
        子女: [], 兄弟姐妹: []
      };
      /* 职业路径 */
      if(p.职业路径 === undefined) p.职业路径 = {当前职业: null, 等级: 1, 经验: 0};
      /* 人生目标进度 */
      if(p.目标进度 === undefined) p.目标进度 = {};
    },

    /* 改变属性（带上下限） */
    setStat: function(S, stat, val){
      if(!S.player || !S.player.属性) this.initCharacter(S);
      S.player.属性[stat] = Math.max(0, Math.min(100, val));
    },
    addStat: function(S, stat, delta){
      var cur = (S.player && S.player.属性 && S.player.属性[stat]) || 0;
      this.setStat(S, stat, cur + delta);
    },

    /* 经济操作 */
    applyEconomicTier: function(S, tier){
      if(!S.player || !S.player.经济) this.initCharacter(S);
      var eco = S.player.经济;
      var table = [
        {现金:200, 储蓄:0, 债务:1000, 月收入:800, 月支出:900},    /* 1 赤贫 */
        {现金:500, 储蓄:0, 债务:500, 月收入:1500, 月支出:1400},    /* 2 贫困 */
        {现金:1000, 储蓄:2000, 债务:0, 月收入:3000, 月支出:2500},  /* 3 工薪 */
        {现金:3000, 储蓄:15000, 债务:0, 月收入:8000, 月支出:5000}, /* 4 中产 */
        {现金:10000, 储蓄:80000, 债务:0, 月收入:25000, 月支出:12000},/* 5 富裕 */
        {现金:50000, 储蓄:500000, 债务:0, 月收入:100000, 月支出:30000}/* 6 精英 */
      ];
      var t = table[Math.max(0, Math.min(5, (tier||3)-1))];
      eco.现金 = t.现金; eco.储蓄 = t.储蓄; eco.债务 = t.债务;
      eco.月收入 = t.月收入; eco.月支出 = t.月支出;
    },
    addMoney: function(S, amount){
      if(!S.player || !S.player.经济) this.initCharacter(S);
      S.player.经济.现金 += amount;
      if(S.player.经济.现金 < 0){
        S.player.经济.债务 += Math.abs(S.player.经济.现金);
        S.player.经济.现金 = 0;
      }
    },
    setIncome: function(S, income){
      if(!S.player || !S.player.经济) this.initCharacter(S);
      S.player.经济.月收入 = income;
    },

    /* 压力与健康 */
    addStress: function(S, delta){
      if(!S.player) this.initCharacter(S);
      S.player.压力 = Math.max(0, Math.min(100, (S.player.压力||0) + delta));
      if(S.player.压力 > 80){
        this.addHealth(S, -5); /* 高压损健康 */
      }
    },
    addHealth: function(S, delta){
      if(!S.player) this.initCharacter(S);
      S.player.健康 = Math.max(0, Math.min(100, (S.player.健康||100) + delta));
    },

    /* 伤病系统 */
    addInjury: function(S, part, severity){
      if(!S.player) this.initCharacter(S);
      var healTurns = severity === '轻伤' ? 3 : severity === '重伤' ? 15 : 30;
      S.player.伤病.push({部位: part, 程度: severity, 恢复回合: healTurns, 永久影响: severity==='严重创伤'});
      if(severity === '重伤' || severity === '严重创伤'){
        this.addHealth(S, severity==='严重创伤' ? -30 : -15);
        this.addStress(S, 20);
      }
    },
    /* 每回合恢复伤病 */
    tickInjuries: function(S){
      if(!S.player || !S.player.伤病) return;
      S.player.伤病 = S.player.伤病.filter(function(i){
        i.恢复回合--;
        if(i.恢复回合 <= 0){
          if(i.永久影响){
            /* 永久创伤：压力永久+5上限 */
            S.player.压力 = Math.min(100, (S.player.压力||0) + 5);
          }
          return false;
        }
        return true;
      });
    },

    /* 家庭事件：父母状态随时间变化 */
    tickFamily: function(S){
      if(!S.player || !S.player.家庭) this.initCharacter(S);
      var f = S.player.家庭;
      var age = parseInt(S.player.年龄) || 20;
      /* 父母在玩家 40+ 岁后有概率生病/去世 */
      if(age > 40){
        ['父亲','母亲'].forEach(function(role){
          if(f[role] && !f[role].已故 && RNG.chance(0.02)){
            if(RNG.chance(0.3)){
              f[role].已故 = true;
              f[role].死因 = RNG.pick(['疾病','意外','自然衰老']);
              CE.addStress(S, 25);
              if(S.worldline) WorldlineEngine.addMemory(S, new Date(S.date).getFullYear(), f[role].姓名+'去世了。');
            } else {
              f[role].状态 = '生病';
            }
          }
        });
      }
      /* v2.6: 恋爱结婚（22岁后，未婚，有概率结识伴侣）—— 尊重玩家"不婚"选择 */
      var intentSingle = (f.intent === 'single');
      if(age >= 22 && !f.配偶 && !intentSingle && RNG.chance(0.04)){
        var names = ['张伟','李娜','王芳','刘洋','陈静','赵磊','孙丽','周强'];
        f.配偶 = {姓名: RNG.pick(names), 状态:'婚姻中', 结婚年龄: age};
        if(S.worldline) WorldlineEngine.addMemory(S, new Date(S.date).getFullYear(), '你和'+f.配偶.姓名+'结婚了。');
      }
      /* v2.6: 生育（已婚，25-45岁，有概率生子）—— 尊重玩家"丁克"选择 */
      var intentChildfree = (f.intent === 'childfree');
      if(f.配偶 && !intentChildfree && age >= 25 && age <= 45 && (f.子女||[]).length < 3 && RNG.chance(0.03)){
        if(!f.子女) f.子女 = [];
        var childNames = ['小宇','小雨','小轩','小涵','小辰','小诺'];
        f.子女.push({姓名: RNG.pick(childNames), 年龄: 0, 性别: RNG.chance(0.5)?'男':'女'});
        CE.addStress(S, 5);
        if(S.player.经济) S.player.经济.月支出 += 800;
        if(S.worldline) WorldlineEngine.addMemory(S, new Date(S.date).getFullYear(), '孩子'+f.子女[f.子女.length-1].姓名+'出生了。');
      }
      /* v2.6: 子女成长（每年+1岁） */
      if(f.子女 && f.子女.length){
        f.子女.forEach(function(c){
          c.年龄 = (c.年龄||0) + (1/12);  /* 每月成长 */
        });
      }
    },

    /* 声望 */
    addReputation: function(S, delta){
      if(!S.player) this.initCharacter(S);
      S.player.声望 = Math.max(-100, Math.min(100, (S.player.声望||0) + delta));
    },

    /* 职业升级 */
    advanceCareer: function(S, expGain){
      if(!S.player || !S.player.职业路径) this.initCharacter(S);
      var c = S.player.职业路径;
      c.经验 += expGain;
      var need = c.等级 * 100;
      while(c.经验 >= need && c.等级 < 5){
        c.经验 -= need;
        c.等级++;
        need = c.等级 * 100;
        if(S.player.经济) S.player.经济.月收入 += 500 * c.等级;
      }
    },

    /* v2.6: 职业路线表 —— 每个职业5级 */
    careerRoutes: {
      soldier:   ['列兵','下士','中士','中尉','少校'],
      worker:    ['学徒','熟练工','技师','班组长','车间主任'],
      scientist: ['助理研究员','研究员','副研究员','研究员','首席科学家'],
      engineer:  ['初级工程师','工程师','高级工程师','技术总监','首席工程师'],
      reporter:  ['实习记者','记者','资深记者','主编','媒体大亨'],
      police:    ['警员','警长','警督','警司','警察局长'],
      doctor:    ['住院医师','主治医师','副主任医师','主任医师','医学权威'],
      teacher:   ['代课老师','教师','高级教师','教研组长','校长'],
      businessman:['小职员','经理','部门总监','副总裁','CEO'],
      artist:    ['无名创作者','签约艺人','知名艺术家','大师','传奇']
    },

    /* v2.6: 获取当前职业头衔 */
    getCareerTitle: function(S){
      if(!S.player) return '无业';
      var c = S.player.职业路径;
      if(!c || !c.当前职业) return S.player.职业 || '无业';
      var route = this.careerRoutes[c.当前职业];
      if(!route) return c.当前职业;
      var lv = Math.max(0, Math.min(4, (c.等级||1)-1));
      return route[lv];
    },

    /* 获取经济等级描述 */
    getEconomyLabel: function(S){
      if(!S.player || !S.player.经济) return '未知';
      var total = (S.player.经济.现金||0) + (S.player.经济.储蓄||0);
      if(total < 0) return '负债';
      if(total < 500) return '赤贫';
      if(total < 5000) return '贫困';
      if(total < 30000) return '工薪';
      if(total < 100000) return '中产';
      if(total < 500000) return '富裕';
      return '精英';
    }
  };

  window.CharacterEngine = CE;
})();
