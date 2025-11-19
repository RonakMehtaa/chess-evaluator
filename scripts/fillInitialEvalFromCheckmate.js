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

function extractStudentMovesFromPgn(pgn) {
  const chess = new Chess();
  try {
    chess.loadPgn(pgn);
  } catch (e) {
    return [];
  }
  const movesVerbose = chess.history({ verbose: true });
  if (!movesVerbose || movesVerbose.length === 0) return [];

  // Determine starting active color by loading PGN then resetting
  const chessForFen = new Chess();
  chessForFen.loadPgn(pgn);
  chessForFen.reset();
  const fen = chessForFen.fen();
  const active = fen.split(' ')[1] || 'w';
  const studentIsWhite = active === 'w';

  const solutionMoves = movesVerbose
    .filter((m, idx) => (studentIsWhite ? idx % 2 === 0 : idx % 2 === 1))
    .map((m) => m.from + m.to + (m.promotion ? m.promotion : ''));

  return solutionMoves;
}

function extractOpponentMovesFromPgn(pgn) {
  const chess = new Chess();
  try {
    chess.loadPgn(pgn);
  } catch (e) {
    return [];
  }
  const movesVerbose = chess.history({ verbose: true });
  if (!movesVerbose || movesVerbose.length === 0) return [];

  const chessForFen = new Chess();
  chessForFen.loadPgn(pgn);
  chessForFen.reset();
  const fen = chessForFen.fen();
  const active = fen.split(' ')[1] || 'w';
  const studentIsWhite = active === 'w';

  const opponentMoves = movesVerbose
    .filter((m, idx) => (studentIsWhite ? idx % 2 === 1 : idx % 2 === 0))
    .map((m) => m.from + m.to + (m.promotion ? m.promotion : ''));

  return opponentMoves;
}

function loadPuzzles() {
  if (!fs.existsSync(JSON_PATH)) {
    console.error(`initialEval JSON not found: ${JSON_PATH}`);
    process.exit(1);
  }
  try {
    const raw = fs.readFileSync(JSON_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse initialEval JSON:', e);
    process.exit(1);
  }
}

function savePuzzles(puzzles) {
  fs.writeFileSync(JSON_PATH, JSON.stringify(puzzles, null, 2), 'utf8');
}

function main() {
  console.log('Filling initialEval puzzles from', PGN_PATH);
  const raw = readPgnFile(PGN_PATH);
  const games = splitPgns(raw);
  console.log(`Found ${games.length} games in PGN`);

  const puzzles = loadPuzzles();
  let updated = 0;

  games.forEach((g) => {
    // extract White tag as name
    const nameMatch = g.match(/\[White\s+"([^"]+)"\]/i);
    const name = nameMatch ? nameMatch[1] : null;
    if (!name) return;

    const puzzle = puzzles.find((p) => p.name === name);
    if (!puzzle) return;

    const solution = extractStudentMovesFromPgn(g);
    const opponentMoves = extractOpponentMovesFromPgn(g);

    if (solution && solution.length > 0) puzzle.solution = solution;
    if (opponentMoves && opponentMoves.length > 0) {
      // trim to solution.length - 1 if necessary
      const expected = Math.max(0, (puzzle.solution?.length || solution.length) - 1);
      puzzle.opponentMoves = opponentMoves.slice(0, expected);
    }

    updated++;
    console.log(`Updated ${name}: solution(${puzzle.solution.length}) opponent(${puzzle.opponentMoves.length})`);
  });

  if (updated > 0) {
    savePuzzles(puzzles);
    console.log(`Wrote ${updated} updated puzzles to ${JSON_PATH}`);
  } else {
    console.log('No puzzles updated');
  }
}

main();
