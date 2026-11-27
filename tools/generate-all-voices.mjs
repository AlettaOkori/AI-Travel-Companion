/**
 * 根据 content-bundle 同源逻辑，为全部对话/配套语音生成 MiniMax TTS
 * 运行：node apps/c-end-kaiping/tools/generate-all-voices.mjs
 * 可选：--clean  先删除旧导游语音再生成
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import {
  resolveDuringChatItems,
  collectAiVoiceSegments,
  stripForTts
} from './chapter-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, '..');
const CONTENT_ROOT = path.join(APP_ROOT, 'assets', 'content');
const TTS_SCRIPT = path.resolve(__dirname, '../../../.claude/skills/minimax/scripts/text_to_audio.py');
const API_KEY = process.env.MINIMAX_API_KEY;
if (!API_KEY) {
  console.error('Set MINIMAX_API_KEY before generating audio.');
  process.exit(1);
}

const VOICES = {
  zhang: 'audiobook_male_1',
  lin: 'tianxin_xiaoling'
};

const CLEAN = process.argv.includes('--clean');
const DURING_ONLY = process.argv.includes('--during');
const DELAY_MS = 800;

function readText(rel) {
  return fs.readFileSync(path.join(CONTENT_ROOT, rel), 'utf8');
}

function readJson(rel) {
  return JSON.parse(readText(rel));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
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
    throw new Error('TTS failed: ' + outFile);
  }
  console.log('OK', path.relative(APP_ROOT, outFile), '(' + text.length + ' chars)');
}

function duringVoiceDir(uid) {
  return uid === 'lin'
    ? path.join(APP_ROOT, 'assets', 'lin_audios')
    : path.join(APP_ROOT, 'assets', 'audios');
}

function cleanOldGuideVoices() {
  ['zhang', 'lin'].forEach((uid) => {
    const dir = duringVoiceDir(uid);
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir)
      .filter((f) => /^导游语音_\d+(_\d+)?\.mp3$/.test(f))
      .forEach((f) => {
        fs.unlinkSync(path.join(dir, f));
        console.log('DEL', path.join(path.relative(APP_ROOT, dir), f));
      });
  });
}

async function generateDuringVoices(uid) {
  const doc = readJson('during/' + uid + '-chapters.json');
  const chatData = resolveDuringChatItems(doc, readText);
  const jobs = collectAiVoiceSegments(chatData);
  const voice = VOICES[uid];
  const outDir = duringVoiceDir(uid);

  console.log('\n[' + uid + '] during voice segments:', jobs.length);
  for (const job of jobs) {
    synthesize(job.text, path.join(outDir, job.filename), voice);
    await sleep(DELAY_MS);
  }
  return jobs.length;
}

function collectFacilityJobs(meta) {
  const jobs = [];
  const seen = new Set();
  ['zhang', 'lin'].forEach((uid) => {
    const facilities = meta[uid]?.during?.facilities || [];
    facilities.forEach((group) => {
      (group.items || []).forEach((item) => {
        if (!item.audio || seen.has(item.audio)) return;
        seen.add(item.audio);
        const siblings = facilities
          .flatMap((g) => g.items || [])
          .filter((i) => i.audio === item.audio);
        const text = stripForTts(
          siblings.map((i) => i.name + '，' + i.desc).join('。')
        );
        jobs.push({
          rel: item.audio.replace(/^assets\//, ''),
          text,
          voice: VOICES[uid]
        });
      });
    });
  });
  return jobs;
}

async function generateFacilityVoices(meta) {
  const jobs = collectFacilityJobs(meta);
  console.log('\n[facility] unique audio files:', jobs.length);
  for (const job of jobs) {
    synthesize(job.text, path.join(APP_ROOT, job.rel), job.voice);
    await sleep(DELAY_MS);
  }
  return jobs.length;
}

async function generateCultureVoices() {
  const jobs = [
    { rel: 'assets/audios/during/zhang/culture-end.mp3', file: 'culture/zhang-intro.txt', voice: VOICES.zhang },
    { rel: 'assets/audios/during/lin/culture-end.mp3', file: 'culture/lin-intro.txt', voice: VOICES.lin }
  ];
  console.log('\n[culture] files:', jobs.length);
  for (const job of jobs) {
    const text = stripForTts(readText(job.file));
    synthesize(text, path.join(APP_ROOT, job.rel.replace(/^assets\//, '')), job.voice);
    await sleep(DELAY_MS);
  }
  return jobs.length;
}

async function generateGroupTourVoices() {
  const tour = readJson('group-tour/lin-tour.json');
  console.log('\n[pretrip group-tour lin] stops:', tour.stops.length);
  for (const stop of tour.stops) {
    const text = stop.personalizedTextFile
      ? stripForTts(readText(stop.personalizedTextFile))
      : stripForTts(stop.personalizedText || '');
    if (!text || !stop.audio) continue;
    synthesize(text, path.join(APP_ROOT, stop.audio.replace(/^assets\//, '')), VOICES.lin);
    await sleep(DELAY_MS);
  }
  return tour.stops.length;
}

function removeOrphanAudios() {
  const orphans = [
    'assets/audios/pretrip/zhang/zili.mp3',
    'assets/audios/pretrip/zhang/ligarden.mp3',
    'assets/audios/pretrip/zhang/maganglong.mp3',
    'assets/audios/during/zhang/facility-zili.mp3',
    'assets/audios/during/zhang/facility-ligarden.mp3'
  ];
  orphans.forEach((rel) => {
    const full = path.join(APP_ROOT, rel.replace(/^assets\//, ''));
    if (fs.existsSync(full)) {
      fs.unlinkSync(full);
      console.log('DEL orphan', rel);
    }
  });
}

async function main() {
  const meta = readJson('users/meta.json');

  if (CLEAN) {
    console.log('Cleaning old guide voice files...');
    cleanOldGuideVoices();
    if (!DURING_ONLY) removeOrphanAudios();
  }

  const counts = {};
  counts.zhangDuring = await generateDuringVoices('zhang');
  counts.linDuring = await generateDuringVoices('lin');
  if (!DURING_ONLY) {
    counts.facility = await generateFacilityVoices(meta);
    counts.culture = await generateCultureVoices();
    counts.groupTour = await generateGroupTourVoices();
  }

  console.log('\nDone.', counts);
  console.log('Tip: bump ?v= in app.html playGuideVoice / getAudioPath cache buster.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
