# 导游详细资料弹窗 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将【行中】Tab 点击导游头像弹出的"联系方式"弹窗改为展示导游详细资料（头像、评分、标签、简介、擅长领域），内容可滚动。

**Architecture:** 复用现有 `guide-modal-overlay` + `guide-modal-card` 外壳，替换内部 HTML 结构、CSS 样式和 JS 填充逻辑。所有改动集中在 `app.html` 单文件内。

**Tech Stack:** 纯 HTML/CSS/JS，无构建工具，无测试框架（验证方式为浏览器手动测试）。

---

## File Structure

| File | Responsibility |
|------|---------------|
| `app.html` | 唯一修改文件。包含弹窗 HTML 结构、内联 CSS、内联 JS。需修改 3 处：HTML 模板（~2386-2419）、CSS 样式（~344-351 及 .gm-content）、JS 填充逻辑（~5299-5318）。 |

---

## Task 1: 修改弹窗 HTML 结构

**Files:**
- Modify: `app.html:2386-2419`

- [ ] **Step 1: 替换弹窗内部 HTML**

  将 `guideContactCard` 内部的联系方式列表和提示语替换为详细资料布局。

  **Old string:**
  ```html
  <!-- AI Target: 导游联系方式弹窗（行中头像点击） -->
  <div class="guide-modal-overlay" id="guideContactOverlay" onclick="if(event.target===this)window.closeGuideContactModal()">
    <div class="guide-modal-card" id="guideContactCard">
      <div class="gm-glow"></div>
      <div class="gm-close" onclick="window.closeGuideContactModal()">×</div>
      <div class="gm-content">
        <div class="gm-avatar-wrap">
          <img src="" alt="导游头像" class="gm-avatar" id="gcAvatar" />
          <span class="gm-status"></span>
        </div>
        <div class="gm-name" id="gcName"></div>
        <div class="gm-tag" id="gcTag"></div>
        <div class="gm-divider"></div>
        <div class="gc-contact-list">
          <div class="gc-contact-item">
            <span class="gc-contact-icon">💬</span>
            <div class="gc-contact-info">
              <span class="gc-contact-label">企业微信</span>
              <span class="gc-contact-value" id="gcWeixin"></span>
            </div>
          </div>
          <div class="gc-contact-item">
            <span class="gc-contact-icon">📱</span>
            <div class="gc-contact-info">
              <span class="gc-contact-label">手机号</span>
              <span class="gc-contact-value" id="gcPhone"></span>
            </div>
          </div>
        </div>
        <div class="gc-note">💡 有问题找我，随时在线～</div>
        <button class="gm-btn" onclick="window.closeGuideContactModal();" style="margin-top:12px;">知道了</button>
      </div>
    </div>
  </div>
  ```

  **New string:**
  ```html
  <!-- AI Target: 导游详细资料弹窗（行中头像点击） -->
  <div class="guide-modal-overlay" id="guideContactOverlay" onclick="if(event.target===this)window.closeGuideContactModal()">
    <div class="guide-modal-card" id="guideContactCard">
      <div class="gm-glow"></div>
      <div class="gm-close" onclick="window.closeGuideContactModal()">×</div>
      <div class="gm-content">
        <div class="gm-avatar-wrap">
          <img src="" alt="导游头像" class="gm-avatar" id="gcAvatar" />
          <span class="gm-status"></span>
        </div>
        <div class="gm-name" id="gcName"></div>
        <div class="gm-tag" id="gcTag"></div>
        <div class="gm-stats-row" id="gcStats"></div>
        <div class="gm-tags-row" id="gcTags"></div>
        <div class="gm-divider"></div>
        <div class="gm-bio-text" id="gcBio"></div>
        <div class="gm-section-title">擅长领域</div>
        <div class="gm-specs-row" id="gcSpecs"></div>
        <button class="gm-btn" onclick="window.closeGuideContactModal();">知道了</button>
      </div>
    </div>
  </div>
  ```

  **验证方式：** 用编辑器打开 `app.html`，搜索 `gcWeixin` 和 `gcPhone`，确认这两个 id 已不存在。

- [ ] **Step 2: Commit**

  ```bash
  git add app.html
  git commit -m "feat: replace guide contact modal HTML with profile layout

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
  ```

---

## Task 2: 更新 CSS 样式

**Files:**
- Modify: `app.html:244-249`（.gm-content 添加滚动）
- Modify: `app.html:344-351`（移除旧 gc-contact 样式）
- Modify: `app.html:351-352`（插入新样式）

- [ ] **Step 1: 给 .gm-content 添加滚动能力**

  **Old string:**
  ```css
  .guide-modal-card .gm-content {
    position: relative;
    z-index: 1;
    padding: 24px 20px 20px;
    text-align: center;
  }
  ```

  **New string:**
  ```css
  .guide-modal-card .gm-content {
    position: relative;
    z-index: 1;
    padding: 24px 20px 20px;
    text-align: center;
    max-height: calc(75vh - 40px);
    overflow-y: auto;
  }
  ```

- [ ] **Step 2: 移除旧的联系方式样式，替换为详细资料样式**

  **Old string:**
  ```css
  /* ── 导游联系方式弹窗 ── */
  .gc-contact-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
  .gc-contact-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: var(--r-4); background: var(--bg-elevated); border: 1px solid var(--border); text-align: left; }
  .gc-contact-icon { font-size: 22px; flex-shrink: 0; }
  .gc-contact-info { display: flex; flex-direction: column; gap: 2px; }
  .gc-contact-label { font-size: var(--fs-12); color: var(--muted); }
  .gc-contact-value { font-size: var(--fs-14); font-weight: 600; color: var(--fg); font-family: var(--font-mono); }
  .gc-note { font-size: var(--fs-12); color: var(--accent); background: var(--accent-dim); padding: 8px 12px; border-radius: var(--r-4); border: 1px solid var(--accent); margin-bottom: 4px; }
  ```

  **New string:**
  ```css
  /* ── 导游详细资料弹窗 ── */
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
  .gm-bio-text {
    font-size: var(--fs-13);
    color: var(--fg-dim);
    line-height: 1.7;
    text-align: left;
    padding: 0 8px;
    margin-bottom: 14px;
  }
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
  ```

  **验证方式：** 搜索 `gc-contact-list`，确认已不存在；搜索 `gm-stats-row`，确认已存在。

- [ ] **Step 3: Commit**

  ```bash
  git add app.html
  git commit -m "feat: add guide profile popup styles, remove contact styles

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
  ```

---

## Task 3: 更新 JS 填充逻辑

**Files:**
- Modify: `app.html:5299-5318`

- [ ] **Step 1: 重写 showGuideContactModal 函数**

  **Old string:**
  ```javascript
    /* ── 导游联系方式弹窗 ── */
    window.showGuideContactModal = function() {
      const user = USER_DB[currentUserId];
      const during = user && user.during;
      const gAvatar = (during && during.guideAvatar) || 'mpsglqy0-ai_avatar.png';
      const gName = (during && during.agentName) || '专属导游';
      const gTag = (during && during.guideTag) || '开平碉楼 · 场景讲解';
      const gWeixin = (during && during.guideWeixin) || 'wxid_guide2025';
      const gPhone = (during && during.guidePhone) || '138-0000-0000';

      document.getElementById('gcAvatar').src = gAvatar;
      document.getElementById('gcAvatar').alt = gName;
      document.getElementById('gcName').textContent = gName;
      document.getElementById('gcTag').textContent = gTag;
      document.getElementById('gcWeixin').textContent = gWeixin;
      document.getElementById('gcPhone').textContent = gPhone;

      const overlay = document.getElementById('guideContactOverlay');
      if (overlay) { overlay.style.display = ''; overlay.classList.add('show'); }
    };
  ```

  **New string:**
  ```javascript
    /* ── 导游详细资料弹窗 ── */
    window.showGuideContactModal = function() {
      const user = USER_DB[currentUserId];
      const during = user && user.during;
      const gAvatar = (during && during.guideAvatar) || 'mpsglqy0-ai_avatar.png';
      const gName = (during && during.agentName) || '专属导游';
      const gTag = (during && during.guideTag) || '开平碉楼 · 场景讲解';

      // 从 guides 数组中匹配完整导游数据
      const guides = (user && user.pretrip && user.pretrip.guides) || [];
      const guide = guides.find(function(g) { return g.name === gName; });

      document.getElementById('gcAvatar').src = gAvatar;
      document.getElementById('gcAvatar').alt = gName;
      document.getElementById('gcName').textContent = gName;
      document.getElementById('gcTag').textContent = gTag;

      // 评分 + 服务次数
      var statsHtml = '';
      if (guide) {
        statsHtml += '<span class="gm-stat"><span class="gm-star">★</span><span class="gm-stat-val">' + (guide.rating || '') + '</span></span>';
        statsHtml += '<span class="gm-stat">' + (guide.serviceCount || 0) + ' 次服务</span>';
      }
      document.getElementById('gcStats').innerHTML = statsHtml;

      // 标签
      var tagsHtml = '';
      if (guide && guide.tags && guide.tags.length) {
        guide.tags.forEach(function(tag) {
          tagsHtml += '<span class="gm-tag-pill">' + tag + '</span>';
        });
      }
      document.getElementById('gcTags').innerHTML = tagsHtml;

      // 个人简介
      document.getElementById('gcBio').textContent = (guide && guide.bio) ? guide.bio : '';

      // 擅长领域
      var specsHtml = '';
      if (guide && guide.specialties && guide.specialties.length) {
        guide.specialties.forEach(function(spec) {
          specsHtml += '<span class="gm-tag-pill">' + spec + '</span>';
        });
      }
      document.getElementById('gcSpecs').innerHTML = specsHtml;

      const overlay = document.getElementById('guideContactOverlay');
      if (overlay) { overlay.style.display = ''; overlay.classList.add('show'); }
    };
  ```

  **关键说明：**
  - 使用 `function` 而非箭头函数，保持与现有代码风格一致
  - `guides.find()` 匹配 `name === gName`。王建国对应 `agentName: '王建国 AI'`，张雅芳对应 `agentName: '张雅芳AI'`（注意后者无空格），需确保 `pretrip.guides` 中的 `name` 字段与之完全匹配
  - 降级逻辑：若 `guide` 未匹配到，`stats`、`tags`、`bio`、`specs` 均留空，弹窗仍显示头像+名字+标签，不报错

  **验证方式：**
  - 搜索 `gcWeixin` 和 `gcPhone`，确认这两个 id 的赋值逻辑已不存在
  - 搜索 `guideWeixin` 和 `guidePhone`，确认已从函数中移除

- [ ] **Step 2: Commit**

  ```bash
  git add app.html
  git commit -m "feat: rewrite showGuideContactModal to render full guide profile

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
  ```

---

## Task 4: 手动验证

**Files:**
- Test: `app.html`（浏览器中打开验证）

- [ ] **Step 1: 验证王建国（张先生）**

  1. 用浏览器打开 `app.html`
  2. 确保当前用户是 `zhang`（若不是，从 localStorage 设置 `hx_current_user = 'zhang'` 后刷新）
  3. 切换到【行中】Tab
  4. 点击顶部导游头像
  5. **期望结果：**
     - 弹窗标题/名字显示"王建国 AI"
     - 显示评分 ★4.9、服务次数 1240 次服务
     - 标签行显示：建筑专家、摄影师、历史达人
     - 个人简介显示完整的 bio 文本
     - 擅长领域显示：建筑摄影、历史讲解、日出机位推荐、材料演变
     - **不显示** 企业微信和手机号
     - 内容可上下滑动
     - 点击遮罩/×/知道了均可关闭

- [ ] **Step 2: 验证张雅芳（林女士）**

  1. 切换用户为 `lin`（localStorage 设置 `hx_current_user = 'lin'` 后刷新）
  2. 切换到【行中】Tab
  3. 点击顶部导游头像
  4. **期望结果：**
     - 弹窗标题/名字显示"张雅芳AI"
     - 显示评分 ★4.6、服务次数 670 次服务
     - 标签行显示：亲子故事王、自然教育、植物专家
     - 个人简介显示完整的 bio 文本
     - 擅长领域显示：亲子自然课、植物观察、鸟类辨识、稻田研学
     - **不显示** 企业微信和手机号

- [ ] **Step 3: 验证降级情况（可选）**

  在浏览器控制台临时执行：
  ```javascript
  USER_DB.lin.pretrip.guides = []; // 清空 guides
  showGuideContactModal();
  ```
  **期望结果：** 弹窗正常弹出，只显示头像+名字+标签，评分/标签/简介/擅长领域区域为空，不报错。

- [ ] **Step 4: Commit（如有修复）**

  若验证中发现问题并修复：
  ```bash
  git add app.html
  git commit -m "fix: adjust guide profile popup after manual testing

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
  ```

---

## Plan Self-Review

### Spec Coverage Checklist

| Spec 需求 | 对应 Task |
|-----------|-----------|
| 复用现有弹窗外壳 | Task 1 |
| 卡片 max-height 75vh + 内容滚动 | Task 2 Step 1 |
| 展示头像+名字 | Task 1、Task 3 |
| 展示评分+服务次数 | Task 1（HTML）、Task 2（CSS）、Task 3（JS） |
| 展示标签 | Task 1（HTML）、Task 2（CSS）、Task 3（JS） |
| 展示个人简介 | Task 1（HTML）、Task 2（CSS）、Task 3（JS） |
| 展示擅长领域 | Task 1（HTML）、Task 2（CSS）、Task 3（JS） |
| 移除联系方式 | Task 1（HTML）、Task 2（CSS）、Task 3（JS） |
| 从 guides 数组匹配数据 | Task 3 |
| 降级逻辑 | Task 3 |
| 王建国+张雅芳覆盖 | Task 4 验证 |

### Placeholder Scan

- ✅ 无 "TBD" / "TODO" / "implement later"
- ✅ 无 "Add appropriate error handling" 等模糊描述
- ✅ 所有代码步骤包含完整 old_string / new_string
- ✅ 无 "Similar to Task N" 引用

### Type Consistency

- ✅ 函数名 `showGuideContactModal` / `closeGuideContactModal` 保持一致
- ✅ DOM id 命名统一：`gcStats`、`gcTags`、`gcBio`、`gcSpecs`
- ✅ CSS class 命名统一：`gm-stats-row`、`gm-tags-row`、`gm-tag-pill`、`gm-bio-text`、`gm-section-title`、`gm-specs-row`
