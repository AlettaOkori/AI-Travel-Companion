/**
 * 将逐条 .txt 合并为场景章节（参照 建筑-脚本V5.31.txt）
 * 运行：node apps/c-end-kaiping/tools/migrate-to-chapters.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT = path.resolve(__dirname, '../assets/content');

function read(rel) {
  return fs.readFileSync(path.join(CONTENT, rel), 'utf8').trimEnd();
}

function write(rel, text) {
  const full = path.join(CONTENT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, text, 'utf8');
}

function roleLabel(sender, context) {
  if (sender === 'system') return '**系统**';
  if (sender === 'user') return '**用户**';
  return context === 'pretrip' ? '**AI定制师**' : '**AI旅伴**';
}

function buildDuringChapterText(turns, context) {
  return turns
    .filter((t) => !t.meta.facilityStop && !(t.meta.htmlFile && !t.text))
    .map((t) => roleLabel(t.sender, context) + '：\n' + t.text)
    .join('\n\n');
}

function loadDuringTurns(chatJson) {
  return chatJson.map((msg) => {
    let text = msg.text || '';
    if (msg.textFile) text = read(msg.textFile);
    return { sender: msg.sender, text, meta: msg };
  });
}

function loadPretripTurns(scriptJson) {
  return scriptJson
    .filter((s) => s.type === 'ai' || s.type === 'user' || s.type === 'scroll-hint')
    .map((s) => {
      let text = s.content || '';
      if (s.contentFile) text = read(s.contentFile);
      return { type: s.type, text, meta: s };
    });
}

const DURING_SCENES = {
  zhang: [
    { title: '场景一：自力村碉楼群（09:00-11:30）', file: '01-自力村.txt', start: 0, end: 27 },
    { title: '场景二：碉楼人家农庄 + 午餐休整（11:30-13:30）', file: '02-农庄午餐.txt', start: 28, end: 41 },
    { title: '场景三：立园（13:30-14:40）', file: '03-立园.txt', start: 42, end: 56 },
    { title: '场景四：马降龙碉楼群（14:40-16:00）', file: '04-马降龙.txt', start: 57, end: 72 },
    { title: '场景五：行程结束（16:00）', file: '05-行程结束.txt', start: 73, end: 78 }
  ],
  lin: [
    { title: '场景零：第一晚 · 民宿天台（20:45）', file: '00-民宿天台.txt', start: 0, end: 13 },
    { title: '场景一：自力村碉楼群（09:00-11:30）', file: '01-自力村.txt', start: 14, end: 45 },
    { title: '场景二：午餐预告 + 午间休整（11:30-13:30）', file: '02-午餐休整.txt', start: 46, end: 52 },
    { title: '场景三：马降龙竹林（14:00-16:00）', file: '03-马降龙.txt', start: 53, end: 58 },
    { title: '场景四：赤坎古镇夜景（18:00）', file: '04-赤坎古镇.txt', start: 59, end: 66 }
  ]
};

const PRETRIP_SCENES = {
  zhang: [
    { title: '第一章：开场与出行意向', file: '01-开场与意向.txt', start: 0, end: 2 },
    { title: '第二章：住宿预订', file: '02-住宿.txt', start: 3, end: 11 },
    { title: '第三章：交通安排', file: '03-交通.txt', start: 12, end: 16 },
    { title: '第四章：门票购买', file: '04-门票.txt', start: 17, end: 18 },
    { title: '第五章：路线规划', file: '05-路线.txt', start: 19, end: 23 },
    { title: '第六章：行李与天气', file: '06-行李天气.txt', start: 24, end: 26 },
    { title: '第七章：导游选择', file: '07-导游.txt', start: 27, end: 32 },
    { title: '第八章：收尾祝福', file: '08-收尾.txt', start: 33, end: 33 }
  ],
  lin: [
    { title: '第一章：开场与出行意向', file: '01-开场与意向.txt', start: 0, end: 2 },
    { title: '第二章：住宿预订', file: '02-住宿.txt', start: 3, end: 8 },
    { title: '第三章：交通安排', file: '03-交通.txt', start: 9, end: 16 },
    { title: '第四章：门票购买', file: '04-门票.txt', start: 17, end: 18 },
    { title: '第五章：路线规划', file: '05-路线.txt', start: 19, end: 21 },
    { title: '第六章：组团同路', file: '06-组团.txt', start: 22, end: 24 },
    { title: '第七章：行李与天气', file: '07-行李天气.txt', start: 25, end: 27 },
    { title: '第八章：导游选择', file: '08-导游.txt', start: 28, end: 33 },
    { title: '第九章：收尾祝福', file: '09-收尾.txt', start: 34, end: 34 }
  ]
};

function findChapterIndex(scenes, turnIndex) {
  for (let i = 0; i < scenes.length; i++) {
    if (turnIndex >= scenes[i].start && turnIndex <= scenes[i].end) return i;
  }
  return 0;
}

function buildDuringMessages(turns) {
  return turns.map((t) => {
    const m = { sender: t.sender, time: t.meta.time };
    if (t.meta.userName) m.userName = t.meta.userName;
    if (t.meta.location) m.location = t.meta.location;
    if (t.meta.facilityStop) {
      m.facilityStop = t.meta.facilityStop;
      m.skipTurn = true;
      m.text = '';
    } else if (t.meta.htmlFile && !t.text) {
      m.skipTurn = true;
      m.text = '';
      m.html = t.meta.htmlFile;
    } else {
      if (t.meta.htmlFile) m.html = t.meta.htmlFile;
    }
    return m;
  });
}

function buildPretripFlow(scriptJson, scenes) {
  const flow = [];
  let turnIndex = 0;

  scriptJson.forEach((step) => {
    if (step.type === 'card') {
      flow.push({ type: 'card', subtype: step.subtype });
      return;
    }
    if (step.type !== 'ai' && step.type !== 'user' && step.type !== 'scroll-hint') {
      flow.push({ ...step });
      return;
    }
    const ch = findChapterIndex(scenes, turnIndex);
    const item = {
      type: step.type,
      chapter: ch,
      turn: turnIndex - scenes[ch].start
    };
    if (step._branch) item._branch = step._branch;
    flow.push(item);
    turnIndex++;
  });
  return flow;
}

function migrateDuring(uid) {
  const chatJson = JSON.parse(read('during/' + uid + '-chat.json'));
  const allTurns = loadDuringTurns(chatJson);
  const sceneDefs = DURING_SCENES[uid];

  const chapterDefs = sceneDefs.map((def) => {
    const turns = allTurns.slice(def.start, def.end + 1);
    const header =
      '# 【开平碉楼 · 行中导览脚本 · ' +
      (uid === 'zhang' ? '张先生' : '林女士') +
      '】\n\n## ' +
      def.title +
      '\n\n';
    write('during/' + uid + '/' + def.file, header + buildDuringChapterText(turns, 'during'));

    return {
      title: def.title,
      file: 'during/' + uid + '/' + def.file,
      messages: buildDuringMessages(turns)
    };
  });

  write(
    'during/' + uid + '-chapters.json',
    JSON.stringify({ format: 'chapter-v1', chapters: chapterDefs }, null, 2)
  );
}

function migratePretrip(uid) {
  const scriptJson = JSON.parse(read('pretrip/' + uid + '-script.json'));
  const allTurns = loadPretripTurns(scriptJson);
  const sceneDefs = PRETRIP_SCENES[uid];

  const chapterDefs = sceneDefs.map((def) => {
    const turns = allTurns.slice(def.start, def.end + 1);
    const header =
      '# 【开平碉楼 · 行前定制脚本 · ' +
      (uid === 'zhang' ? '张先生' : '林女士') +
      '】\n\n## ' +
      def.title +
      '\n\n';
    const body = turns
      .map((t) => {
        const label =
          t.type === 'scroll-hint'
            ? '**（提示）**'
            : t.type === 'user'
              ? '**用户**'
              : '**AI定制师**';
        return label + '：\n' + t.text;
      })
      .join('\n\n');
    write('pretrip/' + uid + '/' + def.file, header + body);

    return { title: def.title, file: 'pretrip/' + uid + '/' + def.file };
  });

  write(
    'pretrip/' + uid + '-script.json',
    JSON.stringify(
      {
        format: 'chapter-v1',
        chapters: chapterDefs,
        flow: buildPretripFlow(scriptJson, sceneDefs)
      },
      null,
      2
    )
  );
}

function removeOldTxt(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach((f) => {
    if (f.endsWith('.txt') && !/^\d{2}-/.test(f) && !f.includes('-html')) {
      fs.unlinkSync(path.join(dir, f));
    }
  });
}

['zhang', 'lin'].forEach((uid) => {
  migrateDuring(uid);
  migratePretrip(uid);
  removeOldTxt(path.join(CONTENT, 'during', uid));
  removeOldTxt(path.join(CONTENT, 'pretrip', uid));
});

const manifest = JSON.parse(read('manifest.json'));
manifest.format = 'chapter-v1';
manifest.during = { zhang: 'during/zhang-chapters.json', lin: 'during/lin-chapters.json' };
write('manifest.json', JSON.stringify(manifest, null, 2));
console.log('Migrated to chapter format under assets/content/');
