import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync('./dist/index.html', 'utf8');
assert.match(page, /<script type="module">/);
assert.match(page, /import \{ generatePuzzle \} from '.\/puzzle-generator\.js'/);
assert(page.includes('?mode=infinite'));
assert(page.includes('New infinite game'));
console.log('Validated Infinite mode wiring.');
