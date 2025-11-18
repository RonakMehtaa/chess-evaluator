import fs from 'fs';
import path from 'path';
import { pgn2fen } from '../src/utils/pgnConverter';
import { Chess } from 'chess.js';

// Use process.cwd() to resolve data directory from repository root so the script
// works the same when run via ts-node or when compiled to a temporary outDir.
const DATA_DIR = path.resolve(process.cwd(), 'src', 'data');
const INPUT_PGN = path.join(DATA_DIR, 'F1 Evaluate.pgn');
const OUTPUT_JSON = path.join(DATA_DIR, 'level1Puzzles.json');

function readPgnFile(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    console.error(`PGN file not found: ${filePath}`);
    process.exit(1);
  }
  return fs.readFileSync(filePath, 'utf8');
}

function splitPgns(raw: string): string[] {
  // Split by blank line followed by a '[' which usually indicates next game's tag section
  const parts = raw
    .split(/\r?\n\r?\n(?=\[)/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts;
}

function loadExisting(): any[] {
  if (!fs.existsSync(OUTPUT_JSON)) return [];
  try {
    return JSON.parse(fs.readFileSync(OUTPUT_JSON, 'utf8')) as any[];
  } catch (e) {
    console.warn('Could not parse existing level1 JSON, starting fresh.');
    return [];
  }
}

function main() {
  console.log('Importing PGN games from', INPUT_PGN);
  const raw = readPgnFile(INPUT_PGN);
  const games = splitPgns(raw);
  console.log(`Found ${games.length} games in the PGN file`);

  const existing = loadExisting();
  // Determine starting ID
  const existingIds = new Set(existing.map((p) => p.id));
  let nextId = 101;
  while (existingIds.has(nextId)) nextId++;

  const newPuzzles: any[] = [];

  function extractStudentMovesFromPgn(pgn: string): string[] {
    try {
      const chessForMoves = new Chess();
      chessForMoves.loadPgn(pgn);
      const movesVerbose = chessForMoves.history({ verbose: true });
      if (!movesVerbose || movesVerbose.length === 0) return [];

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
    } catch (e) {
      return [];
    }
  }

  games.forEach((g, idx) => {
    const fen = pgn2fen(g);
    if (!fen) {
      console.warn(`Skipping game ${idx} - couldn't extract FEN`);
      return;
    }

    const solution = extractStudentMovesFromPgn(g);

    const puzzle = {
      id: nextId++,
      name: `F1 Evaluate - Game ${idx + 1}`,
      difficulty: 'Level 1',
      fen,
      solution: solution || [],
      opponentMoves: [],
    };
    newPuzzles.push(puzzle);
  });

  const merged = [...existing, ...newPuzzles];
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(merged, null, 2), 'utf8');
  console.log(`Wrote ${newPuzzles.length} new puzzles to ${OUTPUT_JSON}`);
}

main();
