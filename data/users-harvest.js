// ============================================================
// 收获Tab · 按用户数据
// ============================================================
window.USER_DATA = window.USER_DATA || {};

// 张先生 — 收获数据（当前已有）
window.USER_DATA.zhang = window.USER_DATA.zhang || {};
window.USER_DATA.zhang.harvest = {
  stats: { trips: 4, knowledge: 73, cities: 12, chats: 189 },
  trips: [
    { thumb: '碉', title: '开平碉楼深度一日游', date: '2025.05.20', spots: 5, knowledge: 31 },
    { thumb: '🏛', title: '西安古城墙 + 碑林', date: '2025.04.05', spots: 3, knowledge: 18 },
    { thumb: '🎋', title: '苏州园林艺匠之旅', date: '2025.03.12', spots: 4, knowledge: 24 }
  ],
  current: {
    title: '开平碉楼深度一日游',
    date: '2025.05.20',
    guide: '王建国 AI',
    thumb: '碉',
    timeline: [
      { time: '09:00 — 11:30', place: '自力村碉楼群', desc: '聚落布局 · 材料演变 · 防御构造 · 铭石楼登顶' },
      { time: '11:30 — 13:30', place: '碉楼人家农庄', desc: '旧居楼改造餐厅 · 黄鳝饭 · 未开发居楼' },
      { time: '13:30 — 14:40', place: '立园', desc: '中西合璧园林 · 谢维立手稿 · 空水池故事' },
      { time: '14:40 — 16:00', place: '马降龙碉楼群', desc: '竹林隐匿 · 骏庐通道 · 隐匿式肌理' }
    ],
    tags: [
      { label: '华侨建筑', hot: true },
      { label: '防御工事', hot: true },
      { label: '中西合璧', hot: true },
      { label: '竹林隐匿', hot: false },
      { label: '园林设计', hot: false },
      { label: '材料演变', hot: false },
      { label: '全球拼贴', hot: false },
      { label: '本土化翻译', hot: false },
      { label: '聚落布局', hot: false },
      { label: '功能主义', hot: false },
      { label: '契约精神', hot: false },
      { label: '手工温度', hot: false }
    ],
    recommendation: {
      title: '🎯 下一站推荐',
      desc: '您今天深入了解了「园林动线设计」与「建筑本土化翻译」，关联推荐：<b>苏州园林</b>（咫尺山林的动线艺术）与 <b>澳门历史城区</b>（中西建筑对话）。'
    }
  }
};

// 林女士 — 收获数据（待补充）
window.USER_DATA.lin = window.USER_DATA.lin || {};
window.USER_DATA.lin.harvest = {
  stats: { trips: 2, knowledge: 0, cities: 3, chats: 0 },
  trips: [
    { thumb: '👨‍👩‍👧', title: '【待补充】', date: '—', spots: 0, knowledge: 0 }
  ],
  current: null
};

// 王女士 — 收获数据（待补充）
window.USER_DATA.wang = window.USER_DATA.wang || {};
window.USER_DATA.wang.harvest = {
  stats: { trips: 1, knowledge: 0, cities: 1, chats: 0 },
  trips: [
    { thumb: '📜', title: '【待补充】', date: '—', spots: 0, knowledge: 0 }
  ],
  current: null
};
