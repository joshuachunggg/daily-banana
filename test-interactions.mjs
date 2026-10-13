import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const shifted = (index, origin, target) => {
  const row = Math.floor(index / 9) + Math.floor(target / 9) - Math.floor(origin / 9);
  const column = index % 9 + target % 9 - origin % 9;
  return row < 0 || row > 8 || column < 0 || column > 8 ? null : row * 9 + column;
};
const nearestIndex = (x, y, size = 630) => {
  if (x < 0 || x > size || y < 0 || y > size) return null;
  const column = Math.min(8, Math.max(0, Math.round(x / size * 9 - .5)));
  const row = Math.min(8, Math.max(0, Math.round(y / size * 9 - .5)));
  return row * 9 + column;
};
const returnedToRack = (grid, cells) => {
  const next = [...grid];
  for (const cell of cells) next[cell] = null;
  return next;
};

assert.equal(shifted(20, 20, 31), 31);
assert.equal(shifted(21, 20, 31), 32);
assert.equal(shifted(8, 7, 8), null);
assert.equal(shifted(80, 71, 80), null);
assert.equal(nearestIndex(0, 0), 0);
assert.equal(nearestIndex(71, 35), 1);
assert.equal(nearestIndex(630, 630), 80);
assert.equal(nearestIndex(-1, 35), null);
assert.deepEqual(returnedToRack(['tile-a', null, 'tile-b'], [0, 2]), [null, null, null]);
const page = readFileSync('./dist/index.html', 'utf8');
assert.match(page, /\.tile \{[^}]*touch-action:none/);
assert(!page.includes('Dictionary ready. Build away.'));
assert.match(page, /id="welcomeDate"/);
assert.match(page, /How scoring works/);
assert.equal((page.match(/<table class="rarity-table">/g) || []).length, 2);
assert.match(page, /<th scope="col">Rarer than<\/th>/);
assert.match(page, /<td class="rarity-rare">Rare<\/td><td>5–8<\/td><td>56\.25%\+<\/td>/);
assert(page.includes('Play: https://joshuachunggg.github.io/daily-banana/'));
console.log('Validated grouped tile movement, return-to-rack, nearest-cell snapping, and welcome details.');
