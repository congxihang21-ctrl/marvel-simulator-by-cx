/* ============================================================================
 * chronicle.js · Beta v2.6.4「编年史」
 * 纯增量模块：统一事件流 S.chronicle[]，不改变任何旧玩法。
 * 数据来源：
 *   ① S.log（AI/离线回合叙事、世界时钟头条）—— track() 增量摄取
 *   ② S.goals.milestones（目标/成就）—— track() 增量摄取
 *   ③ 种子剧情节点 —— game_seed.js 调 Chronicle.fromSeedNode/markPicked
 *   ④ 改写历史 —— Chronicle.addAltered()
 * 旧存档首次进入自动 migrate 回填，历史不丢。
 * ==========================================================================*/
(function () {
  'use strict';
  if (window.Chronicle) return;            /* 防重复加载 */
  var CH = window.Chronicle = {};

  var KIND_IC = { big:'🔴', altered:'🌟', world:'🌍', life:'🙂', rel:'👥', goal:'🎯' };
  var FILTERS = [
    { k:'all',     t:'全部' },
    { k:'big',     t:'🔴 大事' },
    { k:'world',   t:'🌍 世界' },
    { k:'life',    t:'🙂 我的' },
    { k:'rel',     t:'👥 关系' },
    { k:'goal',    t:'🎯 目标' }
  ];
  var CAP = 600;        /* 编年史条数上限：big/altered/goal 永不裁剪 */
  CH._filter = 'all';
  CH._open = false;

  function esc(s){
    return String(s==null?'':s).replace(/[&<>"']/g, function (m) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
    });
  }
  function plain(s){
    return String(s==null?'':s)
      .replace(/!\[[^\]]*\]\([^)]*\)/g,'')
      .replace(/\[([^\]]+)\]\([^)]*\)/g,'$1')
      .replace(/\*\*([^*]+)\*\*/g,'$1').replace(/__([^_]+)__/g,'$1')
      .replace(/^#{1,6}\s*/gm,'').replace(/^\s*[-*>]\s*/gm,'')
      .replace(/`([^`]+)`/g,'$1').replace(/\n{2,}/g,'\n').trim();
  }
  function clip(s,n){
    s = plain(s);
    var i = s.indexOf('\n');
    if (i>=0 && i<n) s = s.slice(0,i);
    s = s.replace(/\s+/g,' ');
    return s.length>n ? s.slice(0,n) + '…' : s;
  }
  function dayKeyFromDate(d){
    function p(n){return (n<10?'0':'')+n;}
    return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate());
  }
  function monthOfDk(dk){ return dk ? String(dk).slice(0,7) : '????-??'; }
  function nowDk(){
    try{
      if (window.S && S.date){ var d=new Date(S.date); if(!isNaN(d)) return dayKeyFromDate(d); }
    }catch(_){}
    return dayKeyFromDate(new Date());
  }
  function timeNow(){
    try{ if(window.S && typeof fmtShort==='function') return fmtShort(new Date(S.date)); }catch(_){}
    return nowDk()+' 08:00';
  }
  var _seq = 0;
  function mkId(){ return 'c'+Date.now().toString(36)+(_seq++).toString(36); }

  /* ---- 轻量状态快照：只在大事/选择时存，控制存档体积 ---- */
  function snapshot(){
    try{
      if(!window.S) return null;
      var p = S.player || {}, w = S.world || {};
      return {
        date: (function(){try{return fmtShort(new Date(S.date));}catch(_){return '';}})(),
        turn: S.turn||0,
        age: p['年龄'], id: p['身份'], job: p['职业'], loc: p['所在地'],
        fac: p['所属势力'], fame: p['声望'], fight: p['战斗能力'],
        mood: p['情绪'], body: p['身体状态'], goal: p['当前目标'],
        world: {
          局势: w['局势']||w['世界局势'], 焦点: w['焦点']||w['世界焦点'],
          舆论: w['舆论']||w['社会舆论']
        }
      };
    }catch(_){ return null; }
  }

  function ensure(){
    if(!window.S) return null;
    if(!Array.isArray(S.chronicle)){
      S.chronicle = [];
      S._chronLog = 0; S._chronMS = 0; S._chronV = 1;
      migrate();
    }
    /* v2.7：存档结构迁移（章节存档点容器等），幂等 */
    try{ if(window.MCU && MCU.SaveKit) MCU.SaveKit.migrate(S); }catch(_){}
    if(!Array.isArray(S._chkpoints)) S._chkpoints=[];
    return S.chronicle;
  }

  /* ================= v2.7 章节存档点（人生回溯） =================
   * 只在 🔴 大事件呈现前、🌟 改写历史时存完整状态快照；
   * 最多 4 个、总预算约 900KB，超了从最旧的开始丢弃。 */
  var CP_CAP=4, CP_BUDGET=900*1024;
  function captureCheckpoint(entry){
    try{
      if(!window.S || typeof JSON==='undefined') return;
      var clone;
      try{ clone=JSON.parse(JSON.stringify(S)); }catch(_){ return; }
      var data;
      try{ data=JSON.stringify(clone); }catch(_){ return; }
      if(!Array.isArray(S._chkpoints)) S._chkpoints=[];
      S._chkpoints.push({
        id:entry.id, dk:entry.dk, t:entry.t, title:entry.title,
        kind:entry.kind, at:Date.now(), data:data
      });
      entry.cp=true;
      /* 预算控制：先按数量砍，再按总字节砍 */
      while(S._chkpoints.length>CP_CAP){
        var gone=S._chkpoints.shift();
        var ge=findEntry(gone && gone.id); if(ge) ge.cp=false;
      }
      var total=function(){return S._chkpoints.reduce(function(n,c){return n+(c.data?c.data.length:0);},0);};
      while(S._chkpoints.length>1 && total()>CP_BUDGET){
        var g2=S._chkpoints.shift();
        var ge2=findEntry(g2 && g2.id); if(ge2) ge2.cp=false;
      }
    }catch(_){}
  }
  function findEntry(id){
    if(!id || !window.S) return null;
    var c=S.chronicle;
    for(var i=c.length-1;i>=0;i--){ if(c[i].id===id) return c[i]; }
    return null;
  }
  function downloadText(filename, text){
    try{
      var blob=new Blob([text],{type:'text/plain;charset=utf-8'});
      var url=URL.createObjectURL(blob);
      var a=document.createElement('a');
      a.href=url;a.download=filename;
      document.body.appendChild(a);a.click();document.body.removeChild(a);
      setTimeout(function(){URL.revokeObjectURL(url);},1500);
      return true;
    }catch(_){ return false; }
  }
  CH.replay = function (id){
    if(!window.S) return;
    var cp=null;
    for(var i=0;i<(S._chkpoints||[]).length;i++){ if(S._chkpoints[i].id===id){ cp=S._chkpoints[i]; break; } }
    if(!cp){ alert('这个节点没有存档点（旧存档在 v2.7 之前经历的大事无法回溯；之后的大事件会自动存档）。'); return; }
    var msg='⟲ 从这一天重新选择\n\n「'+cp.title+'」\n'+
            (cp.dk?cp.dk+' ':'')+'\n\n' +
            '· 将回到这个节点，之后发生的剧情全部重来（你可以做出不同选择）；\n' +
            '· 当前进度会先自动备份到本机并下载一份存档文件，随时可找回；\n' +
            '· 章节存档点本身保留不变。\n\n确定回溯吗？';
    var doReplay=function(){
      try{
        /* 1) 备份当前进度：本机独立键 + 下载文件 */
        var bak=JSON.stringify(S);
        try{ if(window.MCU&&MCU.SaveKit) MCU.SaveKit.safeWrite('mcu_pre_replay',bak); else localStorage.setItem('mcu_pre_replay',bak); }catch(_){}
        var nm=(S.setup&&S.setup.name)?String(S.setup.name):'无名者';
        downloadText('MCU回溯前备份_'+nm+'_'+Date.now()+'.txt',bak);
        /* 2) 恢复到存档点 */
        var snap=JSON.parse(cp.data);
        snap._replayedFrom=cp.title;
        snap._replayedAt=cp.dk;
        /* 存档点克隆于"新点入列前"，恢复后把当前点补回；
           被废弃时间线里更晚的存档点本就不在快照内，自然丢弃。 */
        if(!Array.isArray(snap._chkpoints)) snap._chkpoints=[];
        if(!snap._chkpoints.some(function(x){return x.id===cp.id;})) snap._chkpoints.push(cp);
        window.S=snap;               /* 全局状态替换 */
        /* 3) 关闭编年史界面 */
        CH.closeDetail(); CH.close();
        /* 4) 用存档点状态重建整个游戏 UI（enterGame 即"从 S 重建"，可重入）*/
        try{ if(typeof enterGame==='function') enterGame(); else if(typeof renderAllNow==='function') renderAllNow(); }catch(e){
          if(window.MCU&&MCU.diag) MCU.diag.warn('replay enterGame: '+(e&&e.message));
        }
        try{ if(window.MCU&&MCU.bus) MCU.bus.emit('chronicle:replay',{from:cp.title}); }catch(_){}
        try{ if(typeof toast==='function') toast('⟲ 已回到「'+cp.title+'」，之后的人生重新书写'); }catch(_){}
      }catch(e){
        if(window.MCU&&MCU.diag) MCU.diag.error('replay fatal: '+(e&&e.message));
        alert('回溯失败：'+e.message+'\n你的当前进度没有丢失。');
      }
    };
    try{
      if(typeof showConfirm==='function'){ showConfirm(msg, doReplay, null, {okText:'确认回溯', cancelText:'再想想'}); }
      else if(confirm(msg)){ doReplay(); }
    }catch(_){
      if(confirm(msg)) doReplay();
    }
  };

  /* ---- 旧存档回填：S.log + S.timeline(种子剧情) + 里程碑 ---- */
  function migrate(){
    var log = S.log||[];
    log.forEach(function(e){ addFromLog(e,true); });
    S._chronLog = log.length;
    var tl = S.timeline||[];
    tl.forEach(function(t){
      var month = parseCnMonth(t.date);
      var lv = t.level;
      S.chronicle.push({
        id:mkId(), src:'seed', dk:(month?month+'-01':nowDk()), month:month||monthOfDk(nowDk()),
        t:'', kind: lv==='英雄'?'big': lv==='世界'?'world':'life',
        title: clip(t.text,26)||'一段经历', summary: clip(t.text,46), text:String(t.text||''),
        level:lv||'', choices:[], picked:null, snap:null, old:true
      });
    });
    var ms = (S.goals && S.goals.milestones) || [];
    ms.forEach(function(m){ addMilestone(m,true); });
    S._chronMS = ms.length;
    S.chronicle.sort(cmp);
  }
  function parseCnMonth(s){
    var m = /(\d{4})\D+(\d{1,2})/.exec(String(s||''));
    if(!m) return '';
    return m[1]+'-'+(m[2].length<2?'0':'')+m[2];
  }

  function cmp(a,b){
    var ka=(a.dk||'')+' '+(a.t||'');
    var kb=(b.dk||'')+' '+(b.t||'');
    if(ka===kb) return (a.seq||0)-(b.seq||0);
    return ka<kb?-1:1;
  }

  function stripMdHtml(s){
    /* 世界时钟卡片文本可能含 HTML（来自 cardHtml 的数据源），详情里需保留段落但转义 */
    return String(s==null?'':s);
  }

  function addFromLog(e, isOld){
    var dk = (e.time && String(e.time).slice(0,10)) || nowDk();
    var kind = (e.canon || e.channel) ? 'world' : 'life';
    var text = String(e.text||'');
    var title = clip(text,26) || (kind==='world'?'世界动态':'生活片段');
    var entry = {
      id:mkId(), seq:_seq, src:'log', dk:dk, month:monthOfDk(dk), t:String(e.time||'').slice(11,16),
      kind:kind, title:title, summary:clip(text,48), text:text,
      level:'', choices:[], picked:null,
      hints:(e.hints||[]).slice(0,3), snap:null, old:!!isOld
    };
    S.chronicle.push(entry);
    return entry;
  }

  function addMilestone(m, isOld){
    var dk = (m.at && String(m.at).slice(0,10)) || nowDk();
    S.chronicle.push({
      id:mkId(), seq:_seq, src:'goal', dk:dk, month:monthOfDk(dk), t:String(m.at||'').slice(11,16),
      kind:'goal',
      title:(m.type==='ach'?'🏆 成就解锁：':'🎯 目标达成：')+(m.name||''),
      summary:m.name||'里程碑', text:m.name||'',
      level:'', choices:[], picked:null, snap:null, old:!!isOld
    });
  }

  /* ---- 每回合由 renderStory 调用：增量摄取 S.log / 里程碑 ---- */
  CH.track = function (){
    var c = ensure(); if(!c) return;
    var log = S.log||[];
    var i0 = (typeof S._chronLog==='number') ? S._chronLog : 0;
    var added=false;
    for(var i=i0;i<log.length;i++){ addFromLog(log[i],false); added=true; }
    S._chronLog = log.length;
    var ms = (S.goals && S.goals.milestones) || [];
    var j0 = (typeof S._chronMS==='number') ? S._chronMS : 0;
    for(var j=j0;j<ms.length;j++){ addMilestone(ms[j],false); added=true; }
    S._chronMS = ms.length;
    if(added) S.chronicle.sort(cmp);
    prune();
  };

  function prune(){
    var c = S.chronicle;
    if(c.length<=CAP) return;
    var keep=c.filter(function(e){return e.kind==='big'||e.kind==='altered'||e.kind==='goal';});
    var rest=c.filter(function(e){return !(e.kind==='big'||e.kind==='altered'||e.kind==='goal');});
    var overflow = c.length - CAP;
    rest.sort(cmp);
    if(overflow>0) rest = rest.slice(overflow);
    S.chronicle = keep.concat(rest);
    S.chronicle.sort(cmp);
  }

  /* ---- 种子剧情：节点呈现时登记 ---- */
  CH.fromSeedNode = function (node, choiceLabels, timeStr){
    var c = ensure(); if(!c || !node) return;
    var d = (window.S && S.date) ? new Date(S.date) : new Date();
    if(isNaN(d)) d=new Date();
    var dk=dayKeyFromDate(d);
    var lv=node.level||'日常';
    var kind = lv==='英雄' ? 'big' : lv==='世界' ? 'world' : 'life';
    var text = String(node.text||'');
    var e={
      id:mkId(), seq:_seq, src:'seed', dk:dk, month:monthOfDk(dk),
      t:(d.getHours()<10?'0':'')+d.getHours()+':'+(d.getMinutes()<10?'0':'')+d.getMinutes(),
      kind:kind, title:clip(node.title||text,26)||'一段经历',
      summary:clip(text,48), text:text, level:lv,
      choices:Array.isArray(choiceLabels)?choiceLabels.slice(0,4):[],
      picked:null, snap:(kind==='big')?snapshot():null, old:false
    };
    S.chronicle.push(e);
    S.chronicle.sort(cmp);
    prune();
    S._chronLastSeed = e.id;
    /* v2.7：英雄级大事件 → 章节存档点（在玩家选择之前，可回溯重选） */
    if(kind==='big'){ try{ captureCheckpoint(e); }catch(_){} }
  };

  /* ---- 种子剧情：玩家做出选择，回挂到最近一条事件 ---- */
  CH.markPicked = function (label){
    var c = ensure(); if(!c) return;
    var id = S._chronLastSeed;
    var e = null;
    if(id){ for(var i=c.length-1;i>=0;i--){ if(c[i].id===id){ e=c[i]; break; } } }
    if(!e){ for(var k=c.length-1;k>=0;k--){ if(c[k].src==='seed'){ e=c[k]; break; } } }
    if(e){
      e.picked = String(label||'');
      if(!e.snap) e.snap = snapshot();
    }
  };

  CH.addRel = function (name, role, rel){
    var c = ensure(); if(!c) return;
    var dk=nowDk();
    S.chronicle.push({
      id:mkId(), seq:_seq, src:'rel', dk:dk, month:monthOfDk(dk), t:timeNow().slice(11,16),
      kind:'rel', title:'👥 结识：'+name,
      summary:(role||'')+(rel?' · '+rel:''),
      text:'结识了新的人：'+name+'（'+[role,rel].filter(Boolean).join(' · ')+'）',
      level:'', choices:[], picked:null, snap:null, old:false
    });
    S.chronicle.sort(cmp); prune();
  };

  CH.addAltered = function (title, text){
    var c = ensure(); if(!c) return;
    var dk=nowDk();
    var ae={
      id:mkId(), seq:_seq, src:'sys', dk:dk, month:monthOfDk(dk), t:timeNow().slice(11,16),
      kind:'altered', title:'🌟 '+(title||'历史被你改写'),
      summary:clip(text||'你改变了本该发生的未来',48),
      text:text||'你提前阻止了那场本该席卷世界的灾难。未来，已经不一样了。',
      level:'', choices:[], picked:null, snap:snapshot(), old:false
    };
    S.chronicle.push(ae);
    S.chronicle.sort(cmp); prune();
    /* v2.7：改写历史瞬间 → 章节存档点 */
    try{ captureCheckpoint(ae); }catch(_){}
  };

  /* ---- 大事判定：复用 app.js 的 _isKeyDay（若存在），回退到等级规则 ---- */
  function bigDaySet(list){
    var set={};
    var groups={};
    list.forEach(function(e){
      if(e.kind==='altered'){ set[e.dk]=true; }
      if(e.level==='英雄'){ set[e.dk]=true; }
    });
    try{
      if(typeof _isKeyDay==='function' && window.S && Array.isArray(S.log)){
        var byDay={};
        S.log.forEach(function(le){
          var dk=String(le.time||'').slice(0,10);
          (byDay[dk]=byDay[dk]||[]).push(le);
        });
        Object.keys(byDay).forEach(function(dk){
          try{ if(_isKeyDay(dk,byDay[dk])) set[dk]=true; }catch(_){}
        });
      }
    }catch(_){}
    return set;
  }

  /* ---- 章节划分：每遇一个大事/改写点开新章 ---- */
  function decorate(list){
    var bigs=bigDaySet(list);
    var ch=0; var chTitle='序章 · 命运的清晨';
    list.forEach(function(e){
      var isBig = e.kind==='altered' || (bigs[e.dk] && (e.kind==='life'||e.kind==='world')) || e.kind==='big';
      if(isBig){
        ch++;
        chTitle='第'+['一','二','三','四','五','六','七','八','九','十','十一','十二','十三','十四','十五'][ch-1]||ch+'章';
        chTitle += ' · '+e.title.replace(/^[🔴🌟🌍🙂👥🎯🏆 ]+/,'');
        e._chFirst=true;
      }
      e._chapter=ch;
      e._chTitle=chTitle;
      e._big=isBig;
    });
    return list;
  }

  /* ================= 界面 ================= */
  function $(id){ return document.getElementById(id); }

  CH.open = function (){
    CH.track();
    var ov=$('chrOverlay'); if(!ov) return;
    CH._open=true;
    ov.style.display='block';
    document.documentElement.classList.add('chr-lock');
    CH._filter='all';
    renderMonths();
    renderFilters();
    renderList(true);
  };
  CH.close = function (){
    var ov=$('chrOverlay'); if(!ov) return;
    ov.style.display='none';
    CH._open=false;
    document.documentElement.classList.remove('chr-lock');
  };
  CH.setFilter = function (k){
    CH._filter=k; renderFilters(); renderList(true);
  };
  CH.jumpMonth = function (m, btn){
    var t=document.querySelector('.chr-m[data-month="'+CSS.escape(m)+'"]');
    if(t){
      t.scrollIntoView({behavior:'smooth', block:'start'});
      document.querySelectorAll('.chr-m.flash').forEach(function(n){n.classList.remove('flash');});
      t.classList.add('flash');
      setTimeout(function(){t.classList.remove('flash');},1600);
    }
  };
  CH.toggleItem = function (id){
    var el=document.querySelector('.chr-i[data-id="'+CSS.escape(id)+'"]');
    if(el) el.classList.toggle('open');
  };
  CH.toLatest = function (){
    var list=$('chrList');
    if(list) list.scrollTop=list.scrollHeight;
  };

  function visibleList(){
    var c=(window.S && S.chronicle) ? S.chronicle.slice() : [];
    decorate(c);
    if(CH._filter!=='all') c=c.filter(function(e){
      if(CH._filter==='big') return e._big;
      return e.kind===CH._filter;
    });
    return c;
  }

  function renderMonths(){
    var box=$('chrMonths'); if(!box) return;
    var c=(window.S && S.chronicle)||[];
    var bigs=bigDaySet(c);
    var map={}, order=[];
    c.forEach(function(e){
      var m=e.month; if(!m)return;
      if(!map[m]){map[m]={n:0,big:false};order.push(m);}
      map[m].n++;
      if(bigs[e.dk]||e.kind==='altered')map[m].big=true;
    });
    box.innerHTML = order.map(function(m){
      var parts=m.split('-');
      var label=(parts[0]?parts[0].slice(2)+'年':'')+(parseInt(parts[1],10)||'')+'月';
      return '<button class="chr-mo'+(map[m].big?' has-big':'')+'" onclick="Chronicle.jumpMonth(\''+m+'\')">'+
        (map[m].big?'<i class="dot"></i>':'')+esc(label)+'<span class="n">'+map[m].n+'</span></button>';
    }).join('');
  }

  function renderFilters(){
    var box=$('chrFilters'); if(!box) return;
    box.innerHTML = FILTERS.map(function(f){
      return '<button class="chr-fo'+(CH._filter===f.k?' on':'')+'" onclick="Chronicle.setFilter(\''+f.k+'\')">'+f.t+'</button>';
    }).join('');
  }

  function mdSafe(s){
    /* 编年史详情：正文允许换行，统一转义后保留段落，不吃任何外部 HTML */
    return esc(s).replace(/\n{2,}/g,'\n').replace(/\n/g,'<br>');
  }

  function renderList(scrollLatest){
    var box=$('chrList'); if(!box) return;
    var list=visibleList();
    CH._view=list;   /* v2.6.5：缓存当前视图，供详情卡上一件/下一件导航 */
    if(!list.length){
      box.innerHTML='<div class="chr-empty">还没有可回看的经历。<br>推进时间、做出选择后，这里会自动记录你的完整人生。</div>';
      return;
    }
    var html='';
    var lastCh=-1, lastMonth='';
    list.forEach(function(e,idx){
      if(e._chapter!==lastCh){
        html+='<div class="chr-ch">📜 '+esc(e._chTitle||'')+'</div>';
        lastCh=e._chapter;
      }
      if(e.month!==lastMonth){
        html+='<div class="chr-m" data-month="'+esc(e.month)+'"></div>';
        lastMonth=e.month;
      }
      var ic=KIND_IC[e.kind]||'🌱';
      var meta=[];
      var dkLabel=(function(){var p=(e.dk||'').split('-');return p.length===3?(parseInt(p[1],10)+'月'+parseInt(p[2],10)+'日'):'';})();
      if(dkLabel)meta.push(dkLabel);
      if(e.t)meta.push(e.t);
      if(e.level)meta.push(e.level);
      html+='<div class="chr-i k-'+e.kind+(e._big?' is-big':'')+(e.cp?' has-cp':'')+'" data-id="'+esc(e.id)+'" onclick="Chronicle.toggleItem(\''+e.id+'\')">'+
        '<div class="chr-rail"><span class="chr-dot">'+ic+(e.cp?'<span class="cp-star">⟲</span>':'')+'</span></div>'+
        '<div class="chr-card">'+
          '<div class="chr-hd"><b>'+esc(e.title)+'</b><span class="chr-meta">'+esc(meta.join(' · '))+'</span></div>'+
          '<div class="chr-sum">'+esc(e.summary||'')+'</div>'+
          '<div class="chr-body">'+
            mdSafe(stripMdHtml(e.text))+
            (e.choices && e.choices.length ? '<div class="chr-opts">'+e.choices.map(function(c,i){
              var picked=e.picked && c===e.picked;
              return '<span class="chr-opt'+(picked?' picked':'')+'">'+String.fromCharCode(65+i)+' '+esc(c)+(picked?' ✓':'')+'</span>';
            }).join('')+'</div>' : '')+
            (e.hints && e.hints.length ? '<div class="chr-hints">当时的方向：'+esc(e.hints.join(' ／ '))+'</div>' : '')+
            '<button class="chr-detail-btn" onclick="event.stopPropagation();Chronicle.detail(\''+e.id+'\')">🔍 回看这一天的详情</button>'+
          '</div>'+
        '</div>'+
      '</div>';
    });
    html+='<div class="chr-end">—— 故事还在继续 ——<br><button class="chr-latest-btn" onclick="Chronicle.toLatest()">⬇ 回到最新</button></div>';
    box.innerHTML=html;
    if(scrollLatest){ box.scrollTop=box.scrollHeight; }
  }

  /* ================= v2.6.5 事件详情回看 ================= */
  function ensureDetailSheet(){
    var ov=document.getElementById('chrDetailOv');
    if(ov) return ov;
    ov=document.createElement('div');
    ov.id='chrDetailOv'; ov.className='chd-ov'; ov.style.display='none';
    ov.innerHTML=
      '<div class="chd-card">'+
        '<div class="chd-head"><button class="chd-x" onclick="Chronicle.closeDetail()">✕</button>'+
        '<div class="chd-tt" id="chdTt"></div></div>'+
        '<div class="chd-scroll" id="chdScroll"></div>'+
        '<div class="chd-foot">'+
          '<button class="chd-nav" onclick="Chronicle.detailStep(-1)">⬆ 上一件</button>'+
          '<button class="chd-nav chd-live" onclick="Chronicle.closeDetail();Chronicle.toLatest()">↩ 回到今天</button>'+
          '<button class="chd-nav" onclick="Chronicle.detailStep(1)">下一件 ⬇</button>'+
        '</div>'+
      '</div>';
    ov.addEventListener('click',function(ev){ if(ev.target===ov) CH.closeDetail(); });
    document.body.appendChild(ov);
    return ov;
  }
  function snapRows(snap){
    if(!snap) return '';
    var rows=[['日期',snap.date],['轮次',snap.turn],['年龄',snap.age],['身份',snap.id],
      ['职业',snap.job],['所在地',snap.loc],['所属势力',snap.fac],['声望',snap.fame],
      ['战斗能力',snap.fight],['情绪',snap.mood],['身体',snap.body],['当前目标',snap.goal]];
    var body=rows.filter(function(r){return r[1]!==undefined&&r[1]!==null&&r[1]!==''&&r[1]!=='—';})
      .map(function(r){return '<div class="chd-kv"><span>'+esc(r[0])+'</span><b>'+esc(r[1])+'</b></div>';}).join('');
    var w=snap.world||{};
    var wrows=[['世界局势',w.局势],['世界焦点',w.焦点],['社会舆论',w.舆论]]
      .filter(function(r){return r[1]&&r[1]!=='—';})
      .map(function(r){return '<div class="chd-kv"><span>'+esc(r[0])+'</span><b>'+esc(r[1])+'</b></div>';}).join('');
    if(!body && !wrows) return '';
    return '<div class="chd-snap-h">📸 这一刻的你</div><div class="chd-kvgrid">'+body+'</div>'+
      (wrows?'<div class="chd-snap-h">🌍 此刻的世界</div><div class="chd-kvgrid">'+wrows+'</div>':'');
  }
  CH.detail=function(id){
    var list=CH._view||[];
    var idx=-1;
    for(var i=0;i<list.length;i++){ if(list[i].id===id){idx=i;break;} }
    if(idx<0) return;
    CH._detailIdx=idx;
    renderDetail();
  };
  CH.detailStep=function(d){
    var list=CH._view||[];
    if(!list.length) return;
    var ni=(CH._detailIdx||0)+d;
    if(ni<0) ni=0;
    if(ni>list.length-1) ni=list.length-1;
    CH._detailIdx=ni;
    renderDetail();
  };
  CH.closeDetail=function(){
    var ov=document.getElementById('chrDetailOv');
    if(ov) ov.style.display='none';
  };
  function renderDetail(){
    var list=CH._view||[], e=list[CH._detailIdx||0];
    if(!e) return;
    var ov=ensureDetailSheet();
    $('chdTt').innerHTML=(KIND_IC[e.kind]||'🌱')+' <span>'+esc(e.title)+'</span>';
    var dkLabel=(function(){
      var p=(e.dk||'').split('-');
      if(p.length===3) return p[0]+'年'+parseInt(p[1],10)+'月'+parseInt(p[2],10)+'日'+(e.t?' '+e.t:'')+(e.level?' · '+e.level:'');
      return '';
    })();
    var html='<div class="chd-date">'+esc(dkLabel)+(e._chTitle?' ｜ '+esc(e._chTitle):'')+'</div>';
    html+='<div class="chd-text">'+mdSafe(stripMdHtml(e.text))+'</div>';
    if(e.choices&&e.choices.length){
      html+='<div class="chd-snap-h">🔀 当时的选择</div><div class="chr-opts">'+e.choices.map(function(c,i){
        var picked=e.picked&&c===e.picked;
        return '<span class="chr-opt'+(picked?' picked':'')+'">'+String.fromCharCode(65+i)+' '+esc(c)+(picked?' ✓ 你选了这个':'')+'</span>';
      }).join('')+'</div>';
    }
    if(e.hints&&e.hints.length) html+='<div class="chr-hints">当时的方向：'+esc(e.hints.join(' ／ '))+'</div>';
    var snapHtml=snapRows(e.snap);
    html+=snapHtml;
    if(!snapHtml) html+='<div class="chd-nosnap">🍃 这是日常一刻：仅大事件与关键选择会留存当时的状态快照（控制存档体积），正文已完整保留。</div>';
    if(e.cp){
      html+='<div class="chd-replay-wrap">'+
        '<div class="chd-replay-tip">⟲ 这里有一个章节存档点</div>'+
        '<button class="chd-replay-btn" onclick="Chronicle.replay(\''+e.id+'\')">⟲ 从这一天重新选择</button>'+
        '<div class="chd-replay-note">此后的历史将作废重来；当前进度会先自动备份（本机 + 下载存档文件）。</div>'+
      '</div>';
    }
    $('chdScroll').innerHTML=html;
    ov.style.display='flex';
  }

  /* 全局快捷函数（供 HTML onclick 使用） */
  window.openChronicle = function(){ CH.open(); };
  window.closeChronicle = function(){ CH.close(); };

  /* ESC 关闭（先关详情卡，再关编年史） */
  document.addEventListener('keydown', function(ev){
    if(ev.key!=='Escape') return;
    var d=document.getElementById('chrDetailOv');
    if(d && d.style.display!=='none'){ CH.closeDetail(); return; }
    if(CH._open) CH.close();
  });
})();
