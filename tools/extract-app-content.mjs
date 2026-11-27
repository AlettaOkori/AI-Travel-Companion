/**
 * 从 app.html 提取长文本到 assets/content/（场景章节格式）
 * 运行：node apps/c-end-kaiping/tools/extract-app-content.mjs
 *
 * 注：app.html 中 USER_DB 已外置时，请直接编辑 assets/content/ 下的章节 .txt
 */
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, '..');
const APP_HTML = path.join(APP_ROOT, 'app.html');
const CONTENT_ROOT = path.join(APP_ROOT, 'assets', 'content');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeText(rel, text) {
  const full = path.join(CONTENT_ROOT, rel);
  ensureDir(path.dirname(full));
  fs.writeFileSync(full, text, 'utf8');
  return rel.replace(/\\/g, '/');
}

function evalAppData() {
  const html = fs.readFileSync(APP_HTML, 'utf8');
  const start = html.indexOf('const PRETIP_GUIDE_TIERS = [');
  const end = html.indexOf('// 用户数据快照');
  if (start < 0 || end < 0) throw new Error('Cannot locate USER_DB block in app.html');

  const block = html.slice(start, end);
  const userDbStart = block.indexOf('const USER_DB = {');
  if (userDbStart < 0) throw new Error('USER_DB is stub — edit chapter .txt files directly');

  const funcStart = block.indexOf('function buildGuideServiceTypes');
  const prefixEnd = funcStart > 0 ? funcStart : userDbStart;
  const prefix = block.slice(0, prefixEnd);
  const userDbCode = block.slice(userDbStart);

  const ctx = { console };
  vm.runInNewContext(
    prefix.replace(/\bconst\b/g, 'var') + '\n' + userDbCode.replace('const USER_DB', 'var USER_DB') + '\nUSER_DB;',
    ctx
  );
  return {
    USER_DB: ctx.USER_DB,
    PRETIP_HUMAN_GUIDE: ctx.PRETIP_HUMAN_GUIDE,
    GUIDE_MOTTOS: ctx.GUIDE_MOTTOS,
    GUIDE_YEARS_EXP: ctx.GUIDE_YEARS_EXP,
    PRETIP_GUIDE_TIERS: ctx.PRETIP_GUIDE_TIERS
  };
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

function roleLabel(sender, context) {
  if (sender === 'system') return '**系统**';
  if (sender === 'user') return '**用户**';
  return context === 'pretrip' ? '**AI定制师**' : '**AI旅伴**';
}

function findChapterIndex(scenes, turnIndex) {
  for (let i = 0; i < scenes.length; i++) {
    if (turnIndex >= scenes[i].start && turnIndex <= scenes[i].end) return i;
  }
  return 0;
}

function extractDuring(uid, chatData) {
  const sceneDefs = DURING_SCENES[uid];
  const chapterDefs = sceneDefs.map((def) => {
    const slice = chatData.slice(def.start, def.end + 1);
    const header =
      '# 【开平碉楼 · 行中导览脚本 · ' +
      (uid === 'zhang' ? '张先生' : '林女士') +
      '】\n\n## ' +
      def.title +
      '\n\n';
    const body = slice
      .filter((m) => !m.facilityStop && !(m.html && !m.text))
      .map((m) => roleLabel(m.sender, 'during') + '：\n' + (m.text || ''))
      .join('\n\n');
    writeText('during/' + uid + '/' + def.file, header + body);

    slice.forEach((m) => {
      if (m.html) {
        const idx = chatData.indexOf(m);
        writeText('during/' + uid + '/' + String(idx).padStart(3, '0') + '-html.txt', m.html);
      }
    });

    const messages = slice.map((m) => {
      const item = { sender: m.sender, time: m.time };
      if (m.userName) item.userName = m.userName;
      if (m.location) item.location = m.location;
      if (m.facilityStop) {
        item.facilityStop = m.facilityStop;
        item.skipTurn = true;
        item.text = '';
      } else if (m.html && !m.text) {
        item.skipTurn = true;
        item.text = '';
        item.html = 'during/' + uid + '/' + String(chatData.indexOf(m)).padStart(3, '0') + '-html.txt';
      } else if (m.html) {
        item.html = 'during/' + uid + '/' + String(chatData.indexOf(m)).padStart(3, '0') + '-html.txt';
      }
      return item;
    });

    return { title: def.title, file: 'during/' + uid + '/' + def.file, messages };
  });

  writeText('during/' + uid + '-chapters.json', JSON.stringify({ format: 'chapter-v1', chapters: chapterDefs }, null, 2));
}

function extractPretrip(uid, steps) {
  const sceneDefs = PRETRIP_SCENES[uid];
  const dialogue = steps.filter((s) => s.type === 'ai' || s.type === 'user' || s.type === 'scroll-hint');
  let turnIndex = 0;
  const flow = steps.map((step) => {
    if (step.type === 'card') return { type: 'card', subtype: step.subtype };
    if (step.type !== 'ai' && step.type !== 'user' && step.type !== 'scroll-hint') return { ...step };
    const ch = findChapterIndex(sceneDefs, turnIndex);
    const item = { type: step.type, chapter: ch, turn: turnIndex - sceneDefs[ch].start };
    if (step._branch) item._branch = step._branch;
    turnIndex++;
    return item;
  });

  const chapterDefs = sceneDefs.map((def) => {
    const turns = dialogue.slice(def.start, def.end + 1);
    const header =
      '# 【开平碉楼 · 行前定制脚本 · ' +
      (uid === 'zhang' ? '张先生' : '林女士') +
      '】\n\n## ' +
      def.title +
      '\n\n';
    const body = turns
      .map((t) => {
        const label =
          t.type === 'scroll-hint' ? '**（提示）**' : t.type === 'user' ? '**用户**' : '**AI定制师**';
        return label + '：\n' + (t.content || '');
      })
      .join('\n\n');
    writeText('pretrip/' + uid + '/' + def.file, header + body);
    return { title: def.title, file: 'pretrip/' + uid + '/' + def.file };
  });

  writeText(
    'pretrip/' + uid + '-script.json',
    JSON.stringify({ format: 'chapter-v1', chapters: chapterDefs, flow }, null, 2)
  );
}

function extractGuides(uid, guides, subdir) {
  return guides.map((g) => {
    const copy = { ...g };
    if (copy.bio) {
      copy.bioFile = writeText('guides/' + subdir + '/' + g.id + '-bio.txt', copy.bio);
      delete copy.bio;
    }
    return copy;
  });
}

function main() {
  const data = evalAppData();
  const manifest = {
    version: 1,
    format: 'chapter-v1',
    base: 'assets/content/',
    pretrip: {},
    during: {},
    guides: {},
    humanGuide: {},
    meta: {}
  };

  ['zhang', 'lin'].forEach((uid) => {
    const user = data.USER_DB[uid];
    if (!user) return;

    extractPretrip(uid, user.pretrip.script);
    manifest.pretrip[uid] = 'pretrip/' + uid + '-script.json';

    extractDuring(uid, user.during.chatData);
    manifest.during[uid] = 'during/' + uid + '-chapters.json';

    const aiGuides = extractGuides(uid, user.pretrip.guides, 'ai');
    const humanGuides = extractGuides(uid, user.pretrip.humanGuides, 'human');
    writeText('guides/' + uid + '-ai.json', JSON.stringify(aiGuides, null, 2));
    writeText('guides/' + uid + '-human.json', JSON.stringify(humanGuides, null, 2));
    manifest.guides[uid] = { ai: 'guides/' + uid + '-ai.json', human: 'guides/' + uid + '-human.json' };

    if (user.pretrip.groupTour && user.pretrip.groupTour.stops) {
      const tour = JSON.parse(JSON.stringify(user.pretrip.groupTour));
      tour.stops.forEach((stop) => {
        if (stop.personalizedText) {
          stop.personalizedTextFile = writeText(
            'group-tour/' + uid + '/' + stop.id + '.txt',
            stop.personalizedText
          );
          delete stop.personalizedText;
        }
      });
      writeText('group-tour/' + uid + '-tour.json', JSON.stringify(tour, null, 2));
      manifest.groupTour = manifest.groupTour || {};
      manifest.groupTour[uid] = 'group-tour/' + uid + '-tour.json';
    }

    if (user.during.culturePopup && user.during.culturePopup.introText) {
      const intro = user.during.culturePopup.introText;
      writeText('culture/' + uid + '-intro.txt', intro);
      manifest.culture = manifest.culture || {};
      manifest.culture[uid] = 'culture/' + uid + '-intro.txt';
    }
  });

  ['zhang', 'lin'].forEach((uid) => {
    const pitch = data.PRETIP_HUMAN_GUIDE.pitchByUser[uid];
    if (!pitch) return;
    manifest.humanGuide[uid] = {
      wittyFile: writeText('human-guide/' + uid + '-witty.txt', pitch.witty),
      bioFile: writeText('human-guide/' + uid + '-pitch-bio.txt', pitch.bio)
    };
  });

  writeText('guides/meta/years-exp.json', JSON.stringify(data.GUIDE_YEARS_EXP, null, 2));
  writeText('guides/meta/mottos.json', JSON.stringify(data.GUIDE_MOTTOS, null, 2));
  manifest.meta.yearsExp = 'guides/meta/years-exp.json';
  manifest.meta.mottos = 'guides/meta/mottos.json';

  const usersMeta = {};
  ['zhang', 'lin'].forEach((uid) => {
    const u = JSON.parse(JSON.stringify(data.USER_DB[uid]));
    delete u.pretrip.script;
    delete u.pretrip.guides;
    delete u.pretrip.humanGuides;
    if (u.pretrip.humanGuide && u.pretrip.humanGuide.pitchByUser) {
      u.pretrip.humanGuide.pitchByUser = { zhang: { witty: '', bio: '' }, lin: { witty: '', bio: '' } };
    }
    if (u.pretrip.groupTour) {
      delete u.pretrip.groupTour;
      u.pretrip.groupTourFile = 'group-tour/' + uid + '-tour.json';
    }
    delete u.during.chatData;
    if (u.during.culturePopup) {
      delete u.during.culturePopup.introText;
      u.during.culturePopup.introTextFile = 'culture/' + uid + '-intro.txt';
    }
    usersMeta[uid] = u;
  });
  writeText('users/meta.json', JSON.stringify(usersMeta, null, 2));
  manifest.users = 'users/meta.json';

  writeText('manifest.json', JSON.stringify(manifest, null, 2));
  console.log('Content extracted to', CONTENT_ROOT);
}

main();
