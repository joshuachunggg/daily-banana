import assert from 'node:assert/strict';
import daily from './dist/daily.json' with { type: 'json' };

assert.match(daily.dayKey, /^\d{4}-\d{2}-\d{2}$/);
assert(Number.isInteger(daily.revision) && daily.revision >= 0);
assert(daily.tiles.length >= 14 && daily.tiles.length <= 16);
assert.equal(new Set(daily.tiles.map(tile => tile.id)).size, daily.tiles.length);
assert(daily.tiles.every(tile => /^tile-\d+$/.test(tile.id) && /^[A-Z]$/.test(tile.letter)));
console.log(`Validated static daily puzzle for ${daily.dayKey}.`);
