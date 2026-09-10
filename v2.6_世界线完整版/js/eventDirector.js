/* ===== v2.6: 事件导演系统 (Event Director) =====
   负责评估玩家状态、筛选可达事件、计算权重、选择下一事件 */
(function(){
  var ED = {
    /* 事件库 —— 按类型分层（日常/人生/关系/职业/英雄/世界） */
    eventPool: {
      /* 日常事件 (Level 1) —— 权重最高，填充人生 */
      daily: [
        {id:'d_work',     text:'今天的工作安排', weight:15, stage:['young','early','adult','middle'], effects:{stress:+2, money:+50}},
        {id:'d_neighbor', text:'邻居敲门打招呼', weight:8,  effects:{}},
        {id:'d_study',    text:'要不要学点新东西？', weight:6, effects:{stress:+1}},
        {id:'d_exercise', text:'去锻炼一下身体', weight:6, effects:{stress:-3, 体能:+1}},
        {id:'d_friend',   text:'朋友邀请你出门', weight:7, effects:{stress:-2}},
        {id:'d_save',     text:'要不要存点钱？', weight:5, effects:{}},
        {id:'d_shop',     text:'看到一件想买的东西', weight:5, effects:{money:-30, stress:-1}},
        {id:'d_rest',     text:'今天想在家休息', weight:8, effects:{stress:-5, money:-10}},
        {id:'d_ill',      text:'感觉身体不太舒服', weight:3, effects:{健康:-5, stress:+3}},
        {id:'d_news',     text:'新闻里提到了一些事', weight:6, effects:{}},
        /* v2.6: 出身差异化日常事件 */
        {id:'d_poor_bill',text:'账单到期了，钱不够付', weight:4, req:{tierMax:2}, effects:{stress:+8, 债务:+200}},
        {id:'d_poor_food',text:'今天只能吃便宜的快餐', weight:5, req:{tierMax:2}, effects:{stress:+2, 健康:-2}},
        {id:'d_rich_inv', text:'理财顾问来电推荐产品', weight:4, req:{tierMin:5}, effects:{}},
        {id:'d_rich_party',text:'有人邀请参加高端聚会', weight:3, req:{tierMin:5}, effects:{stress:-3, 声望:+2}},
        {id:'d_mid_gym',  text:'要不要办张健身卡？', weight:4, req:{tierMin:3, tierMax:4}, effects:{money:-100, 体能:+1}},
        /* v2.6.2: 更多日常事件 */
        {id:'d_commute',  text:'通勤路上遇到了点状况', weight:6, effects:{stress:+2}},
        {id:'d_cook',     text:'今天想自己做顿饭', weight:5, effects:{stress:-2, money:-20, 健康:+1}},
        {id:'d_read',     text:'找了本好书来读', weight:4, effects:{stress:-3, 智力:+1}},
        {id:'d_movie',    text:'去看了场电影', weight:4, effects:{stress:-3, money:-40}},
        {id:'d_game',     text:'在家打了会游戏', weight:5, effects:{stress:-2}},
        {id:'d_clean',    text:'大扫除了一番', weight:3, effects:{stress:-1, money:-10}},
        {id:'d_laundry',  text:'洗衣服做家务', weight:4, effects:{stress:+1}},
        {id:'d_haircut',  text:'去理了个发', weight:3, effects:{money:-30, stress:-1}},
        {id:'d_dentist',  text:'去看了牙医', weight:2, effects:{money:-200, 健康:+1, stress:+1}},
        {id:'d_pet',      text:'和宠物玩了一会', weight:4, effects:{stress:-3}},
        {id:'d_garden',   text:'打理阳台上的花', weight:3, effects:{stress:-2}},
        {id:'d_rain',     text:'下大雨被困在家里', weight:3, effects:{stress:+1}},
        {id:'d_sunny',    text:'天气特别好，出去走走', weight:4, effects:{stress:-2, 健康:+1}},
        {id:'d_insomnia', text:'昨晚失眠了', weight:3, effects:{stress:+3, 健康:-1}},
        {id:'d_dream',    text:'做了一个奇怪的梦', weight:2, effects:{}}
      ],
      /* 人生选择 (Level 2) */
      life: [
        {id:'l_career',   text:'是否考虑换一份工作？', weight:4, stage:['young','early','adult']},
        {id:'l_move',     text:'要不要搬家？', weight:2},
        {id:'l_marry',    text:'有人向你提起结婚的事', weight:3, stage:['early','adult','middle'], req:{ageMin:22}},
        {id:'l_child',    text:'考虑要个孩子？', weight:2, stage:['early','adult'], req:{ageMin:25}},
        {id:'l_joinOrg',  text:'一个组织向你抛出橄榄枝', weight:2},
        {id:'l_invest',   text:'有个投资机会', weight:2},
        {id:'l_education',text:'是否继续深造？', weight:3, stage:['teen','young']},
        /* v2.6.2: 节日事件 */
        {id:'f_spring', text:'春节到了，回家过年', weight:3, effects:{stress:-3, money:-500}},
        {id:'f_birthday', text:'今天是你的生日', weight:2, effects:{stress:-2}},
        {id:'f_christmas', text:'圣诞节到了', weight:2, effects:{stress:-1}},
        {id:'f_newyear', text:'新年倒计时', weight:2, effects:{stress:-1}},
        {id:'f_reunion', text:'老同学聚会', weight:3, effects:{stress:-2, 声望:+1}},
        /* v2.6.2: 财务事件 */
        {id:'fin_lottery', text:'买彩票中了小奖', weight:1, effects:{money:+500}},
        {id:'fin_scam', text:'遇到了诈骗', weight:2, effects:{money:-1000, stress:+5}},
        {id:'fin_inheritance', text:'远房亲戚给你留了一笔遗产', weight:1, effects:{money:+50000}},
        {id:'fin_stock', text:'股票涨了', weight:2, req:{tierMin:4}, effects:{money:+2000}},
        {id:'fin_bonus', text:'公司发了年终奖', weight:3, effects:{money:+3000, stress:-2}},
        {id:'fin_raise', text:'你加薪了', weight:3, effects:{money:+1000, 声望:+1}}
      ],
      /* 人物关系 (Level 3) */
      relation: [
        {id:'r_trust',    text:'一个朋友向你倾诉秘密', weight:3, req:{minFriend:3}},
        {id:'r_help',     text:'朋友遇到困难需要帮助', weight:3},
        {id:'r_conflict', text:'和某人发生了争执', weight:2},
        {id:'r_love',     text:'有人对你表示好感', weight:2, stage:['teen','young','early']},
        {id:'r_secret',   text:'你发现了某人的秘密', weight:1},
        {id:'r_family',   text:'家人之间产生了矛盾', weight:3}
      ],
      /* 职业成长 (Level 4) —— 按职业分 */
      career: [
        {id:'c_train',    text:'获得了一次培训机会', weight:4, occupation:['soldier','worker']},
        {id:'c_promote',  text:'有晋升的可能', weight:2, req:{careerLevel:2}},
        {id:'c_project',  text:'接到一个重要项目', weight:3, occupation:['scientist','engineer','reporter']},
        {id:'c_special',  text:'上级找你谈特殊任务', weight:1, req:{military:true}},
        {id:'c_investigate', text:'有件事值得深入调查', weight:2, occupation:['reporter','police']},
        /* v2.6: 医生线事件 */
        {id:'c_doc_emergency', text:'急诊室送来了一个重伤病人', weight:5, occupation:['doctor'], effects:{stress:+5, 声望:+1}},
        {id:'c_doc_surgery', text:'一台高难度手术安排给了你', weight:3, occupation:['doctor'], req:{careerLevel:2}, effects:{stress:+8, 声望:+3}},
        {id:'c_doc_research', text:'有个医学研究项目邀请你参与', weight:2, occupation:['doctor'], effects:{声望:+2}},
        {id:'c_doc_patient', text:'一位病人的家属专程来感谢你', weight:4, occupation:['doctor'], effects:{stress:-2, 声望:+2}},
        {id:'c_doc_burnout', text:'连续加班让你感到疲惫', weight:3, occupation:['doctor'], effects:{stress:+6, 健康:-2}},
        {id:'c_doc_breakthrough', text:'你的治疗方案取得了突破', weight:1, occupation:['doctor'], req:{careerLevel:3}, effects:{声望:+5}},
        /* v2.6: 工程师线事件 */
        {id:'c_eng_design', text:'你负责的设计方案进入评审', weight:4, occupation:['engineer'], effects:{stress:+3}},
        {id:'c_eng_patent', text:'你的一个发明可以申请专利', weight:2, occupation:['engineer'], req:{careerLevel:2}, effects:{声望:+3, money:+2000}},
        {id:'c_eng_overtime', text:'项目赶工，又要加班了', weight:4, occupation:['engineer'], effects:{stress:+5, money:+300}},
        {id:'c_eng_recruit', text:'有公司想挖你过去', weight:1, occupation:['engineer'], req:{careerLevel:3}, effects:{}},
        {id:'c_eng_break', text:'设备出了故障，需要你抢修', weight:3, occupation:['engineer'], effects:{stress:+4}},
        {id:'c_eng_publish', text:'你的技术论文被期刊收录', weight:1, occupation:['engineer'], req:{careerLevel:3}, effects:{声望:+4}},
        /* v2.6: 记者线事件 */
        {id:'c_rep_scoop', text:'你挖到了一条独家新闻', weight:3, occupation:['reporter'], effects:{声望:+3, 声望:+0}},
        {id:'c_rep_interview', text:'你获得了一次重要采访机会', weight:4, occupation:['reporter'], effects:{声望:+2}},
        {id:'c_rep_danger', text:'你追查的线索牵扯到危险人物', weight:2, occupation:['reporter'], req:{careerLevel:2}, effects:{stress:+6}},
        {id:'c_rep_award', text:'你的报道获得了新闻奖提名', weight:1, occupation:['reporter'], req:{careerLevel:3}, effects:{声望:+5}},
        {id:'c_rep_source', text:'一个线人主动联系了你', weight:3, occupation:['reporter'], effects:{}},
        {id:'c_rep_block', text:'你的报道被上级压了下来', weight:2, occupation:['reporter'], effects:{stress:+4}},
        /* v2.6.2: 军人事线 */
        {id:'c_sol_drill', text:'今天的训练强度很大', weight:5, occupation:['soldier','军人'], effects:{stress:+4, 体能:+1, 格斗:+1}},
        {id:'c_sol_mission', text:'接到了一次外出任务', weight:3, occupation:['soldier','军人'], effects:{stress:+6, 声望:+2}},
        {id:'c_sol_promote', text:'上级考虑给你晋升', weight:2, occupation:['soldier','军人'], req:{careerLevel:2}, effects:{声望:+4}},
        {id:'c_sol_comrade', text:'和战友的关系更近了', weight:4, occupation:['soldier','军人'], effects:{}},
        /* v2.6.2: 科学家线 */
        {id:'c_sci_exp', text:'实验室里有了新发现', weight:3, occupation:['scientist','科学家'], effects:{声望:+3, 智力:+1}},
        {id:'c_sci_paper', text:'你的论文被顶级期刊收录', weight:1, occupation:['scientist','科学家'], req:{careerLevel:3}, effects:{声望:+6}},
        {id:'c_sci_fail', text:'实验又失败了', weight:4, occupation:['scientist','科学家'], effects:{stress:+5}},
        {id:'c_sci_grant', text:'申请到了一笔科研经费', weight:2, occupation:['scientist','科学家'], effects:{money:+5000}},
        /* v2.6.2: 警察线 */
        {id:'c_pol_patrol', text:'今天在街上巡逻', weight:5, occupation:['police','警察'], effects:{stress:+3}},
        {id:'c_pol_case', text:'接手了一桩案子', weight:3, occupation:['police','警察'], effects:{stress:+5, 声望:+2}},
        {id:'c_pol_bust', text:'你参与了一次抓捕行动', weight:2, occupation:['police','警察'], req:{careerLevel:2}, effects:{声望:+4, 健康:-3}},
        {id:'c_pol_bribe', text:'有人想给你塞钱', weight:1, occupation:['police','警察'], effects:{}},
        /* v2.6.2: 学生线 */
        {id:'c_stu_exam', text:'快到期末考试了', weight:5, occupation:['student','学生'], effects:{stress:+4, 智力:+1}},
        {id:'c_stu_club', text:'社团有活动要参加', weight:4, occupation:['student','学生'], effects:{stress:-1}},
        {id:'c_stu_scholar', text:'你获得了奖学金', weight:2, occupation:['student','学生'], effects:{money:+2000, 声望:+2}},
        {id:'c_stu_intern', text:'找到了一份实习', weight:3, occupation:['student','学生'], effects:{money:+1500}},
        /* v2.6.2: 商人/程序员线 */
        {id:'c_biz_deal', text:'谈成了一笔生意', weight:3, occupation:['business','商人'], effects:{money:+3000, 声望:+1}},
        {id:'c_biz_client', text:'大客户约你见面', weight:3, occupation:['business','商人'], effects:{}},
        {id:'c_dev_deadline', text:'项目要赶 Deadline 了', weight:5, occupation:['programmer','程序员','engineer'], effects:{stress:+5, money:+500}},
        {id:'c_dev_bug', text:'线上出了个紧急 Bug', weight:3, occupation:['programmer','程序员'], effects:{stress:+6}},
        {id:'c_dev_launch', text:'你的产品上线了', weight:2, occupation:['programmer','程序员'], req:{careerLevel:2}, effects:{声望:+3}}
      ],
      /* 世界新闻 (Level NEWS) */
      world: [
        {id:'w_news_normal', text:'收音机/电视里传来新闻', weight:5, level:'NEWS'},
        {id:'w_news_super',  text:'新闻提到了异常事件', weight:2, level:'NEWS', req:{awarenessMin:10}},
        {id:'w_indirect',    text:'你感觉到周围有些不寻常', weight:1, level:'INDIRECT'}
      ],
      /* 英雄/超自然事件 (Level 5) —— 必须满足条件才出现 */
      hero: [
        {id:'h_ssr_recruit', text:'SSR 的人找到了你', weight:1, level:'DIRECT',
         req:{ageMin:18, military:true, reputation:20}, divergence:+5},
        {id:'h_meet_hero',   text:'你偶然见到了一位超级英雄', weight:1, level:'INDIRECT',
         req:{locationCity:true}},
        {id:'h_strange',     text:'你目睹了无法解释的现象', weight:1, req:{awarenessMin:30}},
        {id:'h_recruit',     text:'有人邀请你加入一个秘密组织', weight:1, req:{influence:30}},
        /* v2.6.2: 更多英雄接触事件 */
        {id:'h_sighting', text:'你亲眼目睹了一场超能力对决', weight:2, req:{awarenessMin:5}, effects:{stress:+3}},
        {id:'h_rescue', text:'你在意外中被超级英雄救了', weight:2, req:{awarenessMin:10}, effects:{stress:+2, 声望:+2}},
        {id:'h_artifact', text:'你捡到了一件奇怪的东西', weight:2, req:{awarenessMin:15}, effects:{}},
        {id:'h_power', text:'你感觉身体里有什么在觉醒', weight:1, req:{awarenessMin:40}, effects:{声望:+4}},
        {id:'h_mentor', text:'一位隐世高人想收你为徒', weight:1, req:{awarenessMin:35}, effects:{}},
        {id:'h_villain', text:'你被反派盯上了', weight:1, req:{awarenessMin:25}, effects:{stress:+8, 声望:+3}},
        {id:'h_accident', text:'你遭遇了一场改变命运的事故', weight:1, req:{awarenessMin:20}, effects:{健康:-5, 声望:+3}}
      ]
    },

    /* 检查事件是否满足硬条件 */
    checkRequirements: function(S, evt){
      if(!evt.req) return true;
      var req = evt.req;
      var p = S.player || {};
      var age = parseInt(p.年龄) || 0;
      var wl = S.worldline || {};

      if(req.ageMin && age < req.ageMin) return false;
      if(req.ageMax && age > req.ageMax) return false;
      if(req.stage){
        var st = CharacterEngine.getLifeStage(age).id;
        if(req.stage.indexOf(st) === -1) return false;
      }
      if(req.military && !WL_hasFlag(S,'military')) return false;
      if(req.reputation && (p.声望||0) < req.reputation) return false;
      if(req.influence && (wl.playerInfluence||0) < req.influence) return false;
      if(req.awarenessMin && (wl.publicAwareness||0) < req.awarenessMin) return false;
      if(req.careerLevel && (p.职业路径&&p.职业路径.等级||0) < req.careerLevel) return false;
      if(req.minFriend){
        var friendCount = (S.rel||[]).filter(function(r){return (r.信任==='高'||r.信任==='中等偏高')}).length;
        if(friendCount < req.minFriend) return false;
      }
      if(req.occupation){
        var occ = (p.职业路径&&p.职业路径.当前职业) || p.职业 || '';
        var ok = false;
        for(var i=0;i<req.occupation.length;i++){
          if(occ.indexOf(req.occupation[i]) !== -1){ok=true;break;}
        }
        if(!ok) return false;
      }
      /* v2.6: 出身阶层要求（经济等级 1-6） */
      if(req.tierMax || req.tierMin){
        var tier = 3;
        var eco = p.经济;
        if(eco){
          var wealth = (eco.储蓄||0)+(eco.现金||0)-(eco.债务||0);
          if(wealth < 0) tier = 2;
          else if(wealth < 2000) tier = 2;
          else if(wealth < 10000) tier = 3;
          else if(wealth < 50000) tier = 4;
          else if(wealth < 300000) tier = 5;
          else tier = 6;
        }
        if(req.tierMax && tier > req.tierMax) return false;
        if(req.tierMin && tier < req.tierMin) return false;
      }
      return true;
    },

    /* 软条件修正权重 */
    applySoftModifiers: function(S, evt, baseWeight){
      var w = baseWeight;
      if(!evt.req) return w;
      var req = evt.req;
      var p = S.player || {};
      var wl = S.worldline || {};
      /* 软条件：未满足时降权但不排除 */
      if(req.softMilitary && !WL_hasFlag(S,'military')) w *= 0.2;
      if(req.softRich && CharacterEngine.getEconomyLabel(S) === '贫困') w *= 0.3;
      if(req.softEducated && (p.属性&&p.属性.智力||50) < 60) w *= 0.5;
      return w;
    },

    /* 事件冷却检查 */
    checkCooldown: function(S, evtId){
      if(!S.cooldowns) S.cooldowns = {};
      var cd = S.cooldowns[evtId] || 0;
      return cd <= 0;
    },

    /* 设置事件冷却 */
    setCooldown: function(S, evtId, turns){
      if(!S.cooldowns) S.cooldowns = {};
      S.cooldowns[evtId] = turns;
    },

    /* 每回合递减冷却 */
    tickCooldowns: function(S){
      if(!S.cooldowns) return;
      for(var k in S.cooldowns){
        if(S.cooldowns[k] > 0) S.cooldowns[k]--;
      }
    },

    /* 核心：根据玩家状态选择下一事件 */
    selectNextEvent: function(S){
      if(!S.worldline) WorldlineEngine.init(S);
      var p = S.player || {};
      var age = parseInt(p.年龄) || 20;
      var stage = CharacterEngine.getLifeStage(age);
      var occ = (p.职业路径 && p.职业路径.当前职业) || p.职业 || '普通';
      var wl = S.worldline;

      /* 根据身份决定事件类型权重（项13） */
      var typeWeights = this.getTypeWeights(S, occ);

      /* 收集候选事件 */
      var candidates = [];
      var self = this;
      Object.keys(this.eventPool).forEach(function(type){
        var pool = self.eventPool[type];
        pool.forEach(function(evt){
          /* 人生阶段过滤 */
          if(evt.stage && evt.stage.indexOf(stage.id) === -1) return;
          /* 硬条件 */
          if(!self.checkRequirements(S, evt)) return;
          /* 冷却 */
          if(!self.checkCooldown(S, evt.id)) return;
          /* 事件历史去重（非日常事件不重复） */
          if(type !== 'daily' && type !== 'world'){
            if((S.eventHistory||[]).some(function(h){return h.id === evt.id})) return;
          }
          /* 计算权重 */
          var w = (evt.weight || 5) * (typeWeights[type] || 0.1);
          w = self.applySoftModifiers(S, evt, w);
          if(w > 0) candidates.push({evt: evt, weight: w, type: type});
        });
      });

      if(candidates.length === 0){
        /* 兜底：返回一个日常事件 */
        return {evt: this.eventPool.daily[0], type:'daily'};
      }

      /* 按权重随机选择 */
      var chosen = RNG.weighted(candidates.map(function(c){return {item:c, weight:c.weight}}));
      return chosen;
    },

    /* 根据身份获取事件类型权重（项13） */
    getTypeWeights: function(S, occ){
      var wl = S.worldline || {};
      var div = wl.divergenceLevel || 0;
      /* 基础权重 */
      var base = {daily:0.60, life:0.15, relation:0.10, career:0.10, world:0.04, hero:0.01};

      /* SSR/军人身份 */
      if(occ.indexOf('soldier') !== -1 || occ.indexOf('SSR') !== -1 || occ.indexOf('military') !== -1){
        base = {daily:0.25, life:0.05, relation:0.10, career:0.35, world:0.15, hero:0.10};
      }
      /* 复仇者成员 */
      if(WL_hasFlag(S,'avenger')){
        base = {daily:0.10, life:0.05, relation:0.10, career:0.20, world:0.15, hero:0.40};
      }
      /* 科学家/工程师 */
      if(occ.indexOf('scientist') !== -1 || occ.indexOf('engineer') !== -1){
        base = {daily:0.40, life:0.10, relation:0.08, career:0.25, world:0.10, hero:0.07};
      }
      /* 偏离度越高，英雄事件概率越高 */
      if(div > 30) base.hero = Math.min(0.4, base.hero + (div-30)*0.005);
      if(div > 50) base.world += 0.05;

      return base;
    },

    /* 执行事件效果 */
    applyEventEffects: function(S, evt){
      if(!evt.effects) return;
      var e = evt.effects;
      if(e.stress) CharacterEngine.addStress(S, e.stress);
      if(e.money) CharacterEngine.addMoney(S, e.money);
      if(e.健康) CharacterEngine.addHealth(S, e.健康);
      if(e.声望) CharacterEngine.addReputation(S, e.声望);
      if(e.体能) CharacterEngine.addStat(S, '体能', e.体能);
      if(e.智力) CharacterEngine.addStat(S, '智力', e.智力);
      if(e.divergence && S.worldline) WorldlineEngine.addDivergence(S, e.divergence);
      if(e.influence && S.worldline) WorldlineEngine.addInfluence(S, e.influence);
      if(e.flag && S.worldline) WorldlineEngine.setFlag(S, e.flag, true);
    },

    /* 记录事件历史 */
    recordEvent: function(S, evt, choice){
      if(!S.eventHistory) S.eventHistory = [];
      S.eventHistory.push({
        id: evt.id, turn: S.turn, date: S.date,
        choice: choice, timestamp: Date.now()
      });
      /* 设置冷却 */
      var cd = evt.id.indexOf('d_') === 0 ? RNG.int(3,7) :
               evt.id.indexOf('r_') === 0 ? RNG.int(10,20) :
               evt.id.indexOf('h_') === 0 ? RNG.int(40,80) : RNG.int(5,10);
      this.setCooldown(S, evt.id, cd);
    }
  };

  /* 辅助函数：检查 Flag */
  function WL_hasFlag(S, key){
    return WorldlineEngine && WorldlineEngine.hasFlag(S, key);
  }

  /* v2.6: 开档即完整 —— 生成初始世界动态，不等第一次世界演化 */
  ED.generateInitialWorld = function(S){
    var era = (S.setup && S.setup.era) ? String(S.setup.era) : '';
    var yr = parseInt(String((S.setup && S.setup.sdate) || '').slice(0,4)) || 1943;
    var birth = (S.setup && S.setup.birth) ? String(S.setup.birth) : '普通人';
    var openers = {
      '政府': yr+' 年，政局按正典时间线运行，一切如常。',
      '英雄界': '超级英雄世界暗流涌动，传奇即将书写。',
      '反派与地下': '地下势力各有盘算，暗处的眼睛在观察。',
      '科技与经济': '科技与经济按时代背景正常运转。',
      '宇宙': '宇宙深处，古老的力量正在沉睡。',
      '多元宇宙': '神圣时间线稳固，分支尚未出现。',
      '你所在地区': '你所在的地区一切如常，生活继续。'
    };
    if(S.world){
      for(var k in openers){
        if(!S.world[k] || S.world[k]==='—' || S.world[k]==='待首次世界演化'){
          S.world[k] = openers[k];
        }
      }
    }
    /* 注入开局已发生事件 */
    if(S.events && Array.isArray(S.events['已发生'])){
      S.events['已发生'].unshift({time:String(yr)+'年', text:'你出生于一个'+birth+'家庭，故事从此刻开始。'});
    }
  };

  /* v2.6: 世界动态联动玩家影响力 —— 影响力高时，新闻里出现和玩家相关的内容 */
  ED.injectInfluenceNews = function(S){
    try{
      var wl = S.worldline || {};
      var infl = wl.playerInfluence || 0;
      if(infl < 20) return;
      var name = (S.setup && S.setup.name) || '你';
      var occ = (S.player && S.player.职业) || '';
      var newsPool = [];
      if(infl >= 80){
        newsPool = [
          name+'近期的举动引发了广泛关注，媒体争相报道。',
          '有人说'+name+'正在改变这个世界的走向。',
          name+'的名字开始出现在多个情报机构的名单上。'
        ];
      } else if(infl >= 50){
        newsPool = [
          occ ? '作为'+occ+'，'+name+'在业内小有名气。' : name+'在圈子里渐渐有了名声。',
          '有人开始议论'+name+'的所作所为。'
        ];
      } else if(infl >= 20){
        newsPool = [
          name+'最近做的事被一些人注意到了。'
        ];
      }
      if(newsPool.length && S.world && S.world['你所在地区']){
        var txt = RNG.pick(newsPool);
        S.world['你所在地区'] = txt;
      }
    }catch(_){}
  };

  window.EventDirector = ED;
})();
