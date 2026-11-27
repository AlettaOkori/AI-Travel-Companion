# During Tab 形态切换设计文档

**日期**: 2026-06-03  
**项目**: 华云天图 AI 旅伴  
**作者**: Claude Code  

---

## 1. 需求背景

在行中导游对话页面（`#tab-during`）中，用户目前只能以**对话气泡**的形式与 AI 导游交互。为了丰富体验，需要增加三种形态切换能力：

1. **对话**（现有）：消息气泡，点击继续，AI 语音自动播放
2. **播客**（新增）：将已解锁的导游语音以播客播放器形式重新组织
3. **视频**（占位）：视频通话形态暂不实现，用占位图代替

核心约束：**播客列表只显示已解锁的语音**（即对话进度 `aiMsgCounter` 已推进到的位置），不能提前暴露未发生的对话内容。

---

## 2. 设计方案（方案 A：底部 Segmented Control）

### 2.1 整体架构

在 `#tab-during` 内部，于 `chat-scroll` 下方、`compose-bar` 上方插入一条形态切换条 `mode-switcher`。`chat-scroll` 内部同时容纳三种形态的内容容器，通过 CSS 控制显隐：

```
#tab-during
├── header.app-header
├── .itin-bar
├── .ops-bar
├── .chat-scroll
│   ├── .during-mode-chat      ← 现有对话内容
│   ├── .during-mode-podcast   ← 播客内容（默认 hidden）
│   └── .during-mode-video     ← 视频占位（默认 hidden）
├── .mode-switcher             ← 新增：💬 对话 / 🎧 播客 / 📹 视频
├── .tap-hint
└── .compose-bar               ← 播客模式下变为迷你播放条
```

### 2.2 状态管理

新增全局状态变量：

```js
window.duringMode = 'chat'; // 'chat' | 'podcast' | 'video'

window.podcastPlayer = {
  currentIndex: 0,   // 当前播放的播客条目索引（对应 aiMsgCounter 顺序）
  isPlaying: false,
  audio: null,       // HTMLAudioElement 实例
  progress: 0,       // 当前播放进度（秒）
  duration: 0        // 当前音频总时长（秒）
};
```

切换规则：
- 默认进入 during tab 时 `duringMode = 'chat'`
- 切换用户 (`switchUser`) 时重置为 `'chat'`，销毁播客播放器
- `chat → podcast`：暂停对话语音；播客默认定位到最新解锁条目 (`aiMsgCounter - 1`)
- `podcast → chat`：暂停播客播放器
- `video`：仅展示占位图，无播放逻辑

### 2.3 形态切换条（Mode Switcher）

- **位置**: `chat-scroll` 与 `compose-bar` 之间
- **高度**: 44px
- **样式**: 三个等宽按钮横向排列，背景 `var(--surface)`，顶部 1px 边框 `var(--border)`
- **选中态**: pill 形状填充 `var(--accent)`，白色文字
- **未选中态**: `var(--muted)` 文字
- **过渡**: 背景色切换 200ms ease

### 2.4 播客页面详细设计

#### Hero 播放卡片（`podcast-hero`）

占播客视图顶部约 45%：

- **背景**: 当前景点照片（复用 `duringBgMap`），底部 60% 叠加渐变遮罩 `linear-gradient(transparent, oklch(20% 0 0 / 0.7))`
- **景点标签**: 顶部小标签 `🏛️ {景点名}`，`font-size: var(--fs-12)`，半透明深色底 + 圆角 pill
- **语音标题**: 取对应 AI 消息前 30 字 + "…"，`font-size: var(--fs-18)`，`font-weight: 600`，白色
- **控制区**:
  - 上一首 ⏮️（40px 圆形，白色半透明背景）
  - 播放/暂停 ▶️/⏸️（56px 圆形，`var(--accent)` 背景，白色图标）
  - 下一首 ⏭️（40px 圆形，白色半透明背景）
- **进度条**: 线性进度条，4px 高度，`var(--accent)` 填充，底部 8px 圆角。可点击跳转。
- **时间**: 左下角 `02:34`，右下角 `08:12`，`font-size: var(--fs-11)`，`font-family: var(--font-mono)`
- **动画**: 播放时封面图轻微呼吸动画 `scale(1) → scale(1.03)`，4s 循环

#### 已解锁片段列表（`podcast-episodes`）

Hero 下方，可滚动：

- **列表标题**: `📋 已解锁讲解（{已解锁数}/{总数}）`，`font-size: var(--fs-13)`，`color: var(--muted)`，padding 16px
- **列表项**（每个 AI 消息对应一项）:
  - 左侧序号 `#01`，`font-family: var(--font-mono)`，`color: var(--accent)`，宽度 36px
  - 中间:
    - 语音摘要：AI 消息文本前 16 字 + "…"，`font-size: var(--fs-14)`
    - 景点标签 pill：从 `chatData[i].location` 或上下文推断，`font-size: var(--fs-11)`
  - 右侧:
    - 状态图标：已播放 `✓`，正在播放 `🔊`（带动画），未播放 `○`
    - 时长 `08:12`（优先从 audio 元数据获取，否则 `--:--`）
- **当前播放项**: 背景 `var(--accent-dim)`，左侧 3px 边框 `var(--accent)`
- **点击行为**: 点击条目切换播放；点击进度条跳转

#### 空态

若 `aiMsgCounter === 0`（尚未开始对话）：
- 居中显示灰色耳机图标（SVG，48px）
- 下方文字："开始行程后将自动解锁播客内容"，`color: var(--muted)`，`font-size: var(--fs-14)`

#### 底部迷你播放条（播客模式）

当切换到播客模式时，`compose-bar` 隐藏，替换为：

- **高度**: 56px
- **背景**: `var(--surface)`，顶部 1px 边框 `var(--border)`
- **左侧**: 小封面缩略图（32×32，圆角 6px）
- **中间**: 语音标题（单行截断，`font-size: var(--fs-13)`）
- **右侧**: 播放/暂停小按钮（32px 圆形，`var(--accent)` 背景）
- **点击**: 点击除按钮外的区域可收起/展开（可选）

### 2.5 视频占位页

极简占位：

- 全屏居中展示图片 `48136c107faa68f0b97a0040864daf33.webp`
- 图片宽度 80%，圆角 `var(--r-6)`，阴影 `var(--shadow-md)`
- 图片下方文字："📹 视频通话功能即将上线"，`color: var(--muted)`，`font-size: var(--fs-14)`
- 底部保留 `mode-switcher`，`compose-bar` 照常显示但输入框禁用，placeholder 改为"视频模式暂不支持输入"

---

## 3. 数据流与同步

### 3.1 播客列表数据来源

播客条目从 `window.chatData` 中动态提取：

```js
function getUnlockedEpisodes() {
  const episodes = [];
  let aiIndex = 0;
  for (let i = 0; i < window.chatData.length; i++) {
    const item = window.chatData[i];
    if (item.type === 'ai') {
      if (aiIndex >= aiMsgCounter) break; // 只取已解锁
      episodes.push({
        index: aiIndex,
        title: item.text.slice(0, 30) + (item.text.length > 30 ? '…' : ''),
        location: item.location || inferLocation(i),
        audioSrc: getAudioPath(aiIndex),
        played: false // 可由播放历史记录
      });
      aiIndex++;
    }
  }
  return episodes;
}
```

### 3.2 关键事件映射

| 事件 | 行为 |
|------|------|
| `loadNext()` 推进对话，新增 AI 消息 | 播客列表自动多解锁一条；若用户正在播客模式且播放到末尾，新条目加入列表但不打断当前播放 |
| 播客模式点击某条目播放 | 调用 `playPodcastEpisode(index)`，使用独立 `<audio>` 元素，不影响对话模式的 `playGuideVoice` |
| 对话模式自动播放语音 | 不影响播客播放器的 `currentIndex`；两者播放状态完全独立 |
| 切换用户 (`switchUser`) | 重置 `duringMode = 'chat'`，播客播放器 `pause()` 并 `audio.src = ''` |
| 播客播放到末尾 | 自动播放下一首（如果存在）；最后一首结束时 `isPlaying = false` |

### 3.3 音频路径

复用现有语音文件约定：
- `zhang` 用户：`assets/audios/导游语音_XX.mp3`（XX 为 `aiIndex` 的两位零填充）
- `lin` 用户：`assets/lin_audios/导游语音_XX.mp3`
- `getAudioPath(aiIndex)` 已存在，直接复用

---

## 4. 动画与过渡

| 元素 | 动画 | 参数 |
|------|------|------|
| 形态切换 | opacity + translateX | 250ms ease-out |
| 播客列表项进入 | slideIn | `translateX(20px) → 0`，300ms ease |
| 播放按钮点击 | scale 反馈 | `scale(0.92)`，150ms 回弹 |
| 进度条拖拽 | 高度放大 | 4px → 8px，松手回弹 |
| Hero 封面呼吸 | scale 循环 | `1 → 1.03`，4s ease-in-out infinite |
| 正在播放图标 | 脉冲 | `opacity 0.4 → 1`，1.2s ease infinite |

---

## 5. 样式规范

所有新增样式复用项目现有 design token：

- **颜色**: `var(--accent)`, `var(--surface)`, `var(--bg-elevated)`, `var(--border)`, `var(--muted)`, `var(--fg)`, `var(--fg-dim)`, `var(--accent-dim)`
- **圆角**: `var(--r-3)`, `var(--r-4)`, `var(--r-6)`, `var(--r-8)`
- **字体**: `var(--fs-11)` ~ `var(--fs-18)`, `var(--font-mono)`
- **阴影**: `var(--shadow-sm)`, `var(--shadow-md)`
- **间距**: `var(--sp-3)`, `var(--sp-4)`
- **动画曲线**: `ease`, `ease-out`, `cubic-bezier(.4,0,.2,1)`

---

## 6. 未决事项与后续工作

1. **音频时长获取**: 设计文档假设能从 `<audio>` 元数据获取时长；若文件无元数据，需回退到 `--:--`。
2. **景点标签推断**: 当前 `chatData` 中 AI 消息可能没有 `location` 字段，需要从相邻的 `system` 消息推断，或增加字段。
3. **播放历史持久化**: 当前设计未将播客播放进度持久化到 `localStorage`；如需记住用户上次播放到哪，可后续扩展。
4. **视频形态**: 本设计仅提供占位实现，完整视频通话功能需后续独立设计和开发。
