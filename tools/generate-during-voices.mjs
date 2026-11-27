/**
 * 为张先生行中场景 02-04 生成导游语音（MiniMax TTS）
 * 运行：node apps/c-end-kaiping/tools/generate-during-voices.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import { resolveDuringChatItems, collectAiVoiceLines } from './chapter-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, '..');
const CONTENT_ROOT = path.join(APP_ROOT, 'assets', 'content');
const AUDIO_DIR = path.join(APP_ROOT, 'assets', 'audios');
const TTS_SCRIPT = path.resolve(__dirname, '../../../.claude/skills/minimax/scripts/text_to_audio.py');
const API_KEY = process.env.MINIMAX_API_KEY;
if (!API_KEY) {
  console.error('Set MINIMAX_API_KEY before generating audio.');
  process.exit(1);
}
const VOICE = 'audiobook_male_1';
const SCENE_FILES = new Set([
  'during/zhang/02-农庄午餐.txt',
  'during/zhang/03-立园.txt',
  'during/zhang/04-马降龙.txt'
]);

function readText(rel) {
  return fs.readFileSync(path.join(CONTENT_ROOT, rel), 'utf8');
}

function synthesize(text, outFile) {
  const result = spawnSync(
    'python',
    [TTS_SCRIPT, '-t', text, '-v', VOICE, '-k', API_KEY, '-o', outFile, '--speed', '1.05'],
    { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 }
  );
  if (result.status !== 0) {
    console.error(result.stdout);
    console.error(result.stderr);
    throw new Error('TTS failed for ' + outFile);
  }
  console.log('OK', path.basename(outFile), '(' + text.length + ' chars)');
}

function main() {
  const doc = JSON.parse(readText('during/zhang-chapters.json'));
  const chatData = resolveDuringChatItems(doc, readText);
  const lines = collectAiVoiceLines(chatData);

  let aiCounter = 0;
  const toGenerate = [];

  doc.chapters.forEach((ch) => {
    const isTarget = SCENE_FILES.has(ch.file);
    ch.messages.forEach((msg) => {
      if (msg.sender !== 'ai') return;
      const isFacilityOnly = msg.facilityStop && msg.skipTurn;
      if (isFacilityOnly) return;
      const line = lines.find((l) => l.idx === aiCounter);
      if (isTarget && line && line.text) toGenerate.push(line);
      aiCounter++;
    });
  });

  if (!toGenerate.length) {
    console.error('No voice lines found for scenes 02-04');
    process.exit(1);
  }

  fs.mkdirSync(AUDIO_DIR, { recursive: true });
  console.log('Generating', toGenerate.length, 'files into', AUDIO_DIR);

  toGenerate.forEach((line) => {
    const name = '导游语音_' + String(line.idx).padStart(2, '0') + '.mp3';
    synthesize(line.text, path.join(AUDIO_DIR, name));
  });

  console.log('Done. Indices:', toGenerate.map((l) => l.idx).join(', '));
}

main();
