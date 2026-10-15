import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync('./dist/index.html', 'utf8');
assert.match(page, /<script type="module">/);
assert.match(page, /import \{ generatePuzzle, variantForSeed \} from '.\/puzzle-generator\.js'/);
assert(page.includes('?mode=infinite'));
assert(page.includes('New infinite game'));
assert(page.includes("['zigzag','long-anchor','dense']"));
assert(page.includes('infiniteVariant'));
console.log('Validated Infinite mode wiring.');
