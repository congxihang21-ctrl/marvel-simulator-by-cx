/* ============================================================
   v2.5 GameSeed - 种子事件驱动引擎（适配 v2.3 的 S 状态结构）
   属性 key: str/cbt/agi/int/tec/pwr/cha/wil（v2.3 英文）
   ============================================================ */

var GameSeed = (function(){
  var STAT_KEYS = ['str','cbt','agi','int','tec','pwr','cha','wil'];
  var STAT_NAMES = {str:'体能',cbt:'格斗',agi:'敏捷',int:'智力',tec:'科技',pwr:'超能',cha:'魅力',wil:'意志'};

  /* v2.6: 简单字符串哈希，用于 RNG 种子 */
  function hashCode(str){
    var h = 0;
    for(var i=0;i<str.length;i++){
      h = ((h<<5)-h) + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  function calcChance(base, stat){
    var s = S;
    if(!s || !s.stats) return base;
    var v = base + ((s.stats[stat]||0) - 30) * 1.2;
    if(s.flags && s.flags.injured) v -= 10;
    if(s.stress > 70) v -= 8;
    v = Math.max(5, Math.min(95, Math.round(v)));
    return v;
  }

  // v2.6: 计算成功率并返回明细，用于转盘显示加成来源
  function calcChanceDetail(base, stat){
    var s = S;
    var statVal = (s && s.stats) ? (s.stats[stat]||0) : 0;
    var statBonus = Math.round((statVal - 30) * 1.2);
    var injured = s && s.flags && s.flags.injured;
    var stressHigh = s && s.stress > 70;
    var raw = base + statBonus - (injured ? 10 : 0) - (stressHigh ? 8 : 0);
    var value = Math.max(5, Math.min(95, Math.round(raw)));
    var detail = [];
    detail.push({label:'基础成功率', val:base, sign:'+'});
    detail.push({label: STAT_NAMES[stat]||stat, val:statBonus, sign: statBonus>=0?'+':''});
    if(injured) detail.push({label:'伤病', val:-10, sign:''});
    if(stressHigh) detail.push({label:'高压(>70)', val:-8, sign:''});
    return {value:value, detail:detail};
  }

  function applyEffects(eff){
    if(!eff || !S) return;
    for(var k in eff){
      if(STAT_KEYS.indexOf(k) >= 0){
        if(!S.stats) S.stats = {};
        S.stats[k] = Math.max(0, Math.min(99, (S.stats[k]||0) + eff[k]));
      } else if(k.indexOf('rel_') === 0){
        var n = k.slice(4);
        if(!S.relations) S.relations = {};
        if(!S.relations[n]) S.relations[n] = {favor:50, trust:30, hostility:0};
        S.relations[n].favor = Math.max(0, Math.min(100, (S.relations[n].favor||0) + eff[k]));
      } else if(k.indexOf('flag_') === 0){
        if(!S.flags) S.flags = {};
        S.flags[k.slice(5)] = true;
      } else if(k === 'injured'){
        if(!S.flags) S.flags = {};
        S.flags.injuredCount = (S.flags.injuredCount||0) + 1;
        S.flags.injuredTotal = (S.flags.injuredTotal||0) + 1;
        S.flags.noInjure = 0;
        if(S.stats){
          S.stats.str = Math.max(0, (S.stats.str||0) - 8);
          S.stats.cbt = Math.max(0, (S.stats.cbt||0) - 5);
        }
        S.stress = Math.min(100, (S.stress||0) + 15);
      } else if(k === 'stress'){
        S.stress = Math.max(0, Math.min(100, (S.stress||0) + eff[k]));
      } else if(k === '钱' || k === 'money'){
        S.money = Math.max(0, (S.money||0) + eff[k]);
      }
    }
    // 重算 OVR
    try{
      if(typeof calcOvr === 'function' && S.stats){
        S.stats.ovr = calcOvr(S.stats);
      }
    }catch(e){}
    if(!eff.injured){
      if(!S.flags) S.flags = {};
      S.flags.noInjure = (S.flags.noInjure||0) + 1;
    }
  }

  function advanceTime(){
    if(!S) return;
    var d = S.date ? new Date(S.date) : new Date();
    d.setMonth(d.getMonth() + 1);
    S.date = d.toISOString();
    // 年龄增长
    if(S.player && S.player['年龄']){
      var age = parseInt(S.player['年龄']) || 20;
      if(d.getMonth() === 0) age++;
      S.player['年龄'] = age;
    }
    S.stress = Math.max(0, (S.stress||0) - 2);
    // 伤病恢复
    if(S.flags && S.flags.injuredCount > 0){
      if(S.stats){
        S.stats.str = Math.min(99, (S.stats.str||0) + 3);
        S.stats.cbt = Math.min(99, (S.stats.cbt||0) + 2);
      }
      S.flags.injuredCount--;
    }
    S.turn = (S.turn||0) + 1;
    if(!S.flags) S.flags = {};
    S.flags.eventCount = (S.flags.eventCount||0) + 1;

    /* v2.6: 引擎系统 tick */
    try{
      /* 事件冷却递减 */
      if(typeof EventDirector !== 'undefined'){
        EventDirector.tickCooldowns(S);
        /* v2.6: 世界动态联动玩家影响力 */
        if(S.turn > 0 && S.turn % 3 === 0){
          EventDirector.injectInfluenceNews(S);
        }
      }
      /* 伤病恢复 */
      if(typeof CharacterEngine !== 'undefined'){
        CharacterEngine.tickInjuries(S);
        /* 经济结算：每月收入-支出 */
        var eco = S.player && S.player.经济;
        if(eco){
          eco.现金 += (eco.月收入||0) - (eco.月支出||0);
          if(eco.现金 < 0){ eco.债务 += Math.abs(eco.现金); eco.现金 = 0; }
          if(eco.现金 > 5000 && RNG && RNG.chance(0.5)){
            eco.储蓄 += 3000; eco.现金 -= 3000;
          }
        }
        /* 家庭随时间变化 */
        CharacterEngine.tickFamily(S);
        /* 压力自然恢复 */
        CharacterEngine.addStress(S, -3);
        /* v2.6: 职业成长（每回合获得经验，自动升级） */
        if(S.player && S.player.职业路径 && S.player.职业路径.当前职业){
          CharacterEngine.advanceCareer(S, 5 + Math.floor(Math.random()*8));
        }
      }
      /* 结局检查 */
      if(typeof EndingEngine !== 'undefined' && EndingEngine.shouldEnd(S)){
        setTimeout(function(){ if(EndingEngine) EndingEngine.showEnding && EndingEngine.showEnding(S); }, 500);
      }
      /* v2.6 人生记忆：每回合记录一条摘要 */
      if(typeof WorldlineEngine !== 'undefined'){
        WorldlineEngine.recordMemory(S);
      }
    }catch(e){ console.warn('engine tick', e); }

    // v2.6: 每隔一段时间有几率结识新的普通 NPC（玩家社交圈，非 MCU 熟人）
    try{
      var turn = S.turn||0;
      var relCount = (S.rel||[]).length;
      // 前 30 回合更容易结识人（建立社交圈）；之后维持在 8-12 人
      var maxRel = turn < 30 ? 8 : 12;
      if(relCount < maxRel && Math.random() < 0.18){
        var era = (S.setup && S.setup.era) ? String(S.setup.era) : '';
        var roles = ['work','neighbor','friend','stranger'];
        var role = roles[Math.floor(Math.random()*roles.length)];
        if(typeof addSocialNPC === 'function'){
          var newNpc = addSocialNPC(era, role);
          if(newNpc){
            var storyEl = document.getElementById('story');
            if(storyEl){
              storyEl.innerHTML += '<div class="log-item" style="color:#7ec8e3;font-size:12px">👤 你认识了新的人：<b>'+newNpc.姓名+'</b>（'+newNpc.身份+' · '+newNpc.关系+'）</div>';
              storyEl.scrollTop = storyEl.scrollHeight;
            }
          }
        }
      }
    }catch(_){}
  }

  /* v2.6: 把 EventDirector 事件转成节点格式，供 renderNode 统一渲染 */
  function directorEventToNode(evt){
    var flagKey = 'flag_' + evt.id + '_done';
    var choices = [
      {text:'正面应对', next:'_director', check:'wil', base:60,
       success:{effects:Object.assign({stress:+2}, {[flagKey]:true})},
       fail:{effects:{stress:+5}}},
      {text:'谨慎观察', next:'_director', check:'int', base:70,
       success:{effects:Object.assign({stress:-1}, {[flagKey]:true})},
       fail:{effects:{stress:+2}}},
      {text:'顺其自然', next:'_director', effects:{stress:-3}}
    ];
    return {
      id: evt.id,
      title: evt.text,
      text: evt.text + '（这是你人生中需要面对的一个选择。）',
      level: evt.level || '日常',
      choices: choices
    };
  }

  function renderNode(){
    if(!S || !S.currentNode) return;
    /* v2.6: 支持 EventDirector 生成的动态事件 */
    var node;
    if(S.currentNode === '_director' && S._directorNode){
      node = S._directorNode;
    } else {
      node = NODES[S.currentNode];
    }
    if(!node){
      var storyEl = document.getElementById('story');
      if(storyEl) storyEl.innerHTML += '<div class="log-item"><b>【系统】</b>节点缺失：' + S.currentNode + '</div>';
      return;
    }
    S.flags = S.flags || {};
    S.flags.eventCount = (S.flags.eventCount||0) + 1;
    if(node.level === '日常') S.flags.dailyCount = (S.flags.dailyCount||0) + 1;

    // 记录时间轴
    var d = S.date ? new Date(S.date) : new Date();
    var timeStr = d.getFullYear() + '年' + (d.getMonth()+1) + '月';
    if(!S.timeline) S.timeline = [];
    S.timeline.push({date: timeStr, text: node.title, level: node.level});
    if(S.timeline.length > 100) S.timeline.shift();

    // 渲染到 story 面板
    var storyEl = document.getElementById('story');
    if(storyEl){
      var levelClass = node.level === '英雄' ? 'hero' : node.level === '世界' ? 'world' : node.level === '人生' ? 'life' : 'daily';
      var item = document.createElement('div');
      item.className = 'log-item seed-event seed-' + levelClass;
      item.innerHTML = '<div class="log-time">' + timeStr + ' · <span class="lv-' + levelClass + '">' + (node.level||'日常') + '</span></div>' +
                       '<div class="log-title"><b>' + node.title + '</b></div>' +
                       '<div class="log-text" id="seedNodeText_' + S.flags.eventCount + '">' + node.text + '</div>';
      storyEl.appendChild(item);
      storyEl.scrollTop = storyEl.scrollHeight;
    }

    // AI 叙事增强（所有事件都润色，日常用浅档，重要用深档；带 sessionStorage 缓存）
    if(typeof AIService !== 'undefined' && AIService.isEnabled && AIService.isEnabled() && AIService.hasKey && AIService.hasKey()){
      var textEl = document.getElementById('seedNodeText_' + S.flags.eventCount);
      if(textEl){
        var isDaily = node.level === '日常';
        var cacheKey = 'mcu_narr_' + S.currentNode + '_' + (isDaily?'d':'i');
        var cached = null;
        try{ cached = sessionStorage.getItem(cacheKey); }catch(_){}
        if(cached){
          textEl.style.transition = 'opacity .4s';
          textEl.style.opacity = '0';
          var _cached = cached;
          setTimeout(function(){ textEl.textContent = _cached; textEl.style.opacity = '1'; }, 250);
        } else {
          textEl.style.opacity = '0.55';
          AIService.generateNarrative(node, S, isDaily).then(function(narrative){
            if(narrative && narrative !== node.text){
              try{ sessionStorage.setItem(cacheKey, narrative); }catch(_){}
              textEl.style.transition = 'opacity .4s';
              textEl.style.opacity = '0';
              setTimeout(function(){ textEl.textContent = narrative; textEl.style.opacity = '1'; }, 300);
            } else {
              textEl.style.opacity = '1';
            }
          }).catch(function(){ textEl.style.opacity = '1'; });
        }
      }
    }

    // 渲染选项到 opts
    var optsEl = document.getElementById('opts');
    if(optsEl){
      optsEl.innerHTML = '';
      node.choices.forEach(function(c, i){
        var div = document.createElement('div');
        div.className = 'opt seed-choice glass-shine';
        var meta = '';
        if(c.check && c.base !== undefined){
          var chance = calcChance(c.base, c.check);
          var risk = chance > 70 ? 'low' : chance > 40 ? 'mid' : 'high';
          var riskLabel = risk === 'low' ? '低风险' : risk === 'mid' ? '中风险' : '高风险';
          var riskColor = chance > 70 ? '#3fae6d' : chance > 40 ? '#e8a33d' : '#e0554b';
          meta = '<div class="choice-meta"><span class="rate-text">' + chance + '%</span>' +
                 '<div class="rate-bar"><div class="rate-fill" style="width:' + chance + '%;background:' + riskColor + '"></div></div>' +
                 '<span class="risk-tag risk-' + risk + '">' + riskLabel + '</span></div>';
        }
        var letter = String.fromCharCode(65 + i);
        div.innerHTML = '<div class="choice-label"><span class="choice-letter">' + letter + '</span>' + c.label + '</div>' + meta;
        div.onclick = function(){ makeChoice(c); };
        optsEl.appendChild(div);
      });

      // 自定义行动按钮
      if(typeof AIService !== 'undefined'){
        var aiDiv = document.createElement('div');
        aiDiv.className = 'opt seed-choice ai-custom';
        aiDiv.innerHTML = '<div class="choice-label"><span class="choice-letter" style="background:var(--magic,#9d7cff);color:#fff">✨</span>自定义行动</div>' +
                          '<div class="choice-meta"><span style="font-size:11px;color:var(--text-muted,#999)">用 AI 解析你的想法</span></div>';
        aiDiv.onclick = function(){ uiCustomOption(node); };
        optsEl.appendChild(aiDiv);
      }
    }

    // 检查成就
    try{ if(typeof checkAchievements === 'function') checkAchievements(); }catch(e){}
  }

  function makeChoice(choice){
    if(!S) return;
    if(choice.check && choice.base !== undefined){
      var cd = calcChanceDetail(choice.base, choice.check);
      runJudge(cd.value, choice, cd.detail);
    } else {
      if(choice.effects) applyEffects(choice.effects);
      if(choice.next){
        S.currentNode = choice.next;
        if(choice.next.indexOf('ending_') === 0){
          showEnding(choice.next.replace('ending_', ''));
          return;
        }
      }
      advanceTime();
      renderNode();
    }
  }

  function runJudge(chance, choice, detail){
    var ov = document.getElementById('judgeOverlay');
    if(!ov){
      var success = Math.random() * 100 < chance;
      resolveChoice(choice, success);
      return;
    }
    var rate = document.getElementById('judgeRate');
    var ptr = document.getElementById('judgePointer');
    var res = document.getElementById('judgeResult');
    var det = document.getElementById('judgeDetail');
    ov.style.display = 'flex';
    if(rate) rate.textContent = chance + '%';
    if(res){ res.textContent = ''; res.style.color = ''; }
    // v2.6: 显示成功率明细
    if(det && detail && detail.length){
      var detHtml = detail.map(function(d){
        return '<div class="judge-detail-row"><span>' + d.label + '</span><span class="' + (d.val >= 0 ? 'pos' : 'neg') + '">' + d.sign + d.val + '</span></div>';
      }).join('');
      det.innerHTML = detHtml;
      det.style.display = 'block';
    } else if(det){ det.style.display = 'none'; }
    var pos = 50, dir = 1, speed = 4;
    var totalTime = 2000 + Math.random() * 800;
    var start = Date.now();
    var tick = function(){
      pos += dir * speed;
      if(pos > 95){ pos = 95; dir = -1; }
      if(pos < 5){ pos = 5; dir = 1; }
      if(ptr) ptr.style.left = pos + '%';
      if(Date.now() - start < totalTime){
        requestAnimationFrame(tick);
      } else {
        var stopPos = Math.random() * 100;
        var success = stopPos < chance;
        if(S) S._lastJudgeSuccess = success;
        if(ptr) ptr.style.left = stopPos + '%';
        if(res){
          res.textContent = success ? '✓ 成功' : '✗ 失败';
          res.style.color = success ? '#10b981' : '#ef4444';
        }
        setTimeout(function(){
          ov.style.display = 'none';
          resolveChoice(choice, success);
        }, 1500);
      }
    };
    tick();
  }

  function resolveChoice(choice, success){
    if(!S) return;
    var result = success ? choice.success : choice.fail;
    if(result){
      if(result.effects) applyEffects(result.effects);
      if(result.next){
        S.currentNode = result.next;
        if(result.next.indexOf('ending_') === 0){
          showEnding(result.next.replace('ending_', ''));
          return;
        }
      }
    }
    advanceTime();
    renderNode();
  }

  function showEnding(id){
    if(!S) return;
    var e = ENDINGS[id] || ENDINGS['ordinary_life'] || {name:'平凡人生', text:'你的人生走到了尽头。'};
    S.ending = id;
    var d = S.date ? new Date(S.date) : new Date();
    var startYear = S.originStartYear || d.getFullYear();
    var years = d.getFullYear() - startYear;
    var battles = (S.flags && S.flags.battleCount) || 0;
    var injuries = (S.flags && S.flags.injuredTotal) || 0;
    var choices = (S.flags && S.flags.eventCount) || 0;
    var achCount = (S.achievements && S.achievements.length) || 0;
    var ovr = (S.stats && S.stats.ovr) || 0;
    var name = (S.setup && S.setup.name) || '无名氏';
    var age = (S.player && S.player['年龄']) || '?';

    var html = '<div class="ending-cinematic">' +
      '<div class="ending-tier">' + (e.rarity || 'END') + '</div>' +
      '<h2 class="ending-title">' + e.name + '</h2>' +
      '<div class="ending-divider"></div>' +
      '<div class="ending-narrative" id="endingNarrative">' + (e.text || '').replace(/{name}/g, name) + '</div>' +
      '<div class="life-stats">' +
        '<div class="stat-row"><span>最终年龄</span><span>' + age + ' 岁</span></div>' +
        '<div class="stat-row"><span>人生跨度</span><span>' + years + ' 年</span></div>' +
        '<div class="stat-row"><span>最终 OVR</span><span>' + ovr + '</span></div>' +
        '<div class="stat-row"><span>重大选择</span><span>' + choices + ' 次</span></div>' +
        '<div class="stat-row"><span>战斗经历</span><span>' + battles + ' 次</span></div>' +
        '<div class="stat-row"><span>受伤次数</span><span>' + injuries + ' 次</span></div>' +
        '<div class="stat-row"><span>解锁成就</span><span>' + achCount + ' 个</span></div>' +
      '</div>';

    // v2.6: 人生回顾 - 最终属性面板
    if(S.stats){
      html += '<div class="life-review-section"><h4 class="review-title">📊 最终属性</h4><div class="review-stats">';
      STAT_KEYS.forEach(function(k){
        var v = S.stats[k] || 0;
        var nm = STAT_NAMES[k] || k;
        html += '<div class="review-stat-item"><span class="rs-name">' + nm + '</span><span class="rs-val">' + v + '</span><div class="rs-bar"><div class="rs-fill" style="width:' + v + '%"></div></div></div>';
      });
      html += '</div></div>';
    }

    // v2.6: 人生回顾 - 获得的成就
    if(S.achievements && S.achievements.length){
      html += '<div class="life-review-section"><h4 class="review-title">🏆 获得的成就</h4><div class="review-achievements">';
      var pool = (typeof ACHIEVEMENT_POOL !== 'undefined') ? ACHIEVEMENT_POOL : [];
      S.achievements.forEach(function(aid){
        var ach = pool.find(function(a){return a.id === aid;});
        if(ach){
          html += '<div class="review-ach-item" title="' + ach.desc + '">' + ach.ic + ' ' + ach.name + '</div>';
        } else {
          html += '<div class="review-ach-item">' + aid + '</div>';
        }
      });
      html += '</div></div>';
    }

    // v2.6: 人生回顾 - NPC 关系
    if(S.relations && Object.keys(S.relations).length){
      html += '<div class="life-review-section"><h4 class="review-title">👥 重要人物</h4><div class="review-relations">';
      for(var rn in S.relations){
        var r = S.relations[rn];
        var fv = r.favor || 0;
        var fLabel = fv >= 80 ? '挚友' : fv >= 50 ? '朋友' : fv >= 20 ? '熟人' : '陌生人';
        html += '<div class="review-rel-item"><span class="rel-name">' + rn + '</span><span class="rel-label">' + fLabel + '（' + fv + '）</span></div>';
      }
      html += '</div></div>';
    }

    // v2.6: AI 人生传记
    html += '<div class="life-review-section"><h4 class="review-title">📜 人生传记</h4><div class="ending-narrative" id="lifeBiography" style="opacity:0.5">正在撰写传记…</div></div>';

    html += '<div class="ending-actions">' +
        '<button class="btn btn-glass" onclick="closeEndingScreen()">返回首页</button>' +
      '</div>' +
    '</div>';

    // 尝试用弹窗显示结局
    if(typeof UI !== 'undefined' && UI.openModal){
      UI.openModal(html);
    } else {
      var modal = document.getElementById('detailModal') || document.getElementById('modal');
      if(modal){
        var body = modal.querySelector('.dbody') || modal.querySelector('#modalBody') || modal;
        body.innerHTML = html;
        modal.style.display = 'flex';
      } else {
        // 兜底：直接在 story 显示
        var storyEl = document.getElementById('story');
        if(storyEl) storyEl.innerHTML += '<div class="log-item"><b>【结局】</b>' + e.name + '<br>' + (e.text||'') + '</div>';
      }
    }

    // AI 结局叙事增强
    if(typeof AIService !== 'undefined' && AIService.isEnabled && AIService.isEnabled() && AIService.hasKey && AIService.hasKey()){
      var narrEl = document.getElementById('endingNarrative');
      if(narrEl){
        AIService.generateEnding(e, S).then(function(text){
          if(text && text !== e.text){
            narrEl.style.transition = 'opacity .4s';
            narrEl.style.opacity = '0';
            setTimeout(function(){ narrEl.textContent = text; narrEl.style.opacity = '1'; }, 300);
          }
        }).catch(function(){});
      }
      // AI 人生传记
      var bioEl = document.getElementById('lifeBiography');
      if(bioEl){
        AIService.generateLifeSummary(S, S.timeline, e).then(function(text){
          if(text){
            bioEl.style.transition = 'opacity .4s';
            bioEl.style.opacity = '0';
            setTimeout(function(){ bioEl.textContent = text; bioEl.style.opacity = '1'; }, 300);
          } else {
            bioEl.textContent = '—';
            bioEl.style.opacity = '1';
          }
        }).catch(function(){ bioEl.textContent = '—'; bioEl.style.opacity = '1'; });
      }
    }

    try{ if(typeof save === 'function') save(); }catch(e){}
  }

  function uiCustomOption(node){
    if(!S) return;
    // v2.6: 用模态框代替 prompt()，移动端体验更好
    showCustomModal(function(input){
      if(!input || !input.trim()) return;
      if(typeof AIService === 'undefined' || !AIService.isEnabled() || !AIService.hasKey()){
        var fallback = {action:'other', risk:50, requiredStats:['wil'], successText:'你的行动取得了成效。', failText:'事情没有按预期发展。'};
        runCustomJudge(fallback);
        return;
      }
      AIService.generateCustomChoice(input.trim(), S).then(function(parsed){
        runCustomJudge(parsed, input);
      }).catch(function(){
        runCustomJudge({action:'other', risk:50, requiredStats:['wil'], successText:'你的行动取得了成效。', failText:'事情没有按预期发展。'});
      });
    });
  }

  function showCustomModal(callback){
    // 创建模态框
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(8px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
    var box = document.createElement('div');
    box.style.cssText = 'background:linear-gradient(160deg,rgba(30,30,45,.98),rgba(15,15,25,.98));border:1px solid rgba(157,124,255,.3);border-radius:16px;padding:24px;max-width:480px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.5);';
    var title = document.createElement('h3');
    title.textContent = '✨ 自定义行动';
    title.style.cssText = 'margin:0 0 8px;font-size:18px;color:#fff;';
    var desc = document.createElement('p');
    desc.textContent = '描述你想做的事，AI 会根据你的属性和当前情况判定结果。';
    desc.style.cssText = 'margin:0 0 16px;font-size:13px;color:#999;';
    var ta = document.createElement('textarea');
    ta.placeholder = '例如：偷偷跟踪那个陌生人 / 去找史蒂夫谈谈血清的事';
    ta.style.cssText = 'width:100%;min-height:90px;padding:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#fff;font-size:14px;resize:vertical;box-sizing:border-box;';
    var btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:10px;margin-top:16px;';
    var btnCancel = document.createElement('button');
    btnCancel.textContent = '取消';
    btnCancel.style.cssText = 'flex:1;padding:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#ccc;cursor:pointer;font-size:14px;';
    var btnOk = document.createElement('button');
    btnOk.textContent = '执行行动';
    btnOk.style.cssText = 'flex:2;padding:12px;background:linear-gradient(135deg,rgba(157,124,255,.9),rgba(124,92,255,.9));border:none;border-radius:10px;color:#fff;cursor:pointer;font-size:14px;font-weight:600;';
    function close(){ overlay.remove(); }
    btnCancel.onclick = close;
    btnOk.onclick = function(){ callback(ta.value); close(); };
    ta.onkeydown = function(e){ if(e.key === 'Enter' && (e.ctrlKey || e.metaKey)) btnOk.click(); };
    btnRow.appendChild(btnCancel);
    btnRow.appendChild(btnOk);
    box.appendChild(title);
    box.appendChild(desc);
    box.appendChild(ta);
    box.appendChild(btnRow);
    overlay.appendChild(box);
    overlay.onclick = function(e){ if(e.target === overlay) close(); };
    document.body.appendChild(overlay);
    setTimeout(function(){ ta.focus(); }, 50);
  }

  function runCustomJudge(parsed, userInput){
    if(!S) return;
    var stat = (parsed.requiredStats && parsed.requiredStats[0]) || 'wil';
    var base = 100 - (parsed.risk || 50);
    var cd = calcChanceDetail(base, stat);
    var storyEl = document.getElementById('story');
    if(storyEl && userInput){
      storyEl.innerHTML += '<div class="log-item"><b style="color:#9d7cff">【你的行动】</b>' + userInput + '</div>';
    }
    // 用转盘判定（带明细）
    var fakeChoice = {
      success:{effects: parsed.successEffects || {}},
      fail:{effects: parsed.failEffects || {injured:true, stress:+10}}
    };
    runJudge(cd.value, {
      check: stat, base: base,
      success: {effects: parsed.successEffects || {}},
      fail: {effects: parsed.failEffects || {injured:true, stress:+10}}
    }, cd.detail);
    // 记录结果文本（resolveChoice 后补充）
    var origResolve = resolveChoice;
    window._customResultPending = true;
    setTimeout(function(){
      var success = S._lastJudgeSuccess;
      var resultText = success ? (parsed.successText || '你的行动取得了成效。') : (parsed.failText || '事情没有按预期发展。');
      if(storyEl){
        storyEl.innerHTML += '<div class="log-item"><b style="color:' + (success?'#3fae6d':'#e0554b') + '">【结果】</b>' + resultText + '</div>';
        // 显示属性变化
        var eff = success ? (parsed.successEffects || {}) : (parsed.failEffects || {injured:true, stress:+10});
        var changeHtml = '';
        for(var k in eff){
          if(STAT_KEYS.indexOf(k) >= 0){
            var nm = STAT_NAMES[k] || k;
            var v = eff[k];
            changeHtml += '<span class="stat-float ' + (v>=0?'pos':'neg') + '">' + nm + ' ' + (v>=0?'+':'') + v + '</span> ';
          } else if(k === 'injured'){
            changeHtml += '<span class="stat-float neg">🩹 受伤</span> ';
          } else if(k === 'stress'){
            changeHtml += '<span class="stat-float ' + (eff[k]>=0?'neg':'pos') + '">压力 ' + (eff[k]>=0?'+':'') + eff[k] + '</span> ';
          }
        }
        if(changeHtml){
          storyEl.innerHTML += '<div class="log-item" style="color:#9d7cff;font-size:12px">📈 ' + changeHtml + '</div>';
        }
        // 世界线偏移提示
        var flagChanges = [];
        for(var fk in eff){
          if(fk.indexOf('flag_') === 0) flagChanges.push(fk.slice(5));
        }
        if(flagChanges.length){
          storyEl.innerHTML += '<div class="log-item" style="color:#e8a33d;font-size:12px">🌀 世界线偏移：' + flagChanges.join('、') + '</div>';
        }
        storyEl.scrollTop = storyEl.scrollHeight;
      }
    }, 1800);
    // 推进到下一个节点
    var useDirector = false;
    var nextSeed = null;
    if(S.currentNode !== '_director' && NODES[S.currentNode] && NODES[S.currentNode].choices && NODES[S.currentNode].choices[0]){
      var next = NODES[S.currentNode].choices[0].next;
      if(next && next.indexOf('ending_') !== 0) nextSeed = next;
    }
    /* v2.6: 第3回合后，70%概率走 EventDirector 动态事件（AI 驱动人生） */
    if(typeof EventDirector !== 'undefined' && (S.turn||0) > 2 && Math.random() < 0.7){
      try{
        var picked = EventDirector.selectNextEvent(S);
        if(picked && picked.evt){
          S._directorNode = directorEventToNode(picked.evt);
          S.currentNode = '_director';
          useDirector = true;
        }
      }catch(e){ console.warn('director', e); }
    }
    if(useDirector){
      setTimeout(function(){
        advanceTime();
        renderNode();
      }, 2000);
    } else if(nextSeed){
      setTimeout(function(){
        S.currentNode = nextSeed;
        advanceTime();
        renderNode();
      }, 2000);
    } else {
      /* 种子链走完，用导演事件兜底 */
      if(typeof EventDirector !== 'undefined'){
        try{
          var p2 = EventDirector.selectNextEvent(S);
          if(p2 && p2.evt){
            S._directorNode = directorEventToNode(p2.evt);
            S.currentNode = '_director';
          }
        }catch(e){}
      }
      setTimeout(function(){ advanceTime(); renderNode(); }, 2000);
    }
  }

  function startFromSeed(originKey){
    // v2.6: 确保 eraName 存在（AI 上下文需要）
    if(S && S.setup && S.setup.era && !S.eraName) S.eraName = String(S.setup.era);
    // v2.6: 根据时代选择起始节点（8 个时代全覆盖）
    var eraName = (S.setup && S.setup.era) ? String(S.setup.era) : '';
    var sdate = (S.setup && S.setup.sdate) ? String(S.setup.sdate) : '';
    var year = parseInt(sdate.slice(0,4)) || 0;
    var nodeMap = [
      {p:/冷战|1950|1995/, y:[1950,1995], node:'cold_001'},
      {p:/英雄黎明|2008|2011/, y:[2008,2011], node:'hero_001'},
      {p:/纽约|2012|2013/, y:[2012,2013], node:'nyc_001'},
      {p:/奥创|索科维亚|2014|2015/, y:[2014,2015], node:'ultron_001'},
      {p:/内战|协议|2016|2017/, y:[2016,2017], node:'civil_001'},
      {p:/无限|烁灭|2018|2023/, y:[2018,2023], node:'infinity_001'},
      {p:/多元|2024|2025|2026/, y:[2024,2026], node:'multi_001'}
    ];
    var matched = false;
    for(var i=0; i<nodeMap.length; i++){
      var item = nodeMap[i];
      if(item.p.test(eraName) || (year >= item.y[0] && year <= item.y[1])){
        S.currentNode = item.node;
        matched = true;
        break;
      }
    }
    // 二战及自定义时代默认用出身映射
    if(!matched){
      var seedMap = {
        'soldier':'ww2_s_001', 'pilot':'ww2_p_001', 'medic':'ww2_m_001',
        'worker':'ww2_w_001', 'journalist':'ww2_j_001', 'musician':'ws_mu_001',
        'gangster':'ws_g_001', 'japanese':'ws_jp_001', 'wakandan':'ws_wk_001',
        'mutant':'ws_mt_001'
      };
      S.currentNode = seedMap[originKey] || 'ww2_s_001';
    }
    S.originStartYear = (S.date ? new Date(S.date).getFullYear() : 1943);
    /* v2.6: 初始化所有引擎系统 */
    try{
      if(typeof RNG !== 'undefined') RNG.setSeed(hashCode(String(S.seedKey||'') + (S.setup.name||'') + S.date));
      if(typeof WorldlineEngine !== 'undefined') WorldlineEngine.init(S);
      if(typeof CharacterEngine !== 'undefined'){
        CharacterEngine.initCharacter(S);
        /* 根据出身设置初始经济 */
        var birth = (S.setup && S.setup.birth) ? String(S.setup.birth) : '';
        var eco = S.player.经济;
        if(/亿万富豪/.test(birth)){ eco.现金 = 500000; eco.月收入 = 20000; eco.储蓄 = 1000000; }
        else if(/富裕|富豪/.test(birth)){ eco.现金 = 50000; eco.月收入 = 8000; eco.储蓄 = 200000; }
        else if(/中产|科学家|军人/.test(birth)){ eco.现金 = 10000; eco.月收入 = 3000; eco.储蓄 = 30000; }
        else if(/街头|贫民|孤儿院/.test(birth)){ eco.现金 = 200; eco.月收入 = 800; eco.债务 = 500; }
        else { eco.现金 = 2000; eco.月收入 = 1500; eco.储蓄 = 5000; }
        /* 设置初始职业 */
        if(!S.player.职业路径.当前职业){
          var occMap = {'军人':'soldier','科学家':'scientist','记者':'reporter','医生':'medic','工人':'worker'};
          for(var ok in occMap){ if(birth.indexOf(ok) !== -1){ S.player.职业路径.当前职业 = occMap[ok]; break; } }
          if(!S.player.职业路径.当前职业) S.player.职业路径.当前职业 = '普通市民';
        }
        /* 根据出身设初始属性 */
        var attrs = S.player.属性;
        if(/军人/.test(birth)){ attrs.体能 += 15; attrs.格斗 += 10; attrs.意志 += 10; }
        if(/科学家|科技/.test(birth)){ attrs.智力 += 15; attrs.科技 += 20; }
        if(/记者/.test(birth)){ attrs.魅力 += 10; attrs.演讲 += 15; }
        if(/医生|医学/.test(birth)){ attrs.智力 += 10; attrs.医学 += 20; }
      }
      if(typeof RelationshipEngine !== 'undefined'){
        (S.rel||[]).forEach(function(npc){ RelationshipEngine.initNPC(npc); });
      }
    }catch(e){ console.warn('engine init', e); }

    // v2.6: seed 路径也生成初始社交 NPC（玩家的家人、邻居、同事等普通人）
    try{
      if(!S.rel || !S.rel.length){
        var _era2 = (S.setup && S.setup.era) ? String(S.setup.era) : '';
        var _initRoles = ['family','work','neighbor','friend'];
        var _initCount = 3 + Math.floor(Math.random()*3); // 3-5 个
        for(var _j=0; _j<_initCount; _j++){
          if(typeof addSocialNPC === 'function'){
            addSocialNPC(_era2, _initRoles[_j % _initRoles.length]);
          }
        }
      }
    }catch(_){}

    // v2.6: 开档即完整 —— 立即填充初始世界动态与已发生事件，不等第一次世界演化
    try{
      if(typeof EventDirector !== 'undefined' && EventDirector.generateInitialWorld){
        EventDirector.generateInitialWorld(S);
      } else {
        // 兜底：给世界动态各维度填一句开局描述
        var _era = (S.setup && S.setup.era) ? String(S.setup.era) : '';
        var _yr = parseInt(String(S.setup && S.setup.sdate || '').slice(0,4)) || 1943;
        var _openers = {
          '政府': _yr+' 年，政局按正典时间线运行。',
          '英雄界': '超级英雄世界暗流涌动，传奇即将书写。',
          '反派与地下': '地下势力各有盘算，暗处的眼睛在观察。',
          '科技与经济': '科技与经济按时代背景正常运转。',
          '宇宙': '宇宙深处，古老的力量正在沉睡。',
          '多元宇宙': '神圣时间线稳固，分支尚未出现。',
          '你所在地区': '你所在的地区一切如常，生活继续。'
        };
        if(S.world){
          for(var _wk in _openers){ if(S.world[_wk]==='—' || !S.world[_wk]) S.world[_wk] = _openers[_wk]; }
        }
      }
      // 注入 1-2 条开局已发生事件
      if(S.events && Array.isArray(S.events['已发生'])){
        var _birth = (S.setup && S.setup.birth) ? String(S.setup.birth) : '普通人';
        S.events['已发生'].push({time:String(_yr)+'年', text:'你出生于一个'+_birth+'家庭，故事从此刻开始。'});
      }
    }catch(e){ console.warn('init world failed', e); }

    renderNode();
  }

  return {
    renderNode: renderNode,
    makeChoice: makeChoice,
    calcChance: calcChance,
    runJudge: runJudge,
    resolveChoice: resolveChoice,
    applyEffects: applyEffects,
    advanceTime: advanceTime,
    showEnding: showEnding,
    startFromSeed: startFromSeed,
    uiCustomOption: uiCustomOption
  };
})();
