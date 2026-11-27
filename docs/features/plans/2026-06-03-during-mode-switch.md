# During Tab 形态切换实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在行中 Tab（`#tab-during`）添加对话 / 播客 / 视频三种形态切换，实现播客播放器，视频用占位图代替。

**Architecture:** 在现有 `chat-scroll` 下方新增两个同级容器（`during-podcast-view`、`during-video-view`），在 `compose-bar` 上方新增形态切换条 `mode-switcher`。三种视图通过 CSS `display` 切换。播客播放器使用独立 `<audio>` 元素，列表数据从 `chatData` 动态提取，解锁范围由 `aiMsgCounter` 控制。

**Tech Stack:** 纯 HTML/CSS/JS，无构建工具，无测试框架，验证方式为浏览器手动测试。

---

## 文件结构

| 文件 | 操作 | 说明 |
|------|------|------|
| `app.html` | 修改 | 插入播客/视频视图 HTML、形态切换条、播客播放器 JS 逻辑 |
| `css/app.css` | 修改 | 新增 `.mode-switcher`、`.during-secondary-view`、播客播放器全套样式 |

---

### Task 1: 插入播客视图与视频占位视图 HTML

**Files:**
- Modify: `app.html:1737-1739`

在 `chat-scroll` 结束标签之后、`tap-hint` 之前插入两个视图容器。

- [ ] **Step 1: 插入播客视图 HTML**

```html
    <!-- 播客视图 -->
    <div class="during-secondary-view hidden" id="during-podcast-view">
      <div class="podcast-hero" id="podcast-hero">
        <div class="podcast-hero-bg" id="podcast-hero-bg"></div>
        <div class="podcast-hero-content">
          <div class="podcast-location" id="podcast-location">🏛️ 景点名称</div>
          <div class="podcast-title" id="podcast-title">语音标题</div>
          <div class="podcast-controls">
            <button class="podcast-btn-prev" id="podcast-btn-prev" aria-label="上一首">⏮</button>
            <button class="podcast-btn-play" id="podcast-btn-play" aria-label="播放">▶</button>
            <button class="podcast-btn-next" id="podcast-btn-next" aria-label="下一首">⏭</button>
          </div>
          <div class="podcast-progress-wrap">
            <div class="podcast-progress-bar" id="podcast-progress-bar">
              <div class="podcast-progress-fill" id="podcast-progress-fill"></div>
            </div>
            <div class="podcast-time">
              <span id="podcast-current-time">00:00</span>
              <span id="podcast-duration">--:--</span>
            </div>
          </div>
        </div>
      </div>
      <div class="podcast-episodes" id="podcast-episodes">
        <div class="podcast-episodes-header">📋 已解锁讲解</div>
        <div class="podcast-episodes-list" id="podcast-episodes-list"></div>
      </div>
    </div>

    <!-- 视频占位视图 -->
    <div class="during-secondary-view hidden" id="during-video-view">
      <div class="video-placeholder">
        <img src="48136c107faa68f0b97a0040864daf33.webp" alt="视频通话即将上线" />
        <p>📹 视频通话功能即将上线</p>
      </div>
    </div>
```

- [ ] **Step 2: 在浏览器中确认 HTML 无语法错误**

打开 `app.html`，确认页面能正常加载，控制台无 HTML 解析错误。

---

### Task 2: 插入形态切换条 HTML

**Files:**
- Modify: `app.html`（在 `tap-hint` 之后、`compose-bar` 之前插入）

- [ ] **Step 1: 插入 mode-switcher**

```html
    <!-- 形态切换条 -->
    <div class="mode-switcher" id="mode-switcher">
      <button class="mode-btn active" data-mode="chat">💬 对话</button>
      <button class="mode-btn" data-mode="podcast">🎧 播客</button>
      <button class="mode-btn" data-mode="video">📹 视频</button>
    </div>
```

- [ ] **Step 2: 确认按钮在页面底部可见**

刷新浏览器，确认三个按钮水平排列在底部输入栏上方。

---

### Task 3: 添加 CSS 样式

**Files:**
- Modify: `css/app.css`（追加到文件末尾）

- [ ] **Step 1: 追加全部新样式**

```css
/* ═══════════════════════════════════════════
   形态切换条 Mode Switcher
   ═══════════════════════════════════════════ */
.mode-switcher {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 6px 16px;
  background: var(--surface);
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}
.mode-btn {
  flex: 1;
  max-width: 120px;
  padding: 8px 12px;
  border: none;
  border-radius: 100px;
  background: transparent;
  color: var(--muted);
  font-size: var(--fs-13);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
.mode-btn.active {
  background: var(--accent);
  color: #fff;
}

/* ═══════════════════════════════════════════
   二级视图容器（播客 / 视频）
   ═══════════════════════════════════════════ */
.during-secondary-view {
  flex: 1;
  overflow-y: auto;
  display: none;
  flex-direction: column;
}
.during-secondary-view:not(.hidden) {
  display: flex;
}

/* ═══════════════════════════════════════════
   播客 Hero 播放卡片
   ═══════════════════════════════════════════ */
.podcast-hero {
  position: relative;
  min-height: 45%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 20px 16px;
  overflow: hidden;
  flex-shrink: 0;
}
.podcast-hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transition: transform 4s ease-in-out;
}
.podcast-hero.playing .podcast-hero-bg {
  animation: podcastBreathe 4s ease-in-out infinite;
}
@keyframes podcastBreathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}
.podcast-hero-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, oklch(20% 0 0 / 0.72) 0%, oklch(20% 0 0 / 0.3) 50%, transparent 100%);
}
.podcast-hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.podcast-location {
  display: inline-flex;
  align-self: flex-start;
  padding: 4px 10px;
  border-radius: 100px;
  background: oklch(20% 0 0 / 0.5);
  color: #fff;
  font-size: var(--fs-12);
  backdrop-filter: blur(4px);
}
.podcast-title {
  color: #fff;
  font-size: var(--fs-18);
  font-weight: 600;
  line-height: 1.4;
  text-shadow: 0 2px 8px oklch(0% 0 0 / 0.4);
}
.podcast-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}
.podcast-btn-prev,
.podcast-btn-next {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: oklch(100% 0 0 / 0.2);
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background 0.15s;
}
.podcast-btn-prev:hover,
.podcast-btn-next:hover {
  background: oklch(100% 0 0 / 0.35);
}
.podcast-btn-play {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: var(--accent);
  color: #fff;
  font-size: 22px;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: transform 0.15s;
}
.podcast-btn-play:active {
  transform: scale(0.92);
}
.podcast-progress-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.podcast-progress-bar {
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: oklch(100% 0 0 / 0.25);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.podcast-progress-fill {
  height: 100%;
  width: 0%;
  background: var(--accent);
  border-radius: 2px;
  transition: width 0.1s linear;
}
.podcast-progress-bar:hover {
  height: 6px;
}
.podcast-time {
  display: flex;
  justify-content: space-between;
  color: oklch(100% 0 0 / 0.7);
  font-size: var(--fs-11);
  font-family: var(--font-mono);
}

/* ═══════════════════════════════════════════
   播客片段列表
   ═══════════════════════════════════════════ */
.podcast-episodes {
  padding: 12px 0;
  flex: 1;
  overflow-y: auto;
}
.podcast-episodes-header {
  padding: 8px 16px;
  font-size: var(--fs-13);
  color: var(--muted);
  font-weight: 500;
}
.podcast-episodes-list {
  display: flex;
  flex-direction: column;
}
.podcast-episode {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s;
  border-left: 3px solid transparent;
}
.podcast-episode:hover {
  background: var(--bg-elevated);
}
.podcast-episode.active {
  background: var(--accent-dim);
  border-left-color: var(--accent);
}
.podcast-episode-num {
  width: 36px;
  font-family: var(--font-mono);
  font-size: var(--fs-13);
  color: var(--accent);
  flex-shrink: 0;
}
.podcast-episode-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.podcast-episode-title {
  font-size: var(--fs-14);
  color: var(--fg);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.podcast-episode-tag {
  display: inline-flex;
  align-self: flex-start;
  padding: 2px 8px;
  border-radius: 100px;
  background: var(--surface-2);
  color: var(--muted);
  font-size: var(--fs-11);
}
.podcast-episode-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.podcast-episode-status {
  font-size: var(--fs-12);
}
.podcast-episode-duration {
  font-size: var(--fs-11);
  font-family: var(--font-mono);
  color: var(--muted);
}
.podcast-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 12px;
  color: var(--muted);
}
.podcast-empty svg {
  width: 48px;
  height: 48px;
  opacity: 0.4;
}

/* ═══════════════════════════════════════════
   视频占位页
   ═══════════════════════════════════════════ */
.video-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  gap: 16px;
}
.video-placeholder img {
  width: 80%;
  max-width: 280px;
  border-radius: var(--r-6);
  box-shadow: var(--shadow-md);
}
.video-placeholder p {
  font-size: var(--fs-14);
  color: var(--muted);
}
```

- [ ] **Step 2: 刷新浏览器确认样式加载**

确认 `mode-switcher` 显示在底部，三个按钮水平排列。

---

### Task 4: JavaScript 状态初始化与形态切换

**Files:**
- Modify: `app.html:3304-3307`（在 `chatIndex/isTyping/aiMsgCounter` 定义下方插入）
- Modify: `app.html:3476-3489`（在 `resetDuringUI` 函数内添加播客重置）

- [ ] **Step 1: 添加全局状态变量**

在 `app.html` 中，找到这段代码：

```js
  const chatScroll = document.getElementById('chat-scroll');
  let chatIndex = 0;
  let isTyping = false;
  let aiMsgCounter = 0;  // AI Target: 导游AI消息计数器，用于匹配语音文件序号
```

在其下方插入：

```js
  window.duringMode = 'chat';
  window.podcastPlayer = {
    currentIndex: 0,
    isPlaying: false,
    audio: new Audio(),
    progress: 0,
    duration: 0
  };
```

- [ ] **Step 2: 添加形态切换核心函数**

在 `app.html` 的 JS 区域内（建议放在 `resetDuringUI` 函数下方、`// ═══════════════════════════════════════════` 注释之前），插入：

```js
  function switchDuringMode(mode) {
    if (mode === window.duringMode) return;

    const chatScrollEl = document.getElementById('chat-scroll');
    const podcastView = document.getElementById('during-podcast-view');
    const videoView = document.getElementById('during-video-view');
    const tapHint = document.getElementById('tap-hint');
    const composeBar = document.querySelector('#tab-during .compose-bar');
    const modeBtns = document.querySelectorAll('.mode-btn');

    // 更新按钮状态
    modeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // 暂停当前模式的播放
    if (window.duringMode === 'chat') {
      const guideAudio = document.getElementById('guide-audio');
      if (guideAudio) { guideAudio.pause(); guideAudio.currentTime = 0; }
    } else if (window.duringMode === 'podcast') {
      pausePodcast();
    }

    // 切换视图
    if (mode === 'chat') {
      chatScrollEl.style.display = '';
      podcastView.classList.add('hidden');
      videoView.classList.add('hidden');
      if (tapHint) tapHint.style.display = '';
      if (composeBar) composeBar.style.display = '';
    } else if (mode === 'podcast') {
      chatScrollEl.style.display = 'none';
      podcastView.classList.remove('hidden');
      videoView.classList.add('hidden');
      if (tapHint) tapHint.style.display = 'none';
      if (composeBar) composeBar.style.display = '';
      renderPodcastEpisodes();
      renderPodcastHero(window.podcastPlayer.currentIndex);
    } else if (mode === 'video') {
      chatScrollEl.style.display = 'none';
      podcastView.classList.add('hidden');
      videoView.classList.remove('hidden');
      if (tapHint) tapHint.style.display = 'none';
      if (composeBar) composeBar.style.display = '';
    }

    window.duringMode = mode;
  }

  function pausePodcast() {
    const p = window.podcastPlayer;
    if (p.audio) { p.audio.pause(); }
    p.isPlaying = false;
    const playBtn = document.getElementById('podcast-btn-play');
    if (playBtn) playBtn.textContent = '▶';
    const hero = document.getElementById('podcast-hero');
    if (hero) hero.classList.remove('playing');
  }
```

- [ ] **Step 3: 在 `resetDuringUI` 中加入播客重置**

找到 `window.resetDuringUI` 函数，在 `audio.src = '';` 这一行之后、`if (chatScroll) chatScroll.innerHTML = '';` 之前插入：

```js
    // 重置播客播放器
    window.duringMode = 'chat';
    pausePodcast();
    window.podcastPlayer.currentIndex = 0;
    window.podcastPlayer.progress = 0;
    window.podcastPlayer.duration = 0;
    const podcastView = document.getElementById('during-podcast-view');
    const videoView = document.getElementById('during-video-view');
    const modeBtns = document.querySelectorAll('.mode-btn');
    if (podcastView) podcastView.classList.add('hidden');
    if (videoView) videoView.classList.add('hidden');
    modeBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === 'chat'));
```

- [ ] **Step 4: 绑定形态切换按钮点击事件**

在 `app.html` JS 区域末尾（或与其他事件监听器一起），插入：

```js
  document.querySelectorAll('#mode-switcher .mode-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      switchDuringMode(this.dataset.mode);
    });
  });
```

- [ ] **Step 5: 浏览器验证切换功能**

刷新浏览器，进入 during tab，点击底部的"播客"和"视频"按钮，确认视图能正确切换，对话内容隐藏/显示正常。

---

### Task 5: 播客播放器核心逻辑

**Files:**
- Modify: `app.html`（在 `switchDuringMode` 函数附近追加）

- [ ] **Step 1: 实现播放/暂停/进度控制函数**

```js
  function getPodcastEpisodes() {
    const episodes = [];
    let aiIndex = 0;
    for (let i = 0; i < window.chatData.length; i++) {
      const item = window.chatData[i];
      if (item.sender === 'ai' || item.type === 'ai') {
        if (aiIndex >= aiMsgCounter) break;
        episodes.push({
          index: aiIndex,
          dataIndex: i,
          title: (item.text || '').slice(0, 30) + ((item.text || '').length > 30 ? '…' : ''),
          location: item.location || '',
          audioSrc: getAudioPath(aiIndex)
        });
        aiIndex++;
      }
    }
    return episodes;
  }

  function getAudioPath(aiIndex) {
    var voiceDir = currentUserId === 'lin' ? 'assets/lin_audios/' : 'assets/audios/';
    return voiceDir + '导游语音_' + String(aiIndex).padStart(2, '0') + '.mp3?v=2';
  }

  function playPodcastEpisode(index) {
    const episodes = getPodcastEpisodes();
    if (index < 0 || index >= episodes.length) return;

    const p = window.podcastPlayer;
    const episode = episodes[index];
    p.currentIndex = index;
    p.audio.src = episode.audioSrc;
    p.audio.load();
    p.audio.play().then(function() {
      p.isPlaying = true;
      const playBtn = document.getElementById('podcast-btn-play');
      if (playBtn) playBtn.textContent = '⏸';
      const hero = document.getElementById('podcast-hero');
      if (hero) hero.classList.add('playing');
      renderPodcastHero(index);
      renderPodcastEpisodes();
    }).catch(function(err) {
      console.warn('播客播放失败:', err.message);
    });
  }

  function togglePodcastPlay() {
    const p = window.podcastPlayer;
    const episodes = getPodcastEpisodes();
    if (episodes.length === 0) return;
    if (p.isPlaying) {
      p.audio.pause();
      p.isPlaying = false;
      document.getElementById('podcast-btn-play').textContent = '▶';
      document.getElementById('podcast-hero').classList.remove('playing');
    } else {
      // 如果没有设置过 src，播放当前索引
      if (!p.audio.src || p.audio.src === window.location.href) {
        playPodcastEpisode(p.currentIndex);
      } else {
        p.audio.play().then(function() {
          p.isPlaying = true;
          document.getElementById('podcast-btn-play').textContent = '⏸';
          document.getElementById('podcast-hero').classList.add('playing');
        });
      }
    }
  }

  function playNextEpisode() {
    const episodes = getPodcastEpisodes();
    const next = window.podcastPlayer.currentIndex + 1;
    if (next < episodes.length) {
      playPodcastEpisode(next);
    } else {
      pausePodcast();
    }
  }

  function playPrevEpisode() {
    const prev = window.podcastPlayer.currentIndex - 1;
    if (prev >= 0) {
      playPodcastEpisode(prev);
    }
  }

  function formatTime(sec) {
    if (!isFinite(sec) || sec < 0) return '--:--';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  function updatePodcastProgress() {
    const p = window.podcastPlayer;
    const fill = document.getElementById('podcast-progress-fill');
    const curTime = document.getElementById('podcast-current-time');
    const durTime = document.getElementById('podcast-duration');
    if (!p.audio || !fill) return;
    const pct = p.audio.duration ? (p.audio.currentTime / p.audio.duration * 100) : 0;
    fill.style.width = pct + '%';
    if (curTime) curTime.textContent = formatTime(p.audio.currentTime);
    if (durTime) durTime.textContent = formatTime(p.audio.duration);
  }

  // 音频事件绑定
  (function bindPodcastAudioEvents() {
    const p = window.podcastPlayer;
    p.audio.addEventListener('timeupdate', updatePodcastProgress);
    p.audio.addEventListener('ended', function() {
      p.isPlaying = false;
      const playBtn = document.getElementById('podcast-btn-play');
      if (playBtn) playBtn.textContent = '▶';
      const hero = document.getElementById('podcast-hero');
      if (hero) hero.classList.remove('playing');
      playNextEpisode();
    });
    p.audio.addEventListener('loadedmetadata', function() {
      const durTime = document.getElementById('podcast-duration');
      if (durTime) durTime.textContent = formatTime(p.audio.duration);
    });
  })();

  // 进度条点击跳转
  document.getElementById('podcast-progress-bar').addEventListener('click', function(e) {
    const p = window.podcastPlayer;
    if (!p.audio || !p.audio.duration) return;
    const rect = this.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    p.audio.currentTime = pct * p.audio.duration;
    updatePodcastProgress();
  });

  // Hero 控制按钮绑定
  document.getElementById('podcast-btn-play').addEventListener('click', togglePodcastPlay);
  document.getElementById('podcast-btn-next').addEventListener('click', playNextEpisode);
  document.getElementById('podcast-btn-prev').addEventListener('click', playPrevEpisode);
```

- [ ] **Step 2: 浏览器验证播放器基础功能**

进入 during tab，推进几条对话解锁语音，切换到播客模式，点击播放按钮，确认：
1. 语音能播放
2. 进度条随时间前进
3. 时间显示更新
4. 播放/暂停按钮状态切换
5. 点击进度条能跳转

---

### Task 6: 播客视图渲染函数

**Files:**
- Modify: `app.html`（与播放器函数放一起）

- [ ] **Step 1: 实现 Hero 和列表渲染**

```js
  function renderPodcastHero(index) {
    const episodes = getPodcastEpisodes();
    const episode = episodes[index];
    const bgEl = document.getElementById('podcast-hero-bg');
    const locEl = document.getElementById('podcast-location');
    const titleEl = document.getElementById('podcast-title');

    if (!episode) {
      if (bgEl) bgEl.style.backgroundImage = '';
      if (locEl) locEl.textContent = '🏛️ 景点名称';
      if (titleEl) titleEl.textContent = '语音标题';
      return;
    }

    // 尝试从 duringBgMap 获取背景图，否则留空
    const locName = episode.location || '';
    let bgUrl = '';
    if (window.duringBgMap && window.duringBgMap[locName]) {
      bgUrl = window.duringBgMap[locName];
    }
    if (bgEl) bgEl.style.backgroundImage = bgUrl ? 'url(' + bgUrl + ')' : '';
    if (locEl) locEl.textContent = locName ? '🏛️ ' + locName : '🏛️ 景点讲解';
    if (titleEl) titleEl.textContent = episode.title;
  }

  function renderPodcastEpisodes() {
    const listEl = document.getElementById('podcast-episodes-list');
    const headerEl = document.querySelector('.podcast-episodes-header');
    const episodes = getPodcastEpisodes();
    const p = window.podcastPlayer;

    if (headerEl) {
      headerEl.textContent = '📋 已解锁讲解（' + episodes.length + ' 条）';
    }

    if (episodes.length === 0) {
      listEl.innerHTML =
        '<div class="podcast-empty">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>' +
          '<span>开始行程后将自动解锁播客内容</span>' +
        '</div>';
      return;
    }

    let html = '';
    episodes.forEach(function(ep, idx) {
      const isActive = idx === p.currentIndex;
      let statusIcon = '○';
      if (isActive && p.isPlaying) statusIcon = '<span class="playing-icon">🔊</span>';
      else if (idx < p.currentIndex) statusIcon = '✓';

      html +=
        '<div class="podcast-episode ' + (isActive ? 'active' : '') + '" data-index="' + idx + '">' +
          '<div class="podcast-episode-num">#' + String(idx + 1).padStart(2, '0') + '</div>' +
          '<div class="podcast-episode-info">' +
            '<div class="podcast-episode-title">' + escapeAttr(ep.title) + '</div>' +
            (ep.location ? '<div class="podcast-episode-tag">' + escapeAttr(ep.location) + '</div>' : '') +
          '</div>' +
          '<div class="podcast-episode-meta">' +
            '<span class="podcast-episode-status">' + statusIcon + '</span>' +
            '<span class="podcast-episode-duration">--:--</span>' +
          '</div>' +
        '</div>';
    });
    listEl.innerHTML = html;

    // 绑定列表项点击
    listEl.querySelectorAll('.podcast-episode').forEach(function(row) {
      row.addEventListener('click', function() {
        const idx = parseInt(this.dataset.index, 10);
        playPodcastEpisode(idx);
      });
    });
  }
```

注意：确保项目中已有 `escapeAttr` 函数。如果项目中没有，需要添加一个简单的：

```js
  function escapeAttr(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function(m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  }
```

- [ ] **Step 2: 浏览器验证列表渲染**

进入播客模式，确认：
1. 已解锁的语音条数正确显示
2. 列表项显示序号、标题、状态图标
3. 点击列表项能切换播放
4. 当前播放项有高亮样式

---

### Task 7: 播放状态图标动画

**Files:**
- Modify: `css/app.css`（追加）

- [ ] **Step 1: 添加播放中图标动画**

```css
.playing-icon {
  display: inline-block;
  animation: playingPulse 1.2s ease infinite;
}
@keyframes playingPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.9); }
}
```

- [ ] **Step 2: 浏览器验证**

播放播客时，确认正在播放的列表项旁的 `🔊` 图标有脉冲动画。

---

### Task 8: 最终集成验证

**Files:**
- 无代码变更，纯验证

- [ ] **Step 1: 完整流程验证**

按以下步骤在浏览器中验证：

1. 打开 `app.html`，进入 during tab，确认默认显示对话模式
2. 点击屏幕推进几条对话，听到语音播放
3. 点击底部"播客"按钮，切换到播客模式
4. 确认播客列表显示的条数 = 已播放的 AI 消息数
5. 点击播放按钮，确认语音播放，进度条走动
6. 点击"下一首"，确认切换到下一个语音
7. 点击"视频"按钮，确认显示占位图片 `48136c107faa68f0b97a0040864daf33.webp`
8. 点击"对话"按钮切回，确认对话界面正常，可以继续点击推进
9. 切换用户（如果有用户切换功能），确认播客状态重置

- [ ] **Step 2: 边界情况验证**

1. **零解锁状态**：未点击任何对话时进入播客模式，确认显示空态（耳机图标 + "开始行程后将自动解锁播客内容"）
2. **快速切换**：在播客播放时快速切换到对话再切回播客，确认不会崩溃，语音暂停
3. **最后一首**：播放到最后一首结束时，确认自动停止（不循环）

---

## 自审检查

### Spec 覆盖率

| Spec 要求 | 对应任务 |
|-----------|----------|
| 底部 Segmented Control 切换条 | Task 2 |
| 三种形态容器（对话/播客/视频） | Task 1 |
| 播客 Hero 播放卡片 | Task 1 HTML + Task 6 renderPodcastHero |
| 已解锁片段列表 | Task 6 renderPodcastEpisodes |
| 列表只显示已解锁（aiMsgCounter 控制） | Task 5 getPodcastEpisodes |
| 空态处理 | Task 6 renderPodcastEpisodes |
| 视频占位图 | Task 1 HTML |
| 数据同步（resetDuringUI / switchUser / loadNext） | Task 4 Step 3（resetDuringUI 钩子） |
| 动画（进度条、播放按钮、呼吸动画） | Task 3 CSS + Task 7 |
| 样式复用现有 token | Task 3 |

### Placeholder 扫描
- 无 "TBD"、"TODO"、"implement later"
- 所有函数均有具体实现代码
- 所有代码块均包含可执行的代码

### 类型一致性
- `aiMsgCounter` 在 Task 4/5/6 中与现有代码一致（整数，从 0 开始）
- `window.duringMode` 取值 `'chat'|'podcast'|'video'` 在所有任务中一致
- `window.podcastPlayer.audio` 始终为 `HTMLAudioElement`

---

## 执行交接

**计划已完成并保存到 `docs/superpowers/plans/2026-06-03-during-mode-switch.md`。**

**两个执行选项：**

1. **Subagent-Driven（推荐）** - 每个 Task 派一个独立子代理执行，我负责审阅中间结果
2. **Inline Execution** - 在当前会话中逐步执行，我可以批量处理无依赖的步骤

**请选择执行方式。**
