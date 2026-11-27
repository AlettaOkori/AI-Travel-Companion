# 行前 Tab · 导游选择功能设计文档

## 1. 概述

在「行前」对话流中，天气提醒卡片之后插入一个**导游选择**环节。以卡片形式展示 3 位匹配度最高的专属行中导游，支持直接点击选中；同时提供「查看更多」入口，在居中模态框内展示完整导游列表，点击后进入详情模态框确认选择。

## 2. 数据模型

在每个用户的 `pretrip` 对象中新增 `guides` 数组：

```javascript
guides: [
  {
    id: 'wangjianguo',
    name: '王建国 AI',
    avatar: 'assets/guides/wangjianguo.jpg',
    matchScore: 98,
    rating: 4.9,
    serviceCount: 1240,
    tags: ['建筑专家', '摄影师', '历史达人'],
    bio: '前建筑师，擅长从结构力学与建造工艺角度解读碉楼。会带你去普通游客找不到的机位拍日出，也能讲清楚每一扇窗楣背后的华侨故事。',
    specialties: ['建筑摄影', '历史讲解', '日出机位推荐', '材料演变']
  },
  // ... 共 5–6 位
]
```

**按用户画像差异化匹配度：**
- `zhang`（建筑摄影 solo）：TOP3 为「建筑专家」「摄影师」「历史达人」型导游
- `lin`（亲子家庭）：TOP3 为「亲子故事王」「自然教育」「趣味历史」型导游

## 3. 对话流变更

在天气卡片 `subtype: 'weather'` 之后插入以下 3 条新 script 条目：

```javascript
{ type: 'ai', content: '行程都安排得差不多了～最后一步，为你推荐几位匹配度超高的专属行中导游，他们会在景区实地带你深度逛碉楼：' },
{ type: 'card', subtype: 'guide' },
{ type: 'user', content: '就选TA吧' }, // 占位，程序根据实际选择替换姓名
{ type: 'ai', content: '好的！已为你锁定 <b>{name}</b>。{name} 是 {tag}，{简介}。出发当天会提前在景区入口等你，有任何想调整的节奏随时沟通～' },
```

原有天气后的 AI 汇总消息、user "没有了，谢谢"、AI 结束语、itinerary 卡片、scroll-hint 依次后移。

**兼容性说明：** 导游选择发生在 checklist 全部完成后（索引 57 之后），`autoAdvance` 中的 checklist 硬编码步骤检查（只到索引 36）和 `checklistMap` 均不受影响。

## 4. UI 组件设计

### 4.1 对话内卡片 `.guide-card`

- 外观复用 `weather-card` 风格：白色背景、`border-radius: var(--r-6)`、`max-width: 94%`、左侧对齐、`box-shadow: var(--shadow-sm)`、入场动画 `msgIn`
- **头部**：`🎯 为你匹配的专属导游`
- **内容区**：纵向排列 3 个 `.guide-option` 条目
  - 每个条目可点击，hover 背景变为 `var(--bg-elevated)`
  - **左侧**：圆形头像 `48px`，`object-fit: cover`
  - **右上**：导游姓名（14px 粗体）+ 匹配度徽章（如"98% 匹配"，accent 色小标签）
  - **右下**：标签小徽章（如"建筑专家"）+ ⭐评分 + 👥服务人数
- **底部**：居中文字按钮"查看更多 →"，点击打开列表模态框

### 4.2 列表模态框 `#guideListOverlay`

- 新建居中模态框结构：`.guide-list-overlay`（fixed、inset-0、flex、center、半透明黑背景 `rgba(0,0,0,0.45)`）
- 卡片 `.guide-list-card`：宽 `340px`、最大高度 `70vh`、圆角 `var(--r-6)`、白色背景、可滚动
- **头部**：标题"选择你的专属导游" + 右上角关闭按钮（×，圆形，32px）
- **列表区**：纵向排列全部导游（约 5–6 位）
  - 每项为 `.gl-item`，布局与对话内条目类似但更紧凑（头像 `40px`）
  - 显示：头像、姓名、匹配度、评分、服务人数
  - 点击任意项 → 隐藏列表模态框 → 打开详情模态框

### 4.3 详情模态框（扩展现有 `#guideModalOverlay`）

复用现有 `.guide-modal-overlay` 居中模态框骨架，内容扩展如下：

- **新增左上角返回按钮**（←，圆形，32px）：点击关闭详情模态框，重新显示列表模态框
- **统计行**（头像下方、name 上方或 name/tag 之间）：`⭐4.9  ·  👥1240人服务  ·  🎯98%匹配`
- **标签区**：`gm-tag` 显示导游标签，用 `·` 连接
- **Bio 区**：`gm-bio` 显示完整个人简介
- **Specialties 区**（bio 下方）：横向排列 specialties 小标签
- **底部按钮**：文字从"开平碉楼见！"改为 **"确认选择"**
- 点击"确认选择" → 触发 `selectGuide(guide, {fromList: true})`

## 5. 交互逻辑

### 5.1 核心函数

| 函数 | 职责 |
|------|------|
| `renderGuideCard()` | 渲染对话内 TOP3 卡片，绑定点击事件 |
| `openGuideListModal()` | 渲染全部列表，打开列表模态框 |
| `openGuideDetailModal(guide)` | 填充详情，打开详情模态框，隐藏列表 |
| `selectGuide(guide, opts)` | 统一选中逻辑：更新数据、推进对话 |
| `closeDetailReturnToList()` | 关闭详情模态框，恢复列表模态框显示 |

### 5.2 选中流程

**场景 A：直接点击 TOP3 之一**
1. 用户点击 `.guide-option`
2. `selectGuide(guide, {fromTop3: true})` 执行：
   - 给该条目添加 `.on` 高亮类，显示"✓ 已选择"
   - 更新 `USER_DB[currentUserId].during.agentName / guideAvatar / guideTag`
   - 替换 `script[currentStep + 1]`（user 占位）的 content 为 `就选${guide.name}吧`
   - `currentStep++` → `renderStep()` 渲染 user 消息 → `setTimeout(autoAdvance, 300)`
3. AI 自动播放下一条确认消息

**场景 B：点击"查看更多" → 列表 → 详情 → 确认**
1. 用户点击"查看更多" → `openGuideListModal()`
2. 用户点击列表项 → `openGuideDetailModal(guide)`
3. 用户在详情页点击"确认选择" → `selectGuide(guide, {fromList: true})`
   - 关闭所有模态框
   - 更新用户数据 + 替换占位消息 + 推进对话（同场景 A 的后半段）

### 5.3 数据更新

选中导游后，实时更新当前用户的 `during` 数据：

```javascript
const user = USER_DB[currentUserId];
user.during.agentName = guide.name;
user.during.guideAvatar = guide.avatar;
user.during.guideTag = guide.tags[0];
```

这确保了后续「行中」Tab 打开时会展示新选中的导游。

## 6. 头像与素材策略

- 导游头像使用路径 `assets/guides/<guide-id>.jpg`
- 由于项目暂无真实导游头像，使用 `https://placehold.co/100x100` 在线占位图或纯色 CSS fallback
- 图片加载失败时，显示 CSS 圆形色块（`var(--accent)` 背景）+ 姓名首字母白色文字

## 7. 实现范围

**需要修改的文件：**
- `app.html`：新增 `guides` 数据、插入 script 条目、新增 `renderGuideCard` 等函数、新增模态框 HTML 与 CSS、扩展 `renderCard` switch
- `data/users.js`：同步新增 `guides` 数据与 script 变更

**不需要修改：**
- `autoAdvance` 核心循环（只需确保新插入的 user 占位能被正常 break）
- `checklistMap` 与顶部 checklist 逻辑
- `css/tokens.css` 与 `css/app.css`（全部使用内联 `<style>` 或现有 CSS 变量）
