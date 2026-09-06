/* ===== v2.6: 结局引擎 (Ending Engine) =====
   根据人生轨迹计算结局、生成章节、人生传记 */
(function(){
  var ENDINGS = [
    {id:'ordinary_success', name:'普通而充实的一生', weight:10,
     check: function(S){ var p=S.player||{}; return (p.声望||0) < 30 && (p.经济&&p.经济.现金||0) > 0; }},
    {id:'military_hero', name:'军事英雄', weight:5,
     check: function(S){ return WL_hasFlag(S,'military') && (S.player.声望||0) > 50; }},
    {id:'superhero', name:'超级英雄', weight:3,
     check: function(S){ return (S.worldline.divergenceLevel||0) > 50 && WL_hasFlag(S,'hasAbility'); }},
    {id:'tech_hero', name:'科技英雄', weight:3,
     check: function(S){ return (S.player.属性&&S.player.属性.科技||0) > 80 && (S.worldline.divergenceLevel||0) > 30; }},
    {id:'behind_scenes', name:'幕后英雄', weight:4,
     check: function(S){ return (S.worldline.playerInfluence||0) > 60 && (S.player.声望||0) < 30; }},
    {id:'sacrifice', name:'牺牲', weight:2,
     check: function(S){ return (S.player.健康||100) <= 0 && WL_hasFlag(S,'heroic_death'); }},
    {id:'villain', name:'黑化', weight:3,
     check: function(S){ return (S.player.声望||0) < -40 || WL_hasFlag(S,'evil'); }},
    {id:'crime', name:'犯罪人生', weight:2,
     check: function(S){ return WL_hasFlag(S,'criminal'); }},
    {id:'missing', name:'神秘失踪', weight:1,
     check: function(S){ return WL_hasFlag(S,'disappeared'); }},
    {id:'family_life', name:'家庭人生', weight:5,
     check: function(S){ var p=S.player||{}; return p.家庭&&p.家庭.配偶 && (p.声望||0) < 50; }},
    {id:'lonely_old', name:'孤独终老', weight:3,
     check: function(S){ var p=S.player||{}; return !p.家庭||!p.家庭.配偶; }},
    {id:'forgotten', name:'被世界遗忘', weight:2,
     check: function(S){ return (S.player.声望||0) < -10; }},
    {id:'worldline_changer', name:'世界线改变者', weight:2,
     check: function(S){ return (S.worldline.divergenceLevel||0) > 70; }},
    {id:'multiverse_anomaly', name:'多元宇宙异常体', weight:1,
     check: function(S){ return (S.worldline.divergenceLevel||0) > 90; }},
    {id:'retirement', name:'功成身退', weight:3,
     check: function(S){ return (S.player.声望||0) > 40 && !WL_hasFlag(S,'hasAbility'); }}
  ];

  var EE = {
    /* 计算结局 */
    calculateEnding: function(S){
      if(!S.worldline) WorldlineEngine.init(S);
      var candidates = ENDINGS.filter(function(e){
        try{ return e.check(S); }catch(_){ return false; }
      });
      if(candidates.length === 0) return ENDINGS[0];
      /* 按权重选最符合的 */
      var chosen = RNG.weighted(candidates.map(function(e){return {item:e, weight:e.weight};}));
      return chosen;
    },

    /* 检查是否应该进入结局（项49、50） */
    shouldEnd: function(S){
      var p = S.player || {};
      var age = parseInt(p.年龄) || 0;
      var turn = S.turn || 0;
      /* 死亡 */
      if((p.健康||100) <= 0) return true;
      /* 高龄自然结局 */
      if(age >= 75 && turn > 120) return true;
      /* 高风险英雄人生可能提前 */
      if(age >= 60 && (S.worldline.divergenceLevel||0) > 70 && turn > 100) return true;
      /* 最长不超过 220 回合 */
      if(turn >= 220) return true;
      return false;
    },

    /* 检查是否进入结局准备阶段（晚年） */
    isEndingPrep: function(S){
      var age = parseInt((S.player&&S.player.年龄)||0);
      return age >= 65;
    },

    /* 生成人生传记（给 AI 的素材） */
    generateBiographyData: function(S){
      var p = S.player || {};
      var wl = S.worldline || {};
      return {
        name: (S.setup && S.setup.name) || '无名者',
        birth: S.setup && S.setup.sdate || '',
        age: p.年龄 || 0,
        occupation: (p.职业路径&&p.职业路径.当前职业) || p.职业 || '未知',
        reputation: p.声望 || 0,
        wealth: p.经济 ? (p.经济.现金 + p.经济.储蓄) : 0,
        economy: CharacterEngine.getEconomyLabel(S),
        health: p.健康 || 100,
        stats: p.属性 || {},
        divergence: wl.divergenceLevel || 0,
        divergenceLabel: WorldlineEngine.getDivergenceLabel(S),
        memories: (S.memory||[]).slice(-20),
        chapters: S.chapters || [],
        relationships: (S.rel||[]).slice(0,10).map(function(r){return r.姓名+'('+r.关系+')'}),
        alteredEvents: wl.alteredEvents || [],
        flags: Object.keys(wl.majorFlags||{}),
        finalStats: p.属性 || {}
      };
    },

    /* 生成结局页面数据 */
    generateEndingScreen: function(S){
      var ending = this.calculateEnding(S);
      var data = this.generateBiographyData(S);
      return {
        ending: ending,
        data: data,
        /* 结局档案（项52） */
        worldlineArchive: {
          canonIntegrity: data.divergence < 30 ? '基本保持正典' : '发生显著改变',
          playerImpact: data.divergence + '%',
          alteredEvents: data.alteredEvents,
          summary: this.generateWorldlineSummary(S)
        }
      };
    },

    /* 生成世界线档案摘要 */
    generateWorldlineSummary: function(S){
      var wl = S.worldline || {};
      var parts = [];
      if(wl.alteredEvents.length === 0){
        parts.push('你没有改变任何重大历史事件，世界线基本保持原样。');
      } else {
        parts.push('你改变了 '+wl.alteredEvents.length+' 个重大事件：'+wl.alteredEvents.join('、'));
      }
      if(wl.divergenceLevel > 50){
        parts.push('你的存在让这个世界产生了明显的偏离。');
      } else {
        parts.push('你在这个世界留下了自己的痕迹，但历史的大方向未曾改变。');
      }
      return parts.join(' ');
    }
  };

  function WL_hasFlag(S, key){
    return WorldlineEngine && WorldlineEngine.hasFlag(S, key);
  }

  /* 展示结局画面 */
  EE.showEnding = function(S){
    var result = EE.generateEndingScreen(S);
    var e = result.ending;
    var d = result.data;
    var arch = result.worldlineArchive;

    var html = '<div style="max-width:640px;margin:0 auto;padding:30px 20px;text-align:center">'+
      '<div style="font-size:28px;font-weight:800;color:#e8c66a;margin-bottom:10px">《'+d.name+'的一生》</div>'+
      '<div style="font-size:16px;color:#c9d3df;margin-bottom:20px">'+e.name+'</div>'+
      '<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:16px;text-align:left;font-size:13px;line-height:1.8;color:#bbb;margin-bottom:16px">'+
        '<div><b>出生日期：</b>'+(d.birth||'未知')+'</div>'+
        '<div><b>享年：</b>'+d.age+' 岁</div>'+
        '<div><b>职业：</b>'+d.occupation+'</div>'+
        '<div><b>经济等级：</b>'+d.economy+'</div>'+
        '<div><b>最终声望：</b>'+d.reputation+'</div>'+
        '<div><b>最终健康：</b>'+d.health+'</div>'+
        '<div><b>世界线偏离：</b>'+d.divergenceLabel+' ('+d.divergence+'%)</div>'+
      '</div>'+
      '<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:16px;text-align:left;font-size:13px;line-height:1.8;color:#bbb;margin-bottom:16px">'+
        '<b style="color:#e8c66a">📜 世界线档案</b><br>'+arch.summary+
      '</div>';
    if(d.memories && d.memories.length){
      html += '<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:16px;text-align:left;font-size:12px;line-height:1.8;color:#999;margin-bottom:16px">'+
        '<b style="color:#7ec8e3">💭 人生记忆</b><br>';
      d.memories.forEach(function(m){ html += m.year+'年：'+m.text+'<br>'; });
      html += '</div>';
    }
    html += '<div id="endingBio" style="background:rgba(232,198,106,.06);border:1px solid rgba(232,198,106,.2);border-radius:14px;padding:16px;text-align:left;font-size:13px;line-height:1.9;color:#ddd;margin-bottom:20px">正在生成人生传记…</div>'+
      '<button onclick="location.reload()" style="padding:12px 36px;border-radius:12px;border:none;background:linear-gradient(180deg,#e8c66a,#c1272d);color:#fff;cursor:pointer;font-size:15px;font-weight:700">重新开始人生</button>'+
      '</div>';

    var screen = document.getElementById('endingScreen');
    if(!screen){
      screen = document.createElement('div');
      screen.id = 'endingScreen';
      screen.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(10,15,24,.97);z-index:300;overflow:auto;padding:20px;box-sizing:border-box';
      document.body.appendChild(screen);
    }
    screen.innerHTML = html;
    screen.style.display = 'block';

    /* AI 生成传记（Tier 5） */
    if(typeof AIService !== 'undefined' && AIService.isEnabled && AIService.isEnabled()){
      try{
        AIService.generateLifeSummary(S, d.memories||[], e).then(function(text){
          var el = document.getElementById('endingBio');
          if(el && text) el.textContent = text;
        }).catch(function(){});
      }catch(_){}
    }
  };

  window.EndingEngine = EE;
})();
