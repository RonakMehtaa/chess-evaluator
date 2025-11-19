const fs = require('fs');
const path = require('path');
const { Chess } = require('chess.js');

const pgnPath = path.resolve(__dirname, '../src/data/Level 2 test.pgn');
const outPath = path.resolve(__dirname, '../src/data/level2Puzzles.json');

const text = fs.readFileSync(pgnPath, 'utf8');
const eventRegex = /(\[Event[\s\S]*?)(?=\n\[Event|$)/g;
const events = text.match(eventRegex) || [];

const puzzles = [];

for (let i = 0; i < events.length; i++) {
  const ev = events[i];
  const fenMatch = ev.match(/\[FEN\s+"([^"]+)"\]/);
  const whiteMatch = ev.match(/\[White\s+"([^"]+)"\]/);
  const name = whiteMatch ? whiteMatch[1] : `Puzzle ${i + 1}`;
  if (!fenMatch) continue;
  const fen = fenMatch[1];

  let body = ev.replace(/\[[^\]]+\][\r\n]*/g, '\n');
  body = body.replace(/\{[\s\S]*?\}/g, '');
  body = body.replace(/[\r\n]+/g, ' ');
  body = body.replace(/\d+\.(\.{3})?/g, '');
  body = body.trim();
  const tokens = body.split(/\s+/).filter(t => t && !/^(1-0|0-1|\*|1\/2-1\/2)$/.test(t));

  const chess = new Chess(fen);
  const solution = [];
  const opponentMoves = [];

  for (let mi = 0; mi < tokens.length; mi++) {
    const san = tokens[mi].trim();
    if (!san) continue;
    const mv = chess.move(san, { sloppy: true });
    if (!mv) break;
    let uci = mv.from + mv.to;
    if (mv.promotion) uci += mv.promotion;
    if (mv.color === 'w') {
      solution.push(uci);
    } else {
      opponentMoves.push(uci);
    }
  }

  puzzles.push({
    id: i + 1,
    name,
    difficulty: 'Level 2',
    fen,
    solution,
    opponentMoves,
  });
}

fs.writeFileSync(outPath, JSON.stringify(puzzles, null, 2), 'utf8');
console.log('Wrote', puzzles.length, 'puzzles to', outPath);
