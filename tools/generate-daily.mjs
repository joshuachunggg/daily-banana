import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { generatePuzzle } from '../dist/puzzle-generator.js';

const dist = resolve(import.meta.dirname, '..', 'dist');
const dayKey = new Date().toISOString().slice(0, 10);
const dictionary = JSON.parse(await readFile(resolve(dist, 'wordfreq-en-25000-log.json'), 'utf8'));
const frequencies = new Map(dictionary.filter(([word]) => /^[a-z]+$/.test(word)));
const seed = createHash('sha256').update(`daily-banana:${dayKey}`).digest().readUInt32LE(0);
const { solution } = generatePuzzle([...frequencies.keys()], frequencies, seed, -12.5);

let shuffleSeed = seed, tiles = solution.filter(Boolean).map((letter, index) => ({ id: `tile-${index}`, letter }));
for (let index = tiles.length - 1; index > 0; index--) {
  shuffleSeed = (shuffleSeed * 1664525 + 1013904223) >>> 0;
  [tiles[index], tiles[shuffleSeed % (index + 1)]] = [tiles[shuffleSeed % (index + 1)], tiles[index]];
}
await writeFile(resolve(dist, 'daily.json'), JSON.stringify({ dayKey, tiles }), 'utf8');
console.log(`Generated ${dayKey} with ${tiles.length} tiles.`);
