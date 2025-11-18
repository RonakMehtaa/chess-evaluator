import fs from 'fs';
import path from 'path';
import { Chess } from 'chess.js';

const DATA_DIR = path.resolve(process.cwd(), 'src', 'data');
const PGN_PATH = path.join(DATA_DIR, 'F1 Evaluate.pgn');
const JSON_PATH = path.join(DATA_DIR, 'level1Puzzles.json');

function readPgnFile(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    console.error(`PGN file not found: ${filePath}`);
    process.exit(1);
  }
  return fs.readFileSync(filePath, 'utf8');
}

function splitPgns(raw: string): string[] {
  return raw
    .split(/\r?\n\r?\n(?=\[)/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function extractStudentMovesFromPgn(pgn: string): string[] {
  const chessForMoves = new Chess();
  // Load PGN to get the full move list
  try {
    chessForMoves.loadPgn(pgn);
  } catch (e) {
    return [];
  }
  const movesVerbose = chessForMoves.history({ verbose: true });
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

function loadPuzzles(): any[] {
  if (!fs.existsSync(JSON_PATH)) {
    console.error(`level1 JSON not found: ${JSON_PATH}`);
    process.exit(1);
  }
  try {
    const raw = fs.readFileSync(JSON_PATH, 'utf8');
    return JSON.parse(raw) as any[];
  } catch (e) {
    console.error('Failed to parse level1 JSON:', e);
    process.exit(1);
  }
}

function savePuzzles(puzzles: any[]) {
  fs.writeFileSync(JSON_PATH, JSON.stringify(puzzles, null, 2), 'utf8');
}

function main() {
  console.log('Autofill: reading PGN from', PGN_PATH);
  const raw = readPgnFile(PGN_PATH);
  const games = splitPgns(raw);
  console.log(`Found ${games.length} games in PGN`);

  const puzzles = loadPuzzles();

  let updated = 0;

  games.forEach((g, idx) => {
    const name = `F1 Evaluate - Game ${idx + 1}`;
    const puzzle = puzzles.find((p) => p.name === name);
    if (!puzzle) {
      console.warn(`No matching puzzle object found for ${name}, skipping`);
      return;
    }
    if (puzzle.solution && puzzle.solution.length > 0) {
      // Skip already-filled solutions
      return;
    }
    const solution = extractStudentMovesFromPgn(g);
    if (!solution || solution.length === 0) {
      console.warn(`No student moves found for ${name}, leaving empty`);
      return;
    }
    puzzle.solution = solution;
    updated++;
    console.log(`Updated ${name} with ${solution.length} moves`);
  });

  if (updated > 0) {
    savePuzzles(puzzles);
    console.log(`Wrote ${updated} updated puzzles to ${JSON_PATH}`);
  } else {
    console.log('No puzzles updated');
  }
}

main();
