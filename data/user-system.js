// ============================================================
// 用户系统配置
// ============================================================
window.USER_SYSTEM = {
  current: 'zhang',
  users: {
    zhang: {
      id: 'zhang',
      name: '张先生',
      avatar: '张',
      guide: { pretrip: '小游', during: '王建国AI' },
      titles: {
        pretrip: '张先生的旅行专属定制师',
        during: '张先生的专属导游 王建国AI',
        harvest: '张先生的旅途收获'
      }
    },
    lin: {
      id: 'lin',
      name: '林女士',
      avatar: '林',
      guide: { pretrip: '小游', during: '张雅芳AI' },
      titles: {
        pretrip: '林女士的旅行专属定制师',
        during: '林女士的专属导游 张雅芳AI',
        harvest: '林女士的旅途收获'
      }
    },
    wang: {
      id: 'wang',
      name: '王女士',
      avatar: '王',
      guide: { pretrip: '小游', during: '李文博AI' },
      titles: {
        pretrip: '王女士的旅行专属定制师',
        during: '王女士的专属导游 李文博AI',
        harvest: '王女士的旅途收获'
      }
    }
  }
};

window.USER_DATA = window.USER_DATA || {};
