import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const p = path.resolve(__dirname, '../app.html');
let html = fs.readFileSync(p, 'utf8');

const start = html.indexOf('const USER_DB = {');
const snap = html.indexOf('// 用户数据快照');
if (start < 0 || snap < 0) throw new Error('markers not found');

const replacement = `var USER_DB = {};
var USER_DB_SNAPSHOT = {};

// 长文本见 assets/content/，由 content-loader.js 注入

`;

html = html.slice(0, start) + replacement + html.slice(snap);
html = html.replace(/const USER_DB_SNAPSHOT = JSON\.parse\(JSON\.stringify\(USER_DB\)\);\r?\n\r?\n/, '');

if (!html.includes('content-loader.js')) {
  const marker = '<script>\n// ═══════════════════════════════════════════\n//  商城数据';
  const insert = '<script src="assets/content/content-loader.js"></script>\n' + marker;
  if (!html.includes(marker)) throw new Error('shop data marker not found');
  html = html.replace(marker, insert);
}

// 页面初始化改为等待文案加载
const oldInit = `  // 页面初始化
  loadUserData(currentUserId);
  updateTitles(currentUserId);
  renderHarvest(currentUserId);
  renderItinBar();`;

const newInit = `  function hxInitAppShell() {
    loadUserData(currentUserId);
    updateTitles(currentUserId);
    renderHarvest(currentUserId);
    renderItinBar();`;

if (html.includes(oldInit)) {
  html = html.replace(oldInit, newInit);
} else {
  console.warn('init block not found');
}

const oldPretripInit = `    // Init
    renderStep(0);
    messagesEl.addEventListener('click', onClick);`;

const newPretripInit = `    function hxInitPretripChat() {
      renderStep(0);
    }
    messagesEl.addEventListener('click', onClick);
    if (window.HX_CONTENT_READY) hxInitPretripChat();
    else window.addEventListener('hx-content-ready', hxInitPretripChat, { once: true });`;

if (html.includes(oldPretripInit)) {
  html = html.replace(oldPretripInit, newPretripInit);
}

const bootBlock = `  if (window.HX_CONTENT_READY) hxInitAppShell();
  else window.addEventListener('hx-content-ready', hxInitAppShell, { once: true });
  hxLoadAppContent().catch(function(err) {
    console.error('[content-loader]', err);
  });`;

if (!html.includes('hxLoadAppContent')) {
  html = html.replace(
    `  // 预渲染商城内容
  const shopContentInit = document.getElementById('shop-content');
  if (shopContentInit) shopContentInit.innerHTML = renderShop(window.currentShopSpot);`,
    `  if (window.HX_CONTENT_READY) hxInitAppShell();
  else window.addEventListener('hx-content-ready', hxInitAppShell, { once: true });
  hxLoadAppContent().catch(function(err) { console.error('[content-loader]', err); });

  // 预渲染商城内容
  const shopContentInit = document.getElementById('shop-content');
  if (shopContentInit) shopContentInit.innerHTML = renderShop(window.currentShopSpot);`
  );
}

fs.writeFileSync(p, html);
console.log('Patched app.html');
