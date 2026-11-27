开平 C 端 · 文案资源目录
================================

本目录存放 app.html 中的长文本，运行时由 assets/content/content-loader.js 加载。

目录结构
--------
manifest.json          总索引
users/meta.json        用户元数据（不含 script / chat / 导游 bio）
pretrip/
  zhang-script.json    张先生行前对话步骤（contentFile 指向 .txt）
  lin-script.json
  zhang/*.txt          行前每条 AI / 用户话术
  lin/*.txt
during/
  zhang-chat.json      张先生行中对话结构
  lin-chat.json
  zhang/*.txt          行中每条 text / html
  lin/*.txt
guides/
  zhang-ai.json        AI 导游列表（bioFile → guides/ai/*.txt）
  zhang-human.json
  lin-ai.json
  lin-human.json
  ai/*-bio.txt
  human/*-bio.txt
  meta/mottos.json     导游服务寄语
  meta/years-exp.json  从业年限
human-guide/           陈大嘴 pitch 文案
group-tour/            林女士组团同路个性化讲解
culture/               行末文创弹窗 intro

原始参考（长脚本原稿，可对照改稿）
----------------------------------
建筑-脚本V5.31.txt     建筑向行中脚本原稿
亲子-V1.2.md           亲子向行中脚本原稿

维护流程
--------
1. 直接编辑本目录下的 .txt / JSON
2. 若在 app.html 里改过 inline 文案，可运行同步脚本重新导出：
   node apps/c-end-kaiping/tools/extract-app-content.mjs
3. 双击 app.html 预览前，若改过文案请重新打包离线包：
   node apps/c-end-kaiping/tools/bundle-content.mjs
4. HTTP 开发预览可直接改 .txt，无需打包（fetch 热加载）
