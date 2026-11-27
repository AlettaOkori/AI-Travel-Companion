/**
 * 章节文案解析与 chatData 组装（chapter-v1）
 */
import fs from 'fs';
import path from 'path';

const ROLE_MAP = {
  AI旅伴: 'ai',
  AI定制师: 'ai',
  用户: 'user',
  系统: 'system',
  '（提示）': 'scroll-hint'
};

export function parseChapterTurns(text) {
  const parts = text.split(/\n\*\*([^*]+)\*\*[：:]\s*\n/);
  const turns = [];
  for (let i = 1; i < parts.length; i += 2) {
    const role = ROLE_MAP[parts[i].trim()];
    if (!role) continue;
    turns.push({ role, text: parts[i + 1].trim() });
  }
  return turns;
}

export function expandDuringChapters(chaptersDoc, readText) {
  const chatData = [];
  chaptersDoc.chapters.forEach((ch) => {
    const raw = readText(ch.file);
    const turns = parseChapterTurns(raw);
    let turnIdx = 0;
    ch.messages.forEach((msg) => {
      const item = { ...msg };
      if (!msg.skipTurn) {
        const turn = turns[turnIdx++];
        if (!turn) {
          throw new Error('章节回合不足: ' + ch.file + ' at message ' + JSON.stringify(msg));
        }
        item.sender = turn.role === 'scroll-hint' ? item.sender : turn.role;
        item.text = turn.text;
      }
      if (item.html && typeof item.html === 'string' && item.html.endsWith('.txt')) {
        item.htmlFile = item.html;
        delete item.html;
      }
      chatData.push(item);
    });
    if (turnIdx !== turns.length) {
      throw new Error('章节回合不匹配: ' + ch.file + ' used ' + turnIdx + ' parsed ' + turns.length);
    }
  });
  return chatData;
}

export function stripForTts(text) {
  return (text || '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/📍[^\s]*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 与 app.html splitGuideSegments 一致：按换行拆成多个气泡 */
export function splitGuideSegments(text) {
  const parts = String(text || '')
    .split(/\r?\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length ? parts : [''];
}

export function guideVoiceFilename(aiIdx, segCount, segIndex) {
  const base = '导游语音_' + String(aiIdx).padStart(2, '0');
  if (segCount <= 1) return base + '.mp3';
  return base + '_' + String(segIndex + 1).padStart(2, '0') + '.mp3';
}

export function collectAiVoiceLines(chatData) {
  const lines = [];
  let aiIdx = 0;
  chatData.forEach((item) => {
    if (item.sender !== 'ai') return;
    const text = item.text && String(item.text).trim();
    const isFacilityOnly = item.facilityStop && !text;
    if (isFacilityOnly || !text) return;
    const idx = aiIdx++;
    lines.push({ idx, text: stripForTts(item.text) });
  });
  return lines;
}

/** 按气泡分段生成语音文件列表 */
export function collectAiVoiceSegments(chatData) {
  const jobs = [];
  let aiIdx = 0;
  chatData.forEach((item) => {
    if (item.sender !== 'ai') return;
    const text = item.text && String(item.text).trim();
    const isFacilityOnly = item.facilityStop && !text;
    if (isFacilityOnly || !text) return;
    const idx = aiIdx++;
    const segments = splitGuideSegments(item.text);
    segments.forEach((seg, si) => {
      jobs.push({
        idx,
        seg: si + 1,
        filename: guideVoiceFilename(idx, segments.length, si),
        text: stripForTts(seg)
      });
    });
  });
  return jobs;
}

/** 仅收集指定章节文件对应的导游语音任务 */
export function collectAiVoiceSegmentsForChapter(chaptersDoc, readText, chapterFile) {
  const jobs = [];
  let aiIdx = 0;
  chaptersDoc.chapters.forEach((ch) => {
    const raw = readText(ch.file);
    const turns = parseChapterTurns(raw);
    let turnIdx = 0;
    ch.messages.forEach((msg) => {
      if (msg.sender === 'ai') {
        const isFacilityOnly = msg.facilityStop && msg.skipTurn;
        let text = '';
        if (!msg.skipTurn) {
          const turn = turns[turnIdx++];
          text = turn?.text || '';
        }
        const trimmed = text && String(text).trim();
        if (!isFacilityOnly && trimmed) {
          const idx = aiIdx++;
          if (ch.file === chapterFile) {
            const segments = splitGuideSegments(text);
            segments.forEach((seg, si) => {
              jobs.push({
                idx,
                seg: si + 1,
                filename: guideVoiceFilename(idx, segments.length, si),
                text: stripForTts(seg)
              });
            });
          }
        } else if (!isFacilityOnly && !trimmed && !msg.skipTurn) {
          aiIdx++;
        }
        return;
      }
      if (!msg.skipTurn) turnIdx++;
    });
    if (turnIdx !== turns.length) {
      throw new Error('章节回合不匹配: ' + ch.file);
    }
  });
  return jobs;
}

export function expandPretripScript(scriptDoc, readText) {
  const chapters = scriptDoc.chapters.map((ch) => ({
    ...ch,
    turns: parseChapterTurns(readText(ch.file))
  }));
  return scriptDoc.flow.map((step) => {
    if (step.type === 'card') return { ...step };
    const turn = chapters[step.chapter].turns[step.turn];
    const item = { type: step.type, content: turn?.text || '' };
    if (step._branch) item._branch = step._branch;
    return item;
  });
}

/** 为每条有语音的 AI 消息写入 aiVoiceIndex，与 导游语音_XX.mp3 文件名对齐 */
export function assignAiVoiceIndices(chatData) {
  let aiIdx = 0;
  return chatData.map((item) => {
    const copy = { ...item };
    if (copy.sender === 'ai') {
      const text = copy.text && String(copy.text).trim();
      const isFacilityOnly = copy.facilityStop && !text;
      if (!isFacilityOnly && text) {
        copy.aiVoiceIndex = aiIdx++;
      }
    }
    return copy;
  });
}

export function resolveDuringChatItems(chaptersDoc, readText) {
  const chatData = expandDuringChapters(chaptersDoc, readText);
  const resolved = chatData.map((item) => {
    const copy = { ...item };
    if (copy.htmlFile) {
      copy.html = readText(copy.htmlFile);
      delete copy.htmlFile;
    } else if (copy.html && typeof copy.html === 'string' && copy.html.endsWith('.txt')) {
      copy.html = readText(copy.html);
    }
    return copy;
  });
  return assignAiVoiceIndices(resolved);
}

export function loadZhangDuringChatData(contentRoot) {
  const doc = JSON.parse(
    fs.readFileSync(path.join(contentRoot, 'during', 'zhang-chapters.json'), 'utf8')
  );
  return expandDuringChapters(doc, (rel) =>
    fs.readFileSync(path.join(contentRoot, rel), 'utf8')
  );
}
