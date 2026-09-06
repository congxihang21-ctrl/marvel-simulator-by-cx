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
        max:  c.max||4096
      };
    }catch(e){
      return {base:CX_BASE,key:CX_KEY,model:CX_MODEL,temp:0.82,max:4096};
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
        var to = setTimeout(function(){ try{ctrl.abort();}catch(e){} }, 45000);
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

  // 构建游戏上下文（给 AI 的世界状态摘要）
  function buildContext(state){
    if(!state) return '';
    var s = state;
    var d = s.date ? new Date(s.date) : new Date();
    var st = s.stats || {};
    var timeStr = d.getFullYear() + '年' + (d.getMonth()+1) + '月' + d.getDate() + '日';
    var attrStr = '体能' + Math.round(st.str||0) + ' 格斗' + Math.round(st.cbt||0) + ' 敏捷' + Math.round(st.agi||0) +
                  ' 智力' + Math.round(st.int||0) + ' 科技' + Math.round(st.tec||0) + ' 超能' + Math.round(st.pwr||0) +
                  ' 魅力' + Math.round(st.cha||0) + ' 意志' + Math.round(st.wil||0);
    var parts = [];
    parts.push('【当前时间】' + timeStr);
    parts.push('【时代】' + (s.eraName||''));
    parts.push('【地点】' + (s.location||(s.player&&s.player['所在地'])||''));
    parts.push('【身份】' + (s.originName||(s.player&&s.player['身份'])||'') + ' / ' + (s.faction||(s.player&&s.player['所属势力'])||''));
    parts.push('【属性】' + attrStr);
    parts.push('【状态】压力' + (s.stress||0) + '/100  金钱' + (s.money||0));
    if(s.relations && Object.keys(s.relations).length){
      var rlist = [];
      for(var rn in s.relations){
        var rv = s.relations[rn];
        rlist.push(rn + '(好感' + (rv.favor||0) + '/信任' + (rv.trust||0) + ')');
      }
      if(rlist.length) parts.push('【人际关系】' + rlist.join('、'));
    }
    if(s.flags){
      var fl = [];
      if(s.flags.injuredCount) fl.push('受伤' + s.flags.injuredCount + '次');
      if(s.flags.battleCount) fl.push('战斗' + s.flags.battleCount + '次');
      for(var fk in s.flags){
        if(s.flags[fk] === true && fk !== 'eventCount' && fk !== 'dailyCount') fl.push(fk);
      }
      if(fl.length) parts.push('【世界线标记】' + fl.join('、'));
    }
    /* v2.6: 信息边界 —— 普通人不知道秘密组织/宇宙魔方等 */
    parts.push('【知识边界】' + getKnowledgeBoundary(s));
    return parts.join('\n');
  }

  /* v2.6: 根据身份/阵营/flag 决定玩家知道什么 */
  function getKnowledgeBoundary(s){
    var knows = [];
    var faction = (s.faction || (s.player && s.player['所属势力']) || '').toLowerCase();
    var origin = (s.originName || (s.player && s.player['身份']) || '').toLowerCase();
    var flags = s.flags || {};
    var isSHIELD = /shield|神盾|s.h.i.e.l.d/i.test(faction);
    var isHydra = /hydra|九头蛇/i.test(faction);
    var isAvenger = /复仇者|avenger/i.test(faction);
    var isStark = /斯塔克|stark/i.test(faction+origin);
    var isMilitary = /军|soldier|military|兵/i.test(origin+faction);
    var isScientist = /科学家|scientist|研究员|博士/i.test(origin+faction);
    var age = s.age || 0;
    var year = (s.date ? new Date(s.date) : new Date()).getFullYear();

    knows.push('公开新闻：纽约之战、奥创事件、内战、灭霸入侵等已公开事件');
    if(isSHIELD || isHydra || isAvenger){
      knows.push('知道神盾局/Hydra 的存在与秘密行动');
      if(year >= 2011) knows.push('知道宇宙魔方/无限宝石的存在');
    } else if(isScientist && year >= 2010){
      knows.push('听说过一些前沿科研传闻，但不知全貌');
    } else if(isMilitary){
      knows.push('知道一些军方机密，但不涉及超自然');
    } else {
      knows.push('不知道神盾局、Hydra、无限宝石等秘密');
    }
    if(isStark){
      knows.push('熟悉斯塔克工业内部动向');
    }
    if(age < 18){
      knows.push('未成年，社会接触面有限');
    }
    return knows.join('；') + '。AI 叙事时必须遵守此边界，不要让玩家知道不该知道的事。';
  }

  // ========== 1. 事件叙事润色 ==========
  async function generateNarrative(event, state, isDaily){
    if(!event) return event.text||'';
    var ctx = buildContext(state);
    var depth = isDaily ? '日常' : '重要';

    var system = '你是漫威电影宇宙人生模拟器的首席叙事编剧。你的职责是把游戏策划写的"事件骨架"润色成有电影感的叙事段落。\n\n核心原则：\n1. 【画面优先】每段必须有可被摄影机拍到的画面：光线、声音、气味、温度、人物动作。不要写"你感到紧张"，要写"你的掌心渗出冷汗，M1加兰德的枪托硌着锁骨"。\n2. 【第二人称】始终用"你"。不要用"主角"。\n3. 【克制】不滥用形容词。不用"令人震撼地""无比悲壮地"。让画面自己说话。\n4. 【对话】有人物在场时，写一两句符合身份的对话，不要长篇大论。\n5. 【不越界】绝不写选项内容、绝不写行动结果、绝不修改事件的走向。你只负责"场景 + 发生了什么 + 你现在的处境"。\n6. 【MCU 正典】钢铁侠、美国队长、雷神等角色的言行必须符合 MCU 电影中的人设。不要让 OOC。\n7. 【不剧透】不要暗示未来会发生什么。';

    var examples = '【示范·好】\n1944年3月17日，意大利前线。\n雨已经下了三个小时。你靠在半塌的石墙边，帆布斗篷渗进了冷水，M1加兰德的枪托硌着锁骨。\n无线电突然刺啦响了一声。"第三小队失去联系。"\n传令的中尉转过头，雨水顺着他钢盔的檐滴下来。"你是这里离他们最近的人。"\n远处传来第二声爆炸——这一次，比刚才近得多。\n\n【示范·坏·不要这样写】\n这是一个非常紧张刺激的夜晚，你感到无比害怕，但你知道自己必须勇敢地面对即将到来的挑战，因为这是你的命运。';

    var prompt = ctx + '\n\n【事件标题】' + event.title + '\n【事件等级】' + (event.level||depth) + '\n【策划原始事件】\n' + (event.text||'') +
                 '\n\n请把上面的事件骨架润色为' + (isDaily ? '100-180字' : '200-350字') + '的电影化叙事。' +
                 (isDaily ? '日常事件要生活化、有烟火气，不要太戏剧化。' : '重要事件要有张力、有画面、有人物。') +
                 '\n直接输出正文，不要加标题、不要加引号、不要写"润色后："之类的前缀。';

    var result = await callAI([{role:'user',content:prompt}], {system: system, temp: isDaily ? 0.7 : 0.85, max: isDaily ? 600 : 1200});
    return result && result.trim() ? result.trim() : (event.text||'');
  }

  // ========== 2. NPC 对话（带记忆） ==========
  async function generateNPCDialogue(npc, playerInput, state, history){
    var ctx = buildContext(state);
    var npcInfo = npc ? ('【NPC】' + npc.name + '\n身份：' + (npc.role||'未知') + '\n性格：' + (npc.personality||'沉稳') +
                         '\n与玩家关系：' + (npc.relation||'陌生') + '\n好感度：' + (npc.favor||50) + '/100\n信任度：' + (npc.trust||30) + '/100') : '';
    var historyStr = '';
    if(history && history.length){
      historyStr = '\n【近期对话记录】\n' + history.map(function(h){
        return (h.role==='player'?'玩家：':'对方：') + h.text;
      }).join('\n');
    }

    var system = '你是漫威电影宇宙中的一个角色。你正在和玩家对话。\n\n规则：\n1. 用第一人称，以该NPC的口吻说话。\n2. 回复必须符合NPC的身份、性格、与玩家的关系和信任度。好感低→冷淡；信任低→有所保留；挚友→真诚。\n3. 参考近期对话记录，保持话题连贯，不要重复已经说过的话。\n4. 不要说不属于这个角色会说的话。不要剧透未来剧情。\n5. 回复要短，50-150字，像真实对话一样有停顿、有情绪。\n6. 如果NPC是MCU正典角色（如美队、钢铁侠），言行必须符合电影人设。\n7. 直接输出对话内容，不要加引号、不要加"NPC说："。';

    var prompt = ctx + '\n' + npcInfo + historyStr + '\n\n【玩家说】' + playerInput +
                 '\n\n请以该NPC的身份回复玩家。';

    var result = await callAI([{role:'user',content:prompt}], {system: system, temp: 0.9});
    return result && result.trim() ? result.trim() : '（' + (npc.name||'对方') + '沉默了一会儿，似乎在斟酌措辞。）';
  }

  // ========== 3. 自定义行动解析 ==========
  async function generateCustomChoice(playerInput, state){
    var ctx = buildContext(state);
    var system = '你是漫威人生模拟器的行动判定引擎。玩家输入了一个自定义行动，你需要把它解析成结构化数据供游戏引擎使用。\n\n你必须严格返回JSON，不要加任何其他文字。';
    var prompt = ctx + '\n【玩家行动】' + playerInput + '\n\n返回JSON格式：\n' +
                 '{"action":"行动类型","risk":1-100,"requiredStats":["属性名"],"successText":"成功时的简短描述(30-60字，有画面感)","failText":"失败时的简短描述(30-60字，有画面感)","worldFlag":"可选，触发的世界线标记名(英文)"}' +
                 '\n\n行动类型：investigate(调查)/fight(战斗)/talk(交涉)/sneak(潜行)/flee(逃跑)/study(研究)/help(帮助)/betray(背叛)/other(其他)\n' +
                 'risk：1-100，越高越危险\n' +
                 'requiredStats：从[体能,格斗,敏捷,智力,科技,超能,魅力,意志]中选1-2个\n' +
                 '只返回JSON，不要任何解释。';

    var result = await callAI([{role:'user',content:prompt}], {system: system, temp: 0.3});
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
    var system = '你是漫威人生模拟器的结局编剧。玩家的一生已经结束，你需要为这个结局写一段有仪式感的人生总结。\n\n规则：\n1. 以电影旁白的口吻，第三人称。\n2. 回顾玩家的一生，点出关键转折。\n3. 给出最终评价——克制、有重量感，不要煽情过度。\n4. 风格：MCU 电影片尾旁白、史诗感、留白。\n5. 200-400字。\n6. 不要剧透其他结局，不要虚构时间线之外的重大事件。';

    var prompt = ctx + '\n【结局名称】' + (ending.title||ending.name||'') +
                 '\n【结局类型】' + (ending.type||'') +
                 '\n【结局描述】' + (ending.text||'') +
                 '\n\n请为这个结局写一段人生总结。直接输出正文。';

    var result = await callAI([{role:'user',content:prompt}], {system: system, temp: 0.8});
    return result && result.trim() ? result.trim() : (ending.text||'');
  }

  // ========== 5. 人生传记 ==========
  async function generateLifeSummary(state, timeline, ending){
    if(!timeline || !timeline.length) return '';
    var events = timeline.slice(-20).map(function(t){return (t.date||'') + ' ' + (t.text||t.title||'');}).join('\n');
    var ctx = buildContext(state);
    var system = '你是漫威宇宙的史官。你正在为一位刚刚走完一生的人物撰写官方传记。\n\n规则：\n1. 第三人称，客观但有温度。\n2. 从人物的起点写到结局，突出关键选择和转折。\n3. 风格：MCU 电影片尾彩蛋的档案感、克制、史诗。\n4. 300-500字。\n5. 严格基于提供的时间线，不要虚构时间线之外的重大事件。';

    var prompt = ctx + '\n【人生时间线】\n' + events +
                 '\n【最终结局】' + (ending ? (ending.title||ending.name||'') : '') +
                 '\n\n请为这位人物撰写人生传记。直接输出正文。';

    var result = await callAI([{role:'user',content:prompt}], {system: system, temp: 0.85});
    return result && result.trim() ? result.trim() : '';
  }

  // ========== 6. 世界新闻生成 ==========
  async function generateWorldNews(state){
    var ctx = buildContext(state);
    var system = '你是漫威宇宙的新闻编辑。根据当前时代、世界状态和玩家身份，生成3-5条新闻。\n\n规则：\n1. 新闻要符合时代背景。\n2. 新闻不一定与玩家直接相关。\n3. 混合：国际大事、社会新闻、科技动态、传闻八卦、MCU正典暗示。\n4. 【身份视角】普通人只看到表面新闻；科学家/记者看到更多科技内幕；军方/神盾局看到机密级信息；富豪看到金融和商业动向。根据玩家身份调整新闻深度。\n5. 必须返回JSON数组，不要加其他文字。';

    var prompt = ctx + '\n\n请根据上述玩家身份与知识边界，生成符合其视角的新闻。返回JSON数组，每条格式：{"title":"新闻标题","content":"1-2句内容","tag":"国际/社会/科技/传闻/神秘/机密"}\n只返回JSON数组。';

    var result = await callAI([{role:'user',content:prompt}], {system: system, temp: 0.9});
    var parsed = parseJSON(result);
    if(Array.isArray(parsed) && parsed.length) return parsed;
    // Fallback 静态新闻
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
    var system = '你是漫威人生模拟器的出身生成器。请输出一个JSON对象，不要任何其他文字。\n\nJSON字段：\n- 家庭出身：字符串，家庭背景简述\n- 社会阶层：字符串，选填"赤贫/贫困/工薪/中产/富裕/精英"\n- 父母职业：字符串，父母职业方向\n- 成长环境：字符串，成长地点和氛围\n- 性格倾向：字符串，1-2个性格关键词\n- 初始技能：数组，2-3个技能字符串\n- 描述：字符串，50-120字的完整出身描述\n\n规则：必须符合时代，普通真实有生活气息，不要超级英雄背景。';
    var prompt = ctx + '\n\n请为玩家生成一个出生身份，输出JSON对象。';
    var result = await callAI([{role:'user',content:prompt}], {system: system, temp: 0.95});
    if(result && result.trim()){
      // 尝试解析 JSON
      var jsonStr = result.replace(/^```json\s*/i,'').replace(/^```\s*/,'').replace(/```$/,'').trim();
      try{
        var obj = JSON.parse(jsonStr);
        if(obj && typeof obj === 'object' && obj.描述) return obj;
      }catch(e){ /* 解析失败，降级为文本 */ }
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
