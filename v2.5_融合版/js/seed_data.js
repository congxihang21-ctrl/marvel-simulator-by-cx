/* v2.5 seed data - mapped to v2.3 english keys */
let NODES = {
/* ===== 士兵路线 ===== */
ww2_s_001:{title:"入伍",level:"日常",text:"你站在征兵办公室里。1943年的春天，战争还在继续。你签下了名字，成为了美国陆军的一名步兵。",choices:[
  {label:"满怀热血，准备战斗",next:"ww2_s_002"},
  {label:"有点害怕，但还是上了",next:"ww2_s_002",effects:{wil:+3}},
  {label:"先打听一下部队情况",next:"ww2_s_002",effects:{cha:+2}}]},
ww2_s_002:{title:"新兵营",level:"日常",text:"六周的基础训练。每天凌晨五点起床，跑步、射击、匍匐前进。你的身体在变硬，心也在变硬。",choices:[
  {label:"全力以赴训练",check:"str",base:60,success:{next:"ww2_s_003",effects:{str:+5,cbt:+3}},fail:{next:"ww2_s_003",effects:{str:+2,injured:true}}},
  {label:"和战友搞好关系",check:"cha",base:55,success:{next:"ww2_s_003",effects:{cha:+3,rel_bucky:15}},fail:{next:"ww2_s_003"}},
  {label:"保持中等水平",next:"ww2_s_003",effects:{str:+2}}]},
ww2_s_003:{title:"认识巴基",level:"人生",text:"训练间隙，一个叫巴基的中士走过来拍了拍你的肩。\"嘿，新兵，听说你布鲁克林来的？我也是。\"",choices:[
  {label:"热情地打招呼",check:"cha",base:65,success:{next:"ww2_s_004",effects:{rel_bucky:20,cha:+2}},fail:{next:"ww2_s_004",effects:{rel_bucky:5}}},
  {label:"礼貌但保持距离",next:"ww2_s_004",effects:{rel_bucky:8}},
  {label:"问问他认不认识史蒂夫·罗杰斯",check:"int",base:45,success:{next:"ww2_s_004",effects:{rel_bucky:10,flag_knowSteve:true}},fail:{next:"ww2_s_004"}}]},
ww2_s_004:{title:"酒吧之夜",level:"日常",text:"周末休假，你和巴基去了镇上的酒吧。角落里有个瘦弱的年轻人正在被两个大兵欺负。",choices:[
  {label:"上去帮忙",check:"cbt",base:50,success:{next:"ww2_s_005",effects:{rel_steve:30,cha:+3}},fail:{next:"ww2_s_005",effects:{injured:true,rel_steve:10}}},
  {label:"叫上巴基一起上",check:"cha",base:60,success:{next:"ww2_s_005",effects:{rel_steve:25,rel_bucky:10}},fail:{next:"ww2_s_005",effects:{rel_steve:15}}},
  {label:"多一事不如少一事",next:"ww2_s_005",effects:{rel_bucky:-5}}]},
ww2_s_005:{title:"史蒂夫·罗杰斯",level:"人生",text:"那个瘦弱的年轻人叫史蒂夫·罗杰斯。他眼神坚定，虽然身材瘦小，但有一种不服输的劲头。他说他想参军，但总是被拒绝。",choices:[
  {label:"鼓励他坚持下去",check:"wil",base:60,success:{next:"ww2_s_006",effects:{rel_steve:20,wil:+3}},fail:{next:"ww2_s_006"}},
  {label:"帮他想想办法",check:"int",base:50,success:{next:"ww2_s_006",effects:{rel_steve:25,int:+2}},fail:{next:"ww2_s_006"}},
  {label:"劝他放弃",next:"ww2_s_006",effects:{rel_steve:-10}}]},
ww2_s_006:{title:"神秘的招募",level:"英雄",text:"一位叫厄斯金的博士找到了你。他说有一个秘密计划，需要身体素质优秀的志愿者。\"你愿意改变世界吗？\"",cond:{flag_knowSteve:true},choices:[
  {label:"我愿意",check:"wil",base:55,success:{next:"ww2_s_007",effects:{flag_serum:true}},fail:{next:"ww2_s_010"}},
  {label:"先问问史蒂夫的想法",check:"int",base:60,success:{next:"ww2_s_007_steve"},fail:{next:"ww2_s_010"}},
  {label:"不感兴趣",next:"ww2_s_010"}]},
ww2_s_007:{title:"超级士兵计划",level:"英雄",text:"你躺在实验台上。血清注入你的身体。剧痛，然后是力量。你感觉自己在蜕变。",choices:[
  {label:"咬牙挺住",check:"wil",base:50,success:{next:"ww2_s_008",effects:{str:+30,cbt:+20,agi:+15,wil:+10}},fail:{next:"ending_serum_fail"}}]},
ww2_s_007_steve:{title:"推荐史蒂夫",level:"英雄",text:"你告诉厄斯金博士，史蒂夫·罗杰斯虽然瘦弱，但他的内心比任何人都强大。博士若有所思。",choices:[
  {label:"坚持推荐史蒂夫",next:"ww2_s_009",effects:{rel_steve:40,flag_steveCap:true}}]},
ww2_s_008:{title:"新的身体",level:"英雄",text:"血清成功了。你变得强壮、敏捷、充满力量。你成为了超级士兵。但这只是开始。",choices:[
  {label:"接受使命",next:"ww2_s_011"}]},
ww2_s_009:{title:"史蒂夫的选择",level:"英雄",text:"史蒂夫接受了血清。他从一个瘦弱的青年变成了完美的人类。你看着他，知道历史已经开始改变。",choices:[
  {label:"为他高兴",next:"ww2_s_010",effects:{rel_steve:30}},
  {label:"有点嫉妒",next:"ww2_s_010",effects:{wil:-3}}]},
ww2_s_010:{title:"前线",level:"日常",text:"无论如何，你被派往了欧洲前线。子弹在头顶飞过，泥土和血的气味充斥鼻腔。这就是真正的战争。",choices:[
  {label:"英勇作战",check:"cbt",base:50,success:{next:"ww2_s_012",effects:{cbt:+3,cha:+2}},fail:{next:"ww2_s_012",effects:{injured:true}}},
  {label:"小心行事",check:"agi",base:55,success:{next:"ww2_s_012"},fail:{next:"ww2_s_012",effects:{str:-2}}},
  {label:"照顾受伤的战友",check:"wil",base:60,success:{next:"ww2_s_012",effects:{cha:+3,rel_bucky:15}},fail:{next:"ww2_s_012"}}]},
ww2_s_011:{title:"美国队长",level:"世界",text:"你被赋予了星条旗战衣和振金圆盾。你成为了美国队长。红骷髅在前方等着你。",choices:[
  {label:"追击红骷髅",next:"ww2_s_013"}]},
ww2_s_012:{title:"1944年的冬天",level:"日常",text:"战争进入第二个冬天。你经历了太多。有人死了，有人疯了，有人还在坚持。",choices:[
  {label:"继续战斗",next:"ww2_s_014"},
  {label:"申请调回后方",check:"cha",base:40,success:{next:"ww2_s_015"},fail:{next:"ww2_s_014"}}]},
ww2_s_013:{title:"红骷髅",level:"世界",text:"约翰·施密特站在你面前，脸上带着扭曲的红色面具。\"你以为你能阻止我吗？\"",choices:[
  {label:"正面决战",check:"cbt",base:60,success:{next:"ending_captain_america"},fail:{next:"ending_red_skull_victor"}},
  {label:"智取",check:"int",base:55,success:{next:"ending_captain_america"},fail:{next:"ending_red_skull_victor"}}]},
ww2_s_014:{title:"战争结束",level:"日常",text:"1945年，德国投降。战争结束了。你还活着，这就够了。",choices:[
  {label:"回家",next:"ending_survivor"}]},
ww2_s_015:{title:"后方",level:"日常",text:"你被调到后方训练新兵。远离了前线，但战争的阴影还在。",choices:[
  {label:"安稳度日",next:"ending_war_hero"}]},
/* ===== 飞行员路线 ===== */
ww2_p_001:{title:"蓝天之上",level:"日常",text:"你坐在P-47战斗机的座舱里。引擎轰鸣，蓝天在你脚下。你是陆军航空队的一名飞行员。",choices:[
  {label:"热爱飞行",next:"ww2_p_002",effects:{agi:+2}},
  {label:"只是服从命令",next:"ww2_p_002"}]},
ww2_p_002:{title:"第一次轰炸",level:"人生",text:"你执行第一次轰炸任务。高射炮在你周围炸开，僚机被击中了。",choices:[
  {label:"坚持投弹",check:"wil",base:60,success:{next:"ww2_p_003",effects:{wil:+3}},fail:{next:"ww2_p_003",effects:{injured:true}}},
  {label:"寻找僚机",check:"agi",base:50,success:{next:"ww2_p_003",effects:{cha:+3}},fail:{next:"ww2_p_003"}}]},
ww2_p_003:{title:"王牌",level:"日常",text:"你的击落数在增加。战友们叫你\"王牌\"。但每次出击，你都可能回不来。",choices:[
  {label:"继续出击",check:"agi",base:55,success:{next:"ww2_p_004"},fail:{next:"ww2_p_005"}}]},
ww2_p_004:{title:"勋章",level:"人生",text:"你获得了飞行十字勋章。你是真正的英雄。",choices:[
  {label:"接受荣誉",next:"ending_ace_pilot"}]},
ww2_p_005:{title:"被击落",level:"人生",text:"你的战机中弹了。你跳伞了，落在了敌占区。",choices:[
  {label:"躲起来等待救援",check:"agi",base:50,success:{next:"ww2_p_006"},fail:{next:"ending_pow"}},
  {label:"尝试逃回盟军防线",check:"wil",base:45,success:{next:"ww2_p_006"},fail:{next:"ending_pow"}}]},
ww2_p_006:{title:"归队",level:"日常",text:"你终于回到了部队。但你已经变了。",choices:[
  {label:"重返蓝天",next:"ww2_p_004"}]},
/* ===== 军医路线 ===== */
ww2_m_001:{title:"野战医院",level:"日常",text:"你是一名随军军医。帐篷里全是伤兵，尖叫声和血腥味让你几乎窒息。",choices:[
  {label:"全力救治",next:"ww2_m_002",effects:{int:+2}},
  {label:"先稳定情绪",next:"ww2_m_002",effects:{wil:+2}}]},
ww2_m_002:{title:"第一个死亡",level:"人生",text:"一个19岁的士兵死在了你的手术台上。你握着他的手，看着他的眼睛失去光泽。",choices:[
  {label:"继续工作",check:"wil",base:55,success:{next:"ww2_m_003"},fail:{next:"ww2_m_003",effects:{stress:+20}}},
  {label:"走出帐篷喘口气",next:"ww2_m_003",effects:{stress:-10}}]},
ww2_m_003:{title:"药品短缺",level:"日常",text:"吗啡快用完了。你必须决定谁能得到镇痛，谁只能咬牙忍着。",choices:[
  {label:"优先重伤员",check:"int",base:60,success:{next:"ww2_m_004"},fail:{next:"ww2_m_004",effects:{cha:-3}}},
  {label:"平均分配",next:"ww2_m_004",effects:{cha:+2}}]},
ww2_m_004:{title:"医学突破",level:"英雄",text:"你在战场上摸索出了一种新的止血方法。也许能救下更多人。",choices:[
  {label:"推广这个方法",check:"tec",base:50,success:{next:"ending_medic_hero"},fail:{next:"ww2_m_005"}}]},
ww2_m_005:{title:"坚持",level:"日常",text:"你继续在前线救死扶伤。每救一个人，你就多一份活下去的理由。",choices:[
  {label:"等到战争结束",next:"ending_survivor_medic"}]},
/* ===== 兵工厂工人路线 ===== */
ww2_w_001:{title:"流水线",level:"日常",text:"你在底特律的兵工厂工作。每天12小时，制造步枪和子弹。你的手被机油染黑。",choices:[
  {label:"努力工作",next:"ww2_w_002",effects:{tec:+2}},
  {label:"摸鱼",next:"ww2_w_002",effects:{stress:-5}}]},
ww2_w_002:{title:"安全事故",level:"人生",text:"冲压机出了故障。你的工友被卷了进去。你冲上去按下了急停。",choices:[
  {label:"救人",check:"agi",base:55,success:{next:"ww2_w_003",effects:{cha:+5}},fail:{next:"ww2_w_003",effects:{injured:true}}},
  {label:"去找工头",next:"ww2_w_003",effects:{cha:-3}}]},
ww2_w_003:{title:"改进建议",level:"人生",text:"你发现了一个提高产量的方法。工头说可以试试，但如果失败了你会被开除。",choices:[
  {label:"提出改进",check:"tec",base:50,success:{next:"ww2_w_004",effects:{tec:+5,钱:200}},fail:{next:"ww2_w_004",effects:{钱:-50}}},
  {label:"保守一点",next:"ww2_w_004"}]},
ww2_w_004:{title:"升职",level:"人生",text:"你的改进成功了。你被提拔为车间主任。",choices:[
  {label:"继续搞发明",next:"ww2_w_005"},
  {label:"安稳当主任",next:"ending_factory_manager"}]},
ww2_w_005:{title:"秘密武器",level:"英雄",text:"你听说军方在秘密研究一种能量武器。你有机会参与。",choices:[
  {label:"参与研究",check:"tec",base:45,success:{next:"ending_weapon_scientist"},fail:{next:"ww2_w_004"}}]},
/* ===== 记者路线 ===== */
ww2_j_001:{title:"编辑部",level:"日常",text:"你是《纽约时报》的实习记者。主编扔给你一篇征兵报道。\"去前线看看。\"",choices:[
  {label:"兴奋地出发",next:"ww2_j_002",effects:{cha:+2}},
  {label:"有点紧张",next:"ww2_j_002",effects:{wil:+1}}]},
ww2_j_002:{title:"前线报道",level:"人生",text:"你跟着部队来到了欧洲。你第一次看到真正的战场。",choices:[
  {label:"如实报道",check:"wil",base:60,success:{next:"ww2_j_003",effects:{wil:+3}},fail:{next:"ww2_j_003"}},
  {label:"写点英雄故事",check:"cha",base:55,success:{next:"ww2_j_003",effects:{cha:+3}},fail:{next:"ww2_j_003"}}]},
ww2_j_003:{title:"丑闻",level:"人生",text:"你发现了军方掩盖的一起事故。如果报道出来，会有大麻烦。",choices:[
  {label:"揭露真相",check:"wil",base:50,success:{next:"ww2_j_004"},fail:{next:"ending_journalist_killed"}},
  {label:"假装没看见",next:"ww2_j_004",effects:{wil:-5}}]},
ww2_j_004:{title:"普利策",level:"人生",text:"你的系列报道引起了轰动。你获得了普利策奖提名。",choices:[
  {label:"继续追查",next:"ending_pulitzer"}]},
/* ===== 音乐家路线 ===== */
ws_mu_001:{title:"哈莱姆之夜",level:"日常",text:"你在哈莱姆的爵士俱乐部吹萨克斯。夜色、酒精、音乐，这是你的世界。",choices:[
  {label:"沉浸在音乐里",next:"ws_mu_002",effects:{cha:+2}},
  {label:"看看台下的观众",next:"ws_mu_002"}]},
ws_mu_002:{title:"经纪人",level:"人生",text:"一个叫乔的经纪人找到你。\"孩子，你有天赋。想不想出唱片？\"",choices:[
  {label:"签约",check:"cha",base:55,success:{next:"ws_mu_003",effects:{钱:150}},fail:{next:"ws_mu_003",effects:{钱:-30}}},
  {label:"再想想",next:"ws_mu_003"}]},
ws_mu_003:{title:"毒瘾诱惑",level:"人生",text:"后台有人递过来一包东西。\"试试这个，灵感会来的。\"",choices:[
  {label:"拒绝",check:"wil",base:60,success:{next:"ws_mu_004",effects:{wil:+3}},fail:{next:"ws_mu_004",effects:{stress:+10}}},
  {label:"试试看",next:"ws_mu_004",effects:{stress:-10,钱:-50}}]},
ws_mu_004:{title:"成名",level:"人生",text:"你的唱片火了。你成了哈莱姆的明星。",choices:[
  {label:"继续唱歌",next:"ending_jazz_star"}]},
/* ===== 黑帮路线 ===== */
ws_g_001:{title:"布鲁克林",level:"日常",text:"你是布鲁克林一个小帮派的成员。今天的任务是收保护费。",choices:[
  {label:"强硬收债",next:"ws_g_002",effects:{cha:-2,钱:30}},
  {label:"客气一点",next:"ws_g_002",effects:{cha:+2,钱:20}}]},
ws_g_002:{title:"火并",level:"人生",text:"和意大利帮的地盘争端升级了。今晚要动手。",choices:[
  {label:"冲在前面",check:"cbt",base:50,success:{next:"ws_g_003",effects:{cbt:+3,钱:100}},fail:{next:"ws_g_003",effects:{injured:true}}},
  {label:"放风",next:"ws_g_003",effects:{钱:40}}]},
ws_g_003:{title:"老大的赏识",level:"人生",text:"老大注意到了你。\"小子，有胆。跟我干大的吧。\"",choices:[
  {label:"跟着老大",check:"wil",base:55,success:{next:"ws_g_004"},fail:{next:"ws_g_004"}},
  {label:"想洗白",check:"int",base:50,success:{next:"ending_gangster_clean"},fail:{next:"ws_g_004"}}]},
ws_g_004:{title:"战争财",level:"人生",text:"战争让黑市生意火爆。你走私武器、食品、药品。",choices:[
  {label:"继续赚钱",next:"ending_gangster_boss"}]},
/* ===== 日裔美国人路线 ===== */
ws_jp_001:{title:"集中营",level:"日常",text:"珍珠港之后，你和家人被关进了集中营。铁丝网、守卫、尘土。这就是你的新家。",choices:[
  {label:"忍耐",next:"ws_jp_002",effects:{wil:+2}},
  {label:"愤怒",next:"ws_jp_002",effects:{wil:-2}}]},
ws_jp_002:{title:"抗争",level:"人生",text:"营里有人在组织抗议。你要加入吗？",choices:[
  {label:"加入抗议",check:"wil",base:55,success:{next:"ws_jp_003",effects:{cha:+5}},fail:{next:"ws_jp_003",effects:{injured:true}}},
  {label:"默默忍受",next:"ws_jp_003"}]},
ws_jp_003:{title:"参军证明",level:"人生",text:"政府说日裔可以参军证明忠诚。你的家人不同意。",choices:[
  {label:"参军",check:"wil",base:50,success:{next:"ww2_s_010"},fail:{next:"ws_jp_004"}},
  {label:"留在营里",next:"ws_jp_004"}]},
ws_jp_004:{title:"自由",level:"人生",text:"1945年，集中营关闭了。你自由了，但你的人生已经改变了。",choices:[
  {label:"重建生活",next:"ending_japanese_freed"}]},
/* ===== 瓦坎达路线 ===== */
ws_wk_001:{title:"异乡",level:"日常",text:"你是瓦坎达派往美国的留学生。你的任务是学习，同时保护振金的秘密。",choices:[
  {label:"专注学业",next:"ws_wk_002",effects:{int:+2}},
  {label:"观察这个国家",next:"ws_wk_002",effects:{cha:+2}}]},
ws_wk_002:{title:"振金危机",level:"人生",text:"你听说有人在走私振金。是瓦坎达的叛徒。",choices:[
  {label:"追查",check:"int",base:55,success:{next:"ws_wk_003"},fail:{next:"ws_wk_003"}},
  {label:"报告国内",next:"ws_wk_003"}]},
ws_wk_003:{title:"守护者",level:"英雄",text:"你必须决定是保护秘密，还是利用这个机会。",choices:[
  {label:"保护振金",check:"wil",base:60,success:{next:"ending_wakandan_guardian"},fail:{next:"ws_wk_004"}},
  {label:"暗中交易",check:"int",base:50,success:{next:"ending_wakandan_traitor"},fail:{next:"ws_wk_004"}}]},
ws_wk_004:{title:"回家",level:"人生",text:"战争结束了。你该回瓦坎达了。",choices:[
  {label:"带着秘密回家",next:"ending_wakandan_return"}]},
/* ===== 变种人路线 ===== */
ws_mt_001:{title:"觉醒",level:"日常",text:"最近你发现自己不对劲。一紧张，周围的东西就会移动。你是...变种人？",choices:[
  {label:"害怕",next:"ws_mt_002",effects:{pwr:+5}},
  {label:"好奇",next:"ws_mt_002",effects:{pwr:+3,int:+2}}]},
ws_mt_002:{title:"暴露",level:"人生",text:"有人看到你用了能力。你必须做出选择。",choices:[
  {label:"逃跑",check:"agi",base:55,success:{next:"ws_mt_003"},fail:{next:"ending_mutant_captured"}},
  {label:"隐藏起来",check:"wil",base:50,success:{next:"ws_mt_003"},fail:{next:"ending_mutant_captured"}}]},
ws_mt_003:{title:"地下",level:"英雄",text:"你加入了一个隐藏变种人的组织。他们说你有潜力。",choices:[
  {label:"训练能力",check:"pwr",base:50,success:{next:"ending_mutant_legend"},fail:{next:"ws_mt_004"}},
  {label:"过普通生活",next:"ending_mutant_hidden"}]},
ws_mt_004:{title:"坚持",level:"日常",text:"你每天都在练习。能力在变强。",choices:[
  {label:"继续训练",next:"ending_mutant_legend"}]},
/* ===== 共享彩蛋节点 ===== */
easter_tesseract:{title:"💎 神秘碎片",level:"英雄",text:"你在废墟中捡到一块发着蓝光的石头。它温暖你的手掌，仿佛有生命。",choices:[
  {label:"收起来",effects:{tec:+10,flag_tesseract:true}},
  {label:"扔掉",effects:{}}]},
};
let ENDINGS = {
  captain_america:{name:"🇺🇸 美国队长",rarity:"传奇",text:"你成为了美国队长，击败了红骷髅，为自由而战。历史将永远铭记你的名字。"},
  red_skull_victor:{name:"💀 红骷髅的胜利",rarity:"史诗",text:"你没能阻止红骷髅。九头蛇的阴影笼罩了世界。"},
  serum_fail:{name:"💉 实验体 #002",rarity:"稀有",text:"血清在你体内产生了剧烈反应。你活了下来，但你再也不是原来的你了。"},
  kia:{name:"💀 战死沙场",rarity:"普通",text:"你倒在了异国的土地上。你的名字被刻在了阵亡将士纪念碑上。"},
  war_hero:{name:"🎖️ 战争英雄",rarity:"稀有",text:"你活着回来了，带着勋章和伤疤。你是英雄。"},
  survivor:{name:"🏠 平安老兵",rarity:"普通",text:"你平安度过了战争。回到家乡，继续做一个普通人。这也是一种胜利。"},
  frozen:{name:"❄️ 冰封沉睡",rarity:"传奇",text:"你被冰封在了北极。几十年后，你会醒来，看到一个完全不同的世界。"},
  hydra:{name:"🐍 九头蛇潜伏者",rarity:"史诗",text:"你加入了九头蛇。在阴影中，你改变了世界的走向。"},
  ace_pilot:{name:"✈️ 王牌飞行员",rarity:"稀有",text:"你击落了无数敌机，成为了空军的传奇。"},
  pow:{name:"🏳️ 战俘幸存者",rarity:"稀有",text:"你在战俘营里熬过了战争。这段经历改变了你。"},
  medic_hero:{name:"🏥 战地神医",rarity:"稀有",text:"你救下了数百名士兵。他们叫你天使。"},
  survivor_medic:{name:"🏥 幸存的军医",rarity:"普通",text:"你活了下来，带着那些没能救回来的人的记忆。"},
  factory_manager:{name:"🔧 车间主任",rarity:"普通",text:"你在兵工厂干到了战争结束，成了车间主任。安稳的一生。"},
  weapon_scientist:{name:"🔬 武器科学家",rarity:"稀有",text:"你参与了秘密武器的研发。你的发明改变了战争。"},
  journalist_killed:{name:"📰 真相殉道者",rarity:"史诗",text:"你揭露了真相，但他们让你消失了。你的报道改变了历史。"},
  pulitzer:{name:"📰 普利策奖得主",rarity:"稀有",text:"你的报道获得了普利策奖。你用一支笔改变了世界。"},
  jazz_star:{name:"🎷 爵士明星",rarity:"稀有",text:"你成了哈莱姆最火的爵士乐手。音乐让你忘记了战争。"},
  gangster_clean:{name:"💼 黑道从良",rarity:"稀有",text:"你洗白了，成了合法商人。但过去的影子还在。"},
  gangster_boss:{name:"🔫 地下之王",rarity:"史诗",text:"你在战争中发了财，成了纽约地下世界的王。"},
  japanese_freed:{name:"✊ 自由",rarity:"稀有",text:"集中营关闭了。你自由了，但代价是失去的那些年。"},
  wakandan_guardian:{name:"🐆 瓦坎达守护者",rarity:"传奇",text:"你保护了振金的秘密。瓦坎达永远感激你。"},
  wakandan_traitor:{name:"🐆 振金叛徒",rarity:"史诗",text:"你出卖了振金的秘密。瓦坎达的诅咒将跟随你一生。"},
  wakandan_return:{name:"🐆 归乡",rarity:"普通",text:"你回到了瓦坎达。外面的世界很复杂，但家永远在这里。"},
  mutant_captured:{name:"🧬 实验体 X",rarity:"史诗",text:"你被军方抓走了。他们想研究你的能力。你再也没回来。"},
  mutant_legend:{name:"🧬 变种人传奇",rarity:"传奇",text:"你用能力改变了历史。未来的变种人会传颂你的故事。"},
  mutant_hidden:{name:"🧬 隐藏的一生",rarity:"普通",text:"你隐藏了能力，过完了普通的一生。没有人知道你的秘密。"},
  unknown_hero:{name:"🕯️ 无名英雄",rarity:"稀有",text:"没有人知道你的名字，但有人因为你活了下来。"},
  ordinary_life:{name:"🏠 平凡人生",rarity:"普通",text:"你没有成为英雄，也没有成为反派。你只是一个普通人，过完了普通的一生。这就够了。"},
};

const ACHIEVEMENTS = [
/* 小成就 - 日常积累 */
{id:"a001",name:"初出茅庐",desc:"完成第一个事件",cat:"小",check:s=>s.flags.eventCount>=1},
{id:"a002",name:"坚持就是胜利",desc:"连续完成10个日常事件",cat:"小",check:s=>s.flags.dailyCount>=10},
{id:"a003",name:"家书抵万金",desc:"收到5封家书",cat:"小",check:s=>s.flags.lettersRecv>=5},
{id:"a004",name:"社交达人",desc:"与3个NPC好感达到50",cat:"小",check:s=>Object.values(s.relations||{}).filter(r=>r.favor>=50).length>=3},
{id:"a005",name:"生存专家",desc:"连续20回合不受伤",cat:"小",check:s=>s.flags.noInjure>=20},
{id:"a006",name:"小富即安",desc:"累计储蓄超过$500",cat:"小",check:s=>s.money>=500},
{id:"a007",name:"勤劳的人",desc:"工作/训练20次",cat:"小",check:s=>s.flags.workCount>=20},
{id:"a008",name:"夜猫子",desc:"夜间活动10次",cat:"小",check:s=>s.flags.nightCount>=10},
{id:"a009",name:"读者",desc:"阅读5本书",cat:"小",check:s=>s.flags.booksRead>=5},
{id:"a010",name:"笔友",desc:"写10封家书",cat:"小",check:s=>s.flags.lettersSent>=10},
{id:"a011",name:"早起鸟",desc:"5点起床10次",cat:"小",check:s=>s.flags.earlyBird>=10},
{id:"a012",name:"节俭",desc:"连续10天不消费",cat:"小",check:s=>s.flags.thriftyDays>=10},
{id:"a013",name:"健身狂人",desc:"体能达到60",cat:"小",check:s=>s.stats.体能>=60},
{id:"a014",name:"书呆子",desc:"智力达到60",cat:"小",check:s=>s.stats.智力>=60},
{id:"a015",name:"万人迷",desc:"魅力达到60",cat:"小",check:s=>s.stats.魅力>=60},
{id:"a016",name:"钢铁意志",desc:"意志达到60",cat:"小",check:s=>s.stats.意志>=60},
{id:"a017",name:"飞毛腿",desc:"敏捷达到60",cat:"小",check:s=>s.stats.敏捷>=60},
{id:"a018",name:"格斗家",desc:"格斗达到60",cat:"小",check:s=>s.stats.格斗>=60},
{id:"a019",name:"发明家",desc:"科技达到60",cat:"小",check:s=>s.stats.科技>=60},
{id:"a020",name:"觉醒者",desc:"超能达到30",cat:"小",check:s=>s.stats.超能>=30},
{id:"a021",name:"OVR 30",desc:"OVR达到30",cat:"小",check:s=>s.ovr>=30},
{id:"a022",name:"OVR 50",desc:"OVR达到50",cat:"小",check:s=>s.ovr>=50},
{id:"a023",name:"老兵",desc:"游戏时间达到1944年",cat:"小",check:s=>s.date.year>=1944},
{id:"a024",name:"幸存者",desc:"活到1945年",cat:"小",check:s=>s.date.year>=1945},
{id:"a025",name:"收藏家",desc:"获得5件装备",cat:"小",check:s=>s.inventory.length>=5},
{id:"a026",name:"装备升级",desc:"获得一件T5以上装备",cat:"小",check:s=>s.inventory.some(i=>i.tier<=5)},
{id:"a027",name:"压力山大",desc:"压力值达到80",cat:"小",check:s=>s.stress>=80},
{id:"a028",name:"心态平和",desc:"压力值降到20以下",cat:"小",check:s=>s.stress<=20},
{id:"a029",name:"富甲一方",desc:"拥有$2000",cat:"小",check:s=>s.money>=2000},
{id:"a030",name:"身无分文",desc:"钱降到0",cat:"小",check:s=>s.money<=0},
/* 中成就 - 人生事件 */
{id:"a031",name:"战火洗礼",desc:"参加第一次战斗",cat:"中",check:s=>s.flags.battleCount>=1},
{id:"a032",name:"救人一命",desc:"救下一个NPC",cat:"中",check:s=>s.flags.savedNPC>=1},
{id:"a033",name:"真相追寻者",desc:"揭露一个丑闻",cat:"中",check:s=>s.flags.exposedScandal>=1},
{id:"a034",name:"黑市之王",desc:"控制3个地盘",cat:"中",check:s=>s.flags.turfCount>=3},
{id:"a035",name:"振金守护者",desc:"保护振金秘密",cat:"中",check:s=>s.flags.protectedVibranium},
{id:"a036",name:"能力觉醒",desc:"首次使用变种能力",cat:"中",check:s=>s.flags.usedPower>=1},
{id:"a037",name:"集中营斗士",desc:"组织一次抗议",cat:"中",check:s=>s.flags.protestCount>=1},
{id:"a038",name:"血浓于水",desc:"与家人关系达到80",cat:"中",check:s=>(s.relations.family?.favor||0)>=80},
{id:"a039",name:"生死之交",desc:"与一个NPC关系达到90",cat:"中",check:s=>Object.values(s.relations||{}).some(r=>r.favor>=90)},
{id:"a040",name:"受伤",desc:"第一次受伤",cat:"中",check:s=>s.flags.injuredCount>=1},
{id:"a041",name:"康复",desc:"从伤病中恢复",cat:"中",check:s=>s.flags.recovered>=1},
{id:"a042",name:"勋章",desc:"获得一枚勋章",cat:"中",check:s=>s.flags.medals>=1},
{id:"a043",name:"升职",desc:"获得一次晋升",cat:"中",check:s=>s.flags.promoted>=1},
{id:"a044",name:"发明家",desc:"完成一项发明",cat:"中",check:s=>s.flags.invention>=1},
{id:"a045",name:"情圣",desc:"谈一次恋爱",cat:"中",check:s=>s.flags.romance>=1},
{id:"a046",name:"结婚",desc:"结婚",cat:"中",check:s=>s.flags.married},
{id:"a047",name:"父亲",desc:"有了孩子",cat:"中",check:s=>s.flags.children>=1},
{id:"a048",name:"失去",desc:"目睹一个NPC死亡",cat:"中",check:s=>s.flags.witnessedDeath>=1},
{id:"a049",name:"逃亡",desc:"从危险中逃脱",cat:"中",check:s=>s.flags.escaped>=1},
{id:"a050",name:"俘虏",desc:"被俘虏过",cat:"中",check:s=>s.flags.captured>=1},
{id:"a051",name:"越狱",desc:"成功越狱",cat:"中",check:s=>s.flags.escapedPrison},
{id:"a052",name:"情报员",desc:"获取一份重要情报",cat:"中",check:s=>s.flags.intel>=1},
{id:"a053",name:"破坏者",desc:"破坏一次敌方设施",cat:"中",check:s=>s.flags.sabotage>=1},
{id:"a054",name:"谈判专家",desc:"成功谈判3次",cat:"中",check:s=>s.flags.negotiated>=3},
{id:"a055",name:"信仰",desc:"参加宗教活动5次",cat:"中",check:s=>s.flags.prayed>=5},
{id:"a056",name:"赌徒",desc:"赌博10次",cat:"中",check:s=>s.flags.gambled>=10},
{id:"a057",name:"酒鬼",desc:"喝酒20次",cat:"中",check:s=>s.flags.drank>=20},
{id:"a058",name:"烟鬼",desc:"抽烟20次",cat:"中",check:s=>s.flags.smoked>=20},
{id:"a059",name:"戒毒",desc:"从毒瘾中恢复",cat:"中",check:s=>s.flags.overcameAddiction},
{id:"a060",name:"导师",desc:"指导过3个新人",cat:"中",check:s=>s.flags.mentored>=3},
/* 大成就 - 英雄/世界事件 */
{id:"a061",name:"🇺🇸 时代的守护者",desc:"取代美国队长",cat:"大",check:s=>s.flags.becameCaptain},
{id:"a062",name:"🧬 超级士兵",desc:"成功接受超级士兵血清",cat:"大",check:s=>s.flags.serumSuccess},
{id:"a063",name:"🩸 红骷髅终结者",desc:"亲手击败红骷髅",cat:"大",check:s=>s.flags.killedRedSkull},
{id:"a064",name:"🕯️ 无名英雄",desc:"在二战中牺牲自己拯救他人",cat:"大",check:s=>s.flags.sacrificed},
{id:"a065",name:"🦸 另一个美国队长",desc:"成为新的美国队长并存活",cat:"大",check:s=>s.flags.newCaptain},
{id:"a066",name:"🐆 瓦坎达之盾",desc:"成为瓦坎达守护者",cat:"大",check:s=>s.flags.wakandanGuardian},
{id:"a067",name:"⚡ 神域见证者",desc:"接触阿斯加德力量",cat:"大",check:s=>s.flags.asgardContact},
{id:"a068",name:"🧬 变种人传奇",desc:"以变种人身份改变历史",cat:"大",check:s=>s.flags.mutantLegend},
{id:"a069",name:"✈️ 王牌",desc:"击落10架敌机",cat:"大",check:s=>s.flags.kills>=10},
{id:"a070",name:"🏥 战地天使",desc:"救下50名伤员",cat:"大",check:s=>s.flags.saved>=50},
{id:"a071",name:"📰 真相之王",desc:"揭露5个丑闻",cat:"大",check:s=>s.flags.exposedScandal>=5},
{id:"a072",name:"🔫 教父",desc:"成为纽约地下之王",cat:"大",check:s=>s.flags.godfather},
{id:"a073",name:"✊ 民权先驱",desc:"为民权而战",cat:"大",check:s=>s.flags.civilRights},
{id:"a074",name:"🔬 科学巨匠",desc:"完成3项发明",cat:"大",check:s=>s.flags.invention>=3},
{id:"a075",name:"🎷 音乐传奇",desc:"成为爵士明星",cat:"大",check:s=>s.flags.jazzStar},
{id:"a076",name:"💎 魔方碎片",desc:"获得宇宙魔方碎片",cat:"大",check:s=>s.flags.tesseract},
{id:"a077",name:"🛡️ 传奇战士",desc:"OVR达到80",cat:"大",check:s=>s.ovr>=80},
{id:"a078",name:"🐍 九头蛇",desc:"加入九头蛇",cat:"大",check:s=>s.flags.joinedHydra},
{id:"a079",name:"❄️ 冰封",desc:"被冰封",cat:"大",check:s=>s.flags.frozen},
{id:"a080",name:"🏆 战争英雄",desc:"获得3枚勋章",cat:"大",check:s=>s.flags.medals>=3},
/* 隐藏成就 */
{id:"a081",name:"？？？",desc:"隐藏成就",cat:"隐藏",hidden:true,check:s=>s.flags.easterEgg1},
{id:"a082",name:"？？？",desc:"隐藏成就",cat:"隐藏",hidden:true,check:s=>s.flags.easterEgg2},
{id:"a083",name:"？？？",desc:"隐藏成就",cat:"隐藏",hidden:true,check:s=>s.flags.easterEgg3},
{id:"a084",name:"？？？",desc:"隐藏成就",cat:"隐藏",hidden:true,check:s=>s.flags.easterEgg4},
{id:"a085",name:"？？？",desc:"隐藏成就",cat:"隐藏",hidden:true,check:s=>s.flags.easterEgg5},
{id:"a086",name:"？？？",desc:"隐藏成就",cat:"隐藏",hidden:true,check:s=>s.flags.easterEgg6},
{id:"a087",name:"？？？",desc:"隐藏成就",cat:"隐藏",hidden:true,check:s=>s.flags.easterEgg7},
{id:"a088",name:"？？？",desc:"隐藏成就",cat:"隐藏",hidden:true,check:s=>s.flags.easterEgg8},
{id:"a089",name:"？？？",desc:"隐藏成就",cat:"隐藏",hidden:true,check:s=>s.flags.easterEgg9},
{id:"a090",name:"？？？",desc:"隐藏成就",cat:"隐藏",hidden:true,check:s=>s.flags.easterEgg10},
{id:"a091",name:"？？？",desc:"隐藏成就",cat:"隐藏",hidden:true,check:s=>s.flags.easterEgg11},
{id:"a092",name:"？？？",desc:"隐藏成就",cat:"隐藏",hidden:true,check:s=>s.flags.easterEgg12},
{id:"a093",name:"？？？",desc:"隐藏成就",cat:"隐藏",hidden:true,check:s=>s.flags.easterEgg13},
{id:"a094",name:"？？？",desc:"隐藏成就",cat:"隐藏",hidden:true,check:s=>s.flags.easterEgg14},
{id:"a095",name:"？？？",desc:"隐藏成就",cat:"隐藏",hidden:true,check:s=>s.flags.easterEgg15},
{id:"a096",name:"？？？",desc:"隐藏成就",cat:"隐藏",hidden:true,check:s=>s.flags.easterEgg16},
{id:"a097",name:"？？？",desc:"隐藏成就",cat:"隐藏",hidden:true,check:s=>s.flags.easterEgg17},
{id:"a098",name:"？？？",desc:"隐藏成就",cat:"隐藏",hidden:true,check:s=>s.flags.easterEgg18},
{id:"a099",name:"？？？",desc:"隐藏成就",cat:"隐藏",hidden:true,check:s=>s.flags.easterEgg19},
{id:"a100",name:"？？？",desc:"隐藏成就",cat:"隐藏",hidden:true,check:s=>s.flags.easterEgg20},
/* ===== v2.4 第三阶段新增成就 ===== */
{id:"a101",name:"初次邂逅",desc:"与一位NPC进行对话",cat:"小",check:s=>s.flags.npcChatCount>=1},
{id:"a102",name:"健谈者",desc:"与NPC对话10次",cat:"小",check:s=>s.flags.npcChatCount>=10},
{id:"a103",name:"知心好友",desc:"与一位NPC信任度达到60",cat:"中",check:s=>(s.npcs||[]).some(n=>n.trust>=60)},
{id:"a104",name:"莫逆之交",desc:"与一位NPC信任度达到80",cat:"大",check:s=>(s.npcs||[]).some(n=>n.trust>=80)},
{id:"a105",name:"AI增强体验",desc:"使用AI生成叙事",cat:"小",check:s=>s.flags.aiNarrative>=1},
{id:"a106",name:"自由意志",desc:"使用AI自定义选择",cat:"中",check:s=>s.flags.aiCustomChoice>=1},
{id:"a107",name:"创意无限",desc:"使用AI自定义选择5次",cat:"大",check:s=>s.flags.aiCustomChoice>=5},
{id:"a108",name:"跨时代旅人",desc:"体验2个不同时代",cat:"大",check:s=>s.flags.erasPlayed>=2},
{id:"a109",name:"时代见证者",desc:"体验5个不同时代",cat:"大",check:s=>s.flags.erasPlayed>=5},
{id:"a110",name:"漫威全史",desc:"体验全部8个时代",cat:"隐藏",hidden:true,check:s=>s.flags.erasPlayed>=8},
{id:"a111",name:"身经百战",desc:"经历5次战斗",cat:"中",check:s=>s.flags.battleCount>=5},
{id:"a112",name:"百战老兵",desc:"经历20次战斗",cat:"大",check:s=>s.flags.battleCount>=20},
{id:"a113",name:"伤痕累累",desc:"受伤5次",cat:"中",check:s=>s.flags.injuredTotal>=5},
{id:"a114",name:"不死之身",desc:"受伤10次仍存活",cat:"大",check:s=>s.flags.injuredTotal>=10},
{id:"a115",name:"OVR 70",desc:"OVR达到70",cat:"中",check:s=>s.ovr>=70},
{id:"a116",name:"OVR 90",desc:"OVR达到90",cat:"大",check:s=>s.ovr>=90},
{id:"a117",name:"富可敌国",desc:"拥有$5000",cat:"中",check:s=>s.money>=5000},
{id:"a118",name:"压力爆表",desc:"压力值达到100",cat:"中",check:s=>s.stress>=100},
{id:"a119",name:"心如止水",desc:"压力值降为0",cat:"中",check:s=>s.stress<=0},
{id:"a120",name:"人生百年",desc:"年龄达到60岁",cat:"大",check:s=>s.age>=60},
{id:"a121",name:"抉择者",desc:"做出50个选择",cat:"中",check:s=>s.flags.eventCount>=50},
{id:"a122",name:"命运主宰",desc:"做出100个选择",cat:"大",check:s=>s.flags.eventCount>=100},
{id:"a123",name:"宇宙魔方",desc:"发现宇宙魔方彩蛋",cat:"隐藏",hidden:true,check:s=>s.flags.easterEgg1},
{id:"a124",name:"MCU学者",desc:"解锁20个成就",cat:"大",check:s=>s.achievements.length>=20},
{id:"a125",name:"传奇人生",desc:"解锁50个成就",cat:"隐藏",hidden:true,check:s=>s.achievements.length>=50},
];
/* ===== 核心状态 ===== */

