/* ============================================================
   AI Adapter - 智谱 glm-4.7（硬编码 Key，不暴露给玩家）
   AI 只负责叙事润色 / NPC 对话 / 新闻生成 / 结局扩写
   不控制游戏逻辑、不修改数值、不决定结局类型
   ============================================================ */

var AIService = (function(){
  // 智谱 AI 配置（作者共享 Key，硬编码，玩家无需配置）
  var CX_KEY   = '0b6f2b0d20084e799a4f9de18fcdf879.8BeGq8ET70mwvVLB';
  var CX_BASE  = 'https://open.bigmodel.cn/api/paas/v4';
  var CX_MODEL = 'glm-4.7';

  var CFG_KEY = 'mcu_ai_cfg_v1';
  var enabled = true;

  function getCfg(){
    try{
      var c = JSON.parse(localStorage.getItem(CFG_KEY)||'{}');
      return {
        base: (c.base||CX_BASE).trim().replace(/\/+$/,''),
        key:  (c.key||CX_KEY).trim(),
        model:(c.model||CX_MODEL).trim(),
        temp: typeof c.temp==='number'?c.temp:0.82,
        max:  c.max||2048
      };
    }catch(e){
      return {base:CX_BASE,key:CX_KEY,model:CX_MODEL,temp:0.82,max:2048};
    }
  }

  function saveCfg(c){ try{ localStorage.setItem(CFG_KEY, JSON.stringify(c)); }catch(e){} }
  function isEnabled(){ return enabled; }
  function setEnabled(v){ enabled = !!v; }
  function hasKey(){ var c = getCfg(); return c.key && c.key.length>10; }

  // 核心 API 调用（带超时 + 重试）
  async function callAI(messages, opts){
    opts = opts || {};
    if(!enabled || !hasKey()) return null;
    var cfg = getCfg();
    var url = cfg.base + '/chat/completions';
    var sysMsg = opts.system ? {role:'system', content:opts.system} : null;
    var allMsgs = sysMsg ? [sysMsg].concat(messages) : messages;
    var payload = {
      model: cfg.model,
      messages: allMsgs,
      temperature: opts.temp!=null ? opts.temp : cfg.temp,
      top_p: 0.85,
      max_tokens: opts.max||cfg.max,
      stream: false
    };
    if(/glm-.*(4\.7|5\.)/.test(cfg.model.toLowerCase())){
      payload.enable_thinking = false;
    }
    for(var attempt=0; attempt<2; attempt++){
      try{
        var ctrl = new AbortController();
        var to = setTimeout(function(){ try{ctrl.abort();}catch(e){} }, 30000);
        var r = await fetch(url, {
          method:'POST',
          headers:{'Content-Type':'application/json','Authorization':'Bearer '+cfg.key},
          body: JSON.stringify(payload),
          signal: ctrl.signal
        });
        clearTimeout(to);
        if(!r.ok){
          var t = await r.text();
          console.warn('[AI] HTTP', r.status, t.slice(0,200));
          if(r.status >= 500 && attempt === 0) continue;
          return null;
        }
        var j = await r.json();
        return j.choices && j.choices[0] && j.choices[0].message ? j.choices[0].message.content : null;
      }catch(e){
        console.warn('[AI] call failed (attempt '+(attempt+1)+'):', e.message);
        if(attempt === 0) continue;
        return null;
      }
    }
    return null;
  }

  // 解析 JSON（支持代码块包裹、数组/对象多形态）
  function parseJSON(s){
    if(!s) return null;
    s = String(s).trim();
    var tick = String.fromCharCode(96);
    var tripleTick = tick+tick+tick;
    if(s.indexOf(tripleTick) >= 0){
      var parts = s.split(tripleTick);
      s = parts.length >= 3 ? parts[1] : s;
      s = s.replace(/^\s*json\s*/i, '').trim();
    }
    try{ return JSON.parse(s); }catch(e){}
    var start = s.indexOf('{');
    var end = s.lastIndexOf('}');
    if(start >= 0 && end > start){
      try{ return JSON.parse(s.substring(start, end+1)); }catch(e){}
    }
    // 尝试解析数组
    var sStart = s.indexOf('[');
    var sEnd = s.lastIndexOf(']');
    if(sStart >= 0 && sEnd > sStart){
      try{ return JSON.parse(s.substring(sStart, sEnd+1)); }catch(e){}
    }
    return null;
  }

  // 构建游戏上下文（给 AI 的世界状态摘要）—— v2.6 精简版，减少 token
  function buildContext(state){
    if(!state) return '';
    var s = state;
    var d = s.date ? new Date(s.date) : new Date();
    var st = s.stats || {};
    var yr = d.getFullYear();
    var parts = [];
    parts.push(yr+'年'+(d.getMonth()+1)+'月 · '+(s.eraName||'')+' · '+(s.location||''));
    parts.push('身份:'+(s.originName||'')+'/'+(s.faction||'无')+' · 年龄:'+(s.age||'?'));
    parts.push('属性:体'+Math.round(st.str||0)+'智'+Math.round(st.int||0)+'魅'+Math.round(st.cha||0)+'意'+Math.round(st.wil||0)+'格'+Math.round(st.cbt||0)+'科'+Math.round(st.tec||0));
    parts.push('状态:压力'+(s.stress||0)+' 钱'+(s.money||0)+' 声望'+(s.player&&s.player['声望']||0));
    /* 经济等级约束 */
    var tier = (s.origin && s.origin.经济层) || (s.player && s.player['财富']) || 3;
    var tierName = ['赤贫','贫困','工薪','中产','富裕','精英'][Math.max(0,Math.min(5,(typeof tier==='number'?tier:3)-1))] || '中产';
    parts.push('经济:'+tierName);
    if(s.relations && Object.keys(s.relations).length){
      var rlist = [];
      var cn = 0;
      for(var rn in s.relations){
        if(cn++>=4) break;
        var rv = s.relations[rn];
        rlist.push(rn+'(好'+(rv.favor||0)+')');
      }
      if(rlist.length) parts.push('关系:'+rlist.join(' '));
    }
    parts.push('知界:'+getKnowledgeBoundary(s));
    return parts.join(' | ');
  }

  /* v2.6: 根据身份/阵营决定玩家知道什么 —— 精简版 */
  function getKnowledgeBoundary(s){
    var faction = (s.faction || '').toLowerCase();
    var origin = (s.originName || '').toLowerCase();
    var isSHIELD = /shield|神盾|hydra|九头蛇|avenger|复仇者/i.test(faction);
    var isScientist = /科学家|scientist|研究员|博士/i.test(origin+faction);
    if(isSHIELD) return '知情(神盾/九头蛇/宝石)';
    if(isScientist) return '略知科研传闻';
    return '平民(不知秘密组织)';
  }

  // ========== 1. 事件叙事润色 ==========
  async function generateNarrative(event, state, isDaily){
    if(!event) return event.text||'';
    var ctx = buildContext(state);

    var system = '你是MCU人生模拟器叙事编剧。规则：\n1.第二人称"你"。\n2.画面优先：写光线/声音/动作，不写"你感到紧张"。\n3.克制，少形容词。\n4.有人物就写一两句符合身份的对话。\n5.不写选项、不写结果、不改走向。\n6.MCU角色符合电影人设，不OOC。\n7.不剧透未来。';

    var prompt = ctx + '\n\n事件:' + (event.title||event.text||'') +
                 '\n请润色为' + (isDaily ? '80-150字生活化叙事' : '150-300字电影化叙事') +
                 '。直接输出正文，无前缀。';

    var result = await callAI([{role:'user',content:prompt}], {system: system, temp: isDaily ? 0.7 : 0.85, max: isDaily ? 500 : 1000});
    return result && result.trim() ? result.trim() : (event.text||'');
  }

  // ========== 2. NPC 对话（带记忆） ==========
  async function generateNPCDialogue(npc, playerInput, state, history){
    var ctx = buildContext(state);
    var npcInfo = npc ? (npc.name+'('+(npc.role||'')+',好感'+(npc.favor||50)+',信任'+(npc.trust||30)+')') : '';
    var historyStr = '';
    if(history && history.length){
      historyStr = '\n近期:\n' + history.slice(-3).map(function(h){return (h.role==='player'?'你':'Ta')+':'+h.text;}).join('\n');
    }
    var system = '你是MCU中的角色，正和玩家对话。第一人称，符合身份性格和关系。好感低冷淡，信任低保留。50-120字，像真实对话。直接输出内容。';
    var prompt = ctx + '\n' + npcInfo + historyStr + '\n你说:'+playerInput+'\nTa回复:';
    var result = await callAI([{role:'user',content:prompt}], {system: system, temp: 0.9, max: 300});
    return result && result.trim() ? result.trim() : '（'+(npc?npc.name:'对方')+'沉默了一会儿。）';
  }

  // ========== 3. 自定义行动解析 ==========
  async function generateCustomChoice(playerInput, state){
    var ctx = buildContext(state);
    var system = '行动判定引擎。只返回JSON。';
    var prompt = ctx + '\n行动:'+playerInput+'\n返回JSON:{"action":"investigate/fight/talk/sneak/flee/study/help/betray/other","risk":1-100,"requiredStats":["属性1"],"successText":"30字有画面","failText":"30字有画面","worldFlag":null}\n只JSON。';
    var result = await callAI([{role:'user',content:prompt}], {system: system, temp: 0.3, max: 400});
    var parsed = parseJSON(result);
    if(parsed && parsed.action){
      return {
        action: parsed.action,
        risk: Math.max(1, Math.min(100, parsed.risk||50)),
        requiredStats: Array.isArray(parsed.requiredStats)?parsed.requiredStats:['意志'],
        successText: parsed.successText||'你的行动取得了成效。',
        failText: parsed.failText||'事情没有按预期发展。',
        worldFlag: parsed.worldFlag||null
      };
    }
    return {action:'other', risk:50, requiredStats:['意志'], successText:'你的行动取得了成效。', failText:'事情没有按预期发展。'};
  }

  // ========== 4. 结局叙事扩写 ==========
  async function generateEnding(ending, state){
    var ctx = buildContext(state);
    var system = 'MCU结局编剧。第三人称电影旁白口吻，回顾一生，克制有重量感，不煽情不剧透。200-350字。直接输出。';
    var prompt = ctx + '\n结局:'+(ending.title||ending.name||'')+' ('+(ending.type||'')+')\n'+(ending.text||'')+'\n写人生总结。';
    var result = await callAI([{role:'user',content:prompt}], {system: system, temp: 0.8, max: 800});
    return result && result.trim() ? result.trim() : (ending.text||'');
  }

  // ========== 5. 人生传记 ==========
  async function generateLifeSummary(state, timeline, ending){
    if(!timeline || !timeline.length) return '';
    var events = timeline.slice(-15).map(function(t){return (t.date||'')+' '+(t.text||t.title||'');}).join('\n');
    var ctx = buildContext(state);
    var system = 'MCU史官。第三人称，客观有温度，突出关键转折，档案感史诗感。250-400字。基于时间线，不虚构。直接输出。';
    var prompt = ctx + '\n时间线:\n'+events+'\n结局:'+(ending?(ending.title||ending.name||''):'')+'\n写传记。';
    var result = await callAI([{role:'user',content:prompt}], {system: system, temp: 0.85, max: 1000});
    return result && result.trim() ? result.trim() : '';
  }

  // ========== 6. 世界新闻生成 ==========
  async function generateWorldNews(state){
    var ctx = buildContext(state);
    var system = 'MCU新闻编辑。按玩家身份视角生成3-4条新闻。返回JSON数组。';
    var prompt = ctx + '\n生成新闻JSON:[{"title":"标题","content":"1-2句","tag":"国际/社会/科技/传闻/神秘"}]\n只JSON。';
    var result = await callAI([{role:'user',content:prompt}], {system: system, temp: 0.9, max: 600});
    var parsed = parseJSON(result);
    if(Array.isArray(parsed) && parsed.length) return parsed;
    var era = (state && state.eraName) || '';
    if(/二战/.test(era)){
      return [
        {title:'盟军在欧洲推进',content:'盟军在意大利前线取得进展，德军防线出现松动。',tag:'国际'},
        {title:'神秘武器传闻',content:'欧洲战区出现关于"异常武器"的未经证实的传闻。',tag:'神秘'},
        {title:'斯塔克工业获大单',content:'霍华德·斯塔克的公司获得军方新一批武器采购合同。',tag:'科技'}
      ];
    }
    return [
      {title:'世界局势变化',content:'国际局势正在发生微妙变化。',tag:'国际'},
      {title:'科技动态',content:'科技领域出现一些值得关注的新进展。',tag:'科技'}
    ];
  }

  // ========== 7. 出身/出生身份 AI 生成 ==========
  async function generateOrigin(state){
    var ctx = buildContext(state);
    var era = (state && state.setup && state.setup.era) || '';
    var system = '出身生成器。返回JSON:{"家庭出身":"","社会阶层":"赤贫/贫困/工薪/中产/富裕/精英","父母职业":"","成长环境":"","性格倾向":"","初始技能":["",""],"描述":"50-100字"}。符合时代，普通真实，非超英。只JSON。';
    var prompt = ctx + '\n生成出身JSON。';
    var result = await callAI([{role:'user',content:prompt}], {system: system, temp: 0.95, max: 500});
    if(result && result.trim()){
      var jsonStr = result.replace(/^```json\s*/i,'').replace(/^```\s*/,'').replace(/```$/,'').trim();
      try{
        var obj = JSON.parse(jsonStr);
        if(obj && typeof obj === 'object' && obj.描述) return obj;
      }catch(e){}
      return {描述: result.trim(), 社会阶层: '工薪'};
    }
    // Fallback: 按时代分文案
    var fb = {
      '二战': [{家庭出身:'普通工薪家庭',社会阶层:'工薪',父母职业:'父亲造船厂工人，母亲护士',成长环境:'布鲁克林三居室公寓',性格倾向:'坚韧务实',初始技能:['机械基础','急救'],描述:'普通工薪家庭，父亲在布鲁克林造船厂做工，母亲是社区护士，一家人挤在三居室公寓里。'}],
      '冷战': [{家庭出身:'军工中层家庭',社会阶层:'中产',父母职业:'父亲飞机厂工程师，母亲秘书',成长环境:'郊区带后院的房子',性格倾向:'理性冷静',初始技能:['数理基础','驾驶'],描述:'军工企业中层家庭，父亲在飞机制造厂做工程师，母亲是秘书，住在郊区带后院的房子。'}],
      '纽约之战': [{家庭出身:'曼哈顿中产',社会阶层:'中产',父母职业:'父亲金融分析师，母亲画廊经理',成长环境:'上西区公寓',性格倾向:'自信外向',初始技能:['金融常识','艺术鉴赏'],描述:'曼哈顿中产家庭，父亲在华尔街做金融分析师，母亲是画廊经理，住在上西区公寓。'}],
      '奥创': [{家庭出身:'科技员工家庭',社会阶层:'中产',父母职业:'父亲斯塔克工业研发，母亲数据分析师',成长环境:'智能家居社区',性格倾向:'好奇钻研',初始技能:['编程基础','电子维修'],描述:'科技公司员工家庭，父亲在斯塔克工业做研发，母亲是数据分析师，家里有各种智能家居。'}],
      '内战': [{家庭出身:'华盛顿智库家庭',社会阶层:'中产',父母职业:'父亲智库研究员，母亲律师',成长环境:'特区政治氛围浓厚',性格倾向:'思辨善辩',初始技能:['写作','辩论'],描述:'华盛顿特区家庭，父亲在智库做研究员，母亲是律师，餐桌上永远在讨论政治。'}],
      '无限战争': [{家庭出身:'纽约普通家庭',社会阶层:'工薪',父母职业:'父亲消防员，母亲护士',成长环境:'经历过纽约大战的社区',性格倾向:'勇敢共情',初始技能:['急救','消防知识'],描述:'纽约普通家庭，父亲是消防员，母亲是护士，经历过纽约大战后更珍惜家人。'}],
      '烁灭': [{家庭出身:'烁灭后重组家庭',社会阶层:'工薪',父母职业:'父亲物流，母亲社工',成长环境:'灾后重建社区',性格倾向:'乐观坚韧',初始技能:['物流管理','心理疏导'],描述:'烁灭后重组家庭，父亲在物流行业工作，母亲是社工，家里收养了一个失去父母的孩子。'}]
    };
    var eraKey = '';
    if(/二战/.test(era)) eraKey='二战';
    else if(/冷战/.test(era)) eraKey='冷战';
    else if(/纽约之战/.test(era)) eraKey='纽约之战';
    else if(/奥创/.test(era)) eraKey='奥创';
    else if(/内战/.test(era)) eraKey='内战';
    else if(/无限战争|烁灭/.test(era)) eraKey='无限战争';
    else if(/回归|多元宇宙/.test(era)) eraKey='烁灭';
    else if(/英雄时代黎明/.test(era)) eraKey='纽约之战';
    var pool = fb[eraKey] || fb['纽约之战'];
    return pool[Math.floor(Math.random()*pool.length)];
  }

  // 测试连接
  async function testConnection(){
    var result = await callAI([{role:'user',content:'回复ok两个字。'}], {max:16, temp:0.1});
    return result && result.indexOf('ok')>=0;
  }

  return {
    getCfg: getCfg,
    saveCfg: saveCfg,
    isEnabled: isEnabled,
    setEnabled: setEnabled,
    hasKey: hasKey,
    generateNarrative: generateNarrative,
    generateNPCDialogue: generateNPCDialogue,
    generateCustomChoice: generateCustomChoice,
    generateEnding: generateEnding,
    generateLifeSummary: generateLifeSummary,
    generateWorldNews: generateWorldNews,
    generateOrigin: generateOrigin,
    testConnection: testConnection
  };
})();
