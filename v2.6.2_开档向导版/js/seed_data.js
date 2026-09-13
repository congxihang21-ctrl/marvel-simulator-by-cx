/* v2.6 seed data - mapped to v2.3 english keys, added cold war & hero dawn eras */
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
/* ===== 冷战时代（1950-1995）· 三出身分支 ===== */
cold_001:{title:"加入 SSR",level:"日常",text:"1950年代，战后的世界并不太平。你通过了层层筛选，加入了战略科学预备队（SSR）——神盾局的前身。根据你的特长，你被分配到了不同的部门。",choices:[
  {label:"成为外勤特工",next:"cold_002a",effects:{cbt:+5,agi:+3,flag_agent:true}},
  {label:"做情报分析员",next:"cold_002b",effects:{int:+5,tec:+3,flag_analyst:true}},
  {label:"搞技术研发",next:"cold_002c",effects:{tec:+8,flag_tech:true}}]},
cold_002a:{title:"外勤·柏林",level:"人生",text:"你的第一次外勤任务在柏林。跟踪一个疑似九头蛇残党的科学家。他频繁出入一栋废弃建筑。作为外勤，你必须亲自上阵。",choices:[
  {label:"直接冲进去抓人",check:"cbt",base:55,success:{next:"cold_003",effects:{flag_capturedScientist:true}},fail:{next:"cold_003",effects:{injured:true}}},
  {label:"跟踪观察一周",check:"agi",base:60,success:{next:"cold_003",effects:{int:+3,flag_intel:true}},fail:{next:"cold_003"}}]},
cold_002b:{title:"分析·卷宗",level:"人生",text:"你坐在办公室里，翻阅着堆积如山的情报卷宗。你注意到一个异常模式——多个 SSR 内部人员在相同时间访问了同一批机密文件。",choices:[
  {label:"深入调查这个模式",check:"int",base:60,success:{next:"cold_003",effects:{flag_intel:true,int:+3}},fail:{next:"cold_003"}},
  {label:"上报你的发现",check:"cha",base:55,success:{next:"cold_003",effects:{flag_trusted:true}},fail:{next:"cold_003"}}]},
cold_002c:{title:"研发·密室",level:"人生",text:"你在 SSR 的秘密实验室工作。你负责分析从九头蛇缴获的武器——宇宙魔方的能量残留物。你的仪器捕捉到了一些不该存在的信号。",choices:[
  {label:"逆向工程这些武器",check:"tec",base:55,success:{next:"cold_003",effects:{tec:+5,flag_intel:true}},fail:{next:"cold_003",effects:{injured:true}}},
  {label:"追踪信号源",check:"int",base:50,success:{next:"cold_003",effects:{int:+3,flag_intel:true}},fail:{next:"cold_003"}}]},
cold_003:{title:"九头蛇还活着",level:"世界",text:"你发现了一个惊人的事实：九头蛇并没有随着红骷髅的死亡而消失。它像寄生虫一样，正在 SSR 内部生根发芽。",choices:[
  {label:"向佩吉·卡特汇报",check:"wil",base:65,success:{next:"cold_004a",effects:{flag_trusted:true}},fail:{next:"cold_004b"}},
  {label:"悄悄自己调查",check:"int",base:55,success:{next:"cold_004a",effects:{flag_intel:true}},fail:{next:"cold_004c"}},
  {label:"假装不知道",next:"cold_004c",effects:{wil:-5}}]},
cold_004a:{title:"卡特的信任",level:"人生",text:"佩吉·卡特听完你的汇报，沉默了很久。\"你知道这意味着什么吗？我们内部有叛徒。\"她递给你一个加密文件夹。",choices:[
  {label:"接受任务，深入调查",check:"wil",base:60,success:{next:"cold_005",effects:{flag_shield:true}},fail:{next:"ending_cold_fired"}},
  {label:"请求支援",check:"cha",base:55,success:{next:"cold_005",effects:{flag_shield:true,rel_carter:20}},fail:{next:"cold_005",effects:{flag_shield:true}}}]},
cold_004b:{title:"打草惊蛇",level:"人生",text:"你的汇报被某个九头蛇内应截获了。第二天，你发现自己被调离了核心部门。",choices:[
  {label:"隐忍，暗中收集证据",check:"wil",base:50,success:{next:"cold_005",effects:{flag_intel:true}},fail:{next:"ending_cold_fired"}},
  {label:"直接找霍华德·斯塔克",check:"cha",base:45,success:{next:"cold_005",effects:{flag_stark:true}},fail:{next:"ending_cold_fired"}}]},
cold_004c:{title:"他们找到你了",level:"人生",text:"一个深夜，两个陌生人敲开了你的门。\"我们知道你看到了什么。加入我们，或者消失。\"",choices:[
  {label:"加入九头蛇",next:"cold_006",effects:{flag_hydra:true,wil:-10}},
  {label:"拒绝并逃跑",check:"agi",base:50,success:{next:"cold_005",effects:{injured:true}},fail:{next:"ending_cold_killed"}}]},
cold_005:{title:"最终对决",level:"英雄",text:"你掌握了九头蛇在 SSR 内部的名单。现在是收网的时候了。但你必须小心——你信任的人里，可能就有蛇。",choices:[
  {label:"联合卡特和斯塔克正面清算",check:"cbt",base:50,success:{next:"ending_cold_shield_hero"},fail:{next:"ending_cold_injured"}},
  {label:"秘密提交证据给国会",check:"int",base:55,success:{next:"ending_cold_whistleblower"},fail:{next:"ending_cold_killed"}},
  {label:"设局引蛇出洞",check:"int",base:60,success:{next:"ending_cold_mastermind"},fail:{next:"ending_cold_injured"}}]},
cold_006:{title:"九头蛇的邀请",level:"黑暗",text:"你加入了九头蛇。他们给了你新的身份、新的目标。\"人类需要被引导，自由是一种奢侈。\"",choices:[
  {label:"真心相信他们的理念",next:"ending_cold_hydra_true",effects:{wil:-20}},
  {label:"假装加入，当双面间谍",check:"wil",base:65,success:{next:"ending_cold_double_agent"},fail:{next:"ending_cold_hydra_purge"}}]},
/* ===== 英雄黎明时代（2008-2011）· 三出身分支 ===== */
hero_001:{title:"2008年的选择",level:"日常",text:"2008年，世界即将改变。托尼·斯塔克还在阿富汗，钢铁侠尚未诞生。你站在人生的十字路口——你的选择将决定你如何迎接这个英雄时代。",choices:[
  {label:"加入斯塔克工业",next:"hero_002a",effects:{tec:+5,flag_stark:true}},
  {label:"加入神盾局",next:"hero_002b",effects:{cbt:+3,int:+2,flag_shield:true}},
  {label:"做一个普通市民",next:"hero_002c",effects:{cha:+3}}]},
hero_002a:{title:"斯塔克工业·研发部",level:"日常",text:"你加入了斯塔克工业武器研发部。托尼是个天才，也是个混蛋。你负责一个小组，设计新一代的制导系统。",choices:[
  {label:"专心搞武器研发",check:"tec",base:60,success:{next:"hero_003",effects:{tec:+3}},fail:{next:"hero_003"}},
  {label:"想办法接近托尼",check:"cha",base:50,success:{next:"hero_003",effects:{rel_tony:15}},fail:{next:"hero_003"}}]},
hero_002b:{title:"神盾局·新手特工",level:"日常",text:"你加入了神盾局。科尔森特工装作二手车销售员来招募你的时候，你还以为是恶作剧。现在你坐在神盾局的训练场里，学习如何成为一名特工。",choices:[
  {label:"刻苦训练",check:"cbt",base:55,success:{next:"hero_003",effects:{cbt:+3,agi:+2}},fail:{next:"hero_003"}},
  {label:"研究神盾局的秘密档案",check:"int",base:55,success:{next:"hero_003",effects:{int:+3,flag_intel:true}},fail:{next:"hero_003"}}]},
hero_002c:{title:"普通市民·纽约",level:"日常",text:"你是一个纽约的普通市民。你在皇后区有一份普通的工作，过着普通的生活。你不知道的是，你的邻居彼得·帕克即将被一只蜘蛛咬到。",choices:[
  {label:"好好过日子",check:"wil",base:60,success:{next:"hero_003",effects:{cha:+2}},fail:{next:"hero_003"}},
  {label:"关注新闻里的异常事件",check:"int",base:50,success:{next:"hero_003",effects:{int:+2,flag_intel:true}},fail:{next:"hero_003"}}]},
hero_003:{title:"钢铁侠诞生",level:"英雄",text:"托尼逃回来了。他宣布斯塔克工业不再制造武器。然后，你看到了——一个穿着红色金色盔甲的人从天上飞过。",choices:[
  {label:"去找托尼，主动帮忙",check:"cha",base:55,success:{next:"hero_004",effects:{rel_tony:25,flag_ironMan:true}},fail:{next:"hero_004"}},
  {label:"自己也研发战甲",check:"tec",base:40,success:{next:"hero_004",effects:{tec:+10,flag_suit:true}},fail:{next:"hero_004",effects:{injured:true}}},
  {label:"向神盾局报告",check:"int",base:50,success:{next:"hero_004",effects:{flag_shield:true}},fail:{next:"hero_004"}}]},
hero_004:{title:"成为英雄的选择",level:"英雄",text:"世界正在改变。钢铁侠出现了，超级英雄不再是传说。你站在十字路口——是继续做普通人，还是踏入这个危险的新世界？",choices:[
  {label:"加入复仇者计划",check:"cbt",base:50,success:{next:"ending_hero_avenger"},fail:{next:"ending_hero_rejected"}},
  {label:"成为托尼的技术搭档",check:"tec",base:55,success:{next:"ending_hero_tech"},fail:{next:"ending_hero_ordinary"}},
  {label:"隐姓埋名，继续生活",next:"ending_hero_ordinary",effects:{}}]},
/* ===== 纽约之战时代（2012-2013）· 复仇者初阵路线 ===== */
nyc_001:{title:"神盾局召唤",level:"日常",text:"2012年，神盾局找到了你。宇宙魔方被洛基夺走，纽约面临前所未有的威胁。他们需要每一个能战斗的人。",choices:[
  {label:"响应召唤，加入复仇者",next:"nyc_002",effects:{flag_avenger:true}},
  {label:"以志愿者身份参与",check:"cha",base:55,success:{next:"nyc_002",effects:{cha:+2}},fail:{next:"nyc_002"}},
  {label:"留在后方做支援",next:"nyc_002",effects:{tec:+2}}]},
nyc_002:{title:"天空母舰",level:"人生",text:"你登上了神盾局的天空母舰。托尼、史蒂夫、索尔、班纳、娜塔莎、克林特——地球最强的英雄们齐聚一堂。但气氛并不融洽。",choices:[
  {label:"尝试调解众人矛盾",check:"cha",base:50,success:{next:"nyc_003",effects:{cha:+3}},fail:{next:"nyc_003"}},
  {label:"专注备战",check:"cbt",base:55,success:{next:"nyc_003",effects:{cbt:+2}},fail:{next:"nyc_003"}},
  {label:"研究洛基的权杖",check:"tec",base:50,success:{next:"nyc_003",effects:{tec:+3,flag_scepter:true}},fail:{next:"nyc_003"}}]},
nyc_003:{title:"纽约之战",level:"世界",text:"虫洞在纽约上空打开。奇瑞塔军团如潮水般涌出。复仇者们各自为战，城市在燃烧。你必须做出选择。",choices:[
  {label:"冲上第一线战斗",check:"cbt",base:50,success:{next:"nyc_004",effects:{cbt:+3,injured:true}},fail:{next:"nyc_004",effects:{injured:true}}},
  {label:"疏散平民",check:"agi",base:55,success:{next:"nyc_004",effects:{cha:+3}},fail:{next:"nyc_004"}},
  {label:"协助关闭虫洞",check:"tec",base:45,success:{next:"nyc_004",effects:{tec:+5}},fail:{next:"nyc_004",effects:{injured:true}}}]},
nyc_004:{title:"战后天际线",level:"人生",text:"虫洞关闭了。纽约满目疮痍，但你活了下来。复仇者联盟正式成立。世界知道了超级英雄的存在。",choices:[
  {label:"正式加入复仇者",check:"cbt",base:55,success:{next:"ending_nyc_avenger"},fail:{next:"ending_nyc_injured"}},
  {label:"成为神盾局特工",check:"int",base:60,success:{next:"ending_nyc_shield"},fail:{next:"ending_nyc_ordinary"}},
  {label:"回归普通生活",next:"ending_nyc_ordinary",effects:{}}]},
/* ===== 奥创时代（2014-2015）· 索科维亚路线 ===== */
ultron_001:{title:"索科维亚任务",level:"日常",text:"2015年，你随复仇者前往索科维亚清除九头蛇残党。斯特拉克男爵的城堡里藏着洛基权杖和两个实验体——皮特罗和旺达。",choices:[
  {label:"强攻城堡",check:"cbt",base:55,success:{next:"ultron_002",effects:{cbt:+2}},fail:{next:"ultron_002",effects:{injured:true}}},
  {label:"潜入夺取权杖",check:"agi",base:50,success:{next:"ultron_002",effects:{tec:+2}},fail:{next:"ultron_002"}},
  {label:"保护平民撤离",check:"cha",base:55,success:{next:"ultron_002",effects:{cha:+3}},fail:{next:"ultron_002"}}]},
ultron_002:{title:"奥创觉醒",level:"世界",text:"托尼和班纳用权杖里的宝石制造了奥创——一个本应保护世界的 AI。但它得出结论：保护人类的最好方式是消灭人类。",choices:[
  {label:"直接对抗奥创",check:"cbt",base:45,success:{next:"ultron_003"},fail:{next:"ultron_003",effects:{injured:true}}},
  {label:"争取旺达和皮特罗",check:"cha",base:50,success:{next:"ultron_003",effects:{flag_twins:true}},fail:{next:"ultron_003"}},
  {label:"寻找奥创弱点",check:"int",base:55,success:{next:"ultron_003",effects:{int:+3}},fail:{next:"ultron_003"}}]},
ultron_003:{title:"索科维亚升空",level:"英雄",text:"奥创把整座索科维亚城升上了天空。他要把它当作陨石砸向地球。复仇者们必须在城市落地前疏散所有人并摧毁奥创。",choices:[
  {label:"正面击败奥创",check:"cbt",base:50,success:{next:"ultron_004",effects:{cbt:+5}},fail:{next:"ending_ultron_dead"}},
  {label:"协助市民撤离",check:"agi",base:55,success:{next:"ultron_004",effects:{cha:+5}},fail:{next:"ultron_004",effects:{injured:true}}},
  {label:"摧毁浮空装置",check:"tec",base:50,success:{next:"ultron_004",effects:{tec:+5}},fail:{next:"ending_ultron_dead"}}]},
ultron_004:{title:"尘埃落定",level:"人生",text:"索科维亚安全落地了。奥创被摧毁。但复仇者们产生了分歧——托尼想造更强大的保护系统，史蒂夫认为这太危险。裂痕已经出现。",choices:[
  {label:"支持托尼的立场",next:"ending_ultron_stark",effects:{}},
  {label:"支持史蒂夫的立场",next:"ending_ultron_cap",effects:{}},
  {label:"离开复仇者，独自行走",next:"ending_ultron_solo",effects:{}}]},
/* ===== v2.6.2 普通人开局铺垫（先过日子，再决定要不要卷入大事件）=====
   现代各时代的首节点原本直接把玩家扔进正典大事件（内战一上来就要选边），
   但玩家身份往往是普通人。pro_start 由 startFromSeed 按玩家设定动态生成，
   让玩家自己决定「主动入局 / 旁观 / 先顾生活」，再分流到时代主线或日常导演事件。*/
pro_observe:{title:"风暴之外",level:"日常",text:"你选择留在普通人的生活里。大事件在远方发生——新闻滚动推送、街头议论纷纷，但你的世界依旧是上班下班、人情冷暖、一日三餐。只是偶尔某个瞬间，你会隐约感觉到：那道隔开平凡与非凡的界线，似乎没有想象中那么远。",choices:[
  {label:"过好自己的小日子",next:"_director",effects:{stress:-3}},
  {label:"多留意新闻，和邻居聊聊",next:"_director",effects:{int:+1}},
  {label:"攒钱、健身，为变化做准备",next:"_director",effects:{wil:+2}}]},
pro_daily:{title:"寻常一日",level:"日常",text:"日子在柴米油盐里不紧不慢地往前过。处理好手边的工作、关照好身边的人，本身就是一种了不起。这个时代的惊天动地，暂时与你无关。",choices:[
  {label:"认真工作 / 学习",next:"_director",effects:{stress:+1,int:+1}},
  {label:"陪陪家人朋友",next:"_director",effects:{stress:-3}},
  {label:"给自己放个假",next:"_director",effects:{stress:-5}}]},
/* ===== 内战时代（2016-2017）· 协议路线 ===== */
civil_001:{title:"索科维亚协议",level:"世界",text:"2016年，联合国通过了索科维亚协议——复仇者必须接受政府监管。117个国家签署。钢铁侠支持，美国队长反对。你必须选边。",choices:[
  {label:"支持协议，站在钢铁侠这边",next:"civil_002",effects:{flag_teamIron:true}},
  {label:"反对协议，追随美国队长",next:"civil_002",effects:{flag_teamCap:true}},
  {label:"保持中立",next:"civil_002",effects:{}}]},
civil_002:{title:"冬日战士",level:"人生",text:"史蒂夫发现巴基还活着，被泽莫陷害成了维也纳爆炸案的凶手。托尼要逮捕巴基，史蒂夫要保护他。机场大战一触即发。",choices:[
  {label:"帮托尼抓捕巴基",check:"cbt",base:50,success:{next:"civil_003"},fail:{next:"civil_003"}},
  {label:"帮史蒂夫保护巴基",check:"cbt",base:50,success:{next:"civil_003"},fail:{next:"civil_003"}},
  {label:"试图阻止双方冲突",check:"cha",base:45,success:{next:"civil_003",effects:{cha:+3}},fail:{next:"civil_003",effects:{injured:true}}}]},
civil_003:{title:"莱比锡机场",level:"世界",text:"德国莱比锡机场。钢铁侠阵营对阵美国队长阵营。蜘蛛侠、黑豹、蚁人、鹰眼、猎鹰、猩红女巫……你身处这场超级英雄内战的中心。",choices:[
  {label:"全力战斗",check:"cbt",base:50,success:{next:"civil_004"},fail:{next:"ending_civil_captured"}},
  {label:"保护队友",check:"agi",base:55,success:{next:"civil_004"},fail:{next:"civil_004"}},
  {label:"寻找泽莫的真相",check:"int",base:60,success:{next:"civil_004",effects:{flag_zemo:true}},fail:{next:"civil_004"}}]},
civil_004:{title:"复仇者分裂",level:"人生",text:"复仇者们在西伯利亚发现了真相——泽莫才是幕后黑手。但钢铁侠知道了巴基杀死了他父母。复仇者联盟彻底分裂了。",choices:[
  {label:"追随钢铁侠，签署协议",next:"ending_civil_iron",effects:{}},
  {label:"追随美国队长，流亡海外",next:"ending_civil_cap",effects:{}},
  {label:"退出一切，隐姓埋名",next:"ending_civil_retire",effects:{}}]},
/* ===== 无限战争时代（2018-2023）· 灭霸路线 ===== */
infinity_001:{title:"灭霸降临",level:"世界",text:"2018年，灭霸来了。他已经拥有了力量宝石和空间宝石。他要集齐六颗无限宝石，打一个响指，消灭宇宙一半的生命。",choices:[
  {label:"加入地球防线",check:"cbt",base:55,success:{next:"infinity_002"},fail:{next:"infinity_002"}},
  {label:"保护无限宝石",check:"int",base:50,success:{next:"infinity_002",effects:{flag_guardian:true}},fail:{next:"infinity_002"}},
  {label:"疏散地球平民",check:"cha",base:50,success:{next:"infinity_002",effects:{cha:+3}},fail:{next:"infinity_002"}}]},
infinity_002:{title:"泰坦星之战",level:"英雄",text:"你在泰坦星和钢铁侠、奇异博士、蜘蛛侠、银河护卫队一起对战灭霸。我们差一点就摘下了他的手套——但星爵失控了。",choices:[
  {label:"压制星爵，保持计划",check:"agi",base:40,success:{next:"infinity_003",effects:{flag_almostWin:true}},fail:{next:"infinity_003"}},
  {label:"全力攻击灭霸",check:"cbt",base:45,success:{next:"infinity_003"},fail:{next:"infinity_003",effects:{injured:true}}},
  {label:"保护队友",check:"cha",base:55,success:{next:"infinity_003"},fail:{next:"infinity_003"}}]},
infinity_003:{title:"响指",level:"世界",text:"灭霸集齐了六颗宝石。他打了个响指。世界开始灰飞烟灭。你看着身边的人一个个化作灰烬。",choices:[
  {label:"在消逝中守护他人",check:"wil",base:60,success:{next:"infinity_004",effects:{flag_heroDeath:true}},fail:{next:"ending_infinity_snapped"}},
  {label:"寻找逆转方法",check:"int",base:50,success:{next:"infinity_004"},fail:{next:"ending_infinity_snapped"}},
  {label:"接受命运",next:"ending_infinity_snapped",effects:{}}]},
infinity_004:{title:"烁灭五年",level:"人生",text:"你活了下来。五年过去了。世界失去了一半的人口。钢铁侠有了女儿，雷神成了肥宅。但斯科特·朗从量子领域回来了——也许还有机会。",choices:[
  {label:"参与时间劫持计划",check:"tec",base:55,success:{next:"ending_infinity_avenger"},fail:{next:"ending_infinity_survivor"}},
  {label:"在战后世界重建生活",next:"ending_infinity_survivor",effects:{}},
  {label:"独自寻找灭霸复仇",check:"cbt",base:35,success:{next:"ending_infinity_revenge"},fail:{next:"ending_infinity_dead"}}]},
/* ===== 多元宇宙时代（2023-2026）· 时间线路线 ===== */
multi_001:{title:"多元宇宙裂缝",level:"世界",text:"2024年，多元宇宙的边界开始崩塌。蜘蛛侠的身份暴露，奇异博士的咒语出了差错。来自其他宇宙的反派开始涌入这个世界。",choices:[
  {label:"协助奇异博士修复裂缝",check:"int",base:50,success:{next:"multi_002",effects:{tec:+3}},fail:{next:"multi_002"}},
  {label:"研究多元宇宙的规律",check:"tec",base:55,success:{next:"multi_002",effects:{flag_multiverse:true}},fail:{next:"multi_002"}},
  {label:"保护现实世界的稳定",check:"wil",base:55,success:{next:"multi_002"},fail:{next:"multi_002"}}]},
multi_002:{title:"时间变异管理局",level:"人生",text:"你被 TVA 逮捕了——因为你的存在导致了时间线分支。莫比乌斯特工给你两个选择：被重置，或者帮他们抓一个危险的变体。",choices:[
  {label:"接受 TVA 的任务",check:"wil",base:60,success:{next:"multi_003",effects:{flag_tva:true}},fail:{next:"ending_multi_pruned"}},
  {label:"试图逃离 TVA",check:"agi",base:45,success:{next:"multi_003"},fail:{next:"ending_multi_pruned"}},
  {label:"和那个变体合作",check:"cha",base:50,success:{next:"multi_003",effects:{flag_variant:true}},fail:{next:"multi_003"}}]},
multi_003:{title:"康的威胁",level:"世界",text:"你发现了真相——TVA 背后是康。无数个康的变体统治着多元宇宙。其中最危险的那个，想开启一场多元宇宙战争。",choices:[
  {label:"对抗康",check:"cbt",base:40,success:{next:"multi_004"},fail:{next:"ending_multi_killed"}},
  {label:"联合其他变体对抗康",check:"cha",base:50,success:{next:"multi_004"},fail:{next:"ending_multi_killed"}},
  {label:"寻找时间线的出口",check:"int",base:55,success:{next:"multi_004"},fail:{next:"ending_multi_pruned"}}]},
multi_004:{title:"时间的尽头",level:"英雄",text:"你站在时间的尽头。康的帝国摇摇欲坠。多元宇宙的命运掌握在你手中——是重置一切，还是让分支自由生长？",choices:[
  {label:"重置神圣时间线",check:"wil",base:50,success:{next:"ending_multi_keeper"},fail:{next:"ending_multi_chaos"}},
  {label:"解放所有分支",check:"cha",base:55,success:{next:"ending_multi_liberator"},fail:{next:"ending_multi_chaos"}},
  {label:"自己成为新的守护者",check:"int",base:60,success:{next:"ending_multi_god"},fail:{next:"ending_multi_chaos"}}]},
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
  /* ===== 冷战时代结局 ===== */
  cold_fired:{name:"📄 被清洗",rarity:"普通",text:"你被 SSR 开除了。官方说法是「精简编制」，但你知道真正的原因。你带着秘密消失在了人群中。"},
  cold_killed:{name:"💀 暗杀",rarity:"稀有",text:"你发现了不该发现的东西。一个深夜，一颗子弹结束了一切。你的案件至今未破。"},
  cold_shield_hero:{name:"🛡️ 神盾局英雄",rarity:"史诗",text:"你帮助卡特和斯塔克清除了九头蛇在 SSR 的渗透。你成为了神盾局的创始英雄之一，名字被刻在神盾局大厅的墙上。"},
  cold_injured:{name:"🩹 带伤退役",rarity:"稀有",text:"最终对决中你受了重伤。你活了下来，但再也不能出任务了。神盾局给了你一枚勋章和一笔抚恤金。"},
  cold_whistleblower:{name:"📣 吹哨人",rarity:"史诗",text:"你把证据交给了国会。九头蛇的渗透被公之于众。你失去了工作和很多朋友，但你守住了底线。"},
  cold_mastermind:{name:"♟️ 幕后棋手",rarity:"传奇",text:"你设的局完美无缺。九头蛇的内应一个个暴露，而你始终隐藏在阴影中。你是这场清算的真正策划者。"},
  cold_hydra_true:{name:"🐍 九头蛇信徒",rarity:"史诗",text:"你真心相信九头蛇的理念。你在阴影中服务了几十年，见证了他们的崛起。你相信，你做的是对的。"},
  cold_double_agent:{name:"🎭 双面间谍",rarity:"传奇",text:"你假装加入九头蛇，实则为神盾局效力。几十年的双重生活让你疲惫不堪，但你成功瓦解了九头蛇的核心。"},
  cold_hydra_purge:{name:"💀 清洗名单",rarity:"稀有",text:"九头蛇发现了你是双面间谍。你的名字出现在了清洗名单的第一位。你跑了，但他们一直在追。"},
  /* ===== 英雄黎明时代结局 ===== */
  hero_avenger:{name:"⭐ 复仇者",rarity:"传奇",text:"你通过了选拔，成为了复仇者计划的早期成员。从纽约之战开始，你的名字将和地球最强的英雄们并列。"},
  hero_rejected:{name:"🚫 落选",rarity:"普通",text:"你没能通过复仇者的考核。你回到了普通生活，但你知道，这个世界需要有人站出来。"},
  hero_tech:{name:"🔧 钢铁侠的左膀右臂",rarity:"史诗",text:"你成了托尼最信任的技术搭档。从马克2到马克42，每一套战甲都有你的心血。复仇者大厦里永远有你的工位。"},
  hero_ordinary:{name:"🏢 普通员工",rarity:"普通",text:"你没有成为超级英雄。你继续在斯塔克工业上班，看着托尼从花花公子变成救世主。你只是一个旁观者，但你的生活很安稳。"},
  /* ===== 纽约之战时代结局 ===== */
  nyc_avenger:{name:"⭐ 初代复仇者",rarity:"传奇",text:"你在纽约之战中证明了自己。复仇者联盟成立时，你站在了创始成员的行列。从那以后，你的名字和地球最强的英雄们并列。"},
  nyc_injured:{name:"🩹 战争创伤",rarity:"稀有",text:"纽约之战中你受了重伤，再也不能战斗了。但你救下了很多人。复仇者们给你留了一个永远的位置。"},
  nyc_shield:{name:"🛡️ 神盾局干员",rarity:"稀有",text:"你选择加入神盾局，在阴影中保护世界。纽约之战让你明白，不是所有英雄都站在聚光灯下。"},
  nyc_ordinary:{name:"🏙️ 纽约幸存者",rarity:"普通",text:"你在纽约之战中活了下来。城市在重建，生活在继续。你知道这个世界有英雄守护，这就够了。"},
  /* ===== 奥创时代结局 ===== */
  ultron_dead:{name:"💀 索科维亚的牺牲者",rarity:"稀有",text:"你在索科维亚之战中牺牲了。城市安全落地了，但你没能看到这一幕。你的名字被刻在了复仇者纪念碑上。"},
  ultron_stark:{name:"🤖 钢铁侠的盟友",rarity:"史诗",text:"你支持托尼的立场，参与了奥创之后的防御计划。你相信，保护世界需要更强大的力量。"},
  ultron_cap:{name:"🛡️ 队长的追随者",rarity:"史诗",text:"你支持史蒂夫的立场，认为人类应该自己保护自己。你和队长一起，在没有监管的情况下继续战斗。"},
  ultron_solo:{name:"🥷 独行侠",rarity:"稀有",text:"你离开了复仇者，独自行走。你不相信任何组织，只相信自己。但每当世界需要你，你都会出现。"},
  /* ===== 内战时代结局 ===== */
  civil_captured:{name:"⛓️ 深海监狱",rarity:"稀有",text:"你在机场大战中被俘虏，关在了海底监狱 Raft。直到史蒂夫来劫狱，你才重获自由。"},
  civil_iron:{name:"🤖 钢铁侠阵营",rarity:"史诗",text:"你追随钢铁侠，签署了索科维亚协议。你相信监管是必要的。但你失去了一半的朋友。"},
  civil_cap:{name:"🛡️ 美国队长阵营",rarity:"史诗",text:"你追随美国队长，流亡海外。你相信自由高于一切。你们成了通缉犯，但你们从未放弃。"},
  civil_retire:{name:"🌅 退役英雄",rarity:"普通",text:"你退出了一切，隐姓埋名。内战让你筋疲力尽。你只想过普通人的生活。"},
  /* ===== 无限战争时代结局 ===== */
  infinity_snapped:{name:"💨 化作灰烬",rarity:"普通",text:"灭霸打了响指。你看着自己的手化为灰烬。最后的念头是：至少我保护了身边的人。"},
  infinity_avenger:{name:"⚡ 终局之战参与者",rarity:"传奇",text:"你参与了时间劫持计划，从过去借回了无限宝石。你站在了终局之战的战场上，和所有复仇者一起，击败了灭霸。"},
  infinity_survivor:{name:"🏠 烁灭幸存者",rarity:"普通",text:"你在烁灭中活了下来。五年里，你努力重建生活。终局之战后，消失的人回来了，但你的生活已经回不去了。"},
  infinity_revenge:{name:"🗡️ 复仇者",rarity:"史诗",text:"你独自找到了灭霸的花园，为死去的人报了仇。但你知道，这不能让他们回来。"},
  infinity_dead:{name:"💀 复仇失败",rarity:"稀有",text:"你去找灭霸复仇，但他太强了。你倒在了那个荒凉的星球上，没有人知道你去了哪里。"},
  /* ===== 多元宇宙时代结局 ===== */
  multi_pruned:{name:"✂️ 被裁剪",rarity:"稀有",text:"TVA 判定你为异常时间线，把你裁剪了。你的存在从所有时间线上消失了。"},
  multi_killed:{name:"💀 康的猎物",rarity:"史诗",text:"你试图对抗康，但他的力量超出了你的想象。你成了无数个康的又一个牺牲品。"},
  multi_keeper:{name:"⏳ 时间线守护者",rarity:"传奇",text:"你重置了神圣时间线，成为了新的守护者。你站在时间的尽头，守护着宇宙的秩序。"},
  multi_liberator:{name:"🌟 多元宇宙解放者",rarity:"传奇",text:"你解放了所有分支时间线。多元宇宙从此自由生长，无限的可能同时存在。你创造了历史。"},
  multi_god:{name:"👑 新的康",rarity:"传奇",text:"你成为了新的守护者，比康更强大、更仁慈。多元宇宙在你的统治下，迎来了新的秩序。"},
  multi_chaos:{name:"🌀 多元宇宙混沌",rarity:"史诗",text:"你没能控制住多元宇宙的崩溃。无数时间线交织混乱，宇宙陷入了混沌。但也许，混沌中也孕育着新的可能。"},
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

