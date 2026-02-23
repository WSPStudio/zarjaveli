import fs from "fs";
import path from "path";
import { performance } from "perf_hooks";

const FILE = path.resolve("statistics.json");

let sessionTimer = null;
let buildStart = 0;

function read() {
  if (!fs.existsSync(FILE)) {
    return {
      sessions: [],
      files: {},
      builds: [],
    };
  }
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf-8"));
  } catch (e) {
    return { sessions: [], files: {}, builds: [] };
  }
}

let writeTimer = null;

function write(data) {
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(() => {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
  }, 50);
}

function format(ms) {
  const m = Math.floor(ms / 60000);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return h ? `${h} ч ${mm} мин` : `${mm} мин`;
}

function today() {
  return new Date().toLocaleDateString("ru-RU");
}

export function startSession() {
  const data = read();
  const session = { date: today(), start: Date.now(), end: Date.now() };
  data.sessions.push(session);
  write(data);
}

export function endSession() {
  if (sessionTimer) clearInterval(sessionTimer);
  const data = read();
  const s = data.sessions.at(-1);
  if (s) s.end = Date.now();
  write(data);
}

export function trackFile(filePath) {
  if (!filePath) return;

  const name = path.basename(filePath);
  if (name.startsWith("__") || name.startsWith(".") || name.endsWith(".map")) return;

  const data = read();
  data.files[name] = (data.files[name] || 0) + 1;

  write(data);
}

export function buildStartTimer() {
  buildStart = performance.now();
}

export function buildEndTimer() {
  // const data = read();
  // data.builds.push({ time: Math.round(performance.now() - buildStart) });
  // write(data);
}

function calc(data) {
  const total = data.sessions.reduce((a, s) => a + (s.end - s.start), 0);

  const perDay = {};
  data.sessions.forEach((s) => {
    perDay[s.date] = (perDay[s.date] || 0) + (s.end - s.start);
  });

  const topDay = Object.entries(perDay).sort((a, b) => b[1] - a[1])[0];

  const buildsAvg = data.builds.reduce((a, b) => a + b.time, 0) / (data.builds.length || 1);

  const files = Object.entries(data.files)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return {
    total,
    sessions: data.sessions.length,
    avgSession: total / (data.sessions.length || 1),
    topDay,
    files,
    buildsAvg,
  };
}

export function showStats(filter = "all") {
  const data = read();
  const a = calc(data);

  console.log("\n📊 СТАТИСТИКА ПРОЕКТА\n");

  if (filter === "all" || filter === "time") {
    console.log(`⏱ Общее время: ${format(a.total)}`);
    console.log(`📆 Самый продуктивный день: ${a.topDay?.[0] || "—"}`);
    console.log(`🔁 Сессий: ${a.sessions}`);
    console.log(`📏 Средняя сессия: ${format(a.avgSession)}\n`);
  }

  if (filter === "all" || filter === "files") {
    console.log("🔥 Топ файлов:");
    a.files.forEach(([f, c]) => console.log(`  ${f} — ${c}`));
    console.log();
  }
}
