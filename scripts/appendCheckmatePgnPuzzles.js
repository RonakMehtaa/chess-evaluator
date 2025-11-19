const fs = require('fs');
const path = require('path');
const { Chess } = require('chess.js');

const DATA_DIR = path.resolve(process.cwd(), 'src', 'data');
const PGN_PATH = path.join(DATA_DIR, 'CheckMate puzzles.pgn');
const JSON_PATH = path.join(DATA_DIR, 'initialEvalPuzzles.json');

function readPgnFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`PGN file not found: ${filePath}`);
    process.exit(1);
  }
  return fs.readFileSync(filePath, 'utf8');
}

function splitPgns(raw) {
  return raw
    .split(/\r?\n\r?\n(?=\[)/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function extractPuzzleData(pgn, idx) {
  const fenMatch = pgn.match(/\[FEN\s+"([^"]+)"\]/i);
  const nameMatch = pgn.match(/\[White\s+"([^"]+)"\]/i);
  const fen = fenMatch ? fenMatch[1] : '';
  const name = nameMatch ? nameMatch[1] : `Puzzle ${idx + 1}`;
  const chess = new Chess(fen);
  // Remove header lines and comments
  let body = pgn.replace(/\[[^\]]+\][\r\n]*/g, '\n');
  body = body.replace(/\{[\s\S]*?\}/g, '');
  body = body.replace(/[\r\n]+/g, ' ');
  body = body.replace(/\d+\.(\.{3})?/g, '');
  body = body.trim();
  const tokens = body.split(/\s+/).filter(t => t && !/^(1-0|0-1|\*|1\/2-1\/2)$/.test(t));
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
  return {
    id: idx * 2 + 1, // avoid collision with existing ids
    name,
    difficulty: 'Initial Eval',
    fen,
    solution,
    opponentMoves,
  };
}

function main() {
  const raw = readPgnFile(PGN_PATH);
  const games = splitPgns(raw);
  const puzzles = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  const existingNames = new Set(puzzles.map(p => p.name));
  let appended = 0;
  games.forEach((g, idx) => {
    const puzzle = extractPuzzleData(g, idx);
    if (!existingNames.has(puzzle.name)) {
      puzzles.push(puzzle);
      appended++;
      console.log(`Appended ${puzzle.name}`);
    }
  });
  fs.writeFileSync(JSON_PATH, JSON.stringify(puzzles, null, 2), 'utf8');
  console.log(`Appended ${appended} new puzzles to ${JSON_PATH}`);
}

main();
