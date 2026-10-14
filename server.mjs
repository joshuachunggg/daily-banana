import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generatePuzzle } from './dist/puzzle-generator.js';

const root = fileURLToPath(new URL('.', import.meta.url));
const dist = resolve(root, 'dist'), dataFile = resolve(root, 'data', 'daily-puzzles.json');
const dictionary = JSON.parse(await readFile(resolve(dist, 'wordfreq-en-25000-log.json'), 'utf8'));
const frequencies = new Map(dictionary.filter(([word]) => /^[a-z]+$/.test(word)));
const validationWords = new Set(JSON.parse(await readFile(resolve(dist, 'twl06.json'), 'utf8')));
const generatorWords = [...frequencies.keys()].filter(word => validationWords.has(word));
const minimumFrequency = -12.5;
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.txt':'text/plain; charset=utf-8', '.md':'text/markdown; charset=utf-8' };
const shuffle = (items, seed) => { const copy=[...items]; for(let i=copy.length-1;i>0;i--){seed=(seed*1664525+1013904223)>>>0; const j=seed%(i+1); [copy[i],copy[j]]=[copy[j],copy[i]]; } return copy; };
const dayKey = () => new Date().toISOString().slice(0,10);
let dailyPromise, loadedDay = '';

async function dailyPuzzle() {
  const day = dayKey();
  if (dailyPromise && loadedDay === day) return dailyPromise;
  loadedDay = day;
  dailyPromise = (async () => {
    await mkdir(resolve(root, 'data'), { recursive: true });
    let store = { puzzles: {} };
    try { store = JSON.parse(await readFile(dataFile, 'utf8')); } catch {}
    if (!store.puzzles?.[day]) {
      const seed = randomBytes(4).readUInt32LE(0), { placements, solution } = generatePuzzle(generatorWords, frequencies, seed, minimumFrequency);
      store.puzzles ||= {};
      store.puzzles[day] = { seed, placements, tiles: shuffle(solution.filter(Boolean), seed).map((letter, index) => ({ id: `tile-${index}`, letter })) };
      await writeFile(dataFile, JSON.stringify(store, null, 2));
    }
    return { dayKey: day, tiles: store.puzzles[day].tiles };
  })();
  return dailyPromise;
}

createServer(async (request, response) => {
  const url = new URL(request.url, 'http://localhost');
  try {
    if (url.pathname === '/api/daily') {
      response.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
      return response.end(JSON.stringify(await dailyPuzzle()));
    }
    const relative = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\/+/, '');
    const file = resolve(dist, relative);
    if (!file.startsWith(dist + sep)) throw Error('Not found');
    const body = await readFile(file);
    response.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' });
    response.end(body);
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
}).listen(4173, '0.0.0.0', () => console.log('Daily Banana is running at http://localhost:4173'));
