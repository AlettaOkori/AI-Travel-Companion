/**
 * 验证章节解析与组装
 * node apps/c-end-kaiping/tools/verify-chapters.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseChapterTurns } from './chapter-utils.mjs';

const CONTENT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../assets/content');

function loadDuring(uid) {
  const doc = JSON.parse(fs.readFileSync(path.join(CONTENT, 'during', uid + '-chapters.json'), 'utf8'));
  const chatData = [];
  doc.chapters.forEach((ch) => {
    const raw = fs.readFileSync(path.join(CONTENT, ch.file), 'utf8');
    const turns = parseChapterTurns(raw);
    let turnIdx = 0;
    ch.messages.forEach((msg) => {
      const item = { ...msg };
      if (!msg.skipTurn) {
        const turn = turns[turnIdx++];
        item.text = turn.text;
      }
      chatData.push(item);
    });
    if (turnIdx !== turns.length) {
      throw new Error(uid + ' ' + ch.file + ' turn mismatch used ' + turnIdx + ' parsed ' + turns.length);
    }
  });
  return chatData;
}

function loadPretrip(uid) {
  const doc = JSON.parse(fs.readFileSync(path.join(CONTENT, 'pretrip', uid + '-script.json'), 'utf8'));
  const chapters = doc.chapters.map((ch) => ({
    ...ch,
    turns: parseChapterTurns(fs.readFileSync(path.join(CONTENT, ch.file), 'utf8'))
  }));
  return doc.flow.map((step) => {
    if (step.type === 'card') return step;
    const turn = chapters[step.chapter].turns[step.turn];
    return { type: step.type, content: turn?.text || '', _branch: step._branch };
  });
}

['zhang', 'lin'].forEach((uid) => {
  const during = loadDuring(uid);
  const pretrip = loadPretrip(uid);
  const empty = during.filter((m) => !m.skipTurn && !m.text);
  if (empty.length) {
    console.error(uid, 'during empty texts:', empty.length);
    process.exitCode = 1;
  }
  const emptyP = pretrip.filter((s) => s.type !== 'card' && !s.content);
  if (emptyP.length) {
    console.error(uid, 'pretrip empty content:', emptyP.length, emptyP.slice(0, 3));
    process.exitCode = 1;
  }
  console.log(uid, 'during', during.length, 'pretrip', pretrip.length, 'OK');
});
