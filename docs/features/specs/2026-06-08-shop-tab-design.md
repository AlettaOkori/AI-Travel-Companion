# 商城 Tab 设计文档

> 日期：2026-06-08
> 项目：华云天图 AI 旅伴

## 1. 需求概述

在【行后】Harvest Tab 中新增一个「🛒 商城」inner tab，排在「更多」之前。页面类似 B 站会员购购物页，展示开平碉楼文创商品，支持完整电商体验（浏览、加购、结算）。景点切换栏做占位展示（可点击但提示开发中）。

## 2. 页面布局

商城页为单一垂直滚动页面，结构自上而下：

1. **景点切换栏** — 横向滚动 pill 标签（开平碉楼 · 赤坎古镇 · 马降龙村落），点击 toast 提示「开发中」
2. **Banner 区** — 开平碉楼宣传大图
3. **筛选排序栏** — 分类筛选（全部/新品/热销/立体拼装/明信片/冰箱贴/帆布包/杯子/钥匙扣）+ 排序（综合/销量/价格）
4. **商品网格** — 双列卡片布局
5. **底部固定购物车栏** — 购物车图标+角标+总价+去结算按钮

## 3. 组件设计

### 3.1 商品卡片
- 圆角白底，图片占上方 ~60%
- 左上角角标：「新品」「热销」
- 信息区：名称（两行截断）、价格（红色加粗 ¥）、付款人数（灰色）
- 右下角购物车图标按钮（点击直接加购）
- 点击卡片主体打开详情浮层

### 3.2 商品详情浮层（Overlay）
- 底部滑入全屏浮层，顶部关闭按钮
- 大图、名称、价格、销量、标签、简介
- 底部操作栏：「加入购物车」+「立即购买」
- 点击立即购买直接进入结算浮层

### 3.3 购物车抽屉（Bottom Sheet）
- 点击底部购物车区域触发
- 商品列表（缩略图+名称+单价+数量增减+删除）
- 底部合计金额 + 「去结算」按钮
- 支持清空购物车

### 3.4 结算浮层（Overlay）
- 全屏浮层
- 模拟收货地址（仅展示）、商品清单、合计金额、运费
- 底部「确认购买」按钮
- 点击后 toast 提示成功，清空购物车，关闭浮层

## 4. 数据模型

### 4.1 商品数据 `SHOP_DATA`
```js
const SHOP_DATA = {
  'kaiping': {
    name: '开平碉楼',
    banner: 'assets/shop/banner_kaiping.jpg',
    categories: ['全部','新品','热销','立体拼装','明信片','冰箱贴','帆布包','杯子','钥匙扣'],
    products: [
      { id, name, price, originalPrice, sales, tag, category, image, desc }
    ]
  }
};
```

### 4.2 购物车状态
- 全局变量 `window.shopCart = []`
- 结构：`{ productId, spotId, qty, ... }`
- 持久化：`localStorage` key `hx_shop_cart`

### 4.3 当前景点
- `window.currentSpotId = 'kaiping'`

## 5. 交互流程

浏览列表 → 点击卡片 → 详情浮层 → 加购/立即购买 → 购物车抽屉 → 结算 → 完成

## 6. 集成方案

### 修改点（仅限 `app.html`）
1. **HTML**：`.harvest-inner-tabs` 插入「商城」button；新增 `#harvest-shop` view
2. **CSS**：追加商城专用样式（grid、卡片、浮层、抽屉），延续现有 CSS 变量
3. **JS 数据**：`SHOP_DATA` + 购物车状态
4. **JS 渲染**：`renderHarvestShop()`、`renderShop()`、`renderShopDetail()`、`renderCartDrawer()`、`renderCheckout()`
5. **JS 事件**：`openShopDetail()`、`addToCart()`、`openCart()`、`goCheckout()`、`submitOrder()`
6. **JS 初始化**：`renderHarvest()` 中调用 `renderHarvestShop()`

### 新增资源
- `assets/shop/` 目录存放裁剪后的商品图片和 banner

## 7. 图片资源清单

从用户提供的截图中提取：
1. `kp01.jpg` — 开平碉楼立体拼图
2. `kp02.jpg` — 开平碉楼手绘明信片套装
3. `kp03.jpg` — 开平碉楼金属冰箱贴
4. `kp04.jpg` — 开平碉楼文创帆布包
5. `kp05.jpg` — 开平碉楼马克杯
6. `kp06.jpg` — 开平碉楼钥匙扣
7. `banner_kaiping.jpg` — 顶部 banner

## 8. 非功能约束

- 纯前端原型，无真实支付、无后端接口
- 延续现有字符串拼接渲染风格（非 DOM API）
- 保持与现有 Harvest tab 样式一致
- 不改动行前/行中 tab、用户切换逻辑
