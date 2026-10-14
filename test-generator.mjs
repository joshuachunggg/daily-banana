import assert from 'node:assert/strict';
import dictionary from './dist/wordfreq-en-25000-log.json' with { type: 'json' };
import { generatePuzzle } from './dist/puzzle-generator.js';

const minimumFrequency = -12.5;
const frequencies = new Map(dictionary.filter(([word]) => /^[a-z]+$/.test(word)));
const words = [...frequencies.keys()];
const connected = board => {
  const start = board.findIndex(Boolean), seen = new Set([start]), todo = [start];
  while (todo.length) { const index = todo.pop(), row = Math.floor(index / 9), column = index % 9; for (const [y,x] of [[row-1,column],[row+1,column],[row,column-1],[row,column+1]]) { const next = y * 9 + x; if (y >= 0 && y < 9 && x >= 0 && x < 9 && board[next] && !seen.has(next)) { seen.add(next); todo.push(next); } } }
  return seen.size === board.filter(Boolean).length;
};
for (let seed = 0; seed < 365; seed++) {
  const { placements, solution } = generatePuzzle(words, frequencies, seed, minimumFrequency);
  assert.equal(placements.length, 3);
  assert(placements.every(({ w }) => w.length >= 5 && w.length <= 6 && frequencies.get(w) >= minimumFrequency));
  assert(solution.filter(Boolean).length >= 14 && solution.filter(Boolean).length <= 16);
  assert(solution.every((letter, _, board) => !letter || board.filter(tile => tile === letter).length <= 2));
  assert(connected(solution));
}
console.log('Validated 365 deterministic, connected daily puzzle generations.');
