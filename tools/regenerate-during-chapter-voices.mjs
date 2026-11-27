/**
 * 按章节 .txt 重生成对应导游语音（与网页 chatData / aiIndex 对齐）
 * 运行：node apps/c-end-kaiping/tools/regenerate-during-chapter-voices.mjs zhang during/zhang/05-行程结束.txt
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import { collectAiVoiceSegmentsForChapter } from './chapter-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, '..');
const CONTENT_ROOT = path.join(APP_ROOT, 'assets', 'content');
const TTS_SCRIPT = path.resolve(__dirname, '../../../.claude/skills/minimax/scripts/text_to_audio.py');
const API_KEY = process.env.MINIMAX_API_KEY;

const VOICES = { zhang: 'audiobook_male_1', lin: 'tianxin_xiaoling' };
const uid = process.argv[2];
const chapterFile = process.argv[3];

if (!uid || !chapterFile) {
  console.error('Usage: node regenerate-during-chapter-voices.mjs <zhang|lin> <chapter-file-rel>');
  process.exit(1);
}

if (!API_KEY) {
  console.error('Set MINIMAX_API_KEY before generating audio.');
  process.exit(1);
}

function readText(rel) {
  return fs.readFileSync(path.join(CONTENT_ROOT, rel), 'utf8');
}

function synthesize(text, outFile, voice) {
  const absOut = path.resolve(outFile);
  fs.mkdirSync(path.dirname(absOut), { recursive: true });
  const result = spawnSync(
    'python',
    [TTS_SCRIPT, '-t', text, '-v', voice, '-k', API_KEY, '-o', absOut, '--speed', '1.05'],
    { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 }
  );
  if (result.status !== 0) {
    console.error(result.stdout);
    console.error(result.stderr);
    throw new Error('TTS failed: ' + absOut);
  }
  console.log('OK', path.relative(APP_ROOT, absOut));
  console.log('   ', text.slice(0, 72) + (text.length > 72 ? '…' : ''));
}

const doc = JSON.parse(readText('during/' + uid + '-chapters.json'));
const jobs = collectAiVoiceSegmentsForChapter(doc, readText, chapterFile);
const outDir = path.join(APP_ROOT, 'assets', uid === 'lin' ? 'lin_audios' : 'audios');

console.log('[' + uid + '] ' + chapterFile + ' → ' + jobs.length + ' voice file(s)');
jobs.forEach((job) => {
  synthesize(job.text, path.join(outDir, job.filename), VOICES[uid]);
});
