/* ============================================================
   v2.4 种子人生 · 数据定义
   二战年代（1943-1945）完整路线
   ============================================================ */

var STAT_NAMES = ['体能','格斗','敏捷','智力','科技','超能','魅力','意志'];
var RARITY_COLORS = {common:'#8fa3b8',rare:'#7cc0ff',epic:'#9d7cff',legendary:'#f2c54d'};
var RARITY_NAMES = {common:'普通',rare:'稀有',epic:'史诗',legendary:'传奇'};

/* ===== 年代定义 ===== */
var ERAS = {
  ww2: {
    id:'ww2', name:'二战与超级士兵时代', years:'1943-1945', icon:'⚔️',
    desc:'世界战火纷飞，超级士兵计划刚刚启动。瘦弱的史蒂夫·罗杰斯即将改变历史——而你，可能是那个取代他的人。',
    seeds:['ww2_soldier','ww2_scientist','ww2_agent','ww2_civilian'],
    endings:['captain_america','kia','serum_failure','red_skull_victor','survivor','hydra_infiltrator','war_hero','frozen']
  }
};

/* ===== 种子（出身）定义 ===== */
var SEEDS = {
  ww2_soldier: {
    id:'ww2_soldier', era:'ww2', name:'士兵', icon:'🎖️',
    desc:'你被征召入伍，即将前往欧洲战场。你的体能和意志是最大的资本。',
    stats:{体能:65,格斗:50,敏捷:40,智力:25,科技:15,超能:0,魅力:35,意志:55},
    startNode:'ww2_s_001', routeHint:'可成为美国队长',
    line:'士兵路线'
  },
  ww2_scientist: {
    id:'ww2_scientist', era:'ww2', name:'科学家', icon:'🔬',
    desc:'你是厄斯金博士的助手，参与超级士兵计划。你的智力和科技是核心。',
    stats:{体能:25,格斗:15,敏捷:30,智力:70,科技:65,超能:0,魅力:40,意志:45},
    startNode:'ww2_sc_001', routeHint:'可成为钢铁侠前身',
    line:'科研路线'
  },
  ww2_agent: {
    id:'ww2_agent', era:'ww2', name:'特工', icon:'🕵️',
    desc:'你是战略科学预备队的特工，擅长渗透和情报。你的敏捷和魅力是武器。',
    stats:{体能:45,格斗:55,敏捷:70,智力:50,科技:30,超能:0,魅力:60,意志:50},
    startNode:'ww2_a_001', routeHint:'可成为黑寡妇式特工',
    line:'特工路线'
  },
  ww2_civilian: {
    id:'ww2_civilian', era:'ww2', name:'平民', icon:'👷',
    desc:'你只是布鲁克林的一个普通市民，战争改变了所有人的生活。',
    stats:{体能:35,格斗:20,敏捷:35,智力:40,科技:25,超能:0,魅力:45,意志:40},
    startNode:'ww2_c_001', routeHint:'市井路线',
    line:'平民路线'
  }
};

/* ===== 事件节点树（二战·士兵路线，核心路线）===== */
var NODES = {
  /* ---- 士兵路线 ---- */
  ww2_s_001: {
    era:'1943春', title:'入伍',
    text:'征兵令下来了。你站在布鲁克林的征兵办公室里，看着周围形形色色的年轻人。空气中弥漫着紧张和兴奋。一个瘦弱的年轻人正在和征兵官争论——他太瘦了，不符合标准。',
    choices:[
      {label:'上去看看那个瘦弱的年轻人', check:'魅力', baseChance:30,
        success:{next:'ww2_s_002a', effects:{魅力:+3,关系_史蒂夫:15}, text:'你走过去拍了拍他的肩："兄弟，别气馁，总有办法的。"他抬头看你，眼神里有了点光。'},
        fail:{next:'ww2_s_002b', effects:{魅力:-2}, text:'你刚开口就被他顶了回来："不用你管。"气氛有点尴尬。'}},
      {label:'办好自己的手续，别多管闲事', check:null,
        next:'ww2_s_002c', effects:{意志:+3}, text:'你摇摇头，转身去办自己的手续。战争年代，管好自己最重要。'}
    ]
  },
  ww2_s_002a: {
    era:'1943春', title:'结识史蒂夫',
    text:'那个年轻人叫史蒂夫·罗杰斯。他告诉你他想参军想疯了，但因为体格太差被刷了五次。你和他聊了很久，发现他虽然瘦小，但眼神里有一种你很少见的坚定。',
    choices:[
      {label:'"你会成为一个好兵的，我相信你。"', check:'魅力', baseChance:50,
        success:{next:'ww2_s_003', effects:{魅力:+5,关系_史蒂夫:25}, text:'史蒂夫愣了一下，然后笑了："谢谢你。你是第一个这么说的人。"你们成了朋友。'},
        fail:{next:'ww2_s_003', effects:{关系_史蒂夫:10}, text:'史蒂夫礼貌地笑了笑，但你感觉他没太往心里去。'}},
      {label:'"光有决心没用，你这体格上去就是送死。"', check:null,
        next:'ww2_s_003', effects:{意志:+2,关系_史蒂夫:-10}, text:'话一出口你就后悔了。史蒂夫的脸沉了下来，但他没有反驳。'}
    ]
  },
  ww2_s_002b: {
    era:'1943春', title:'独自训练',
    text:'你没有再管那个年轻人，专注于自己的训练。新兵营的日子很苦，但你咬牙坚持了下来。',
    choices:[
      {label:'加倍训练，成为新兵中的尖子', check:'体能', baseChance:40,
        success:{next:'ww2_s_003', effects:{体能:+8,格斗:+5}, text:'你的拼命被教官看在眼里，你成了新兵连的示范兵。'},
        fail:{next:'ww2_s_003', effects:{体能:+3}, text:'你尽力了，但底子还是差点。不过至少没掉队。'}},
      {label:'保持中等水平，不冒尖也不落后', check:null,
        next:'ww2_s_003', effects:{体能:+2,意志:+2}, text:'你选择了稳妥。不冒尖意味着不被注意，但也不会被针对。'}
    ]
  },
  ww2_s_002c: {
    era:'1943春', title:'新兵营',
    text:'你顺利通过了征兵，被分配到新兵训练营。这里的训练强度超出想象，每天都是体能、格斗、射击的循环。',
    choices:[
      {label:'全力以赴，争取最好成绩', check:'体能', baseChance:35,
        success:{next:'ww2_s_003', effects:{体能:+6,格斗:+4,意志:+3}, text:'你在新兵营脱颖而出，教官开始注意到你。'},
        fail:{next:'ww2_s_003', effects:{体能:+3}, text:'你拼尽全力，但总有人比你更强。不过你没有放弃。'}},
      {label:'和战友搞好关系，建立人脉', check:'魅力', baseChance:45,
        success:{next:'ww2_s_003', effects:{魅力:+4}, text:'你很快和新兵们打成一片，成了连里的"红人"。'},
        fail:{next:'ww2_s_003', effects:{魅力:+1}, text:'你尝试融入，但效果一般。'}}
    ]
  },
  ww2_s_003: {
    era:'1943夏', title:'超级士兵计划',
    text:'训练中，一个叫厄斯金的博士找到了你。他说他在为一个秘密项目挑选候选人——超级士兵计划。他看了你的训练记录，觉得你有潜力。但他也提到了另一个候选人：史蒂夫·罗杰斯。',
    choices:[
      {label:'"我愿意接受这个计划。"', check:'意志', baseChance:45,
        success:{next:'ww2_s_004', effects:{意志:+5,标记_候选:true}, text:'厄斯金博士点点头："我会把你列入候选名单。记住，成为超级士兵不只是体能，更是心。"'},
        fail:{next:'ww2_s_004_fail', effects:{意志:+3}, text:'你的犹豫让厄斯金博士皱了皱眉。他没有当场拒绝，但你感觉机会在溜走。'}},
      {label:'"博士，我能问一下史蒂夫·罗杰斯的情况吗？"', check:'智力', baseChance:50,
        success:{next:'ww2_s_004', effects:{智力:+3,关系_史蒂夫:5,标记_候选:true}, text:'厄斯金博士笑了："他虽然瘦小，但有一颗不屈的心。你也是。你们两个我都看好。"'},
        fail:{next:'ww2_s_004', effects:{标记_候选:true}, text:'厄斯金博士没有多透露，但你成功入选了候选名单。'}}
    ]
  },
  ww2_s_004_fail: {
    era:'1943夏', title:'错失良机',
    text:'厄斯金博士最终选择了史蒂夫·罗杰斯作为超级士兵计划的唯一候选人。你错过了这个机会，但战争还在继续，你仍然可以在战场上证明自己。',
    choices:[
      {label:'接受现实，专注于战场', check:null,
        next:'ww2_s_combat_01', effects:{意志:+5}, text:'你收拾心情，准备上战场。也许当不了超级士兵，但你可以当一个好兵。'},
      {label:'不甘心，想办法找其他机会', check:'智力', baseChance:20,
        success:{next:'ww2_s_004', effects:{标记_候选:true}, text:'你找到了一个关系，重新获得了候选资格。'},
        fail:{next:'ww2_s_combat_01', effects:{意志:-3}, text:'你四处奔走，但没有结果。只能接受现实。'}}
    ]
  },
  ww2_s_004: {
    era:'1943秋', title:'血清注射',
    text:'你被带到了一个秘密实验室。厄斯金博士亲自为你准备注射。他告诉你，血清会放大你内心的本质——好人会变得更好，坏人会变得更坏。机器启动了，你的血管像要炸开一样。',
    choices:[
      {label:'咬牙挺住，用意志控制身体', check:'意志', baseChance:50,
        success:{next:'ww2_s_005_cap', effects:{体能:+35,格斗:+25,敏捷:+20,超能:+10,意志:+10,标记_美队:true}, text:'剧痛中你听到了自己的心跳。然后，一切安静了。你睁开眼，感觉身体里有使不完的劲。你成功了。'},
        fail:{next:'ww2_s_005_fail', effects:{}, text:'你的心脏承受不住。视野开始模糊，耳边是厄斯金博士的大喊："停下！快停下！"'}}
    ]
  },
  ww2_s_005_cap: {
    era:'1943秋', title:'美国队长',
    text:'你取代了史蒂夫·罗杰斯，成为了超级士兵计划的成功样本。军方给了你一套红白蓝制服和一面振金盾牌。媒体称你为"美国队长"。但你知道，真正的考验还在后面——红骷髅和九头蛇正在欧洲蠢蠢欲动。',
    choices:[
      {label:'立刻前往欧洲，对抗红骷髅', check:null,
        next:'ww2_s_redskull_01', effects:{魅力:+5}, text:'你披上斗篷，登上了前往欧洲的飞机。', unlockAchievement:'取代美国队长'},
      {label:'先去看看史蒂夫，告诉他这个消息', check:null,
        next:'ww2_s_steve_talk', effects:{关系_史蒂夫:10}, text:'你找到了史蒂夫。他看着你，沉默了很久，然后说："替我照顾好这个世界。"'}
    ]
  },
  ww2_s_005_fail: {
    era:'1943秋', title:'实验失败',
    text:'血清在你体内剧烈反应，你的心脏骤停。医生们抢救了很久，但你再也没能睁开眼。你成为了超级士兵计划的又一个失败样本。历史仍然选择了史蒂夫·罗杰斯。',
    choices:[], ending:'serum_failure'
  },
  ww2_s_steve_talk: {
    era:'1943秋', title:'与史蒂夫告别',
    text:'史蒂夫拍了拍你的肩："你比我更适合这个。去吧，替我打那些纳粹。"你点点头，转身走向了属于你的战场。',
    choices:[
      {label:'出发，前往欧洲', check:null,
        next:'ww2_s_redskull_01', effects:{意志:+5}, text:'你不再犹豫。', unlockAchievement:'取代美国队长'}
    ]
  },
  ww2_s_combat_01: {
    era:'1943秋', title:'诺曼底',
    text:'你随部队参加了诺曼底登陆。海滩上炮火连天，你的战友一个个倒下。你必须做出选择。',
    choices:[
      {label:'带头冲锋，突破德军防线', check:'体能', baseChance:35,
        success:{next:'ww2_s_combat_02', effects:{体能:+5,格斗:+5,意志:+8}, text:'你呐喊着冲过了海滩，在你身后，战友们跟了上来。这一天，你成了英雄。'},
        fail:{next:'ww2_s_ending_kia', effects:{}, text:'一颗子弹击中了你。你倒在了诺曼底的沙滩上，望着远方的天空。'}},
      {label:'寻找掩体，掩护战友推进', check:'敏捷', baseChance:50,
        success:{next:'ww2_s_combat_02', effects:{敏捷:+4,魅力:+5}, text:'你精准的掩护射击让战友们得以推进。你不是最猛的，但是最可靠的。'},
        fail:{next:'ww2_s_combat_02', effects:{体能:-5}, text:'你被弹片擦伤了，但没有大碍。'}}
    ]
  },
  ww2_s_combat_02: {
    era:'1944春', title:'战线推进',
    text:'你随部队一路向东推进。战争越来越惨烈，但你也越来越强。一次侦察任务中，你发现了一个九头蛇的秘密基地。',
    choices:[
      {label:'独自潜入，收集情报', check:'敏捷', baseChance:40,
        success:{next:'ww2_s_combat_03', effects:{敏捷:+5,智力:+5,标记_九头蛇情报:true}, text:'你像幽灵一样潜入了基地，拿到了关键情报。'},
        fail:{next:'ww2_s_combat_03', effects:{体能:-8}, text:'你被发现了，一番激战后你逃了出来，但受了伤。'}},
      {label:'回报指挥部，请求支援', check:'智力', baseChance:60,
        success:{next:'ww2_s_combat_03', effects:{智力:+3,魅力:+5}, text:'你的情报让指挥部制定了精准的打击计划。'},
        fail:{next:'ww2_s_combat_03', effects:{}, text:'指挥部没有重视你的情报。你只能自己想办法。'}}
    ]
  },
  ww2_s_combat_03: {
    era:'1944冬', title:'战争尾声',
    text:'德国节节败退，战争即将结束。你在最后一场战役中遇到了一个九头蛇的精英战士。',
    choices:[
      {label:'正面决战', check:'格斗', baseChance:45,
        success:{next:'ww2_s_ending_warhero', effects:{格斗:+5}, text:'经过一场恶战，你击败了对手。战争结束了，你活着回到了家。'},
        fail:{next:'ww2_s_ending_kia', effects:{}, text:'你拼尽了全力，但还是倒在了胜利的前夜。'}},
      {label:'智取，用计谋取胜', check:'智力', baseChance:55,
        success:{next:'ww2_s_ending_warhero', effects:{智力:+5}, text:'你设下陷阱，不费一兵一卒就解决了对手。'},
        fail:{next:'ww2_s_combat_03b', effects:{体能:-10}, text:'你的计谋被识破，陷入了苦战。'}}
    ]
  },
  ww2_s_combat_03b: {
    era:'1945春', title:'最后一搏',
    text:'你身负重伤，但敌人还在。你必须做出最后的决定。',
    choices:[
      {label:'拼死一战', check:'意志', baseChance:30,
        success:{next:'ww2_s_ending_warhero', effects:{}, text:'你用最后的力气击败了敌人。你活了下来，但留下了永久的伤疤。'},
        fail:{next:'ww2_s_ending_kia', effects:{}, text:'你倒下了，再也没有起来。'}}
    ]
  },
  ww2_s_redskull_01: {
    era:'1944冬', title:'追踪红骷髅',
    text:'你追踪红骷髅到了阿尔卑斯山的一个秘密基地。他正在研发一种毁灭性的武器。你必须阻止他。',
    choices:[
      {label:'正面突入基地', check:'体能', baseChance:35,
        success:{next:'ww2_s_redskull_02', effects:{体能:+5,格斗:+5}, text:'你用盾牌砸开了基地的大门，一路打到了核心区域。'},
        fail:{next:'ww2_s_redskull_02', effects:{体能:-15}, text:'你遭到了猛烈的抵抗，虽然突入了，但受了重伤。'}},
      {label:'潜行渗透', check:'敏捷', baseChance:50,
        success:{next:'ww2_s_redskull_02', effects:{敏捷:+5}, text:'你悄无声息地潜入了基地，找到了红骷髅的位置。'},
        fail:{next:'ww2_s_redskull_02', effects:{体能:-10}, text:'你被发现了，一番激战后才脱身。'}}
    ]
  },
  ww2_s_redskull_02: {
    era:'1944冬', title:'红骷髅',
    text:'你终于面对了红骷髅。他戴着红色的面具，眼中闪烁着疯狂的光芒。"美国队长，"他冷笑道，"你以为你能阻止我？"',
    choices:[
      {label:'"我不只是阻止你，我要终结你。"', check:'格斗', baseChance:40,
        success:{next:'ww2_s_ending_redskull_defeated', effects:{格斗:+8,意志:+10}, text:'你们展开了殊死搏斗。最终，你用盾牌击碎了他的武器，将他制服。', unlockAchievement:'击败红骷髅'},
        fail:{next:'ww2_s_ending_redskull_victor', effects:{}, text:'红骷髅的力量超出了你的想象。你被他打倒在地，意识渐渐模糊。'}},
      {label:'利用基地设备智取', check:'智力', baseChance:55,
        success:{next:'ww2_s_ending_redskull_defeated', effects:{智力:+8}, text:'你破坏了基地的能源系统，引发了爆炸。红骷髅被埋在了废墟之下。', unlockAchievement:'击败红骷髅'},
        fail:{next:'ww2_s_ending_redskull_victor', effects:{}, text:'你的计划出了差错，红骷髅抓住了机会。'}}
    ]
  },

  /* ---- 结局节点 ---- */
  ww2_s_ending_kia: {
    era:'1944', title:'战死沙场',
    text:'你倒在了欧洲的土地上，再也没有回家。你的名字被刻在了阵亡将士纪念碑上。你的家人收到了一份阵亡通知书和一枚紫心勋章。',
    choices:[], ending:'kia'
  },
  ww2_s_ending_warhero: {
    era:'1945', title:'战争英雄',
    text:'战争结束了。你活着回到了美国，胸前挂满了勋章。你不是超级士兵，但你是一个真正的英雄。人们在街头欢呼你的名字。',
    choices:[], ending:'war_hero', unlockAchievement:'战争英雄'
  },
  ww2_s_ending_redskull_defeated: {
    era:'1945', title:'传奇队长',
    text:'你击败了红骷髅，拯救了无数人的生命。你成为了真正的美国队长，一个时代的象征。战争结束后，你继续为正义而战，直到最后一次任务——你驾驶着载有炸弹的飞机坠入了北冰洋。',
    choices:[], ending:'captain_america', unlockAchievement:'传奇队长'
  },
  ww2_s_ending_redskull_victor: {
    era:'1944', title:'红骷髅的胜利',
    text:'红骷髅击败了你。他的武器最终被用于战争，造成了巨大的破坏。你成为了这场灾难中无数牺牲者之一。历史被改写了——但不是往好的方向。',
    choices:[], ending:'red_skull_victor'
  },

  /* ---- 其他出身的起始节点（简化版，保证流程跑通）---- */
  ww2_sc_001: {
    era:'1943春', title:'实验室助手',
    text:'你是厄斯金博士的助手，在布鲁克林的秘密实验室工作。超级士兵计划即将进入最后阶段，但你总觉得哪里不对。',
    choices:[
      {label:'检查实验设备，确保万无一失', check:'科技', baseChance:50,
        success:{next:'ww2_s_004', effects:{科技:+5,标记_候选:true}, text:'你发现了一个关键的设备参数问题并修正了它。厄斯金博士决定让你也参与候选。'},
        fail:{next:'ww2_s_combat_01', effects:{智力:+2}, text:'你没发现什么问题。实验按计划进行，但结果如何就看运气了。'}},
      {label:'研究血清配方，想办法优化', check:'智力', baseChance:40,
        success:{next:'ww2_s_004', effects:{智力:+5,科技:+3,标记_候选:true}, text:'你对配方提出了一个关键优化建议。厄斯金博士眼前一亮。'},
        fail:{next:'ww2_s_combat_01', effects:{}, text:'你的研究没有突破。只能按原计划进行。'}}
    ]
  },
  ww2_a_001: {
    era:'1943春', title:'特工任务',
    text:'你是战略科学预备队的特工。上级给了你一个任务——潜入九头蛇在欧洲的一个据点，收集情报。',
    choices:[
      {label:'伪装潜入', check:'魅力', baseChance:45,
        success:{next:'ww2_s_combat_02', effects:{魅力:+5,标记_九头蛇情报:true}, text:'你成功伪装成德军军官，混入了据点。'},
        fail:{next:'ww2_s_combat_01', effects:{体能:-5}, text:'你的伪装被识破，只能边打边撤。'}},
      {label:'夜间突袭', check:'敏捷', baseChance:50,
        success:{next:'ww2_s_combat_02', effects:{敏捷:+5}, text:'你在夜色的掩护下渗透了据点，拿到了情报。'},
        fail:{next:'ww2_s_combat_01', effects:{体能:-8}, text:'你被发现了，一番激战后逃脱。'}}
    ]
  },
  ww2_c_001: {
    era:'1943春', title:'布鲁克林的日常',
    text:'你是布鲁克林的一个普通市民。战争改变了一切——物资短缺、 rationing、身边的人一个个被征召。你必须想办法活下去。',
    choices:[
      {label:'去工厂工作，支持战争生产', check:null,
        next:'ww2_s_combat_01', effects:{智力:+3}, text:'你进了兵工厂，每天生产武器装备。虽然不上战场，但你也在为战争出力。'},
      {label:'想办法应征入伍', check:'体能', baseChance:30,
        success:{next:'ww2_s_001', effects:{体能:+3}, text:'你通过了征兵体检，即将成为一名士兵。'},
        fail:{next:'ww2_s_combat_01', effects:{}, text:'你没通过体检。只能继续留在后方。'}}
    ]
  }
};

/* ===== 结局定义 ===== */
var ENDINGS = {
  captain_america: {icon:'🇺🇸', title:'美国队长', rarity:'legendary', desc:'你取代了史蒂夫·罗杰斯，成为超级士兵计划的成功样本，击败红骷髅，成为时代传奇。'},
  serum_failure: {icon:'💉', title:'实验体 #002', rarity:'rare', desc:'血清在你体内失控，你成为了超级士兵计划的又一个失败样本。'},
  kia: {icon:'💀', title:'战死沙场', rarity:'common', desc:'你倒在了欧洲的土地上，名字被刻在阵亡将士纪念碑上。'},
  red_skull_victor: {icon:'💀', title:'红骷髅的胜利', rarity:'epic', desc:'你被红骷髅击败，他的武器造成了巨大破坏。历史被改写。'},
  survivor: {icon:'🏠', title:'幸存者', rarity:'common', desc:'你活过了战争，回到了家乡。虽然不是英雄，但你活着。'},
  hydra_infiltrator: {icon:'🐍', title:'九头蛇潜伏者', rarity:'epic', desc:'你发现了九头蛇的秘密，并决定潜入其中，从内部瓦解这个组织。'},
  war_hero: {icon:'🎖️', title:'战争英雄', rarity:'rare', desc:'你不是超级士兵，但你用勇气和智慧赢得了战争，成为了真正的英雄。'},
  frozen: {icon:'❄️', title:'冰封沉睡', rarity:'legendary', desc:'你为了拯救世界，驾驶载有炸弹的飞机坠入北冰洋，冰封了七十年。'}
};

/* ===== 成就定义 ===== */
var ACHIEVEMENTS = {
  '取代美国队长': {icon:'🛡️', desc:'取代史蒂夫·罗杰斯成为超级士兵'},
  '击败红骷髅': {icon:'💀', desc:'在最终决战中击败红骷髅'},
  '战争英雄': {icon:'🎖️', desc:'在二战中活下来并成为英雄'},
  '传奇队长': {icon:'⭐', desc:'达成美国队长传奇结局'},
  '先行者的代价': {icon:'💉', desc:'血清注射失败，成为实验体'},
  '诺曼底幸存者': {icon:'🌊', desc:'在诺曼底登陆中存活'},
  '九头蛇克星': {icon:'🐍', desc:'获取九头蛇情报并摧毁其基地'}
};
