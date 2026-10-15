const random = seed => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const pickFavoringHardLetters = (items, next) => {
  const weights = items.map(item => {
    const word = item.word || item;
    return 1 + new Set(word).size - new Set(word.replace(/[jqxz]/g, '')).size;
  });
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let position = next() * total;
  for (let index = 0; index < items.length; index++) if ((position -= weights[index]) < 0) return items[index];
  return items.at(-1);
};

export function solutionGrid(placements) {
  const board = Array(81).fill(null);
  for (const { r, c, w, d } of placements) for (const [i, letter] of [...w].entries()) {
    const row = r + (d === 'd' ? i : 0), column = c + (d === 'a' ? i : 0), index = row * 9 + column;
    if (row < 0 || row > 8 || column < 0 || column > 8 || board[index] && board[index] !== letter.toUpperCase()) throw Error('Generated puzzle conflicts.');
    board[index] = letter.toUpperCase();
  }
  return board;
}

function generateZigzag(words, frequencies, seed, minimumFrequency) {
  const candidates = words.filter(word => /^[a-z]{5,6}$/.test(word) && frequencies.get(word) >= minimumFrequency);
  const crossings = new Map();
  for (const word of candidates) for (let index = 1; index < word.length - 1; index++) {
    const entries = crossings.get(word[index]) || [];
    entries.push({ word, index });
    crossings.set(word[index], entries);
  }
  const next = random(seed);
  for (let attempt = 0; attempt < 3000; attempt++) {
    const first = pickFavoringHardLetters(candidates, next), firstIndex = 1 + Math.floor(next() * (first.length - 2));
    const second = pickFavoringHardLetters((crossings.get(first[firstIndex]) || []).filter(entry => entry.word !== first), next);
    if (!second) continue;
    const thirdVerticalIndex = second.index + 3 < second.word.length ? second.index + 3 : second.index - 3;
    const third = pickFavoringHardLetters((crossings.get(second.word[thirdVerticalIndex]) || []).filter(entry => entry.word !== first && entry.word !== second.word), next);
    if (!third) continue;
    const placements = [
      { r: 4, c: 4 - firstIndex, w: first, d: 'a' },
      { r: 4 - second.index, c: 4, w: second.word, d: 'd' },
      { r: 4 - second.index + thirdVerticalIndex, c: 4 - third.index, w: third.word, d: 'a' }
    ];
    const solution = solutionGrid(placements), tiles = solution.filter(Boolean).length;
    if (tiles >= 14 && tiles <= 16 && solution.every((letter, _, board) => !letter || board.filter(tile => tile === letter).length <= 2)) return { placements, solution };
  }
  throw Error('Could not generate today’s puzzle.');
}

function generateLongAnchor(words, frequencies, seed, minimumFrequency) {
  const anchors = words.filter(word => /^[a-z]{7,8}$/.test(word) && frequencies.get(word) >= minimumFrequency);
  const branches = words.filter(word => /^[a-z]{5,6}$/.test(word) && frequencies.get(word) >= minimumFrequency);
  const crossings = new Map();
  for (const word of branches) for (let index = 1; index < word.length - 1; index++) {
    const entries = crossings.get(word[index]) || [];
    entries.push({ word, index });
    crossings.set(word[index], entries);
  }
  const next = random(seed);
  for (let attempt = 0; attempt < 3000; attempt++) {
    const first = pickFavoringHardLetters(anchors, next);
    const firstIndex = first.length - 5 + Math.floor(next() * (10 - first.length));
    const second = pickFavoringHardLetters((crossings.get(first[firstIndex]) || []).filter(entry => entry.word !== first), next);
    if (!second) continue;
    const thirdVerticalIndex = second.index + 3 < second.word.length ? second.index + 3 : second.index - 3;
    const third = pickFavoringHardLetters((crossings.get(second.word[thirdVerticalIndex]) || []).filter(entry => entry.word !== first && entry.word !== second.word), next);
    if (!third) continue;
    const placements = [
      { r: 4, c: 4 - firstIndex, w: first, d: 'a' },
      { r: 4 - second.index, c: 4, w: second.word, d: 'd' },
      { r: 4 - second.index + thirdVerticalIndex, c: 4 - third.index, w: third.word, d: 'a' }
    ];
    const solution = solutionGrid(placements), tiles = solution.filter(Boolean).length;
    if (tiles >= 15 && tiles <= 16 && solution.every((letter, _, board) => !letter || board.filter(tile => tile === letter).length <= 2)) return { placements, solution };
  }
  throw Error('Could not generate a long-anchor puzzle.');
}

function generateDense(words, frequencies, seed, minimumFrequency) {
  const verticals = words.filter(word => /^[a-z]{5,6}$/.test(word) && frequencies.get(word) >= minimumFrequency);
  const horizontals = words.filter(word => /^[a-z]{4,5}$/.test(word) && frequencies.get(word) >= minimumFrequency);
  const crossings = new Map();
  for (const word of horizontals) for (let index = 1; index < word.length - 1; index++) {
    const entries = crossings.get(word[index]) || [];
    entries.push({ word, index });
    crossings.set(word[index], entries);
  }
  const next = random(seed);
  for (let attempt = 0; attempt < 3000; attempt++) {
    const vertical = pickFavoringHardLetters(verticals, next);
    const positions = Array.from({ length: vertical.length - 2 }, (_, index) => index + 1);
    for (let index = positions.length - 1; index > 0; index--) {
      const swap = Math.floor(next() * (index + 1));
      [positions[index], positions[swap]] = [positions[swap], positions[index]];
    }
    const branches = positions.slice(0, 3).map(position => pickFavoringHardLetters((crossings.get(vertical[position]) || []).filter(entry => entry.word !== vertical), next));
    if (branches.some(branch => !branch) || new Set(branches.map(branch => branch.word)).size !== 3) continue;
    const placements = [
      { r: 2, c: 4, w: vertical, d: 'd' },
      ...branches.map((branch, index) => ({ r: 2 + positions[index], c: 4 - branch.index, w: branch.word, d: 'a' }))
    ];
    const solution = solutionGrid(placements), tiles = solution.filter(Boolean).length;
    if (tiles >= 15 && tiles <= 16 && solution.every((letter, _, board) => !letter || board.filter(tile => tile === letter).length <= 2)) return { placements, solution };
  }
  throw Error('Could not generate a dense puzzle.');
}

export function variantForSeed(seed) {
  const roll = seed % 10;
  return roll < 5 ? 'zigzag' : roll < 8 ? 'long-anchor' : 'dense';
}

export function generatePuzzle(words, frequencies, seed, minimumFrequency, variant = 'zigzag') {
  if (variant === 'long-anchor') return generateLongAnchor(words, frequencies, seed, minimumFrequency);
  if (variant === 'dense') return generateDense(words, frequencies, seed, minimumFrequency);
  if (variant === 'zigzag') return generateZigzag(words, frequencies, seed, minimumFrequency);
  throw Error(`Unknown puzzle variant: ${variant}`);
}
