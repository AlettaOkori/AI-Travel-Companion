/**
 * 从 assets/content/ 加载文案并组装 USER_DB
 * 流程：manifest.json → users/meta.json → pretrip/guides/during 各模块 → .txt 台词文件
 */
(function(global) {
  'use strict';

  var BASE = 'assets/content/';
  var textCache = {};
  var textResolved = {};
  function isFileProtocol() {
    try {
      return !!(global.location && global.location.protocol === 'file:');
    } catch (e) {
      return false;
    }
  }

  function shouldUseBundle() {
    return !!global.HX_CONTENT_BUNDLE || isFileProtocol();
  }

  function loadFromBundle() {
    var bundle = global.HX_CONTENT_BUNDLE;
    if (!bundle || !bundle.USER_DB) {
      if (isFileProtocol()) {
        return Promise.reject(new Error(
          'file:// 模式需要 content-bundle.js。请运行: node apps/c-end-kaiping/tools/bundle-content.mjs'
        ));
      }
      return loadViaFetch();
    }
    global.GUIDE_MOTTOS = bundle.GUIDE_MOTTOS;
    global.GUIDE_YEARS_EXP = bundle.GUIDE_YEARS_EXP;
    global.USER_DB = JSON.parse(JSON.stringify(bundle.USER_DB));
    global.USER_DB_SNAPSHOT = JSON.parse(JSON.stringify(bundle.USER_DB));
    global.HX_CONTENT_READY = true;
    global.dispatchEvent(new Event('hx-content-ready'));
    return Promise.resolve(global.USER_DB);
  }

  function fetchText(rel) {
    if (textCache[rel]) return textCache[rel];
    textCache[rel] = fetch(BASE + rel).then(function(r) {
      if (!r.ok) throw new Error('无法加载文案: ' + rel);
      return r.text();
    }).then(function(t) {
      textResolved[rel] = t;
      return t;
    });
    return textCache[rel];
  }

  function fetchJson(rel) {
    return fetch(BASE + rel).then(function(r) {
      if (!r.ok) throw new Error('无法加载数据: ' + rel);
      return r.json();
    });
  }

  function parseChapterTurns(text) {
    var ROLE_MAP = { 'AI旅伴': 'ai', 'AI定制师': 'ai', '用户': 'user', '系统': 'system', '（提示）': 'scroll-hint' };
    var parts = text.split(/\n\*\*([^*]+)\*\*[：:]\s*\n/);
    var turns = [];
    for (var i = 1; i < parts.length; i += 2) {
      var role = ROLE_MAP[parts[i].trim()];
      if (!role) continue;
      turns.push({ role: role, text: parts[i + 1].trim() });
    }
    return turns;
  }

  function assignAiVoiceIndices(chatData) {
    var aiIdx = 0;
    return chatData.map(function(item) {
      var copy = Object.assign({}, item);
      if (copy.sender === 'ai') {
        var text = copy.text && String(copy.text).trim();
        var isFacilityOnly = copy.facilityStop && !text;
        if (!isFacilityOnly && text) {
          copy.aiVoiceIndex = aiIdx++;
        }
      }
      return copy;
    });
  }

  function expandDuringChapters(chaptersDoc, readTextFn) {
    var chatData = [];
    chaptersDoc.chapters.forEach(function(ch) {
      var raw = readTextFn(ch.file);
      var turns = parseChapterTurns(raw);
      var turnIdx = 0;
      ch.messages.forEach(function(msg) {
        var item = Object.assign({}, msg);
        if (!msg.skipTurn) {
          var turn = turns[turnIdx++];
          item.sender = turn.role === 'scroll-hint' ? item.sender : turn.role;
          item.text = turn.text;
        }
        if (item.html && typeof item.html === 'string' && item.html.endsWith('.txt')) {
          item.htmlFile = item.html;
          delete item.html;
        }
        chatData.push(item);
      });
    });
    return chatData;
  }

  function expandPretripScript(scriptDoc, readTextFn) {
    var chapters = scriptDoc.chapters.map(function(ch) {
      return Object.assign({}, ch, { turns: parseChapterTurns(readTextFn(ch.file)) });
    });
    return scriptDoc.flow.map(function(step) {
      if (step.type === 'card') return Object.assign({}, step);
      var turn = chapters[step.chapter].turns[step.turn];
      var item = { type: step.type, content: (turn && turn.text) || '' };
      if (step._branch) item._branch = step._branch;
      return item;
    });
  }

  function resolveScriptSteps(steps) {
    return Promise.all(steps.map(function(step) {
      if (!step.contentFile) return Promise.resolve(Object.assign({}, step));
      return fetchText(step.contentFile).then(function(text) {
        var copy = Object.assign({}, step);
        copy.content = text;
        delete copy.contentFile;
        return copy;
      });
    }));
  }

  function resolveScriptDoc(doc) {
    if (doc.format === 'chapter-v1' && doc.flow) {
      var files = doc.chapters.map(function(ch) { return ch.file; });
      return Promise.all(files.map(fetchText)).then(function() {
        return expandPretripScript(doc, function(rel) { return textResolved[rel]; });
      });
    }
    return resolveScriptSteps(doc);
  }

  function resolveChatData(items) {
    return Promise.all(items.map(function(item) {
      var copy = Object.assign({}, item);
      var tasks = [];
      if (item.textFile) {
        tasks.push(fetchText(item.textFile).then(function(t) { copy.text = t; delete copy.textFile; }));
      }
      if (item.htmlFile) {
        tasks.push(fetchText(item.htmlFile).then(function(h) { copy.html = h; delete copy.htmlFile; }));
      }
      if (!tasks.length) return Promise.resolve(copy);
      return Promise.all(tasks).then(function() { return copy; });
    }));
  }

  function resolveDuringDoc(doc) {
    if (doc.format === 'chapter-v1' && doc.chapters) {
      var files = [];
      doc.chapters.forEach(function(ch) {
        files.push(ch.file);
        ch.messages.forEach(function(msg) {
          if (msg.html && typeof msg.html === 'string' && msg.html.endsWith('.txt')) {
            files.push(msg.html);
          }
        });
      });
      return Promise.all(files.map(fetchText)).then(function() {
        var chatData = expandDuringChapters(doc, function(rel) { return textResolved[rel]; });
        return Promise.all(chatData.map(function(item) {
          var copy = Object.assign({}, item);
          if (copy.htmlFile) {
            copy.html = textResolved[copy.htmlFile];
            delete copy.htmlFile;
          }
          return copy;
        })).then(function(resolved) {
          return assignAiVoiceIndices(resolved);
        });
      });
    }
    return resolveChatData(doc);
  }

  function resolveGuides(guides) {
    return Promise.all(guides.map(function(g) {
      if (!g.bioFile) return Promise.resolve(Object.assign({}, g));
      return fetchText(g.bioFile).then(function(bio) {
        var copy = Object.assign({}, g);
        copy.bio = bio;
        delete copy.bioFile;
        return copy;
      });
    }));
  }

  function resolveGroupTour(tour) {
    if (!tour || !tour.stops) return Promise.resolve(tour);
    return Promise.all(tour.stops.map(function(stop) {
      if (!stop.personalizedTextFile) return Promise.resolve(stop);
      return fetchText(stop.personalizedTextFile).then(function(text) {
        var s = Object.assign({}, stop);
        s.personalizedText = text;
        delete s.personalizedTextFile;
        return s;
      });
    })).then(function(stops) {
      var t = Object.assign({}, tour);
      t.stops = stops;
      return t;
    });
  }

  function loadUserContent(uid, manifest, usersMeta) {
    var user = JSON.parse(JSON.stringify(usersMeta[uid]));
    return Promise.all([
      fetchJson(manifest.pretrip[uid]).then(resolveScriptDoc),
      fetchJson(manifest.guides[uid].ai).then(resolveGuides),
      fetchJson(manifest.guides[uid].human).then(resolveGuides),
      fetchJson(manifest.during[uid]).then(resolveDuringDoc)
    ]).then(function(parts) {
      user.pretrip.script = parts[0];
      user.pretrip.guides = parts[1];
      user.pretrip.humanGuides = parts[2];
      user.during.chatData = parts[3];

      var tasks = [];

      if (user.during.culturePopup && manifest.culture && manifest.culture[uid]) {
        tasks.push(fetchText(manifest.culture[uid]).then(function(intro) {
          user.during.culturePopup.introText = intro;
        }));
      }

      if (user.pretrip.groupTourFile) {
        tasks.push(fetchJson(user.pretrip.groupTourFile).then(resolveGroupTour).then(function(tour) {
          user.pretrip.groupTour = tour;
          delete user.pretrip.groupTourFile;
        }));
      }

      if (manifest.humanGuide && manifest.humanGuide[uid] && user.pretrip.humanGuide) {
        tasks.push(Promise.all([
          fetchText(manifest.humanGuide[uid].wittyFile),
          fetchText(manifest.humanGuide[uid].bioFile)
        ]).then(function(pitch) {
          if (!user.pretrip.humanGuide.pitchByUser) user.pretrip.humanGuide.pitchByUser = {};
          if (!user.pretrip.humanGuide.pitchByUser[uid]) user.pretrip.humanGuide.pitchByUser[uid] = {};
          user.pretrip.humanGuide.pitchByUser[uid].witty = pitch[0];
          user.pretrip.humanGuide.pitchByUser[uid].bio = pitch[1];
        }));
      }

      return Promise.all(tasks).then(function() { return user; });
    });
  }

  function loadViaFetch() {
    return fetchJson('manifest.json').then(function(manifest) {
      return fetchJson(manifest.users).then(function(usersMeta) {
        return Promise.all([
          fetchJson(manifest.meta.mottos),
          fetchJson(manifest.meta.yearsExp)
        ]).then(function(metaParts) {
          global.GUIDE_MOTTOS = metaParts[0];
          global.GUIDE_YEARS_EXP = metaParts[1];
          return Promise.all([
            loadUserContent('zhang', manifest, usersMeta),
            loadUserContent('lin', manifest, usersMeta)
          ]).then(function(users) {
            global.USER_DB = { zhang: users[0], lin: users[1] };
            global.USER_DB_SNAPSHOT = JSON.parse(JSON.stringify(global.USER_DB));
            global.HX_CONTENT_READY = true;
            global.dispatchEvent(new Event('hx-content-ready'));
            return global.USER_DB;
          });
        });
      });
    });
  }

  global.hxLoadAppContent = function() {
    if (shouldUseBundle()) return loadFromBundle();
    return loadViaFetch();
  };
})(typeof window !== 'undefined' ? window : globalThis);
