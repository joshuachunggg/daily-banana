import assert from 'node:assert/strict';
import dictionary from './dist/wordfreq-en-25000-log.json' with { type: 'json' };
import validationWords from './dist/twl06.json' with { type: 'json' };
import { createRarityScorer } from './dist/scoring.js';

const frequencies = new Map(dictionary.filter(([word, frequency]) => /^[a-z]+$/.test(word) && frequency >= -12.5));
const acceptedWords = new Set(validationWords);
const puzzles = [
  [{r:5,c:2,w:'plane',d:'a'},{r:1,c:6,w:'stone',d:'d'},{r:4,c:4,w:'race',d:'d'},{r:7,c:4,w:'earn',d:'a'}],
  [{r:5,c:2,w:'stream',d:'a'},{r:3,c:4,w:'forest',d:'d'},{r:3,c:4,w:'farm',d:'a'}],
  [{r:5,c:2,w:'place',d:'a'},{r:3,c:3,w:'silver',d:'d'},{r:1,c:6,w:'stone',d:'d'}]
];
function boardFor(placements) { const board=Array(81).fill(null); for(const {r,c,w,d} of placements) for(const [i,letter] of [...w].entries()){const index=(r+(d==='d'?i:0))*9+c+(d==='a'?i:0), value=letter.toUpperCase(); assert(index>=0&&index<81); assert(!board[index]||board[index]===value); board[index]=value;} return board; }
function runs(board) { const all=[]; for(const [vertical,outer] of [[false,9],[true,9]]) for(let o=0;o<outer;o++){let word='';for(let i=0;i<=9;i++){const letter=i<9?board[vertical?i*9+o:o*9+i]:null;if(letter)word+=letter;else{if(word.length>1)all.push(word.toLowerCase());word='';}}} return all; }
function connected(board) { const start=board.findIndex(Boolean), seen=new Set([start]), todo=[start]; while(todo.length){const i=todo.pop(),r=Math.floor(i/9),c=i%9;for(const [y,x] of [[r-1,c],[r+1,c],[r,c-1],[r,c+1]]){const next=y*9+x;if(y>=0&&y<9&&x>=0&&x<9&&board[next]&&!seen.has(next)){seen.add(next);todo.push(next);}}} return seen.size===board.filter(Boolean).length; }
for(const puzzle of puzzles){const board=boardFor(puzzle), found=runs(board), tiles=board.filter(Boolean).length; assert(connected(board)); assert(tiles>=14&&tiles<=16); assert(found.length>=3); assert(found.every(word=>word.length>=4&&frequencies.has(word))); assert(Math.max(...found.map(word=>word.length))<=tiles*.45);}
for (const word of ['rapeseed','lantern','sonar','pacer']) assert(acceptedWords.has(word));
assert(acceptedWords.has('shog'));
assert(!acceptedWords.has('dgo'));
const score = createRarityScorer([['rare',-16],['less',-14],['used',-12],['word',-10],['fiver',-20],['other',-18],['longer',-20],['common',-18],['normal',-16],['famous',-14]]);
assert.equal(score('fiver').points, 8);
assert.equal(score('word').points, 0);
assert.equal(score('famous').points, 0);
assert.equal(score('word').level, 'Common');
assert.equal(score('rare').level, 'Rare');
assert.equal(score('fiver').level, 'Rare');
assert(score('rare').rarerThan > score('less').rarerThan);
assert.equal(score('rare').range, '4–5-letter words');
const bandScore = createRarityScorer([['aaaa',-8],['aaab',-7],['aaac',-6],['aaad',-5],['aaae',-4],['aaaf',-3],['aaag',-2],['aaah',-1],['aaai',0]]);
assert.equal(bandScore('aaae').level, 'Uncommon');
assert.equal(bandScore('aaad').level, 'Rare');
console.log(`Validated ${puzzles.length} solvable, non-trivial daily racks.`);
