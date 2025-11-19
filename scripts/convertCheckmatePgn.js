const fs = require('fs');
const path = require('path');
const { Chess } = require('chess.js');

const pgnPath = path.resolve(__dirname, '../src/data/CheckMate puzzles.pgn');
const outPath = path.resolve(__dirname, '../src/data/initialEvalPuzzles.json');

if (!fs.existsSync(pgnPath)) {
  console.error('PGN file not found at', pgnPath);
  process.exit(2);
}

const text = fs.readFileSync(pgnPath, 'utf8');
const eventRegex = /(\[Event[\s\S]*?)(?=\n\[Event|$)/g;
const events = text.match(eventRegex) || [];

const puzzles = [];

for (let i = 0; i < events.length && puzzles.length < 6; i++) {
  const ev = events[i];
  const fenMatch = ev.match(/\[FEN\s+"([^"]+)"\]/);
  const whiteMatch = ev.match(/\[White\s+"([^"]+)"\]/);
  const plyMatch = ev.match(/\[PlyCount\s+"(\d+)"\]/);
  const name = whiteMatch ? whiteMatch[1] : `Puzzle ${i + 1}`;
  if (!fenMatch) {
    console.warn('Skipping event', i + 1, '— no FEN header');
    continue;
  }
  const fen = fenMatch[1];

  // strip header lines
  let body = ev.replace(/\[[^\]]+\][\r\n]*/g, '\n');
  // remove comments
  body = body.replace(/\{[\s\S]*?\}/g, '');
  // replace newlines with space
  body = body.replace(/[\r\n]+/g, ' ');
  // remove move numbers like 1.
  body = body.replace(/\d+\.(\.{3})?/g, '');
  body = body.trim();
  // split tokens and remove result tokens
  const tokens = body.split(/\s+/).filter(t => t && !/^(1-0|0-1|\*|1\/2-1\/2)$/.test(t));

  const chess = new Chess(fen);
  const solution = [];
  const opponentMoves = [];

  for (let mi = 0; mi < tokens.length; mi++) {
    const san = tokens[mi].trim();
    if (!san) continue;
    // Try to play the SAN on the chess instance
    const mv = chess.move(san, { sloppy: true });
    if (!mv) {
      console.warn(`Failed to apply move SAN='${san}' on FEN=${fen} (event ${i + 1})`);
      break; // stop processing this event
    }
    // build UCI-style string (from + to + promotion if any)
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
    difficulty: 'Initial Eval',
    fen,
    solution,
    opponentMoves,
  });
}

fs.writeFileSync(outPath, JSON.stringify(puzzles, null, 2), 'utf8');
console.log('Wrote', puzzles.length, 'puzzles to', outPath);
process.exit(0);
