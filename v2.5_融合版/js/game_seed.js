/* ============================================================
   v2.5 GameSeed - 种子事件驱动引擎（适配 v2.3 的 S 状态结构）
   属性 key: str/cbt/agi/int/tec/pwr/cha/wil（v2.3 英文）
   ============================================================ */

var GameSeed = (function(){
  var STAT_KEYS = ['str','cbt','agi','int','tec','pwr','cha','wil'];

  function calcChance(base, stat){
    var s = S;
    if(!s || !s.stats) return base;
    var v = base + ((s.stats[stat]||0) - 30) * 1.2;
    if(s.flags && s.flags.injured) v -= 10;
    if(s.stress > 70) v -= 8;
    v = Math.max(5, Math.min(95, Math.round(v)));
    return v;
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
  }

  function renderNode(){
    if(!S || !S.currentNode) return;
    var node = NODES[S.currentNode];
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

    // AI 叙事增强（非日常事件）
    if(node.level !== '日常' && typeof AIService !== 'undefined' && AIService.isEnabled && AIService.isEnabled() && AIService.hasKey && AIService.hasKey()){
      var textEl = document.getElementById('seedNodeText_' + S.flags.eventCount);
      if(textEl){
        textEl.style.opacity = '0.6';
        AIService.generateNarrative(node, S).then(function(narrative){
          if(narrative && narrative !== node.text){
            textEl.style.transition = 'opacity .4s';
            textEl.style.opacity = '0';
            setTimeout(function(){ textEl.textContent = narrative; textEl.style.opacity = '1'; }, 300);
          } else {
            textEl.style.opacity = '1';
          }
        }).catch(function(){ textEl.style.opacity = '1'; });
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
      var chance = calcChance(choice.base, choice.check);
      runJudge(chance, choice);
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

  function runJudge(chance, choice){
    var ov = document.getElementById('judgeOverlay');
    if(!ov){
      // 没有转盘 UI，直接判定
      var success = Math.random() * 100 < chance;
      resolveChoice(choice, success);
      return;
    }
    var rate = document.getElementById('judgeRate');
    var ptr = document.getElementById('judgePointer');
    var res = document.getElementById('judgeResult');
    ov.style.display = 'flex';
    if(rate) rate.textContent = chance + '%';
    if(res){ res.textContent = ''; res.style.color = ''; }
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
      '</div>' +
      '<div class="ending-actions">' +
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
            narrEl.style.opacity = '0';
            setTimeout(function(){ narrEl.textContent = text; narrEl.style.opacity = '1'; }, 300);
          }
        }).catch(function(){});
      }
    }

    try{ if(typeof save === 'function') save(); }catch(e){}
  }

  function uiCustomOption(node){
    if(!S) return;
    var input = prompt('输入你的自定义行动：\n（例如：去厨房跟母亲谈汤米的入伍通知 / 偷偷跟踪那个陌生人）');
    if(!input || !input.trim()) return;
    if(typeof AIService === 'undefined' || !AIService.isEnabled() || !AIService.hasKey()){
      // 无 AI，直接用通用判定
      var fallback = {action:'other', risk:50, requiredStats:['wil'], successText:'你的行动取得了成效。', failText:'事情没有按预期发展。'};
      runCustomJudge(fallback);
      return;
    }
    AIService.generateCustomChoice(input.trim(), S).then(function(parsed){
      runCustomJudge(parsed, input);
    }).catch(function(){
      runCustomJudge({action:'other', risk:50, requiredStats:['wil'], successText:'你的行动取得了成效。', failText:'事情没有按预期发展。'});
    });
  }

  function runCustomJudge(parsed, userInput){
    if(!S) return;
    var stat = (parsed.requiredStats && parsed.requiredStats[0]) || 'wil';
    var base = 100 - (parsed.risk || 50);
    var chance = calcChance(base, stat);
    var storyEl = document.getElementById('story');
    if(storyEl && userInput){
      storyEl.innerHTML += '<div class="log-item"><b>【你的行动】</b>' + userInput + '</div>';
    }
    var success = Math.random() * 100 < chance;
    var resultText = success ? (parsed.successText || '成功') : (parsed.failText || '失败');
    if(storyEl){
      storyEl.innerHTML += '<div class="log-item"><b>【结果】</b>' + resultText + '</div>';
      storyEl.scrollTop = storyEl.scrollHeight;
    }
    // 推进到下一个节点（种子链中下一个）
    if(S.currentNode && NODES[S.currentNode] && NODES[S.currentNode].choices && NODES[S.currentNode].choices[0]){
      var next = NODES[S.currentNode].choices[0].next;
      if(next && next.indexOf('ending_') !== 0){
        S.currentNode = next;
      }
    }
    advanceTime();
    renderNode();
  }

  function startFromSeed(originKey){
    // 从 v2.4 SEEDS 映射起始节点
    var seedMap = {
      'soldier':'ww2_s_001', 'pilot':'ww2_p_001', 'medic':'ww2_m_001',
      'worker':'ww2_w_001', 'journalist':'ww2_j_001', 'musician':'ws_mu_001',
      'gangster':'ws_g_001', 'japanese':'ws_jp_001', 'wakandan':'ws_wk_001',
      'mutant':'ws_mt_001'
    };
    S.currentNode = seedMap[originKey] || 'ww2_s_001';
    S.originStartYear = (S.date ? new Date(S.date).getFullYear() : 1943);
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
