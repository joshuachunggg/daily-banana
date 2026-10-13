const lowerBound = (values, value) => {
  let low = 0, high = values.length;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (values[middle] < value) low = middle + 1;
    else high = middle;
  }
  return low;
};

const levelFor = points => points <= 1 ? 'Common' : points <= 3 ? 'Familiar' : points <= 5 ? 'Less common' : points <= 7 ? 'Uncommon' : 'Rare';

export function createRarityScorer(entries) {
  const frequencies = new Map(entries), buckets = new Map();
  for (const [word, frequency] of entries) {
    if (/^[a-z]{3,}$/.test(word)) (buckets.get(word.length) || buckets.set(word.length, []).get(word.length)).push(frequency);
  }
  for (const values of buckets.values()) values.sort((a, b) => a - b);
  return word => {
    const values = buckets.get(word.length), frequency = frequencies.get(word);
    if (!values || frequency === undefined) return { points: 0, level: 'Common', rarerThan: 0 };
    const rank = Math.min(values.length - 1, lowerBound(values, frequency));
    const rarity = values.length === 1 ? 0 : 1 - rank / (values.length - 1);
    const points = Math.round(rarity * 8);
    return { points, level: levelFor(points), rarerThan: Math.round(rarity * 100) };
  };
}
