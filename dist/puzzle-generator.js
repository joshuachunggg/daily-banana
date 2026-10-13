const random = seed => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const pick = (items, next) => items[Math.floor(next() * items.length)];

export function solutionGrid(placements) {
  const board = Array(81).fill(null);
  for (const { r, c, w, d } of placements) for (const [i, letter] of [...w].entries()) {
    const row = r + (d === 'd' ? i : 0), column = c + (d === 'a' ? i : 0), index = row * 9 + column;
    if (row < 0 || row > 8 || column < 0 || column > 8 || board[index] && board[index] !== letter.toUpperCase()) throw Error('Generated puzzle conflicts.');
    board[index] = letter.toUpperCase();
  }
  return board;
}

export function generatePuzzle(words, frequencies, seed, minimumFrequency) {
  const candidates = words.filter(word => /^[a-z]{5,6}$/.test(word) && frequencies.get(word) >= minimumFrequency);
  const crossings = new Map();
  for (const word of candidates) for (let index = 1; index < word.length - 1; index++) {
    const entries = crossings.get(word[index]) || [];
    entries.push({ word, index });
    crossings.set(word[index], entries);
  }
  const next = random(seed);
  for (let attempt = 0; attempt < 3000; attempt++) {
    const first = pick(candidates, next), firstIndex = 1 + Math.floor(next() * (first.length - 2));
    const second = pick((crossings.get(first[firstIndex]) || []).filter(entry => entry.word !== first), next);
    if (!second) continue;
    const thirdVerticalIndex = second.index + 3 < second.word.length ? second.index + 3 : second.index - 3;
    const third = pick((crossings.get(second.word[thirdVerticalIndex]) || []).filter(entry => entry.word !== first && entry.word !== second.word), next);
    if (!third) continue;
    const placements = [
      { r: 4, c: 4 - firstIndex, w: first, d: 'a' },
      { r: 4 - second.index, c: 4, w: second.word, d: 'd' },
      { r: 4 - second.index + thirdVerticalIndex, c: 4 - third.index, w: third.word, d: 'a' }
    ];
    const solution = solutionGrid(placements), tiles = solution.filter(Boolean).length;
    if (tiles >= 14 && tiles <= 16) return { placements, solution };
  }
  throw Error('Could not generate today’s puzzle.');
}
