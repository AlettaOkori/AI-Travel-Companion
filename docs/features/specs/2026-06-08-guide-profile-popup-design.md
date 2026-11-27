# 导游详细资料弹窗设计文档

## 背景

【行中】Tab 里点击导游头像，当前弹出的是"联系方式"弹窗，显示企业微信和手机号。用户希望将其改为展示导游的**详细资料**，使头像点击更有价值，也符合"AI 旅伴"的产品定位。

## 需求目标

- 将"联系方式"弹窗改为"导游详细资料"弹窗
- 展示导游的完整信息：头像、名字、评分、服务次数、标签、个人简介、擅长领域
- 移除联系方式（微信/手机）
- 弹窗内容可上下滑动，适应不同信息长度
- 仅需覆盖 **王建国**（张先生）和 **张雅芳**（林女士）两位导游

## 交互流程

```
用户点击【行中】Tab 顶部导游头像
        │
        ▼
   弹出导游详细资料弹窗（居中卡片）
        │
   ┌────┴────┐
   │ 头像+名字 │
   │ 评分+次数 │
   │  标签行   │
   │ ───────  │
   │  个人简介 │
   │ 擅长领域  │
   │ [知道了]  │
   └─────────┘
        │
   点击遮罩 / × / 知道了 → 关闭弹窗
```

## 数据模型

导游详细数据已存在于 `USER_DB[currentUserId].pretrip.guides[]` 数组中，每个 guide 对象结构如下：

```js
{
  id: 'wangjianguo',
  name: '王建国 AI',
  avatar: 'assets/guides/wangjianguo.jpg',
  matchScore: 98,
  rating: 4.9,
  serviceCount: 1240,
  tags: ['建筑专家', '摄影师', '历史达人'],
  bio: '前建筑师，擅长从结构力学与建造工艺角度解读碉楼...',
  specialties: ['建筑摄影', '历史讲解', '日出机位推荐', '材料演变']
}
```

弹窗展示时，通过当前 `user.during.agentName` 去 `user.pretrip.guides` 中按 `name` 匹配，提取完整数据。

## UI 设计

### 整体结构

复用现有的 `guide-modal-overlay` + `guide-modal-card` 外壳：

- 遮罩层：`guide-modal-overlay` 保持不变
- 卡片容器：`guide-modal-card`，调整 `max-height: 75vh`，内容区增加 `overflow-y: auto`
- 关闭方式：点击遮罩、点击右上角 `×`、点击底部"知道了"按钮

### 内容布局（从上到下）

| 顺序 | 区域 | 说明 | 样式 |
|------|------|------|------|
| 1 | 头像区 | 导游头像（80px 圆形）+ 右下角绿色在线状态点 | 复用 `.gm-avatar-wrap`、`.gm-avatar`、`.gm-status` |
| 2 | 名字 | 导游名字，如"王建国 AI" | 复用 `.gm-name` |
| 3 | 数据行 | ★ 评分（如 4.9）+ 服务次数（如 1,240 次服务） | 新增 `.gm-stats-row` |
| 4 | 标签行 | 导游标签 pill（如 建筑专家 / 摄影师 / 历史达人） | 新增 `.gm-tags-row` + `.gm-tag-pill` |
| 5 | 分隔线 | 细线分割 | 复用 `.gm-divider` |
| 6 | 个人简介 | `bio` 长文本 | 新增 `.gm-bio-text` |
| 7 | 擅长领域 | "擅长领域"小标题 + `specialties` pill 标签 | 新增 `.gm-section-title` + `.gm-specs-row` |
| 8 | 底部按钮 | "知道了"关闭按钮 | 复用 `.gm-btn` |

### 新增 CSS 类定义

```css
/* 统计行：评分 + 服务次数 */
.gm-stats-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 10px;
  font-size: var(--fs-13);
  color: var(--fg-dim);
}
.gm-stats-row .gm-stat {
  display: flex;
  align-items: center;
  gap: 4px;
}
.gm-stats-row .gm-star {
  color: #f5a623;
}
.gm-stats-row .gm-stat-val {
  font-weight: 600;
  color: var(--fg);
}

/* 标签行 */
.gm-tags-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  margin-bottom: 12px;
  padding: 0 8px;
}
.gm-tag-pill {
  font-size: var(--fs-11);
  padding: 4px 10px;
  border-radius: 100px;
  background: var(--accent-dim);
  color: var(--accent);
  border: 1px solid var(--accent);
  white-space: nowrap;
}

/* 个人简介 */
.gm-bio-text {
  font-size: var(--fs-13);
  color: var(--fg-dim);
  line-height: 1.7;
  text-align: left;
  padding: 0 8px;
  margin-bottom: 14px;
}

/* 擅长领域区 */
.gm-section-title {
  font-size: var(--fs-12);
  font-weight: 600;
  color: var(--fg);
  text-align: left;
  padding: 0 8px;
  margin-bottom: 8px;
}
.gm-specs-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0 8px;
  margin-bottom: 16px;
}
.gm-specs-row .gm-tag-pill {
  background: var(--bg-elevated);
  color: var(--fg-dim);
  border: 1px solid var(--border);
}

/* 卡片内容滚动 */
.guide-modal-card .gm-content {
  max-height: calc(75vh - 40px);
  overflow-y: auto;
  padding-right: 4px; /* 为滚动条留空间 */
}
```

## 实现要点

### HTML 结构变更

将 `guideContactCard` 内部的 `.gc-contact-list`、`.gc-note` 替换为新的资料展示区域，保留 `.gm-content` 作为内容容器。

### JS 逻辑变更

`showGuideContactModal()` 函数需要：

1. 从 `USER_DB[currentUserId]` 获取当前用户数据
2. 从 `user.during` 获取导游名字 `agentName`
3. 在 `user.pretrip.guides` 中按 `name` 匹配对应的 guide 对象
4. 如果匹配成功，填充完整数据（rating、serviceCount、tags、bio、specialties）
5. 如果匹配失败，降级显示：名字、头像、已有的 `guideTag`

```js
function showGuideContactModal() {
  const user = USER_DB[currentUserId];
  const during = user && user.during;
  const gAvatar = (during && during.guideAvatar) || 'mpsglqy0-ai_avatar.png';
  const gName = (during && during.agentName) || '专属导游';

  // 匹配完整导游数据
  const guides = (user && user.pretrip && user.pretrip.guides) || [];
  const guide = guides.find(g => g.name === gName);

  // 填充 DOM...
}
```

### 移除的内容

- `.gc-contact-list`（企业微信 + 手机号）
- `.gc-note`（"💡 有问题找我，随时在线～"）
- `#gcWeixin`、`#gcPhone` DOM 元素及其赋值逻辑
- `guideWeixin`、`guidePhone` 相关数据读取

## 验收标准

- [ ] 点击【行中】Tab 顶部导游头像，弹出详细资料弹窗（而非联系方式）
- [ ] 弹窗展示：头像、名字、评分、服务次数、标签、个人简介、擅长领域
- [ ] 弹窗内容可上下滑动，不出现整体页面滚动
- [ ] 不显示联系方式（微信/手机）
- [ ] 王建国（张先生）和张雅芳（林女士）两位导游资料均能正确展示
- [ ] 关闭弹窗的三种方式均正常：点击遮罩、点击 ×、点击"知道了"
- [ ] 若导游数据匹配失败，弹窗不报错，优雅降级显示基础信息
