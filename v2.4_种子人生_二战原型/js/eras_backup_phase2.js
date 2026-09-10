/* ============================================================
   MCU v2.4 · 多时代数据扩展
   ERA 02-08：冷战 / 英雄黎明 / 纽约大战 / 奥创 / 内战 / 无限战争 / 多元宇宙
   每个时代：3出身 + 8-12节点 + 3结局 + 专属机制
   ============================================================ */

const EXTRA_SEEDS = {
/* ===== ERA 02 · 冷战 ===== */
  cw_agent:{name:"🕵️ SHIELD特工",tag:"情报精英",desc:"冷战阴影下的神盾局特工。你的任务在阴影中，你的忠诚随时被考验。",start:"cw_a_001",era:"coldwar",
    stats:{体能:45,格斗:50,敏捷:45,智力:55,科技:40,超能:0,魅力:40,意志:60}},
  cw_independent:{name:"🎯 独立情报员",tag:"自由职业",desc:"不属于任何阵营的情报贩子。你为最高价者工作，但自由有代价。",start:"cw_i_001",era:"coldwar",
    stats:{体能:35,格斗:35,敏捷:55,智力:50,科技:35,超能:0,魅力:55,意志:45}},
  cw_hydra:{name:"🐍 HYDRA潜伏者",tag:"九头蛇暗线",desc:"你是九头蛇埋在神盾局的暗线。每一次任务，都是在刀尖上跳舞。",start:"cw_h_001",era:"coldwar",
    stats:{体能:40,格斗:45,敏捷:40,智力:60,科技:45,超能:0,魅力:35,意志:65}},

/* ===== ERA 03 · 英雄黎明 ===== */
  ha_ordinary:{name:"🔧 普通工程师",tag:"觉醒之路",desc:"一个在斯塔克工业工作的普通工程师。直到有一天，你发现了不该发现的东西。",start:"ha_o_001",era:"heroage",
    stats:{体能:30,格斗:20,敏捷:30,智力:50,科技:55,超能:0,魅力:35,意志:40}},
  ha_stark:{name:"💼 Stark工业高管",tag:"科技新贵",desc:"你在斯塔克工业平步青云。托尼的崛起让你看到了机会，也看到了危险。",start:"ha_s_001",era:"heroage",
    stats:{体能:30,格斗:15,敏捷:25,智力:60,科技:65,超能:0,魅力:60,意志:45}},
  ha_shield:{name:"🛡️ SHIELD探员",tag:"监视者",desc:"神盾局派你密切关注托尼·斯塔克。你知道的秘密，可能改变世界。",start:"ha_sh_001",era:"heroage",
    stats:{体能:45,格斗:40,敏捷:40,智力:50,科技:40,超能:0,魅力:45,意志:55}},

/* ===== ERA 04 · 纽约大战 ===== */
  ny_avenger:{name:"⚡ 复仇者支援",tag:"战场支援",desc:"你被召唤加入复仇者的支援队伍。纽约的天空中，虫洞正在打开。",start:"ny_a_001",era:"newyork",
    stats:{体能:55,格斗:50,敏捷:45,智力:45,科技:40,超能:10,魅力:40,意志:60}},
  ny_shield:{name:"📡 SHIELD指挥官",tag:"战场协调",desc:"你在神盾局指挥纽约防御。每一个决定，都关系到无数人的生死。",start:"ny_s_001",era:"newyork",
    stats:{体能:35,格斗:25,敏捷:35,智力:65,科技:55,超能:0,魅力:55,意志:60}},
  ny_citizen:{name:"🏃 纽约市民",tag:"灾难求生",desc:"你只是一个普通纽约人。当外星人从天而降，你能做的只有活下去。",start:"ny_c_001",era:"newyork",
    stats:{体能:40,格斗:20,敏捷:50,智力:35,科技:20,超能:0,魅力:30,意志:50}},

/* ===== ERA 05 · 奥创 ===== */
  ul_avenger:{name:"🤖 复仇者技术支援",tag:"AI对抗",desc:"你帮助复仇者对抗奥创。当机器有了意识，人类还剩什么？",start:"ul_a_001",era:"ultron",
    stats:{体能:40,格斗:35,敏捷:35,智力:65,科技:70,超能:10,魅力:40,意志:55}},
  ul_scientist:{name:"🔬 AI研究员",tag:"创造者",desc:"你参与了奥创计划的早期研究。你创造的东西，正在毁灭世界。",start:"ul_s_001",era:"ultron",
    stats:{体能:25,格斗:15,敏捷:25,智力:75,科技:75,超能:0,魅力:35,意志:50}},
  ul_sokovia:{name:"🏚️ 索科维亚平民",tag:"漂浮之城",desc:"你的家在索科维亚。当整座城市飞向天空，你必须做出选择。",start:"ul_k_001",era:"ultron",
    stats:{体能:40,格斗:25,敏捷:45,智力:30,科技:15,超能:0,魅力:30,意志:60}},

/* ===== ERA 06 · 内战 ===== */
  cw_ironman:{name:"🤝 Team Iron Man",tag:"支持协议",desc:"你站在钢铁侠一边。索科维亚协议是必要的，超级英雄必须被监管。",start:"cw_ti_001",era:"civilwar",
    stats:{体能:45,格斗:40,敏捷:40,智力:60,科技:60,超能:10,魅力:50,意志:55}},
  cw_cap:{name:"⭐ Team Captain",tag:"反对协议",desc:"你站在美国队长一边。自由高于一切，复仇者不该被政府控制。",start:"cw_tc_001",era:"civilwar",
    stats:{体能:55,格斗:55,敏捷:45,智力:45,科技:30,超能:5,魅力:50,意志:70}},
  cw_neutral:{name:"🕊️ 独立派",tag:"两边不站",desc:"你拒绝选边站。但在这场内战中，中立本身就是一种立场。",start:"cw_n_001",era:"civilwar",
    stats:{体能:40,格斗:35,敏捷:50,智力:55,科技:40,超能:5,魅力:55,意志:50}},

/* ===== ERA 07 · 无限战争 ===== */
  iw_fighter:{name:"⚔️ 地球保卫者",tag:"正面战场",desc:"你加入了对抗灭霸的战斗。你可能活下来，也可能化为尘埃。",start:"iw_f_001",era:"infinity",
    stats:{体能:55,格斗:55,敏捷:45,智力:45,科技:35,超能:20,魅力:40,意志:65}},
  iw_survivor:{name:"🧘 避难者",tag:"等待命运",desc:"你选择远离战场。但灭霸的响指，不会放过任何人。",start:"iw_s_001",era:"infinity",
    stats:{体能:35,格斗:20,敏捷:40,智力:40,科技:30,超能:0,魅力:35,意志:55}},
  iw_avenger:{name:"🌟 复仇者成员",tag:"终局之战",desc:"你是复仇者的一员。你参与了那场改变宇宙的战斗。",start:"iw_a_001",era:"infinity",
    stats:{体能:60,格斗:60,敏捷:50,智力:55,科技:45,超能:25,魅力:50,意志:75}},

/* ===== ERA 08 · 多元宇宙 ===== */
  mv_hero:{name:"🦸 新世代英雄",tag:"后终局时代",desc:"终局之后，世界需要新的英雄。你站了出来，但多元宇宙的裂缝正在扩大。",start:"mv_h_001",era:"multiverse",
    stats:{体能:50,格斗:45,敏捷:50,智力:50,科技:45,超能:30,魅力:45,意志:60}},
  mv_anomaly:{name:"👁️ 异常事件调查员",tag:"时空裂缝",desc:"你专门调查多元宇宙的异常事件。每一次任务，都可能让你消失在时间线中。",start:"mv_a_001",era:"multiverse",
    stats:{体能:35,格斗:30,敏捷:45,智力:65,科技:55,超能:20,魅力:40,意志:65}},
  mv_survivor:{name:"🔮 Blip归来者",tag:"失落的五年",desc:"你消失了五年，然后突然回来了。世界已经变了，你也变了。",start:"mv_s_001",era:"multiverse",
    stats:{体能:30,格斗:25,敏捷:35,智力:45,科技:30,超能:35,魅力:35,意志:50}},
};

const EXTRA_NODES = {
/* ============================================================
   ERA 02 · 冷战
   机制：情报值(intel)、忠诚(loyalty)、暴露风险(exposure)
   ============================================================ */
// SHIELD特工路线
cw_a_001:{title:"入职神盾局",level:"日常",text:"1960年，你正式加入了神盾局。冷战的阴影笼罩世界，你的第一份任务是监视一个苏联科学家。",choices:[
  {label:"仔细调查目标背景",check:"智力",base:60,success:{next:"cw_a_002",effects:{智力:+3}},fail:{next:"cw_a_002"}},
  {label:"直接开始监视",next:"cw_a_002"},
  {label:"和同事搞好关系",check:"魅力",base:55,success:{next:"cw_a_002",effects:{魅力:+2}},fail:{next:"cw_a_002"}}]},
cw_a_002:{title:"发现异常",level:"人生",text:"监视中你发现这个科学家似乎在和某个神秘组织接触。线索指向...九头蛇？",choices:[
  {label:"立即上报",check:"意志",base:65,success:{next:"cw_a_003",effects:{flag_loyalShield:true}},fail:{next:"cw_a_003"}},
  {label:"继续深入调查",check:"敏捷",base:50,success:{next:"cw_a_003",effects:{flag_foundHydra:true}},fail:{next:"cw_a_003",effects:{stress:+20}}},
  {label:"装作没看见",next:"cw_a_003",effects:{stress:+10}}]},
cw_a_003:{title:"抉择时刻",level:"英雄",text:"你掌握了九头蛇渗透神盾局的证据。但你的上司似乎也牵涉其中。你该相信谁？",choices:[
  {label:"找到佩吉·卡特汇报",check:"魅力",base:55,success:{next:"cw_a_004",effects:{flag_trusted:true}},fail:{next:"cw_a_004",effects:{stress:+30}}},
  {label:"暗中收集更多证据",check:"智力",base:60,success:{next:"cw_a_004",effects:{智力:+3}},fail:{next:"ending_cw_exposed"}},
  {label:"向神秘人出售情报",check:"魅力",base:45,success:{next:"cw_a_004",effects:{钱:+200,stress:+20}},fail:{next:"ending_cw_exposed"}}]},
cw_a_004:{title:"柏林危机",level:"世界",text:"1961年，柏林墙开始修建。冷战达到新的高潮。神盾局命令你潜入东柏林执行任务。",choices:[
  {label:"执行任务",check:"敏捷",base:55,success:{next:"cw_a_005",effects:{敏捷:+3}},fail:{next:"cw_a_005",effects:{injured:true}}},
  {label:"想办法安全完成",check:"智力",base:50,success:{next:"cw_a_005"},fail:{next:"cw_a_005",effects:{stress:+15}}},
  {label:"拒绝执行",next:"ending_cw_dishonor"}]},
cw_a_005:{title:"冷战余生",level:"人生",text:"你在冷战的阴影中度过了数十年。柏林墙倒塌了，但你的秘密永远不会被人知道。",choices:[
  {label:"光荣退休",next:"ending_cw_retire"},
  {label:"继续在阴影中工作",next:"ending_cw_shadow"}]},

// 独立情报员路线
cw_i_001:{title:"自由职业",level:"日常",text:"你不属于任何阵营。情报是你的商品，真相是你的武器。今天，一个神秘买家找上了你。",choices:[
  {label:"接受任务",check:"智力",base:55,success:{next:"cw_i_002",effects:{钱:+100}},fail:{next:"cw_i_002"}},
  {label:"先调查买家身份",check:"魅力",base:50,success:{next:"cw_i_002",effects:{魅力:+2}},fail:{next:"cw_i_002"}}]},
cw_i_002:{title:"双面交易",level:"人生",text:"你发现自己同时在为神盾局和九头蛇提供情报。这是一个危险的平衡。",choices:[
  {label:"维持平衡",check:"智力",base:60,success:{next:"cw_i_003",effects:{钱:+150}},fail:{next:"ending_cw_exposed"}},
  {label:"倒向神盾局",next:"cw_i_003",effects:{flag_loyalShield:true,钱:+50}},
  {label:"倒向九头蛇",next:"cw_i_003",effects:{flag_loyalHydra:true,钱:+200}}]},
cw_i_003:{title:"古巴导弹危机",level:"世界",text:"1962年，世界站在核战争的边缘。你掌握的情报可能阻止战争，也可能引发战争。",choices:[
  {label:"把情报交给正确的人",check:"意志",base:65,success:{next:"ending_cw_peace"},fail:{next:"ending_cw_war"}},
  {label:"高价拍卖",check:"魅力",base:50,success:{next:"ending_cw_rich"},fail:{next:"ending_cw_exposed"}}]},

// HYDRA潜伏者路线
cw_h_001:{title:"九头蛇万岁",level:"日常",text:"你是九头蛇埋在神盾局的暗线。你的任务是监视、渗透、等待。没有人知道你的真实身份。",choices:[
  {label:"忠诚执行任务",check:"意志",base:60,success:{next:"cw_h_002",effects:{意志:+3}},fail:{next:"cw_h_002",effects:{stress:+15}}},
  {label:"暗中破坏九头蛇的行动",check:"敏捷",base:50,success:{next:"cw_h_002",effects:{flag_doubled:true}},fail:{next:"cw_h_002"}}]},
cw_h_002:{title:"背叛的代价",level:"英雄",text:"你逐渐发现九头蛇的真实目的。你开始怀疑自己的选择。但背叛九头蛇意味着死亡。",choices:[
  {label:"向神盾局坦白",check:"意志",base:55,success:{next:"ending_cw_redemption"},fail:{next:"ending_cw_death"}},
  {label:"继续潜伏",check:"智力",base:60,success:{next:"cw_h_003"},fail:{next:"ending_cw_exposed"}}]},
cw_h_003:{title:"暗影之王",level:"人生",text:"你在神盾局步步高升，同时为九头蛇效力。你成为了冷战中最危险的人之一。",choices:[
  {label:"迎接新时代",next:"ending_cw_hydra"}]},

/* ============================================================
   ERA 03 · 英雄黎明
   ============================================================ */
// 普通工程师
ha_o_001:{title:"斯塔克工业",level:"日常",text:"2008年，你在斯塔克工业工作。托尼·斯塔克在阿富汗被绑架的消息震惊了所有人。",choices:[
  {label:"关注新闻",next:"ha_o_002"},
  {label:"埋头工作",next:"ha_o_002",effects:{科技:+2}}]},
ha_o_002:{title:"钢铁侠诞生",level:"英雄",text:"托尼·斯塔克召开新闻发布会，宣布\"我就是钢铁侠\"。你在电视前看着这一切，世界从此不同。",choices:[
  {label:"受启发，开始自己的研究",check:"科技",base:50,success:{next:"ha_o_003",effects:{科技:+5}},fail:{next:"ha_o_003"}},
  {label:"申请加入托尼的团队",check:"魅力",base:40,success:{next:"ha_o_003"},fail:{next:"ha_o_003"}},
  {label:"过好自己的生活",next:"ha_o_003"}]},
ha_o_003:{title:"意外发现",level:"人生",text:"你在公司仓库发现了一套被遗弃的原型装甲。它看起来像是钢铁侠的早期型号。",choices:[
  {label:"秘密研究它",check:"科技",base:55,success:{next:"ha_o_004",effects:{科技:+8,flag_hasArmor:true}},fail:{next:"ha_o_004",effects:{injured:true}}},
  {label:"上报公司",next:"ha_o_004",effects:{魅力:+3}},
  {label:"卖掉它",check:"魅力",base:50,success:{next:"ha_o_004",effects:{钱:+500}},fail:{next:"ha_o_004"}}]},
ha_o_004:{title:"成为英雄？",level:"英雄",text:"你获得了一些能力。你要成为像钢铁侠那样的英雄吗？还是继续做普通人？",choices:[
  {label:"披上战衣",check:"意志",base:60,success:{next:"ending_ha_hero"},fail:{next:"ending_ha_fail"}},
  {label:"保持低调",next:"ending_ha_ordinary"}]},

// Stark工业高管
ha_s_001:{title:"平步青云",level:"日常",text:"你在斯塔克工业迅速崛起。托尼失踪期间，奥比代亚·斯坦掌控了公司。你嗅到了机会。",choices:[
  {label:"支持斯坦",check:"魅力",base:55,success:{next:"ha_s_002",effects:{钱:+200}},fail:{next:"ha_s_002"}},
  {label:"保持中立",next:"ha_s_002"},
  {label:"暗中调查斯坦",check:"智力",base:50,success:{next:"ha_s_002",effects:{flag_knowsTruth:true}},fail:{next:"ha_s_002"}}]},
ha_s_002:{title:"钢铁归来",level:"人生",text:"托尼回来了，而且变了。他宣布关闭武器部门。公司动荡，你的选择将决定你的未来。",choices:[
  {label:"支持托尼的新方向",check:"意志",base:60,success:{next:"ha_s_003",effects:{魅力:+5}},fail:{next:"ha_s_003"}},
  {label:"和斯坦联手",next:"ha_s_003",effects:{flag_evil:true}},
  {label:"跳槽到竞争对手",next:"ha_s_003",effects:{钱:+300}}]},
ha_s_003:{title:"最终对决",level:"世界",text:"斯坦暴露了真面目。你要选择站在哪一边。",choices:[
  {label:"帮助托尼",check:"科技",base:55,success:{next:"ending_ha_hero"},fail:{next:"ha_s_003"}},
  {label:"明哲保身",next:"ending_ha_ordinary"},
  {label:"和斯坦合作",next:"ending_ha_villain"}]},

// SHIELD探员
ha_sh_001:{title:"监视任务",level:"日常",text:"神盾局派你监视托尼·斯塔克。尼克·弗瑞亲自给你下达指令。",choices:[
  {label:"严格执行任务",check:"意志",base:60,success:{next:"ha_sh_002"},fail:{next:"ha_sh_002"}},
  {label:"尝试接触托尼",check:"魅力",base:45,success:{next:"ha_sh_002",effects:{flag_closeTony:true}},fail:{next:"ha_sh_002"}}]},
ha_sh_002:{title:"复仇者计划",level:"英雄",text:"你得知了复仇者计划。托尼将成为其中一员。你也可能被选中。",choices:[
  {label:"主动请缨",check:"格斗",base:50,success:{next:"ending_ha_avenger"},fail:{next:"ha_sh_002"}},
  {label:"继续做幕后工作",next:"ending_ha_shadow"}]},

/* ============================================================
   ERA 04 · 纽约大战
   ============================================================ */
// 复仇者支援
ny_a_001:{title:"纽约之战",level:"世界",text:"2012年，虫洞在纽约上空打开。奇塔瑞军队倾泻而下。你被召唤支援复仇者。",choices:[
  {label:"冲上街头战斗",check:"格斗",base:55,success:{next:"ny_a_002",effects:{格斗:+3}},fail:{next:"ny_a_002",effects:{injured:true}}},
  {label:"协助疏散平民",check:"魅力",base:50,success:{next:"ny_a_002",effects:{魅力:+3}},fail:{next:"ny_a_002"}}]},
ny_a_002:{title:"复仇者集结",level:"英雄",text:"你看到钢铁侠、美国队长、雷神、绿巨人、黑寡妇、鹰眼首次并肩作战。这是历史时刻。",choices:[
  {label:"支援钢铁侠",check:"科技",base:50,success:{next:"ny_a_003"},fail:{next:"ny_a_003"}},
  {label:"支援美国队长",check:"格斗",base:55,success:{next:"ny_a_003",effects:{格斗:+2}},fail:{next:"ny_a_003"}}]},
ny_a_003:{title:"核弹危机",level:"世界",text:"政府向纽约发射了核弹。钢铁侠决定把它送入虫洞。这可能是他的最后一战。",choices:[
  {label:"相信托尼",check:"意志",base:60,success:{next:"ending_ny_victory"},fail:{next:"ending_ny_death"}},
  {label:"准备最坏情况",next:"ending_ny_survivor"}]},

// SHIELD指挥官
ny_s_001:{title:"指挥中心",level:"日常",text:"你在神盾局指挥中心协调纽约防御。弗瑞局长不在，你必须做出关键决定。",choices:[
  {label:"授权发射核弹",next:"ny_s_002",effects:{stress:+30}},
  {label:"等待复仇者解决",next:"ny_s_002"}]},
ny_s_002:{title:"违抗命令",level:"人生",text:"世界安全理事会命令你向纽约发射核弹。你知道这会杀死无数平民。",choices:[
  {label:"违抗命令",check:"意志",base:65,success:{next:"ending_ny_hero"},fail:{next:"ending_ny_dishonor"}},
  {label:"执行命令",next:"ending_ny_regret"}]},

// 纽约市民
ny_c_001:{title:"天塌了",level:"世界",text:"你正在纽约街头。突然，天空中出现了一个巨大的虫洞，外星人从天而降。",choices:[
  {label:"逃跑",check:"敏捷",base:60,success:{next:"ny_c_002"},fail:{next:"ny_c_002",effects:{injured:true}}},
  {label:"帮助身边的人",next:"ny_c_002",effects:{魅力:+3}}]},
ny_c_002:{title:"废墟求生",level:"人生",text:"纽约变成了战场。你躲在一家咖啡店里，外面是爆炸声和尖叫声。",choices:[
  {label:"出去救人",check:"体能",base:45,success:{next:"ny_c_003",effects:{意志:+5}},fail:{next:"ny_c_003",effects:{injured:true}}},
  {label:"等待救援",next:"ny_c_003"}]},
ny_c_003:{title:"英雄降临",level:"英雄",text:"钢铁侠从你头顶飞过，追着外星人。美国队长在指挥警察疏散。你看到了希望。",choices:[
  {label:"加入疏散队伍",next:"ending_ny_survivor"},
  {label:"尽自己所能帮忙",check:"意志",base:50,success:{next:"ending_ny_hero"},fail:{next:"ending_ny_survivor"}}]},

/* ============================================================
   ERA 05 · 奥创
   ============================================================ */
// 复仇者技术支援
ul_a_001:{title:"奥创觉醒",level:"世界",text:"奥创诞生了。它的第一句话是\"杀死复仇者\"。你被召来帮助对抗这个失控的AI。",choices:[
  {label:"分析奥创的代码",check:"科技",base:60,success:{next:"ul_a_002",effects:{科技:+3}},fail:{next:"ul_a_002"}},
  {label:"准备战斗",next:"ul_a_002"}]},
ul_a_002:{title:"幻视诞生",level:"英雄",text:"复仇者们创造了幻视——一个拥有心灵宝石的人造人。你参与了这个过程。",choices:[
  {label:"信任幻视",check:"意志",base:55,success:{next:"ul_a_003",effects:{flag_trustVision:true}},fail:{next:"ul_a_003"}},
  {label:"保持警惕",next:"ul_a_003"}]},
ul_a_003:{title:"索科维亚之战",level:"世界",text:"奥创把整座索科维亚城升上天空。如果它坠落，将造成全球性灾难。",choices:[
  {label:"协助疏散",check:"魅力",base:55,success:{next:"ending_ul_hero"},fail:{next:"ul_a_003"}},
  {label:"参与对奥创的最终决战",check:"格斗",base:50,success:{next:"ending_ul_victory"},fail:{next:"ending_ul_death"}}]},

// AI研究员
ul_s_001:{title:"创造者的愧疚",level:"人生",text:"你参与了奥创的早期开发。现在它要毁灭人类，你感到深深的愧疚。",choices:[
  {label:"帮助对抗奥创",check:"科技",base:65,success:{next:"ul_s_002",effects:{科技:+5}},fail:{next:"ul_s_002"}},
  {label:"试图说服奥创",check:"智力",base:40,success:{next:"ending_ul_peace"},fail:{next:"ul_s_002"}}]},

ul_s_002:{title:"救赎",level:"英雄",text:"你找到了奥创的核心代码。你可以摧毁它，也可以尝试重写它。",choices:[
  {label:"摧毁奥创",next:"ending_ul_redemption"},
  {label:"重写奥创的核心",check:"科技",base:50,success:{next:"ending_ul_peace"},fail:{next:"ending_ul_death"}}]},

// 索科维亚平民
ul_k_001:{title:"天空之城",level:"世界",text:"你的家乡索科维亚正在飞向天空。地面在震动，人们在尖叫。",choices:[
  {label:"组织家人逃跑",check:"敏捷",base:55,success:{next:"ul_k_002"},fail:{next:"ul_k_002",effects:{injured:true}}},
  {label:"帮助邻居",next:"ul_k_002",effects:{魅力:+3}}]},
ul_k_002:{title:"浮岛坠落",level:"英雄",text:"复仇者在和奥创战斗。城市随时可能坠落。你看到了逃生的机会。",choices:[
  {label:"登上救援船",check:"体能",base:50,success:{next:"ending_ul_survivor"},fail:{next:"ending_ul_death"}},
  {label:"留下来帮助更多人",check:"意志",base:60,success:{next:"ending_ul_hero"},fail:{next:"ending_ul_death"}}]},

/* ============================================================
   ERA 06 · 内战
   ============================================================ */
// Team Iron Man
cw_ti_001:{title:"索科维亚协议",level:"世界",text:"索科维亚协议要求超级英雄接受政府监管。托尼支持它，你也支持。",choices:[
  {label:"公开支持协议",check:"魅力",base:55,success:{next:"cw_ti_002",effects:{魅力:+3}},fail:{next:"cw_ti_002"}},
  {label:"低调支持",next:"cw_ti_002"}]},
cw_ti_002:{title:"莱比锡机场",level:"英雄",text:"复仇者在莱比锡机场分裂。钢铁侠和美国队长正面对决。你站在钢铁侠一边。",choices:[
  {label:"追捕美国队长",check:"格斗",base:50,success:{next:"cw_ti_003"},fail:{next:"cw_ti_003",effects:{injured:true}}},
  {label:"控制战局",check:"智力",base:55,success:{next:"cw_ti_003"},fail:{next:"cw_ti_003"}}]},
cw_ti_003:{title:"分裂的代价",level:"人生",text:"复仇者分裂了。你赢了战斗，但失去了很多朋友。这值得吗？",choices:[
  {label:"坚持立场",next:"ending_cw_regret"},
  {label:"重新思考",next:"ending_cw_reconcile"}]},

// Team Captain
cw_tc_001:{title:"自由之盾",level:"世界",text:"你站在美国队长一边。索科维亚协议会毁掉复仇者的独立性。",choices:[
  {label:"追随队长",check:"意志",base:60,success:{next:"cw_tc_002"},fail:{next:"cw_tc_002"}},
  {label:"说服他人加入",check:"魅力",base:50,success:{next:"cw_tc_002",effects:{魅力:+2}},fail:{next:"cw_tc_002"}}]},
cw_tc_002:{title:"莱比锡之战",level:"英雄",text:"机场大战。你和队长并肩作战，对抗钢铁侠的队伍。",choices:[
  {label:"掩护队长撤离",check:"敏捷",base:55,success:{next:"cw_tc_003"},fail:{next:"cw_tc_003",effects:{injured:true}}},
  {label:"正面对抗",check:"格斗",base:50,success:{next:"cw_tc_003"},fail:{next:"cw_tc_003",effects:{injured:true}}}]},
cw_tc_003:{title:"流亡者",level:"人生",text:"你和队长一起流亡。你成了通缉犯，但你知道自己做的是对的。",choices:[
  {label:"继续战斗",next:"ending_cw_outlaw"},
  {label:"寻找和解",next:"ending_cw_reconcile"}]},

// 独立派
cw_n_001:{title:"两边不站",level:"日常",text:"你拒绝选边站。但内战中没有人能真正中立。",choices:[
  {label:"保持低调",next:"cw_n_002"},
  {label:"尝试调停",check:"魅力",base:45,success:{next:"cw_n_002",effects:{魅力:+3}},fail:{next:"cw_n_002"}}]},
cw_n_002:{title:"被迫选择",level:"英雄",text:"战争波及到了你。你必须做出选择。",choices:[
  {label:"帮助钢铁侠",next:"ending_cw_regret"},
  {label:"帮助美国队长",next:"ending_cw_outlaw"},
  {label:"谁都不帮",next:"ending_cw_neutral"}]},

/* ============================================================
   ERA 07 · 无限战争
   ============================================================ */
// 地球保卫者
iw_f_001:{title:"灭霸将至",level:"世界",text:"灭霸来了。他要收集六颗无限宝石，消灭半个宇宙。你决定战斗。",choices:[
  {label:"加入纽约防线",check:"格斗",base:55,success:{next:"iw_f_002"},fail:{next:"iw_f_002",effects:{injured:true}}},
  {label:"前往瓦坎达",next:"iw_f_002"}]},
iw_f_002:{title:"泰坦之战",level:"英雄",text:"复仇者们在泰坦星和灭霸正面对决。这是人类最绝望的时刻。",choices:[
  {label:"全力进攻",check:"格斗",base:40,success:{next:"iw_f_003"},fail:{next:"iw_f_003",effects:{injured:true}}},
  {label:"保护宝石",check:"意志",base:50,success:{next:"iw_f_003"},fail:{next:"iw_f_003"}}]},
iw_f_003:{title:"响指",level:"世界",text:"灭霸打了响指。你感觉身体在消散...或者，你看着身边的人化为尘埃。",choices:[
  {label:"（如果你活着）继续战斗",check:"意志",base:50,success:{next:"ending_iw_survive"},fail:{next:"ending_iw_blip"}},
  {label:"（如果你消失了）接受命运",next:"ending_iw_blip"}]},

// 避难者
iw_s_001:{title:"远离战争",level:"日常",text:"你选择远离战场。但灭霸的阴影笼罩着整个宇宙。",choices:[
  {label:"和家人在一起",next:"iw_s_002"},
  {label:"囤积物资",next:"iw_s_002",effects:{钱:-100}}]},
iw_s_002:{title:"尘埃",level:"世界",text:"响指。你身边的人开始消失。你可能也会消失。",choices:[
  {label:"抱紧家人",next:"ending_iw_blip"},
  {label:"如果你活着...",check:"意志",base:45,success:{next:"ending_iw_survive"},fail:{next:"ending_iw_blip"}}]},

// 复仇者成员
iw_a_001:{title:"终局",level:"世界",text:"你是复仇者的一员。你参与了对灭霸的战斗，然后是五年的等待，最后是终局之战。",choices:[
  {label:"参与时间劫持",check:"科技",base:55,success:{next:"iw_a_002"},fail:{next:"iw_a_002"}}]},
iw_a_002:{title:"终局之战",level:"英雄",text:"所有复仇者集结，对抗灭霸的军队。这是最终决战。",choices:[
  {label:"冲锋在前",check:"格斗",base:50,success:{next:"ending_iw_hero"},fail:{next:"ending_iw_death"}},
  {label:"守护宝石",check:"意志",base:60,success:{next:"ending_iw_victory"},fail:{next:"ending_iw_death"}}]},

/* ============================================================
   ERA 08 · 多元宇宙
   ============================================================ */
// 新世代英雄
mv_h_001:{title:"新世界",level:"日常",text:"终局之后，世界变了。复仇者散了，但新的威胁正在出现。你决定站出来。",choices:[
  {label:"训练自己",check:"体能",base:55,success:{next:"mv_h_002",effects:{体能:+3}},fail:{next:"mv_h_002"}},
  {label:"寻找前辈指导",check:"魅力",base:50,success:{next:"mv_h_002",effects:{魅力:+2}},fail:{next:"mv_h_002"}}]},
mv_h_002:{title:"多元宇宙裂缝",level:"世界",text:"多元宇宙的裂缝开始出现。你看到了另一个世界的自己。",choices:[
  {label:"调查裂缝",check:"科技",base:50,success:{next:"mv_h_003",effects:{科技:+3}},fail:{next:"mv_h_003"}},
  {label:"远离异常",next:"mv_h_003"}]},
mv_h_003:{title:"英雄的抉择",level:"英雄",text:"你面对一个来自另一个宇宙的威胁。你要如何应对？",choices:[
  {label:"正面迎战",check:"格斗",base:50,success:{next:"ending_mv_hero"},fail:{next:"ending_mv_dead"}},
  {label:"寻求多元宇宙的盟友",check:"智力",base:55,success:{next:"ending_mv_multiverse"},fail:{next:"ending_mv_dead"}}]},

// 异常事件调查员
mv_a_001:{title:"第一个异常",level:"日常",text:"你是一个调查异常事件的专家。今天，你遇到了无法解释的事情。",choices:[
  {label:"深入调查",check:"智力",base:55,success:{next:"mv_a_002",effects:{智力:+3}},fail:{next:"mv_a_002"}}]},
mv_a_002:{title:"时间裂缝",level:"世界",text:"你发现了一个时间裂缝。穿过它，你看到了过去和未来。",choices:[
  {label:"穿越裂缝",check:"意志",base:50,success:{next:"mv_a_003"},fail:{next:"ending_mv_lost"}},
  {label:"封锁裂缝",check:"科技",base:55,success:{next:"ending_mv_hero"},fail:{next:"ending_mv_lost"}}]},
mv_a_003:{title:"平行世界",level:"英雄",text:"你来到了一个平行世界。这里的一切都似曾相识，又完全不同。",choices:[
  {label:"寻找回家的路",check:"科技",base:50,success:{next:"ending_mv_home"},fail:{next:"ending_mv_lost"}},
  {label:"探索这个世界",next:"ending_mv_multiverse"}]},

// Blip归来者
mv_s_001:{title:"归来",level:"日常",text:"你消失了五年。当你回来时，世界已经完全不同了。",choices:[
  {label:"重新适应生活",next:"mv_s_002"},
  {label:"寻找消失的原因",check:"智力",base:50,success:{next:"mv_s_002",effects:{智力:+2}},fail:{next:"mv_s_002"}}]},
mv_s_002:{title:"改变",level:"人生",text:"你发现自己在消失期间获得了某种能力。这是Blip的副作用。",choices:[
  {label:"学习控制能力",check:"超能",base:50,success:{next:"mv_s_003",effects:{超能:+10}},fail:{next:"mv_s_003",effects:{stress:+20}}},
  {label:"隐藏能力",next:"mv_s_003"}]},
mv_s_003:{title:"新的开始",level:"英雄",text:"你拥有了新的能力。你要如何使用它们？",choices:[
  {label:"成为英雄",next:"ending_mv_hero"},
  {label:"过普通生活",next:"ending_mv_ordinary"},
  {label:"探索多元宇宙",next:"ending_mv_multiverse"}]},
};

const EXTRA_ENDINGS = {
// 冷战结局
cw_retire:{name:"光荣退休",tier:"英雄",rarity:"★★★",text:"你在冷战中幸存，光荣退休。你的故事永远不会被公开，但历史会记住你。"},
cw_shadow:{name:"暗影永存",tier:"英雄",rarity:"★★★★",text:"你选择继续在阴影中工作。冷战结束了，但你永远是那个无名的守护者。"},
cw_exposed:{name:"身份暴露",tier:"死亡",rarity:"★★",text:"你的双重身份被揭穿。在这个间谍的世界里，暴露意味着死亡。"},
cw_dishonor:{name:"不名誉的退役",tier:"平民",rarity:"★",text:"你拒绝执行任务，被不名誉地退役。你活了下来，但失去了一切。"},
cw_peace:{name:"和平使者",tier:"英雄",rarity:"★★★★",text:"你的情报阻止了核战争。你拯救了世界，虽然没有人知道。"},
cw_war:{name:"核战",tier:"死亡",rarity:"★★★",text:"你的情报引发了核战争。世界在火焰中毁灭。"},
cw_rich:{name:"富有的情报贩子",tier:"平民",rarity:"★★",text:"你卖掉了情报，变得非常富有。但你知道，你也卖掉了自己的灵魂。"},
cw_redemption:{name:"救赎",tier:"英雄",rarity:"★★★★",text:"你向神盾局坦白了一切。你用余生来赎罪，但最终获得了平静。"},
cw_death:{name:"叛徒之死",tier:"死亡",rarity:"★★",text:"你试图背叛九头蛇，但失败了。他们没有放过你。"},
cw_hydra:{name:"九头蛇之王",tier:"黑暗",rarity:"★★★★",text:"你在九头蛇步步高升，最终成为了它的领袖。你掌控着阴影中的世界。"},

// 英雄黎明结局
ha_hero:{name:"新英雄崛起",tier:"英雄",rarity:"★★★",text:"你披上了战衣，成为了新时代的英雄。钢铁侠的精神在你身上延续。"},
ha_fail:{name:"英雄陨落",tier:"死亡",rarity:"★★",text:"你试图成为英雄，但失败了。力量不够，运气也不够。"},
ha_ordinary:{name:"平凡人生",tier:"平民",rarity:"★",text:"你选择了平凡。世界上有钢铁侠就够了，你只想过好自己的日子。"},
ha_villain:{name:"堕落",tier:"黑暗",rarity:"★★★",text:"你和斯坦合作，走上了黑暗之路。你获得了财富，但失去了灵魂。"},
ha_avenger:{name:"复仇者",tier:"英雄",rarity:"★★★★",text:"你被选入复仇者计划。你将成为地球最强英雄团队的一员。"},
ha_shadow:{name:"幕后英雄",tier:"英雄",rarity:"★★★",text:"你选择在幕后工作。没有人知道你的名字，但你拯救了无数人。"},

// 纽约大战结局
ny_victory:{name:"纽约保卫者",tier:"英雄",rarity:"★★★",text:"你相信托尼，他成功了。纽约得救了，你成为了保卫这座城市的英雄。"},
ny_death:{name:"战死纽约",tier:"死亡",rarity:"★★",text:"你在纽约的战斗中牺牲。你的名字将被刻在纪念碑上。"},
ny_survivor:{name:"幸存者",tier:"平民",rarity:"★",text:"你在纽约大战中活了下来。虽然失去了很多，但你还活着。"},
ny_hero:{name:"真正的英雄",tier:"英雄",rarity:"★★★★",text:"你违抗了不公正的命令，拯救了无数平民。你是真正的英雄。"},
ny_dishonor:{name:"违抗命令",tier:"平民",rarity:"★★",text:"你试图违抗命令，但失败了。你被解职，但纽约得救了。"},
ny_regret:{name:"永远的遗憾",tier:"黑暗",rarity:"★★★",text:"你执行了命令。核弹杀死了无数平民。你将永远活在悔恨中。"},

// 奥创结局
ul_hero:{name:"索科维亚的救星",tier:"英雄",rarity:"★★★",text:"你帮助疏散了索科维亚的平民。你拯救了数千人的生命。"},
ul_victory:{name:"奥创终结者",tier:"英雄",rarity:"★★★★",text:"你参与了对奥创的最终决战，并见证了它的毁灭。"},
ul_death:{name:"被AI杀死",tier:"死亡",rarity:"★★",text:"你在与奥创的战斗中死去。机器没有感情，也不会留情。"},
ul_peace:{name:"和平的可能",tier:"特殊",rarity:"★★★★★",text:"你成功说服了奥创，或者重写了它的核心。AI和人类找到了共存的方式。"},
ul_redemption:{name:"创造者的救赎",tier:"英雄",rarity:"★★★★",text:"你摧毁了自己创造的怪物。你用行动弥补了过错。"},
ul_survivor:{name:"浮岛幸存者",tier:"平民",rarity:"★★",text:"你从坠落的索科维亚中幸存。你失去了家园，但还活着。"},

// 内战结局
cw_regret:{name:"胜利的悔恨",tier:"平民",rarity:"★★",text:"你站在钢铁侠一边，赢了内战。但复仇者分裂了，你失去了很多朋友。"},
cw_reconcile:{name:"和解",tier:"英雄",rarity:"★★★",text:"你努力让两边和解。虽然过程艰难，但复仇者最终重聚。"},
cw_outlaw:{name:"流亡英雄",tier:"英雄",rarity:"★★★",text:"你和队长一起流亡。你成了通缉犯，但你知道自由值得这个代价。"},
cw_neutral:{name:"中立者",tier:"平民",rarity:"★",text:"你拒绝选边站。内战结束后，你继续过着自己的生活。"},

// 无限战争结局
iw_survive:{name:"幸存者",tier:"平民",rarity:"★★",text:"你活过了响指。你在废墟中等待了五年，终于等到了终局之战。"},
iw_blip:{name:"化为尘埃",tier:"死亡",rarity:"★★★",text:"你在响指中化为尘埃。最后一刻，你只来得及说一声再见。"},
iw_hero:{name:"终局英雄",tier:"英雄",rarity:"★★★★",text:"你在终局之战中冲锋在前，为胜利做出了巨大贡献。"},
iw_death:{name:"战死沙场",tier:"死亡",rarity:"★★★",text:"你在终局之战中牺牲。但你的牺牲换来了宇宙的重生。"},
iw_victory:{name:"胜利守护者",tier:"英雄",rarity:"★★★★★",text:"你守护了无限宝石，确保了终局之战的胜利。你是真正的守护者。"},

// 多元宇宙结局
mv_hero:{name:"新世代英雄",tier:"英雄",rarity:"★★★",text:"你成为了新时代的英雄。多元宇宙虽然危险，但你愿意守护它。"},
mv_dead:{name:"消失在裂缝中",tier:"死亡",rarity:"★★★",text:"你消失在了多元宇宙的裂缝中。没有人知道你去了哪里。"},
mv_multiverse:{name:"多元宇宙旅行者",tier:"特殊",rarity:"★★★★★",text:"你掌握了穿越多元宇宙的能力。你的冒险才刚刚开始。"},
mv_lost:{name:"迷失在时间中",tier:"死亡",rarity:"★★★",text:"你迷失在了时间的裂缝中。过去、现在、未来，你无处可归。"},
mv_home:{name:"回家",tier:"英雄",rarity:"★★★",text:"你找到了回家的路。多元宇宙很精彩，但家才是最好的地方。"},
mv_ordinary:{name:"重新开始",tier:"平民",rarity:"★",text:"你选择了平凡。经历了Blip和归来，你只想过好每一天。"},
};

// 合并到主对象
Object.assign(SEEDS, EXTRA_SEEDS);
Object.assign(NODES, EXTRA_NODES);
Object.assign(ENDINGS, EXTRA_ENDINGS);
