const fs = require('fs');
const path = require('path');
const { Chess } = require('chess.js');

const DATA_DIR = path.resolve(process.cwd(), 'src', 'data');
const LEVELS = [
  { pgn: 'Level 1 test.pgn', json: 'level1Puzzles.json' },
  { pgn: 'Level 2 test.pgn', json: 'level2Puzzles.json' },
  { pgn: 'Level 3 test.pgn', json: 'level3Puzzles.json' },
  { pgn: 'Level 4 test.pgn', json: 'level4Puzzles.json' },
];

function readPgnFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`PGN file not found: ${filePath}`);
    return null;
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
    id: idx + 1,
    name,
    difficulty: `Level ${level}`,
    fen,
    solution,
    opponentMoves,
  };
}

function convertLevel(level, pgnFile, jsonFile) {
  const pgnPath = path.join(DATA_DIR, pgnFile);
  const jsonPath = path.join(DATA_DIR, jsonFile);
  const raw = readPgnFile(pgnPath);
  if (!raw) return;
  const games = splitPgns(raw);
  const puzzles = [];
  games.forEach((g, idx) => {
    const puzzle = extractPuzzleData(g, idx);
    puzzle.difficulty = `Level ${level}`;
    puzzles.push(puzzle);
  });
  fs.writeFileSync(jsonPath, JSON.stringify(puzzles, null, 2), 'utf8');
  console.log(`Converted ${games.length} puzzles to ${jsonFile}`);
}

function main() {
  LEVELS.forEach((lvl, i) => {
    convertLevel(i + 1, lvl.pgn, lvl.json);
  });
}

main();
