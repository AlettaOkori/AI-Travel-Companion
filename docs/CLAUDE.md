# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**华云天图 AI 旅伴** is a mobile-first web prototype for an AI-powered cultural tourism companion, focused on Kaiping Diaolou (a UNESCO World Heritage Site in Guangdong, China). It is a pure frontend project with no build step and no backend. QA automation dependencies live in `tools/qa/` (Playwright).

## Running the Project

This is a static HTML site. Open any `.html` file directly in a browser:

- **Entry point (onboarding)**: `index.html`
- **Main app (3 tabs)**: `app.html`
- **Alternative mobile pages**: `pages/mobile-ios-pretrip.html`, `pages/mobile-android-pretrip.html`（资源路径使用 `../assets/...`）

No build step required for the app itself. For screenshot/verification scripts, see `tools/qa/` (`npm install` then `npm run verify-guide-card`). Serve the app locally (e.g. `npx serve .` on port 8080) when running QA scripts.

## High-Level Architecture

### Page Flow

```
index.html (splash → user profile onboarding) ──→ app.html (3-tab main app)
                                                        ├── Tab 1: Pre-trip (行程规划对话)
                                                        ├── Tab 2: During (行中导游对话)
                                                        └── Tab 3: Harvest (收获/知识图谱)
```

### Data Model: Multi-User Script-Driven Dialogue

The entire application is driven by a single monolithic data object `USER_DB` defined inline in `app.html` (lines ~1830–2450) and also exported from `data/users.js`. Each user has three phases of data:

- `pretrip.script[]` — array of dialogue turns (`{type: 'ai'|'user'|'card', ...}`) for the pre-trip planning chat
- `during.chatData[]` — array of dialogue turns for the real-time tour guide chat
- `harvest` — structured data for trip records, knowledge graph, stats, and archive

**User IDs**: `zhang` (architecture/photography solo traveler), `lin` (family with child), `wang` (placeholder).

The current user is persisted to `localStorage` key `hx_current_user`. Functions `getCurrentUserId()` / `setCurrentUserId()` manage this.

### Pre-trip Tab (`#tab-pretrip`)

- Driven by `window.script` (loaded from the current user's `pretrip.script`)
- Click-to-advance dialogue: user clicks the message area to trigger the next user turn; AI turns auto-play with a typing indicator
- Top checklist bar tracks progress through 5 preparation stages
- `renderCard(subtype)` renders embedded cards: `checklist`, `hotel`, `train`, `crowd`, `route`, `weather`, `itinerary`
- Script index → checklist state mapping is hardcoded in `checklistMap`

### During Tab (`#tab-during`)

- Driven by `window.chatData` (loaded from the current user's `during.chatData`)
- Click-to-advance on blank space; each click calls `loadNext()`
- Messages are typed out character-by-character via `typeTo()`
- AI messages auto-trigger voice audio playback via `playGuideVoice(aiIndex)`
- **Voice file convention**: `assets/audios/导游语音_XX.mp3` for zhang, `assets/lin_audios/导游语音_XX.mp3` for lin. Files are zero-padded 2-digit indices matching the AI message counter (`aiMsgCounter`)
- System messages update the itinerary bar highlight and may trigger background image changes (`setDuringBg(locationName)`)
- Chat messages can include inline HTML attachments (e.g. knowledge cards, task cards)

### Harvest Tab (`#tab-harvest`)

- Three inner tabs: `archive` (行程记录), `graph` (知识图谱), `more` (更多功能)
- `renderHarvest(uid)` dynamically rebuilds the entire tab content from user data
- **Knowledge Graph**: `knowledgeTree` data is auto-clustered into thematic domains (`architecture`, `history`, `art`, `science`, `culture`, `trade`) by `renderKnowledgeDomains()`. Tags are mapped to domains via `tagDomainMap`
- **Trip expansion**: trip rows are expandable; clicking triggers `toggleTripExpand()` which reveals timeline, cultural creatives, knowledge cards, and stats

### Styling System

- Design tokens in `css/tokens.css` using `oklch()` color space
- Shared component styles in `css/app.css`
- Device frame styling (`.device-ios`) simulates an iPhone 15 Pro (390×844)
- On real mobile devices the frame hides and the app fills the viewport

## Key Files and Their Roles

| File | Role |
|------|------|
| `app.html` | **Single source of truth**. Contains the full `USER_DB` object, all rendering logic, tab switching, user switching, and dialogue engines inline in `<script>` tags (~1800 lines of JS). This is the core application. |
| `index.html` | Standalone onboarding/splash page with profile selection; navigates to `app.html` on completion. |
| `data/users.js` | Exported copy of `USER_DB` + user getter/setter utilities. Included as a reference but `app.html` has its own inline copy. |
| `data/pretrip-dialog.js` | Standalone `pretrip` script for the `lin` user. Historical/backup; the active data lives in `app.html` `USER_DB`. |
| `data/during-dialog.js` | Standalone `during` chatData for the `zhang` user. Historical/backup. |
| `data/users-harvest.js` | Standalone harvest data. Historical/backup. |
| `data/user-system.js` | Lightweight user metadata (names, avatars, guide assignments). |
| `css/tokens.css` | CSS custom properties (colors, typography, spacing). |
| `css/app.css` | Shared component styles (messages, cards, tabbar, etc.). |

## Critical Conventions

- **Dialogue scripts use hardcoded step indices** to drive checklist progress and card rendering. Adding/removing script entries requires updating the `checklistMap` and the hardcoded step checks in `autoAdvance()`.
- **Voice files are indexed by AI message counter**, not by dialogue turn index. Skipping or reordering AI messages will desynchronize audio.
- **HTML string concatenation is the rendering engine**. Most UI is built via raw string concatenation (`innerHTML = '...'`), not DOM APIs. Escaping is minimal (`escapeAttr()` only).
- **All three tabs coexist in one DOM**; visibility is toggled via CSS `display`. State resets when switching users (`resetPretripUI`, `resetDuringUI`).
