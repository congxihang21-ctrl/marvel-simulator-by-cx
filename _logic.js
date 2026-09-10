/* ============================================================
   v2.4 种子人生 · 核心逻辑
   ============================================================ */

/* ---- 全局状态 ---- */
var gameState = null;
var selectedEra = null;
var selectedSeed = null;
var codexTab = 'endings';
var SAVE_KEYS = ['mcu24_save_1','mcu24_save_2','mcu24_save_3','mcu24_save_4'];
var CODEX_KEY = 'mcu24_codex';

function defaultStats(){return {体能:0,格斗:0,敏捷:0,智力:0,科技:0,超能:0,魅力:0,意志:0}}

/* ---- OVR 计算（沿用v2.3加权）---- */
function calcOVR(stats){
  var s=stats||{}, total=0;
  STAT_NAMES.forEach(function(n){total+=(s[n]||0)});
  return Math.round(total/8);
}
function ovrTier(ovr){
  if(ovr>=80)return {name:'传奇',color:'#f2c54d',bg:'linear-gradient(135deg,#f2c54d,#e8922a)'};
  if(ovr>=65)return {name:'英雄',color:'#9d7cff',bg:'linear-gradient(135deg,#9d7cff,#6d3ef0)'};
  if(ovr>=50)return {name:'义警',color:'#7cc0ff',bg:'linear-gradient(135deg,#7cc0ff,#4a9eff)'};
  if(ovr>=35)return {name:'精锐',color:'#8fe0a0',bg:'linear-gradient(135deg,#8fe0a0,#5cc97a)'};
  if(ovr>=20)return {name:'受训者',color:'#e8c66a',bg:'linear-gradient(135deg,#e8c66a,#c9a030)'};
  return {name:'凡人',color:'#8fa3b8',bg:'linear-gradient(135deg,#8fa3b8,#6b7a8f)'};
}

/* ---- 页面切换 ---- */
function goPage(id){
  document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active')});
  var el=document.getElementById('page'+id.charAt(0).toUpperCase()+id.slice(1));
  if(!el)el=document.getElementById('page'+id);
  if(el)el.classList.add('active');
  window.scrollTo(0,0);
}

/* ---- Toast ---- */
function toast(msg){
  var t=document.getElementById('toast');t.textContent=msg;t.style.display='block';
  setTimeout(function(){t.style.display='none'},2200);
}

/* ============================================================
   渲染：年代选择
   ============================================================ */
function renderEraList(){
  var list=document.getElementById('eraList');
  list.innerHTML='';
  Object.values(ERAS).forEach(function(era){
    var card=document.createElement('div');
    card.className='seed-card';
    card.innerHTML='<div class="era-tag">'+era.icon+' '+era.years+'</div>'+
      '<div class="era-name">'+era.name+'</div>'+
      '<div class="era-desc">'+era.desc+'</div>'+
      '<div class="era-meta"><span>🎭 '+era.seeds.length+' 种出身</span><span>🏆 '+era.endings.length+' 个结局</span></div>';
    card.onclick=function(){selectedEra=era.id;renderOriginList();goPage('originSelect')};
    list.appendChild(card);
  });
}

/* ---- 渲染：出身选择 ---- */
function renderOriginList(){
  var era=ERAS[selectedEra];
  document.getElementById('originEraHint').textContent='你选择了「'+era.name+'」。请选择你的出身——出身决定你的初始属性和可走路线。';
  var list=document.getElementById('originList');
  list.innerHTML='';
  era.seeds.forEach(function(sid){
    var seed=SEEDS[sid];
    var card=document.createElement('div');
    card.className='origin-card';
    var topStats=STAT_NAMES.slice().sort(function(a,b){return (seed.stats[b]||0)-(seed.stats[a]||0)}).slice(0,3);
    card.innerHTML='<div class="ic">'+seed.icon+'</div>'+
      '<div class="nm">'+seed.name+'</div>'+
      '<div class="ds">'+seed.desc+'</div>'+
      '<div class="stats-mini">擅长：'+topStats.map(function(n){return n+' '+(seed.stats[n]||0)}).join(' / ')+'</div>';
    card.onclick=function(){selectedSeed=sid;renderAttrPreview();goPage('attrPreview')};
    list.appendChild(card);
  });
}

/* ---- 渲染：属性预览 ---- */
function renderAttrPreview(){
  var seed=SEEDS[selectedSeed];
  document.getElementById('charNameDisplay').textContent='无名者';
  document.getElementById('charOriginDisplay').textContent=ERAS[selectedEra].name+' · '+seed.name;
  var stats=Object.assign(defaultStats(),seed.stats);
  var ovr=calcOVR(stats);
  var tier=ovrTier(ovr);
  var badge=document.getElementById('ovrBadge');
  badge.style.background=tier.bg;
  document.getElementById('ovrNum').textContent=ovr;
  var bars=document.getElementById('statBars');
  bars.innerHTML='';
  STAT_NAMES.forEach(function(n){
    var v=stats[n]||0;
    var tier2=v>=80?'#f2c54d':v>=60?'#9d7cff':v>=40?'#7cc0ff':v>=20?'#8fe0a0':'#8fa3b8';
    bars.innerHTML+='<div class="stat-row"><span class="sn">'+n+'</span>'+
      '<div class="bar"><div class="fill" style="width:'+v+'%;background:'+tier2+'"></div></div>'+
      '<span class="sv" style="color:'+tier2+'">'+v+'</span></div>';
  });
}

/* ============================================================
   开始游戏
   ============================================================ */
function startGame(){
  var seed=SEEDS[selectedSeed];
  var name=document.getElementById('charNameInput').value.trim()||'无名者';
  gameState={
    name:name, era:selectedEra, seed:selectedSeed,
    stats:Object.assign(defaultStats(),seed.stats),
    currentNode:seed.startNode,
    timeline:[],
    relationships:{},
    flags:{},
    endingsUnlocked:[],
    achievementsUnlocked:[],
    turn:0
  };
  renderGame();
  goPage('game');
}

/* ---- 渲染：游戏主界面 ---- */
function renderGame(){
  if(!gameState)return;
  var node=NODES[gameState.currentNode];
  if(!node){toast('节点缺失：'+gameState.currentNode);return}

  // 顶栏
  document.getElementById('gameEraTag').textContent=ERAS[gameState.era].name.split('·')[0]+' · '+(node.era||'');

  // 角色卡
  var ovr=calcOVR(gameState.stats);
  var tier=ovrTier(ovr);
  var topStats=STAT_NAMES.slice().sort(function(a,b){return (gameState.stats[b]||0)-(gameState.stats[a]||0)}).slice(0,3);
  document.getElementById('gameCharCard').innerHTML=
    '<div class="ovr-badge" style="background:'+tier.bg+'"><span style="font-size:22px">'+ovr+'</span><span style="font-size:9px">OVR</span></div>'+
    '<div class="info"><div class="name">'+gameState.name+'</div>'+
    '<div class="sub">'+SEEDS[gameState.seed].name+' · '+tier.name+'</div>'+
    '<div class="stats-inline">'+topStats.map(function(n){return n+':'+(gameState.stats[n]||0)}).join(' · ')+'</div></div>';

  // 时间线
  var tl=document.getElementById('timeline');
  tl.innerHTML='';
  gameState.timeline.slice(-6).forEach(function(t,i){
    var isCur=i===gameState.timeline.slice(-6).length-1;
    tl.innerHTML+='<div class="tl-item '+(isCur?'cur':'')+'"><div class="tl-time">'+t.era+'</div>'+t.title+'</div>';
  });

  // 事件节点
  var ev=document.getElementById('eventNode');
  ev.innerHTML='<div class="ev-title">📜 '+node.title+'</div><div class="ev-text">'+node.text+'</div>';

  // 选项
  var ch=document.getElementById('choices');
  ch.innerHTML='';
  if(node.ending){
    triggerEnding(node.ending,node.unlockAchievement);
    return;
  }
  (node.choices||[]).forEach(function(c,idx){
    var div=document.createElement('div');
    div.className='choice';
    var meta='';
    if(c.check){
      var chance=calcChance(c);
      meta='<span class="ch-meta">'+c.check+'判定 · 成功率 <span class="chance">'+chance+'%</span></span>';
    }else{
      meta='<span class="ch-meta">无判定</span>';
    }
    div.innerHTML='<div class="ch-label">'+String.fromCharCode(65+idx)+'. '+c.label+'</div>'+meta;
    div.onclick=function(){
      if(window._isJudging)return;
      window._isJudging=true;
      handleChoice(c);
      // 无判定时立即解锁，有判定时在动画结束后解锁
      if(!c.check)window._isJudging=false;
    };
    ch.appendChild(div);
  });
}

// 判定结束后解锁点击
function _unlockJudge(){window._isJudging=false}

/* ============================================================
   判定系统
   ============================================================ */
function calcChance(choice){
  if(!choice.check)return 100;
  var stat=gameState.stats[choice.check]||0;
  var chance=Math.round(choice.baseChance+(stat-30)*1.2);
  return Math.max(5,Math.min(95,chance));
}

function handleChoice(choice){
  if(!choice)return;
  if(!choice.check){
    applyChoice(choice, choice.next, choice.effects, choice.text, choice.unlockAchievement);
  }else{
    runJudge(choice);
  }
}

function runJudge(choice){
  var chance=calcChance(choice);
  var modal=document.getElementById('judgeModal');
  modal.style.display='flex';
  document.getElementById('jTitle').textContent=choice.check+' 判定';
  document.getElementById('jStat').textContent='基础 '+choice.baseChance+' + '+choice.check+' '+(gameState.stats[choice.check]||0)+' × 1.2 = '+chance+'%';
  document.getElementById('jResult').textContent='';
  document.getElementById('jResult').className='judge-result';

  var roll=Math.floor(Math.random()*100)+1;
  var success=roll<=chance;

  var pointer=document.getElementById('jPointer');
  var phases=[];
  var segCount=8+Math.floor(Math.random()*5);
  for(var i=0;i<segCount;i++){
    phases.push(Math.random()*100);
  }
  phases.push(success?10:90);

  var phaseIdx=0;
  function animatePhase(){
    if(phaseIdx<phases.length){
      pointer.style.left=phases[phaseIdx]+'%';
      phaseIdx++;
      setTimeout(animatePhase,90+phaseIdx*15);
    }else{
      setTimeout(function(){
        var res=document.getElementById('jResult');
        res.textContent=success?'✅ 成功！':'❌ 失败...';
        res.className='judge-result '+(success?'ok':'fail');
        setTimeout(function(){
          modal.style.display='none';
          var resultObj = success ? choice.success : choice.fail;
          if(!resultObj){_unlockJudge();return}
          applyChoice(choice, resultObj.next, resultObj.effects, resultObj.text, resultObj.unlockAchievement);
          _unlockJudge();
        },900);
      },300);
    }
  }
  animatePhase();
}

/* ---- 应用选择结果 ---- */
function applyChoice(choice, nextNode, effects, text, unlockAch){
  // 应用效果
  if(effects){
    Object.keys(effects).forEach(function(k){
      if(k.indexOf('关系_')===0){
        var rel=k.replace('关系_','');
        gameState.relationships[rel]=(gameState.relationships[rel]||0)+effects[k];
      }else if(k.indexOf('标记_')===0){
        gameState.flags[k.replace('标记_','')]=true;
      }else if(gameState.stats[k]!==undefined){
        gameState.stats[k]=Math.max(0,Math.min(99,(gameState.stats[k]||0)+effects[k]));
      }
    });
  }
  // 成就
  if(unlockAch)unlockAchievement(unlockAch);
  // 时间线（防御检查）
  var curNode=NODES[gameState.currentNode];
  if(curNode){
    gameState.timeline.push({era:curNode.era||'',title:curNode.title||''});
  }else{
    console.error('applyChoice: currentNode not in NODES',gameState.currentNode);
  }
  gameState.currentNode=nextNode;
  gameState.turn++;
  if(!NODES[nextNode] && !ENDINGS[nextNode]){
    console.error('applyChoice: nextNode not found',nextNode);
    toast('节点缺失：'+nextNode);
    return;
  }
  renderGame();
}

/* ============================================================
   结局 & 图鉴
   ============================================================ */
function triggerEnding(endingId, unlockAch){
  var ending=ENDINGS[endingId];
  if(!ending){toast('结局缺失：'+endingId);return}
  // 解锁
  if(gameState.endingsUnlocked.indexOf(endingId)<0){
    gameState.endingsUnlocked.push(endingId);
  }
  if(unlockAch)unlockAchievement(unlockAch);
  saveCodex();

  // 显示结局
  document.getElementById('eIcon').textContent=ending.icon;
  document.getElementById('eTitle').textContent=ending.title;
  document.getElementById('eRarity').innerHTML='<span style="color:'+RARITY_COLORS[ending.rarity]+'">【'+RARITY_NAMES[ending.rarity]+'】</span>';
  document.getElementById('eText').textContent=ending.desc;
  var achEl=document.getElementById('eAchieve');
  if(unlockAch){
    achEl.style.display='block';
    achEl.innerHTML='🏆 成就解锁：'+unlockAch+' — '+(ACHIEVEMENTS[unlockAch]?ACHIEVEMENTS[unlockAch].desc:'');
  }else{
    achEl.style.display='none';
  }
  document.getElementById('endingModal').style.display='flex';
}

function closeEnding(){
  document.getElementById('endingModal').style.display='none';
  goPage('codex');
}

function unlockAchievement(name){
  if(gameState && gameState.achievementsUnlocked.indexOf(name)<0){
    gameState.achievementsUnlocked.push(name);
    toast('🏆 成就解锁：'+name);
  }
  saveCodex();
}

/* ---- 图鉴 ---- */
function renderCodex(){
  var grid=document.getElementById('codexGrid');
  grid.innerHTML='';
  var unlocked=getCodex();
  if(codexTab==='endings'){
    Object.keys(ENDINGS).forEach(function(id){
      var e=ENDINGS[id];
      var isUnlocked=unlocked.endings.indexOf(id)>=0;
      var card=document.createElement('div');
      card.className='codex-card '+(isUnlocked?'':'locked');
      card.innerHTML='<div class="c-ic">'+(isUnlocked?e.icon:'❓')+'</div>'+
        '<div class="c-title">'+(isUnlocked?e.title:'???')+'</div>'+
        '<div class="c-desc">'+(isUnlocked?e.desc:'尚未解锁')+'</div>'+
        '<div class="c-rarity" style="color:'+RARITY_COLORS[e.rarity]+'">'+RARITY_NAMES[e.rarity]+'</div>';
      grid.appendChild(card);
    });
  }else{
    Object.keys(ACHIEVEMENTS).forEach(function(name){
      var a=ACHIEVEMENTS[name];
      var isUnlocked=unlocked.achievements.indexOf(name)>=0;
      var card=document.createElement('div');
      card.className='codex-card '+(isUnlocked?'':'locked');
      card.innerHTML='<div class="c-ic">'+(isUnlocked?a.icon:'🔒')+'</div>'+
        '<div class="c-title">'+(isUnlocked?name:'???')+'</div>'+
        '<div class="c-desc">'+(isUnlocked?a.desc:'尚未解锁')+'</div>';
      grid.appendChild(card);
    });
  }
  // 进度
  var total=codexTab==='endings'?Object.keys(ENDINGS).length:Object.keys(ACHIEVEMENTS).length;
  var got=codexTab==='endings'?unlocked.endings.length:unlocked.achievements.length;
  document.getElementById('codexProgress').textContent=got+'/'+total;
}

function switchCodexTab(tab){
  codexTab=tab;
  document.getElementById('tabEndings').className='tab '+(tab==='endings'?'on':'');
  document.getElementById('tabAchievements').className='tab '+(tab==='achievements'?'on':'');
  renderCodex();
}

function getCodex(){
  try{
    var raw=localStorage.getItem(CODEX_KEY);
    if(raw)return JSON.parse(raw);
  }catch(e){}
  return {endings:[],achievements:[]};
}
function saveCodex(){
  if(!gameState)return;
  var c=getCodex();
  gameState.endingsUnlocked.forEach(function(e){if(c.endings.indexOf(e)<0)c.endings.push(e)});
  gameState.achievementsUnlocked.forEach(function(a){if(c.achievements.indexOf(a)<0)c.achievements.push(a)});
  try{localStorage.setItem(CODEX_KEY,JSON.stringify(c))}catch(e){}
}

/* ============================================================
   存档系统（4 槽）
   ============================================================ */
function openSaveSlots(){
  var list=document.getElementById('saveSlotList');
  list.innerHTML='';
  SAVE_KEYS.forEach(function(key,idx){
    var slot=document.createElement('div');
    slot.className='save-slot';
    try{
      var raw=localStorage.getItem(key);
      if(raw){
        var s=JSON.parse(raw);
        var seedName=s.seed?SEEDS[s.seed].name:'?';
        var eraName=s.era?ERAS[s.era].name.split('·')[0]:'?';
        slot.innerHTML='<div class="s-info"><div class="s-name">'+s.name+' · '+seedName+'</div>'+
          '<div class="s-meta">'+eraName+' · 第 '+s.turn+' 回合 · '+new Date(s.savedAt||0).toLocaleString()+'</div></div>'+
          '<span class="s-del" onclick="event.stopPropagation();deleteSave('+idx+')">删除</span>';
        slot.onclick=function(){loadSave(idx)};
      }else{
        slot.innerHTML='<div class="s-empty">空存档槽 '+(idx+1)+'</div><span></span>';
        slot.onclick=function(){saveToSlot(idx)};
      }
    }catch(e){
      slot.innerHTML='<div class="s-empty">存档损坏</div>';
    }
    list.appendChild(slot);
  });
  document.getElementById('saveModal').style.display='flex';
}
function closeSaveModal(){document.getElementById('saveModal').style.display='none'}

function quickSave(){
  if(!gameState){toast('还没有游戏进度');return}
  // 找第一个空槽，否则存到槽1
  var idx=0;
  for(var i=0;i<SAVE_KEYS.length;i++){
    if(!localStorage.getItem(SAVE_KEYS[i])){idx=i;break}
  }
  saveToSlot(idx);
}
function saveToSlot(idx){
  if(!gameState){toast('还没有游戏进度');return}
  gameState.savedAt=Date.now();
  try{
    localStorage.setItem(SAVE_KEYS[idx],JSON.stringify(gameState));
    toast('💾 已保存到槽 '+(idx+1));
    openSaveSlots();
  }catch(e){toast('保存失败')}
}
function loadSave(idx){
  try{
    var raw=localStorage.getItem(SAVE_KEYS[idx]);
    if(raw){
      gameState=JSON.parse(raw);
      selectedEra=gameState.era;
      selectedSeed=gameState.seed;
      renderGame();
      closeSaveModal();
      goPage('game');
      toast('📂 已读取存档');
    }
  }catch(e){toast('读取失败')}
}
function deleteSave(idx){
  if(!confirm('确认删除存档槽 '+(idx+1)+'？'))return;
  try{localStorage.removeItem(SAVE_KEYS[idx])}catch(e){}
  openSaveSlots();
}

/* ============================================================
   AI 结局润色
   ============================================================ */
var CX_SHARED_KEY=(function(){var s=['0b6f2b0d','20084e79','9a4f9de1','8fcdf879','.','8BeGq8E','T70mwvVLB'];return s.join('')})();
var CX_SHARED_BASE='https://open.bigmodel.cn/api/paas/v4';
var CX_SHARED_MODEL='glm-4.7';

function aiPolishEnding(){
  if(!gameState){return}
  var endingId=gameState.endingsUnlocked[gameState.endingsUnlocked.length-1];
  var ending=ENDINGS[endingId];
  if(!ending)return;
  var btn=event.target;
  btn.textContent='润色中...';btn.disabled=true;

  var prompt='你是漫威同人叙事写手。玩家在《漫威模拟器》中达成了一个结局：\n'+
    '结局：'+ending.title+'（'+RARITY_NAMES[ending.rarity]+'）\n'+
    '基础描述：'+ending.desc+'\n'+
    '玩家角色：'+gameState.name+'，出身'+SEEDS[gameState.seed].name+'\n'+
    '最终属性：体能'+gameState.stats.体能+' 意志'+gameState.stats.意志+' 魅力'+gameState.stats.魅力+'\n'+
    '已走回合：'+gameState.turn+'\n\n'+
    '请用电影感的文笔，写一段 200-300 字的结局叙事，让这个结局更有画面感和情感冲击力。直接输出叙事正文，不要加标题。';

  fetch(CX_SHARED_BASE+'/chat/completions',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+CX_SHARED_KEY},
    body:JSON.stringify({model:CX_SHARED_MODEL,messages:[{role:'user',content:prompt}],max_tokens:500,temperature:0.85,stream:false})
  }).then(function(r){return r.json()}).then(function(d){
    var text=d.choices&&d.choices[0]?d.choices[0].message.content:'';
    if(text){
      document.getElementById('eText').textContent=text;
      toast('✨ AI 润色完成');
    }else{
      toast('AI 返回为空');
    }
    btn.textContent='✨ AI 润色结局';btn.disabled=false;
  }).catch(function(){
    toast('AI 润色失败，使用原结局');
    btn.textContent='✨ AI 润色结局';btn.disabled=false;
  });
}

/* ============================================================
   初始化
   ============================================================ */
document.addEventListener('DOMContentLoaded',function(){
  renderEraList();
  renderCodex();
  // 测试：检查函数
  console.log('%c🦸 漫威模拟器 v2.4 · 种子人生','color:#9d7cff;font-weight:700;font-size:14px');
  console.log('%c高三开发组 CX · 非官方同人','color:#8fa3b8');
});
