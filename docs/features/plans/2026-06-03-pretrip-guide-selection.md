# 行前 Tab · 导游选择功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在「行前」对话流的天气提醒后插入导游选择卡片，支持对话内 TOP3 快速选中与「查看更多」居中模态框列表+详情确认。

**Architecture:** 在现有 `renderCard(subtype)` 体系中新增 `guide` 分支；新增列表模态框 DOM，扩展现有详情模态框；通过 `selectGuide()` 统一处理选中并推进对话流。

**Tech Stack:** 纯 HTML/CSS/JS，无构建工具，无测试框架，手动浏览器验证。

---

## 文件结构

| 文件 | 变更类型 | 职责 |
|------|----------|------|
| `app.html` | 修改 | 核心：新增 CSS、模态框 HTML、USER_DB 数据、script 条目、JS 函数 |
| `data/users.js` | 修改 | 同步 `USER_DB` 的数据与脚本变更 |

---

## Task 1: 新增导游模拟数据到 USER_DB

**Files:**
- Modify: `app.html:1898`（在 zhang 的 `pretrip` 中 `itinerary` 之前插入 `guides`）
- Modify: `app.html:2223` 附近（在 lin 的 `pretrip` 中插入 `guides`）

**背景：** 每个用户的 `pretrip` 对象目前包含 `agentName`、`script`、`checklistMap`、`itinerary`。需要在 `checklistMap` 之后、`itinerary` 之前插入 `guides` 数组。

- [ ] **Step 1: 在 zhang 的 pretrip 中插入 guides 数据**

在 `app.html:1897`（`checklistMap` 结束后的 `},` 与 `// 行程卡片的定制数据` 之间）插入：

```javascript
      // 导游推荐数据
      guides: [
        { id: 'wangjianguo', name: '王建国 AI', avatar: 'assets/guides/wangjianguo.jpg', matchScore: 98, rating: 4.9, serviceCount: 1240, tags: ['建筑专家', '摄影师', '历史达人'], bio: '前建筑师，擅长从结构力学与建造工艺角度解读碉楼。会带你去普通游客找不到的机位拍日出，也能讲清楚每一扇窗楣背后的华侨故事。', specialties: ['建筑摄影', '历史讲解', '日出机位推荐', '材料演变'] },
        { id: 'chenyue', name: '陈月 AI', avatar: 'assets/guides/chenyue.jpg', matchScore: 92, rating: 4.8, serviceCount: 890, tags: ['摄影师', '光影魔术师', '夜景达人'], bio: '国家地理签约摄影师，专攻建筑与乡土人文。她熟悉碉楼一天中每个时刻的光线变化，知道哪扇窗在下午三点会有最美的阴影。', specialties: ['建筑摄影', '光影构图', '无人机航拍', '夜景长曝光'] },
        { id: 'liweimin', name: '李伟民 AI', avatar: 'assets/guides/liweimin.jpg', matchScore: 88, rating: 4.7, serviceCount: 2100, tags: ['历史达人', '华侨故事', '口述史'], bio: '开平本地 historian，走访过 300 多座碉楼，采访过 50 多位碉楼后人。他讲的故事不是书本上的，是爷爷奶奶亲口说的。', specialties: ['华侨历史', '口述史', '村落探访', '家谱溯源'] },
        { id: 'zhangxiaoya', name: '张晓雅 AI', avatar: 'assets/guides/zhangxiaoya.jpg', matchScore: 85, rating: 4.8, serviceCount: 1560, tags: ['美食家', '生活家', '本地通'], bio: '土生土长的开平姑娘，熟知每一家藏在巷子里的老字号。她能告诉你哪家黄鳝饭最正宗，哪间咖啡店的露台能看到最美的碉楼剪影。', specialties: ['本地美食', '咖啡探店', '生活美学', '手作体验'] },
        { id: 'liuwenshan', name: '刘文山 AI', avatar: 'assets/guides/liuwenshan.jpg', matchScore: 82, rating: 4.6, serviceCount: 670, tags: ['自然教育', '植物专家', '亲子友好'], bio: '生态学博士，研究方向是珠三角乡土植物。他知道马降龙竹林里每一种鸟叫声，也能教你怎么在稻田边辨认 20 种野草。', specialties: ['自然教育', '植物观察', '鸟类辨识', '生态摄影'] },
        { id: 'zhoumingxuan', name: '周明轩 AI', avatar: 'assets/guides/zhoumingxuan.jpg', matchScore: 78, rating: 4.7, serviceCount: 930, tags: ['文化学者', '艺术评论', '策展人'], bio: '当代艺术策展人，长期关注华侨建筑与身份认同议题。他能从一座碉楼的装饰细节，聊到全球化早期的文化流动与本土抵抗。', specialties: ['艺术评论', '文化研究', '展览导览', '当代视角'] }
      ],
```

- [ ] **Step 2: 在 lin 的 pretrip 中插入 guides 数据**

在 lin 的 `pretrip` 中 `checklistMap` 之后、`itinerary` 之前插入：

```javascript
      // 导游推荐数据
      guides: [
        { id: 'liuwenshan', name: '刘文山 AI', avatar: 'assets/guides/liuwenshan.jpg', matchScore: 97, rating: 4.6, serviceCount: 670, tags: ['亲子故事王', '自然教育', '植物专家'], bio: '生态学博士，会把碉楼变成孩子的「自然寻宝图」。他知道马降龙竹林里每一种鸟叫声，也能让 8 岁小朋友在稻田边认出 10 种野草。', specialties: ['亲子自然课', '植物观察', '鸟类辨识', '稻田研学'] },
        { id: 'zhangxiaoya', name: '张晓雅 AI', avatar: 'assets/guides/zhangxiaoya.jpg', matchScore: 93, rating: 4.8, serviceCount: 1560, tags: ['趣味历史', '美食家', '本地通'], bio: '土生土长的开平姑娘，擅长把华侨故事讲成冒险童话。她知道哪家黄鳝饭小朋友最爱吃，哪间咖啡店的露台有最好的碉楼剪影。', specialties: ['儿童故事', '本地美食', '手作体验', '生活美学'] },
        { id: 'liweimin', name: '李伟民 AI', avatar: 'assets/guides/liweimin.jpg', matchScore: 89, rating: 4.7, serviceCount: 2100, tags: ['历史达人', '华侨故事', '口述史'], bio: '开平本地 historian，走访过 300 多座碉楼。他会蹲下来跟孩子讲：「你看这扇铁门，当年是为了防土匪的，但花纹是不是很像你绘本里的城堡？」', specialties: ['华侨历史', '口述史', '村落探访', '互动讲解'] },
        { id: 'wangjianguo', name: '王建国 AI', avatar: 'assets/guides/wangjianguo.jpg', matchScore: 84, rating: 4.9, serviceCount: 1240, tags: ['建筑专家', '摄影师', '历史达人'], bio: '前建筑师，虽然专业术语多，但特别会「降维」给孩子讲结构。他会用积木比喻碉楼的防御体系，让小朋友秒懂为什么窗户那么小。', specialties: ['建筑启蒙', '结构游戏', '历史讲解', '摄影入门'] },
        { id: 'chenyue', name: '陈月 AI', avatar: 'assets/guides/chenyue.jpg', matchScore: 80, rating: 4.8, serviceCount: 890, tags: ['摄影师', '光影魔术师', '生活家'], bio: '国家地理签约摄影师，擅长用照片讲故事。她会教孩子怎么用妈妈的手机拍出「碉楼大片」，还会准备一份「小小摄影师任务卡」。', specialties: ['儿童摄影课', '光影游戏', '任务卡设计', '亲子拍照'] },
        { id: 'zhoumingxuan', name: '周明轩 AI', avatar: 'assets/guides/zhoumingxuan.jpg', matchScore: 76, rating: 4.7, serviceCount: 930, tags: ['文化学者', '艺术评论', '策展人'], bio: '当代艺术策展人，会带孩子用「找不同」的方式观察中西合璧的装饰细节。他准备了一套碉楼图案贴纸，讲完故事就发一张。', specialties: ['艺术启蒙', '图案观察', '贴纸游戏', '文化对比'] }
      ],
```

- [ ] **Step 3: Commit**

```bash
git add app.html
git commit -m "feat: add guide mock data for zhang and lin users"
```

---

## Task 2: 修改 pretrip.script 对话流

**Files:**
- Modify: `app.html:1882-1887`（zhang 的 script，weather 卡片后）
- Modify: `app.html:2216-2221`（lin 的 script，weather 卡片后）

**背景：** 在天气卡片 `subtype: 'weather'` 之后、原有 AI 汇总消息之前，插入导游推荐的 AI 消息、guide 卡片、user 占位消息、AI 确认消息。原有后续条目整体后移 4 个索引。

- [ ] **Step 1: 修改 zhang 的 script**

找到 zhang script 中的这一行（约 1882）：
```javascript
        { type: 'card', subtype: 'weather' },
```

将其替换为：
```javascript
        { type: 'card', subtype: 'weather' },
        { type: 'ai', content: '行程都安排得差不多了～最后一步，为你推荐几位匹配度超高的专属行中导游，他们会在景区实地带你深度逛碉楼：' },
        { type: 'card', subtype: 'guide' },
        { type: 'user', content: '就选TA吧' },
        { type: 'ai', content: '好的！已为你锁定 <b>{name}</b>。{name} 是 {tag}，{brief}。出发当天会提前在景区入口等你，有任何想调整的节奏随时沟通～<br><br>另外，你的 <b>高铁票、酒店、联票</b> 我都已汇总好，等一下会生成一张「行程卡片」给你，包含所有确认号、地址、联系人，可以一键分享给家人。<br><br>还有什么不放心的吗？比如想加购一份旅行意外险？' },
```

其中 `{name}`、`{tag}`、`{brief}` 不是模板字符串，而是占位文本——程序会在 `selectGuide()` 中把整条消息的 `content` 动态替换为实际导游信息。保留原始占位文本即可。

- [ ] **Step 2: 修改 lin 的 script**

找到 lin script 中的这一行（约 2216）：
```javascript
        { type: 'card', subtype: 'weather' },
```

将其替换为：
```javascript
        { type: 'card', subtype: 'weather' },
        { type: 'ai', content: '行程都安排得差不多了～最后一步，为你推荐几位匹配度超高的专属行中导游，他们会在景区实地带你深度逛碉楼，特别适合带小朋友的家庭：' },
        { type: 'card', subtype: 'guide' },
        { type: 'user', content: '就选TA吧' },
        { type: 'ai', content: '好的！已为你锁定 <b>{name}</b>。{name} 是 {tag}，{brief}。出发当天会提前在景区入口等你们，有任何想调整的节奏随时沟通～<br><br>另外，你的 <b>高铁票、民宿、接站车、联票</b> 我都已汇总好，等一下会生成一张「行程卡片」给你，包含所有确认号、地址、联系人，可以一键分享给同行朋友或家人。<br><br>还有什么不放心的吗？比如小朋友 dietary restrictions、或者想加购一份旅行意外险？' },
```

- [ ] **Step 3: Commit**

```bash
git add app.html
git commit -m "feat: insert guide selection into pretrip script flow"
```

---

## Task 3: 新增 CSS 样式

**Files:**
- Modify: `app.html`（在现有 `<style>` 标签内，`.weather-card` 样式之后插入）

- [ ] **Step 1: 插入 guide-card 与相关样式**

在 `.weather-card` 样式块之后（约第 80 行附近，`.w-tip` 样式之后）插入：

```css
  /* ── 导游选择卡片 ── */
  .guide-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-6); overflow: hidden; max-width: 94%; align-self: flex-start; box-shadow: var(--shadow-sm); animation: msgIn .4s ease-out both; }
  .guide-head { padding: 12px 16px; border-bottom: 1px solid var(--border); }
  .guide-head b { font-size: var(--fs-14); font-weight: 600; }
  .guide-body { padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; }
  .guide-option { display: flex; align-items: center; gap: 12px; padding: 10px; border: 1px solid var(--border); border-radius: var(--r-4); background: var(--bg-elevated); cursor: pointer; transition: all .2s; }
  .guide-option:hover { border-color: var(--accent); background: var(--accent-dim); }
  .guide-option.on { border-color: var(--accent); background: var(--accent-dim); }
  .guide-option.on::after { content: '✓ 已选择'; margin-left: auto; font-size: var(--fs-11); color: var(--accent); font-weight: 600; }
  .g-avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid var(--surface); box-shadow: var(--shadow-sm); flex-shrink: 0; background: var(--accent); display: grid; place-items: center; color: #fff; font-size: 18px; font-weight: 600; }
  .g-avatar img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
  .g-info { flex: 1; min-width: 0; }
  .g-name-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
  .g-name { font-size: var(--fs-14); font-weight: 600; color: var(--fg); }
  .g-match { padding: 2px 8px; border-radius: 10px; font-size: var(--fs-11); font-family: var(--font-mono); color: var(--accent); background: var(--accent-dim); border: 1px solid var(--accent); font-weight: 600; }
  .g-meta { display: flex; align-items: center; gap: 10px; font-size: var(--fs-12); color: var(--fg-dim); flex-wrap: wrap; }
  .g-meta .tag { padding: 2px 8px; border-radius: 6px; font-size: var(--fs-11); background: var(--surface); border: 1px solid var(--border); color: var(--muted); }
  .guide-more { text-align: center; padding-top: 6px; }
  .guide-more-btn { display: inline-flex; align-items: center; gap: 4px; font-size: var(--fs-13); color: var(--accent); font-weight: 600; cursor: pointer; background: none; border: none; padding: 6px 12px; border-radius: var(--r-4); transition: background .2s; }
  .guide-more-btn:hover { background: var(--accent-dim); }

  /* ── 导游列表模态框 ── */
  .guide-list-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 2000; display: none; align-items: center; justify-content: center; padding: 20px; opacity: 0; transition: opacity 0.3s ease; }
  .guide-list-overlay.show { display: flex; opacity: 1; }
  .guide-list-card { position: relative; width: 100%; max-width: 360px; max-height: 70vh; border-radius: var(--r-6); background: var(--surface); border: 1px solid var(--border); overflow: hidden; transform: scale(0.92) translateY(20px); transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1); box-shadow: 0 24px 60px -12px rgba(0,0,0,0.3); display: flex; flex-direction: column; }
  .guide-list-overlay.show .guide-list-card { transform: scale(1) translateY(0); }
  .gl-head { padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
  .gl-head b { font-size: var(--fs-16); font-weight: 600; }
  .gl-close { width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; font-size: 18px; color: var(--muted); background: var(--surface-2); border: 1px solid var(--border); cursor: pointer; transition: all 0.15s; }
  .gl-close:hover { background: var(--bg-elevated); color: var(--fg); }
  .gl-body { padding: 16px 20px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 10px; }
  .gl-item { display: flex; align-items: center; gap: 12px; padding: 10px; border: 1px solid var(--border); border-radius: var(--r-4); background: var(--bg-elevated); cursor: pointer; transition: all .2s; }
  .gl-item:hover { border-color: var(--accent); background: var(--accent-dim); }
  .gl-item .g-avatar { width: 40px; height: 40px; font-size: 16px; }
  .gl-item .g-name { font-size: var(--fs-13); }
  .gl-item .g-match { font-size: 10px; padding: 1px 6px; }
  .gl-item .g-meta { font-size: var(--fs-11); gap: 6px; }
```

- [ ] **Step 2: Commit**

```bash
git add app.html
git commit -m "feat: add guide selection card and list modal styles"
```

---

## Task 4: 新增与扩展模态框 HTML

**Files:**
- Modify: `app.html:1800-1823`（导游分配模态框区域）

- [ ] **Step 1: 在现有 guide-modal-overlay 后插入列表模态框**

找到 `app.html` 中 `</div>`（`guideModalOverlay` 结束标签，约第 1823 行），在其后插入：

```html
<!-- AI Target: 导游列表模态框 -->
<div class="guide-list-overlay" id="guideListOverlay" onclick="if(event.target===this)window.closeGuideListModal()">
  <div class="guide-list-card" id="guideListCard">
    <div class="gl-head">
      <b>选择你的专属导游</b>
      <div class="gl-close" onclick="window.closeGuideListModal()">×</div>
    </div>
    <div class="gl-body" id="guideListBody">
      <!-- 动态填充 -->
    </div>
  </div>
</div>
```

- [ ] **Step 2: 扩展现有 guide-modal-overlay 为详情+确认模态框**

将现有 `guideModalOverlay` 内部内容替换为：

```html
<!-- AI Target: 导游分配模态框（扩展为详情+确认） -->
<div class="guide-modal-overlay" id="guideModalOverlay" onclick="if(event.target===this)window.closeGuideModal()">
  <div class="guide-modal-card" id="guideModalCard">
    <div class="gm-glow"></div>
    <div class="gm-content">
      <div class="gm-badge">🎉 行程规划完成</div>
      <div class="gm-avatar-wrap">
        <img src="" alt="导游头像" class="gm-avatar" id="gmAvatar" />
      </div>
      <div class="gm-name" id="gmName"></div>
      <div class="gm-stats" id="gmStats" style="font-size:var(--fs-12);color:var(--fg-dim);margin-bottom:8px;"></div>
      <div class="gm-tag" id="gmTag"></div>
      <div class="gm-bio" id="gmBio"></div>
      <div class="gm-specialties" id="gmSpecialties" style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:12px;"></div>
      <div class="gm-divider"></div>
      <div class="gm-features">
        <div class="gm-feat"><span class="gm-ficon">📍</span><span class="gm-flabel">场景实时讲解</span></div>
        <div class="gm-feat"><span class="gm-ficon">🗣️</span><span class="gm-flabel">语音互动问答</span></div>
        <div class="gm-feat"><span class="gm-ficon">📸</span><span class="gm-flabel">拍照打卡提醒</span></div>
      </div>
      <button class="gm-btn" id="gmConfirmBtn" onclick="window.closeGuideModal();">
        开平碉楼见！
      </button>
    </div>
  </div>
</div>
```

注意：新增 `#gmStats` 统计行、`#gmSpecialties` specialties 标签区、以及把按钮的 onclick 改为通过 `#gmConfirmBtn` 动态绑定（后续 JS 中处理）。

- [ ] **Step 3: Commit**

```bash
git add app.html
git commit -m "feat: add guide list modal HTML and expand detail modal"
```

---

## Task 5: 实现 renderGuideCard 与 renderCard 扩展

**Files:**
- Modify: `app.html:3834-3844`（`renderCard` 函数）

- [ ] **Step 1: 扩展 renderCard switch**

将现有 `renderCard`：
```javascript
    function renderCard(subtype) {
      switch (subtype) {
        case 'checklist': renderChecklist(); break;
        case 'hotel': renderHotelCard(); break;
        case 'train': renderTrainCard(); break;
        case 'crowd': renderCrowdCard(); break;
        case 'route': renderRouteCard(); break;
        case 'weather': renderWeatherCard(); break;
        case 'itinerary': renderItineraryCard(); break;
      }
    }
```

改为：
```javascript
    function renderCard(subtype) {
      switch (subtype) {
        case 'checklist': renderChecklist(); break;
        case 'hotel': renderHotelCard(); break;
        case 'train': renderTrainCard(); break;
        case 'crowd': renderCrowdCard(); break;
        case 'route': renderRouteCard(); break;
        case 'weather': renderWeatherCard(); break;
        case 'guide': renderGuideCard(); break;
        case 'itinerary': renderItineraryCard(); break;
      }
    }
```

- [ ] **Step 2: 在 renderWeatherCard 之后新增 renderGuideCard 函数**

在 `renderWeatherCard` 函数结束后的 `showGuideModal` 函数之前（约第 3586 行之前）插入：

```javascript
    function renderGuideCard() {
      const user = USER_DB[currentUserId];
      const guides = user && user.pretrip && user.pretrip.guides ? user.pretrip.guides : [];
      const top3 = guides.slice(0, 3);

      const card = document.createElement('div');
      card.className = 'guide-card';
      card.id = 'guideCard';
      let html = `
        <div class="guide-head"><b>🎯 为你匹配的专属导游</b></div>
        <div class="guide-body">`;
      top3.forEach((g, idx) => {
        const tagsHtml = g.tags.map(t => `<span class="tag">${t}</span>`).join('');
        html += `
          <div class="guide-option" data-guide-id="${g.id}" onclick="window.selectGuideById('${g.id}', {fromTop3:true})">
            <div class="g-avatar"><img src="${g.avatar}" alt="${g.name}" onerror="this.style.display='none';this.parentNode.textContent='${g.name.charAt(0)}'" /></div>
            <div class="g-info">
              <div class="g-name-row">
                <span class="g-name">${g.name}</span>
                <span class="g-match">${g.matchScore}% 匹配</span>
              </div>
              <div class="g-meta">
                ${tagsHtml}
                <span>⭐ ${g.rating}</span>
                <span>👥 ${g.serviceCount}人服务</span>
              </div>
            </div>
          </div>`;
      });
      html += `
          <div class="guide-more">
            <button class="guide-more-btn" onclick="window.openGuideListModal()">查看更多 →</button>
          </div>
        </div>`;
      card.innerHTML = html;
      messagesEl.appendChild(card);
      scrollToBottom();
    }
```

- [ ] **Step 3: Commit**

```bash
git add app.html
git commit -m "feat: implement renderGuideCard and extend renderCard"
```

---

## Task 6: 实现模态框交互函数

**Files:**
- Modify: `app.html`（在 `showGuideModal` 函数之后、`toggleVoiceCallBubble` 之前插入新函数）

- [ ] **Step 1: 在 showGuideModal 之后插入交互函数**

找到 `showGuideModal` 函数（约第 3588 行），在其结束后、`window.closeGuideModal` 之前插入以下函数：

```javascript
    /* ── 导游选择交互 ── */
    window.openGuideListModal = function() {
      const user = USER_DB[currentUserId];
      const guides = user && user.pretrip && user.pretrip.guides ? user.pretrip.guides : [];
      const body = document.getElementById('guideListBody');
      if (!body) return;
      let html = '';
      guides.forEach(g => {
        const tagsHtml = g.tags.map(t => `<span class="tag">${t}</span>`).join('');
        html += `
          <div class="gl-item" onclick="window.openGuideDetailModal('${g.id}')">
            <div class="g-avatar"><img src="${g.avatar}" alt="${g.name}" onerror="this.style.display='none';this.parentNode.textContent='${g.name.charAt(0)}'" /></div>
            <div class="g-info">
              <div class="g-name-row">
                <span class="g-name">${g.name}</span>
                <span class="g-match">${g.matchScore}% 匹配</span>
              </div>
              <div class="g-meta">
                ${tagsHtml}
                <span>⭐ ${g.rating}</span>
                <span>👥 ${g.serviceCount}人服务</span>
              </div>
            </div>
          </div>`;
      });
      body.innerHTML = html;
      const overlay = document.getElementById('guideListOverlay');
      if (overlay) { overlay.style.display = ''; overlay.classList.add('show'); }
    };

    window.closeGuideListModal = function() {
      const el = document.getElementById('guideListOverlay');
      if (!el) return;
      el.classList.remove('show');
      el.style.display = 'none';
    };

    window.openGuideDetailModal = function(guideId) {
      const user = USER_DB[currentUserId];
      const guides = user && user.pretrip && user.pretrip.guides ? user.pretrip.guides : [];
      const guide = guides.find(g => g.id === guideId);
      if (!guide) return;

      // 隐藏列表模态框（保留在 DOM 下层）
      window.closeGuideListModal();

      // 填充详情模态框
      document.getElementById('gmAvatar').src = guide.avatar;
      document.getElementById('gmAvatar').alt = guide.name;
      document.getElementById('gmName').textContent = guide.name;
      document.getElementById('gmStats').innerHTML = `⭐ ${guide.rating} &nbsp;·&nbsp; 👥 ${guide.serviceCount}人服务 &nbsp;·&nbsp; 🎯 ${guide.matchScore}%匹配`;
      document.getElementById('gmTag').textContent = guide.tags.join(' · ');
      document.getElementById('gmBio').textContent = guide.bio;

      const specsEl = document.getElementById('gmSpecialties');
      if (specsEl) {
        specsEl.innerHTML = guide.specialties.map(s => `<span style="padding:4px 10px;border-radius:var(--r-2);font-size:var(--fs-12);border:1px solid var(--border);background:var(--surface);color:var(--fg-dim);">${s}</span>`).join('');
      }

      // 动态绑定确认按钮
      const btn = document.getElementById('gmConfirmBtn');
      if (btn) {
        btn.textContent = '确认选择';
        btn.onclick = function() { window.selectGuideById(guide.id, {fromList:true}); };
      }

      const overlay = document.getElementById('guideModalOverlay');
      if (overlay) { overlay.style.display = ''; overlay.classList.add('show'); }
    };

    window.selectGuideById = function(guideId, opts) {
      opts = opts || {};
      const user = USER_DB[currentUserId];
      const guides = user && user.pretrip && user.pretrip.guides ? user.pretrip.guides : [];
      const guide = guides.find(g => g.id === guideId);
      if (!guide) return;

      // 关闭所有模态框
      window.closeGuideModal();
      window.closeGuideListModal();

      // 更新用户数据
      user.during.agentName = guide.name;
      user.during.guideAvatar = guide.avatar;
      user.during.guideTag = guide.tags[0];

      // 更新对话内卡片选中状态（如果是从 TOP3 点击）
      if (opts.fromTop3) {
        const card = document.getElementById('guideCard');
        if (card) {
          card.querySelectorAll('.guide-option').forEach(opt => {
            if (opt.dataset.guideId === guideId) opt.classList.add('on');
            else opt.classList.remove('on');
          });
        }
      }

      // 替换占位 user 消息并推进对话
      if (script[currentStep + 1] && script[currentStep + 1].type === 'user') {
        script[currentStep + 1].content = `就选${guide.name}吧`;
      }

      // 动态替换下一条 AI 确认消息中的占位符
      if (script[currentStep + 2] && script[currentStep + 2].type === 'ai') {
        const brief = guide.bio.slice(0, 40) + (guide.bio.length > 40 ? '…' : '');
        script[currentStep + 2].content = script[currentStep + 2].content
          .replace(/\{name\}/g, guide.name)
          .replace(/\{tag\}/g, guide.tags[0])
          .replace(/\{brief\}/g, brief);
      }

      currentStep++;
      renderStep(currentStep);
      setTimeout(function() { autoAdvance(); }, 300);
    };
```

- [ ] **Step 2: 修改 closeGuideModal 以支持返回列表**

将现有 `window.closeGuideModal`：
```javascript
    window.closeGuideModal = function() {
      const el = document.getElementById('guideModalOverlay');
      if (!el) return;
      el.classList.remove('show');
      el.style.display = 'none';
    };
```

改为：
```javascript
    window.closeGuideModal = function() {
      const el = document.getElementById('guideModalOverlay');
      if (!el) return;
      el.classList.remove('show');
      el.style.display = 'none';
      // 重置按钮为默认状态
      const btn = document.getElementById('gmConfirmBtn');
      if (btn) { btn.textContent = '开平碉楼见！'; btn.onclick = function() { window.closeGuideModal(); }; }
    };
```

- [ ] **Step 3: Commit**

```bash
git add app.html
git commit -m "feat: implement guide selection modal interactions"
```

---

## Task 7: 同步 data/users.js

**Files:**
- Modify: `data/users.js`

- [ ] **Step 1: 将 app.html 中修改后的 USER_DB 相关部分同步到 data/users.js**

`data/users.js` 中的 `USER_DB` 结构与 `app.html` 完全一致。将以下变更同步：
1. zhang 的 `pretrip.guides` 数组
2. lin 的 `pretrip.guides` 数组
3. zhang 的 `pretrip.script` 中 weather 后的插入
4. lin 的 `pretrip.script` 中 weather 后的插入

最可靠的方式是：将 `app.html` 中 `const USER_DB = {` 到 `};`（USER_DB 结束）之间的完整内容，替换 `data/users.js` 中对应的部分。

- [ ] **Step 2: Commit**

```bash
git add data/users.js
git commit -m "feat: sync guide selection data to data/users.js"
```

---

## Task 8: 手动测试验证

**Files:**
- 无需修改文件

- [ ] **Step 1: 浏览器打开 app.html**

在浏览器中打开 `app.html`（使用本地文件协议 `file://` 或简单 HTTP 服务器）。

- [ ] **Step 2: 验证 zhang 用户的导游选择流程**

1. 页面加载后默认是 zhang 用户，行前 Tab 已打开
2. 快速点击对话区域，让对话推进到天气卡片之后
3. 观察是否出现「🎯 为你匹配的专属导游」卡片，包含 3 位导游
4. 点击其中一位导游 → 观察是否高亮显示"✓ 已选择"，并出现 user 消息"就选{name}吧"，随后 AI 回复确认消息
5. 刷新页面，重新推进到导游卡片
6. 点击「查看更多 →」→ 观察是否弹出居中列表模态框，显示 6 位导游
7. 点击列表中的一位导游 → 观察是否打开详情模态框，显示完整 bio、specialties、统计行
8. 点击「确认选择」→ 观察模态框是否关闭，对话是否推进

- [ ] **Step 3: 验证 lin 用户的导游选择流程**

1. 点击右上角用户切换器，切换到「林女士」
2. 观察行前 Tab 是否重置，重新推进对话
3. 验证导游推荐是否为亲子向（TOP3 标签应有「亲子故事王」「自然教育」等）
4. 重复 Step 2 的选中流程验证

- [ ] **Step 4: 验证 during Tab 导游同步**

1. 在行前 Tab 选择一位导游后，切换到「行中」Tab
2. 观察顶部导游信息是否更新为新选中的导游（名称、头像）

- [ ] **Step 5: Commit**

```bash
git commit -m "test: manual verification of guide selection flow"
```

---

## Self-Review Checklist

**1. Spec coverage:**
- [x] 对话内 TOP3 卡片 → Task 3 CSS + Task 5 renderGuideCard
- [x] 匹配度显示 → Task 5 `.g-match` 徽章
- [x] 标签、评分、服务人数 → Task 5 `.g-meta`
- [x] 头像 + fallback → Task 5 `onerror` 处理
- [x] 「查看更多」→ Task 6 `openGuideListModal`
- [x] 列表模态框（居中）→ Task 3 CSS + Task 4 HTML
- [x] 详情模态框 → Task 4 HTML 扩展 + Task 6 `openGuideDetailModal`
- [x] TOP3 直接选中推进对话 → Task 6 `selectGuideById({fromTop3:true})`
- [x] 列表→详情→确认推进对话 → Task 6 `selectGuideById({fromList:true})`
- [x] 更新 during 数据 → Task 6 `user.during.agentName/avatar/tag`
- [x] 按用户画像差异化 → Task 1 zhang/lin 不同 guides

**2. Placeholder scan:** 无 TBD/TODO/"implement later"。

**3. Type consistency:**
- `selectGuideById(guideId, opts)` 在所有调用处签名一致
- `fromTop3` / `fromList` 选项键名一致

**4. 已知限制：**
- 导游头像使用 `assets/guides/*.jpg` 路径，项目中暂无真实图片；`onerror` fallback 已处理
- 无自动化测试，全部依赖 Task 8 手动验证
