const lowerBound = (values, value) => {
  let low = 0, high = values.length;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (values[middle] < value) low = middle + 1;
    else high = middle;
  }
  return low;
};

const levelFor = points => points === 0 ? 'Common' : points <= 2 ? 'Familiar' : points === 3 ? 'Less common' : points === 4 ? 'Uncommon' : 'Rare';

export function createRarityScorer(entries) {
  const frequencies = new Map(entries), values = [];
  for (const [word, frequency] of entries) {
    if (/^[a-z]{3,}$/.test(word)) values.push(frequency);
  }
  values.sort((a, b) => a - b);
  return word => {
    const frequency = frequencies.get(word);
    if (!values.length || frequency === undefined) return { points: 0, level: 'Common', rarerThan: 0, range: 'all words' };
    const rank = Math.min(values.length - 1, lowerBound(values, frequency));
    const rarity = values.length === 1 ? 0 : 1 - rank / (values.length - 1);
    const points = rarity < .05 ? 0 : rarity < .075 ? 1 : rarity < .1 ? 2 : rarity < .15 ? 3 : rarity < .25 ? 4 : Math.min(8, 5 + Math.floor((rarity - .25) / .15));
    return { points, level: levelFor(points), rarerThan: Math.round(rarity * 100), range: 'all words' };
  };
}
