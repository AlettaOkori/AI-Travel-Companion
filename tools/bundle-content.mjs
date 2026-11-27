/**
 * 将 assets/content/ 打包为 content-bundle.js，供 file:// 直接打开 app.html
 * 运行：node apps/c-end-kaiping/tools/bundle-content.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { expandPretripScript, resolveDuringChatItems } from './chapter-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, '..');
const CONTENT_ROOT = path.join(APP_ROOT, 'assets', 'content');
const OUT_FILE = path.join(CONTENT_ROOT, 'content-bundle.js');

function readText(rel) {
  return fs.readFileSync(path.join(CONTENT_ROOT, rel), 'utf8');
}

function readJson(rel) {
  return JSON.parse(readText(rel));
}

function resolveScriptSteps(steps) {
  return steps.map(function(step) {
    var copy = Object.assign({}, step);
    if (copy.contentFile) {
      copy.content = readText(copy.contentFile);
      delete copy.contentFile;
    }
    return copy;
  });
}

function resolveChatData(items) {
  return items.map(function(item) {
    var copy = Object.assign({}, item);
    if (copy.textFile) {
      copy.text = readText(copy.textFile);
      delete copy.textFile;
    }
    if (copy.htmlFile) {
      copy.html = readText(copy.htmlFile);
      delete copy.htmlFile;
    }
    return copy;
  });
}

function resolveGuides(guides) {
  return guides.map(function(g) {
    var copy = Object.assign({}, g);
    if (copy.bioFile) {
      copy.bio = readText(copy.bioFile);
      delete copy.bioFile;
    }
    return copy;
  });
}

function resolveGroupTour(tour) {
  if (!tour || !tour.stops) return tour;
  var t = Object.assign({}, tour);
  t.stops = tour.stops.map(function(stop) {
    var s = Object.assign({}, stop);
    if (s.personalizedTextFile) {
      s.personalizedText = readText(s.personalizedTextFile);
      delete s.personalizedTextFile;
    }
    return s;
  });
  return t;
}

function resolveScriptDoc(doc) {
  if (doc.format === 'chapter-v1' && doc.flow) {
    return expandPretripScript(doc, readText);
  }
  return resolveScriptSteps(doc);
}

function resolveDuringDoc(doc) {
  if (doc.format === 'chapter-v1' && doc.chapters) {
    return resolveDuringChatItems(doc, readText);
  }
  return resolveChatData(doc);
}

function loadUserContent(uid, manifest, usersMeta) {
  var user = JSON.parse(JSON.stringify(usersMeta[uid]));

  user.pretrip.script = resolveScriptDoc(readJson(manifest.pretrip[uid]));
  user.pretrip.guides = resolveGuides(readJson(manifest.guides[uid].ai));
  user.pretrip.humanGuides = resolveGuides(readJson(manifest.guides[uid].human));
  user.during.chatData = resolveDuringDoc(readJson(manifest.during[uid]));

  if (user.during.culturePopup && manifest.culture && manifest.culture[uid]) {
    user.during.culturePopup.introText = readText(manifest.culture[uid]);
  }

  if (user.pretrip.groupTourFile) {
    user.pretrip.groupTour = resolveGroupTour(readJson(user.pretrip.groupTourFile));
    delete user.pretrip.groupTourFile;
  }

  if (manifest.humanGuide && manifest.humanGuide[uid] && user.pretrip.humanGuide) {
    if (!user.pretrip.humanGuide.pitchByUser) user.pretrip.humanGuide.pitchByUser = {};
    if (!user.pretrip.humanGuide.pitchByUser[uid]) user.pretrip.humanGuide.pitchByUser[uid] = {};
    user.pretrip.humanGuide.pitchByUser[uid].witty = readText(manifest.humanGuide[uid].wittyFile);
    user.pretrip.humanGuide.pitchByUser[uid].bio = readText(manifest.humanGuide[uid].bioFile);
  }

  return user;
}

function main() {
  var manifest = readJson('manifest.json');
  var usersMeta = readJson(manifest.users);
  var GUIDE_MOTTOS = readJson(manifest.meta.mottos);
  var GUIDE_YEARS_EXP = readJson(manifest.meta.yearsExp);

  var USER_DB = {
    zhang: loadUserContent('zhang', manifest, usersMeta),
    lin: loadUserContent('lin', manifest, usersMeta)
  };

  var bundle = { GUIDE_MOTTOS: GUIDE_MOTTOS, GUIDE_YEARS_EXP: GUIDE_YEARS_EXP, USER_DB: USER_DB };
  var body = 'window.HX_CONTENT_BUNDLE=' + JSON.stringify(bundle) + ';';
  var banner = '/* 自动生成 · file:// 离线包 · 勿手改。更新文案后运行: node apps/c-end-kaiping/tools/bundle-content.mjs */\n';

  fs.writeFileSync(OUT_FILE, banner + body, 'utf8');
  var kb = Math.round(fs.statSync(OUT_FILE).size / 1024);
  console.log('Wrote', OUT_FILE, '(' + kb + ' KB)');
}

main();
