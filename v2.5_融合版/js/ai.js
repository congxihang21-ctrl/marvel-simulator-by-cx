/* ============================================================
   AI Adapter - 智谱 glm-4.7 + Local Fallback
   AI 只负责叙事增强，不控制游戏逻辑
   ============================================================ */

var AIService = (function(){
  // 智谱 AI 配置（从 v2.3 接入）
  var CX_KEY   = '0b6f2b0d20084e799a4f9de18fcdf879.8BeGq8ET70mwvVLB';
  var CX_BASE  = 'https://open.bigmodel.cn/api/paas/v4';
  var CX_MODEL = 'glm-4.7';

  var CFG_KEY = 'mcu_ai_cfg_v1';
  var enabled = true;

  // 读取用户配置（允许覆盖默认）
  function getCfg(){
    try{
      var c = JSON.parse(localStorage.getItem(CFG_KEY)||'{}');
      return {
        base: (c.base||CX_BASE).trim().replace(/\/+$/,''),
        key:  (c.key||CX_KEY).trim(),
        model:(c.model||CX_MODEL).trim(),
        temp: typeof c.temp==='number'?c.temp:0.85,
        max:  c.max||4096
      };
    }catch(e){
      return {base:CX_BASE,key:CX_KEY,model:CX_MODEL,temp:0.85,max:4096};
    }
  }

  function saveCfg(c){
    try{ localStorage.setItem(CFG_KEY, JSON.stringify(c)); }catch(e){}
  }

  function isEnabled(){ return enabled; }
  function setEnabled(v){ enabled = !!v; }

  function hasKey(){
    var c = getCfg();
    return c.key && c.key.length>10;
  }

  // 核心 API 调用
  async function callAI(messages, opts){
    opts = opts || {};
    if(!enabled || !hasKey()) return null;
    var cfg = getCfg();
    var url = cfg.base + '/chat/completions';
    var payload = {
      model: cfg.model,
      messages: messages,
      temperature: opts.temp||cfg.temp,
      top_p: 0.85,
      max_tokens: opts.max||cfg.max,
      stream: false
    };
    // GLM 4.7 关思考
    if(/glm-.*(4\.7|5\.)/.test(cfg.model.toLowerCase())){
      payload.enable_thinking = false;
    }
    try{
      var ctrl = new AbortController();
      var to = setTimeout(function(){ try{ctrl.abort();}catch(e){} }, 60000);
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
        return null;
      }
      var j = await r.json();
      return j.choices && j.choices[0] && j.choices[0].message ? j.choices[0].message.content : null;
    }catch(e){
      console.warn('[AI] call failed:', e.message);
      return null;
    }
  }

  // 尝试解析 JSON（AI 可能返回代码块包裹）
  function parseJSON(s){
    if(!s) return null;
    s = String(s).trim();
    // 去掉代码块包裹（```json ... ```）
    var tick = String.fromCharCode(96); // 反引号
    var tripleTick = tick + tick + tick;
    if(s.indexOf(tripleTick) >= 0){
      var parts = s.split(tripleTick);
      s = parts.length >= 3 ? parts[1] : s;
      // 去掉开头的 json 标记
      s = s.replace(/^\s*json\s*/i, '').trim();
    }
    try{ return JSON.parse(s); }catch(e){}
    // 尝试提取第一个 {...}
    var start = s.indexOf('{');
    var end = s.lastIndexOf('}');
    if(start >= 0 && end > start){
      try{ return JSON.parse(s.substring(start, end+1)); }catch(e){}
    }
    return null;
  }

  // 构建游戏上下文（给 AI 的世界状态）
  function buildContext(state){
    if(!state) return '';
    var s = state;
    var d = s.date || {};
    var st = s.stats || {};
    var timeStr = d.year ? d.year + '年' + (d.month||'') + '月' : '';
    var attrStr = '体能' + Math.round(st.体能||0) + ' 格斗' + Math.round(st.格斗||0) + ' 智力' + Math.round(st.智力||0) + ' 意志' + Math.round(st.意志||0);
    var parts = [];
    parts.push('【当前时间】' + timeStr);
    parts.push('【时代】' + (s.eraName||''));
    parts.push('【地点】' + (s.location||''));
    parts.push('【身份】' + (s.originName||'') + ' / ' + (s.faction||''));
    parts.push('【属性】' + attrStr);
    parts.push('【状态】压力' + (s.stress||0) + ' 金钱' + (s.money||0));
    if(s.npcs && s.npcs.length){
      var npcList = s.npcs.filter(function(n){ return n.alive !== false; })
        .map(function(n){ return n.name + '(' + n.relation + '/信任' + (n.trust||0) + ')'; })
        .join('、');
      if(npcList) parts.push('【认识的人】' + npcList);
    }
    return parts.join('\n');
  }

  // 1. 生成事件叙事（把固定事件包装成有氛围的文字）
  async function generateNarrative(event, state){
    if(!event) return event.text||'';
    var ctx = buildContext(state);
    var prompt = '你是漫威电影宇宙人生模拟器的叙事引擎。请把以下游戏事件改写为一段有电影感、有氛围、有人物的叙事文字。\n\n要求：\n1. 先写时间地点氛围（1-2句）\n2. 再写发生了什么（2-4句，要有画面感）\n3. 最后写玩家处境（1-2句，引出选择）\n4. 不要写选择内容，不要写结果\n5. 控制在 150-300 字\n6. 用第二人称"你"\n7. 风格：MCU 电影化、克制、有张力\n\n'+ctx+'\n\n【事件标题】'+event.title+'\n【事件类型】'+(event.level||'')+'\n【原始事件】'+event.text+'\n\n请直接输出叙事正文，不要加标题、不要加引号、不要解释。';

    var result = await callAI([{role:'user',content:prompt}]);
    return result && result.trim() ? result.trim() : (event.text||'');
  }

  // 2. 生成 NPC 对话
  async function generateNPCDialogue(npc, playerInput, state){
    var ctx = buildContext(state);
    var npcInfo = npc ? ('【NPC】'+npc.name+'，身份：'+(npc.role||'')+'，性格：'+(npc.personality||'')+'，与玩家关系：'+(npc.relation||'陌生')+'，信任度：'+(npc.trust||50)) : '';
    var prompt = '你是漫威电影宇宙中的一个角色。请根据以下信息回复玩家。\n\n'+ctx+'\n'+npcInfo+'\n\n【玩家说】'+playerInput+'\n\n要求：\n1. 用第一人称，以该NPC的口吻说话\n2. 回复要符合NPC身份和性格\n3. 考虑与玩家的关系和信任度\n4. 不要透露未来剧情\n5. 控制在 50-150 字\n6. 直接输出对话内容，不要加引号和说明';

    var result = await callAI([{role:'user',content:prompt}]);
    return result && result.trim() ? result.trim() : '（'+npc.name+'沉默了一会儿，似乎在斟酌措辞。）';
  }

  // 3. 解析玩家自定义选择
  async function generateCustomChoice(playerInput, state){
    var ctx = buildContext(state);
    var prompt = '玩家在漫威人生模拟器中输入了一个自定义行动。请将其解析为结构化数据。\n\n'+ctx+'\n【玩家行动】'+playerInput+'\n\n请返回JSON：{"action":"行动类型","risk":1-100,"requiredStats":["属性名"],"successText":"成功时的简短描述","failText":"失败时的简短描述"}\n\n行动类型可选：investigate(调查)、fight(战斗)、talk(交涉)、sneak(潜行)、flee(逃跑)、study(研究)、help(帮助)、betray(背叛)、other(其他)\nrisk：1-100，越高越危险\nrequiredStats：从["体能","格斗","敏捷","智力","科技","超能","魅力","意志"]中选1-2个\n只返回JSON，不要其他内容。';

    var result = await callAI([{role:'user',content:prompt}]);
    var parsed = parseJSON(result);
    if(parsed && parsed.action){
      return {
        action: parsed.action,
        risk: Math.max(1, Math.min(100, parsed.risk||50)),
        requiredStats: Array.isArray(parsed.requiredStats)?parsed.requiredStats:[],
        successText: parsed.successText||'你的行动取得了成效。',
        failText: parsed.failText||'事情没有按预期发展。'
      };
    }
    // Fallback
    return {
      action:'other', risk:50, requiredStats:['意志'],
      successText:'你的行动取得了成效。', failText:'事情没有按预期发展。'
    };
  }

  // 4. 生成结局叙事
  async function generateEnding(ending, state){
    var ctx = buildContext(state);
    var prompt = '玩家的漫威人生已经结束。请为以下结局写一段有仪式感的人生总结。\n\n'+ctx+'\n【结局】'+(ending.title||'')+'\n【结局类型】'+(ending.type||'')+'\n【结局描述】'+(ending.text||'')+'\n\n要求：\n1. 回顾玩家的一生（2-3句）\n2. 点出关键转折（1-2句）\n3. 给出最终评价（1-2句）\n4. 风格：电影旁白、有重量感、克制\n5. 控制在 200-400 字\n6. 不要剧透其他结局\n\n直接输出正文。';

    var result = await callAI([{role:'user',content:prompt}]);
    return result && result.trim() ? result.trim() : (ending.text||'');
  }

  // 5. 生成人生传记（结局页用）
  async function generateLifeSummary(state, timeline, ending){
    if(!timeline || !timeline.length) return '';
    var events = timeline.slice(-15).map(function(t){return t.year+'年: '+t.title;}).join('\n');
    var ctx = buildContext(state);
    var endTitle = ending ? (ending.title || '') : '';
    var prompt = '请为这位漫威宇宙人物写一段人生传记。\n\n'+ctx+'\n【人生时间线】\n'+events+'\n【最终结局】'+endTitle+'\n\n要求：\n1. 以第三人称写人物传记\n2. 从出生/入伍开始，到结局结束\n3. 突出关键选择和转折\n4. 风格：MCU 电影旁白、史诗感、克制\n5. 控制在 300-500 字\n6. 不要虚构时间线之外的重大事件\n\n直接输出正文。';

    var result = await callAI([{role:'user',content:prompt}]);
    return result && result.trim() ? result.trim() : '';
  }

  // 测试连接
  async function testConnection(){
    var result = await callAI([{role:'user',content:'回复"ok"两个字。'}], {max:16});
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
    testConnection: testConnection
  };
})();
