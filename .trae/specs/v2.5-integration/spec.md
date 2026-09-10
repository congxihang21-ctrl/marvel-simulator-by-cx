# 漫威电影宇宙·英雄纪元 v2.5 - 产品需求文档

## Overview
- **Summary**: 以 v2.3 为功能底座，融入 v2.4 的种子事件驱动架构、AI 叙事增强、转盘判定、Liquid Glass 视觉，开发 v2.5 版本。
- **Purpose**: 解决 v2.3「每回合全靠 AI 生成」的稳定性问题，同时保留 v2.3 完整的英雄成长系统，提升叙事确定性与沉浸感。
- **Target Users**: 漫威粉丝、文字 RPG 玩家、抖音/移动端用户。

## Goals
- 以 v2.4 的「种子事件驱动 + AI 增强」替换 v2.3 的「每回合 AI 全量生成」架构，提升稳定性。
- 完整保留 v2.3 的 OVR 6 档分级、时代英雄目标、5 档英雄成就、世界动态、金句、大事件、离线引擎。
- 引入 v2.4 的转盘式判定动画与自定义行动（AI 解析玩家自由输入）。
- 视觉升级为 Liquid Glass 风格，保留 v2.3 的 8 张迷你卡信息架构。

## Non-Goals
- 不重写 v2.3 已有的存档/读档、设置、教程、捐赠等周边功能。
- 不改动 v2.3 的属性 8 维定义（str/cbt/agi/int/tec/pwr/cha/wil）。
- 不新增 v2.3/v2.4 均未覆盖的全新游戏机制（如战斗系统、装备系统）。
- 不做后端服务，保持纯前端单文件可运行。

## Background & Context
- v2.3（9744 行单文件）功能完整但叙事全靠 AI 生成，API 失败时依赖离线引擎，体验不稳定。
- v2.4（约 2200 行）架构更优：种子事件节点构成确定性叙事骨架，AI 仅做叙事增强，稳定性好；但功能系统（目标/成就/世界动态）不如 v2.3 丰富。
- v2.4 的转盘判定、自定义行动、Liquid Glass UI 是体验亮点。
- 决策：v2.5 = v2.3 功能系统 + v2.4 叙事架构 + v2.4 视觉/交互。

## Functional Requirements

### 叙事与事件
- **FR-1**: 采用 v2.4 的种子事件节点系统（NODES），每个节点含 title/level/text/choices，choices 含 check/base/success/fail/effects/next。
- **FR-2**: AI 仅对非日常事件做叙事增强（generateNarrative），失败时回退原始文本。
- **FR-3**: 支持玩家自定义行动，由 AI 解析为结构化 action/risk/requiredStats/successText/failText。
- **FR-4**: 保留 v2.3 的离线组合叙事引擎，作为 AI 不可用时的降级方案。

### 判定与成长
- **FR-5**: 采用 v2.4 的转盘式判定动画（runJudge），成功率 = base + (属性-30)×1.2，受受伤/压力影响。
- **FR-6**: 保留 v2.3 的 OVR 6 档分级（凡人→受训者→精锐→义警→英雄→传奇），用 8 维加权计算。
- **FR-7**: 保留 v2.3 的时代英雄目标系统（每时代 3 短 + 3 中 + 2 长）。
- **FR-8**: 融合成就系统：v2.3 的 5 档叙事成就（C→SS）作主线，v2.4 的数值成就作支线。

### 世界与沉浸
- **FR-9**: 保留 v2.3 的 7 维世界动态（政府/英雄界/反派/科技经济/宇宙/多元宇宙/本地）。
- **FR-10**: 保留 v2.3 的 MCU 金句库，按时代标签筛选，用于开场/回合间/结局。
- **FR-11**: 保留 v2.3 的大事件触发机制（指定回合 + 冷却）。
- **FR-12**: 保留 v2.3 的 NPC 关系系统（好感/信任/敌意 0-100）。

### UI 与交互
- **FR-13**: 视觉升级为 v2.4 的 Liquid Glass 风格（玻璃拟态 + 光晕 + 模糊）。
- **FR-14**: 保留 v2.3 的 8 张迷你卡信息架构（出身/状态/能力/目标/关系/世界/事件/组织）。
- **FR-15**: 保留 v2.3 的简易/专家双模式。
- **FR-16**: 保留 v2.3 的存档/读档、设置、教程。

### AI 集成
- **FR-17**: 采用 v2.4 的 AIService 模块（Zhipu glm-4.7），支持配置 base/key/model/temp。
- **FR-18**: AI 功能包括：事件叙事增强、NPC 对话、自定义选择解析、结局叙事、人生传记。

## Non-Functional Requirements
- **NFR-1**: 纯前端单文件（可拆分 js/css），无后端依赖。
- **NFR-2**: 移动端优先适配（iOS/鸿蒙/安卓 X5），保留 v2.4 的视口变量与 polyfill。
- **NFR-3**: AI 失败时 3 秒内回退，不阻塞游戏推进。
- **NFR-4**: 存档兼容 v2.3（S 对象结构不变）。
- **NFR-5**: 首屏加载 ≤ 2 秒（本地文件）。

## Constraints
- **Technical**: 基于 v2.3 单文件 9744 行做增量改造，不整文件重写；使用最小差分编辑。
- **Business**: 保持非官方同人性质，不引入版权风险素材。
- **Dependencies**: 依赖 Zhipu API（key 已内置），无其他外部依赖。

## Assumptions
- v2.3 的 S 状态对象结构可平滑迁移到 v2.5。
- v2.4 的种子事件数据（NODES）可直接复用并扩展到更多时代。
- 用户已接受 v2.3 的交互范式，v2.5 主要增强视觉与稳定性。

## Acceptance Criteria

### AC-1: 种子事件驱动架构
- **Type**: `rule`
- **Given**: 玩家进入游戏并选择出身
- **When**: 点击推进
- **Then**: 游戏按 NODES 节点链推进，每个节点显示事件+选项
- **Pass Condition**: 不依赖 AI 即可完整推进至少 10 个节点至结局
- **Evidence**: 手动测试节点流转 + 控制台无报错

### AC-2: AI 叙事增强不阻塞
- **Type**: `rule`
- **Given**: AI 服务不可用或超时
- **When**: 触发非日常事件
- **Then**: 3 秒内显示原始事件文本，游戏可继续
- **Pass Condition**: 断网状态下可正常推进
- **Evidence**: 断网测试 + 控制台日志

### AC-3: OVR 6 档分级显示
- **Type**: `rule`
- **Given**: 玩家属性发生变化
- **When**: 渲染能力面板
- **Then**: 显示 OVR 数值及对应档位（凡人/受训者/精锐/义警/英雄/传奇）
- **Pass Condition**: OVR=0→凡人, OVR=50→义警, OVR=80→传奇
- **Evidence**: 边界值测试

### AC-4: 转盘判定动画
- **Type**: `rule`
- **Given**: 玩家选择带 check/base 的选项
- **When**: 点击选项
- **Then**: 显示转盘动画，指针停止后判定成功/失败并应用对应 effects
- **Pass Condition**: 成功率与 calcChance 计算一致
- **Evidence**: 连续 10 次判定成功率落在 ±15% 区间

### AC-5: 时代目标系统
- **Type**: `rule`
- **Given**: 玩家进入某时代
- **When**: 查看目标面板
- **Then**: 显示该时代的短期/中期/长期英雄目标
- **Pass Condition**: 5 个时代各有 8 个目标
- **Evidence**: 检查 DEFAULT_ERA_GOALS 数据完整性

### AC-6: 成就融合
- **Type**: `rule`
- **Given**: 玩家达成成就条件
- **When**: 触发 unlockAchievement
- **Then**: 叙事成就（C→SS）和数值成就均可解锁并展示
- **Pass Condition**: 至少 32 项叙事成就 + 125 项数值成就可解锁
- **Evidence**: 成就池数据检查

### AC-7: Liquid Glass 视觉
- **Type**: `rubric`
- **Dimension**: 视觉一致性与现代感
- **Scale**: 1-5
- **Anchors**: 1 = 仍为 v2.3 旧风格; 3 = 部分玻璃效果; 5 = 完整 Liquid Glass，与 v2.4 视觉一致
- **Pass Threshold**: >= 4
- **Evidence**: 截图对比 v2.4

### AC-8: 存档兼容性
- **Type**: `rule`
- **Given**: v2.3 的存档字符串
- **When**: 在 v2.5 中导入
- **Then**: 可正常读取并继续游戏
- **Pass Condition**: S 对象核心字段（stats/turn/date/events）不丢失
- **Evidence**: 导入测试

## Open Questions
- [ ] 是否需要为 v2.4 已有的 8 个时代都补充完整种子事件链？（当前仅二战有完整链）
- [ ] v2.3 的离线引擎是否需要适配种子事件结构？
- [ ] 简易模式下是否隐藏转盘判定，直接出结果？
