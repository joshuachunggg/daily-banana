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
  const frequencies = new Map(entries), buckets = new Map(), comparisons = new Map();
  for (const [word, frequency] of entries) {
    if (/^[a-z]{3,}$/.test(word)) (buckets.get(word.length) || buckets.set(word.length, []).get(word.length)).push(frequency);
  }
  for (const values of buckets.values()) values.sort((a, b) => a - b);
  for (const length of buckets.keys()) {
    const lengths = [length - 1, length, length + 1].filter(candidate => buckets.has(candidate));
    comparisons.set(length, { values: lengths.flatMap(candidate => buckets.get(candidate)).sort((a, b) => a - b), range: lengths.length === 1 ? `${length}-letter words` : `${lengths[0]}–${lengths.at(-1)}-letter words` });
  }
  return word => {
    const comparison = comparisons.get(word.length), frequency = frequencies.get(word);
    if (!comparison || frequency === undefined) return { points: 0, level: 'Common', rarerThan: 0, range: `${word.length}-letter words` };
    const { values, range } = comparison;
    const rank = Math.min(values.length - 1, lowerBound(values, frequency));
    const rarity = values.length === 1 ? 0 : 1 - rank / (values.length - 1);
    const points = rarity < .05 ? 0 : rarity < .075 ? 1 : rarity < .1 ? 2 : rarity < .15 ? 3 : rarity < .25 ? 4 : Math.min(8, 5 + Math.floor((rarity - .25) / .15));
    return { points, level: levelFor(points), rarerThan: Math.round(rarity * 100), range };
  };
}
