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

/**
 * Extract opponent (black's) moves from a PGN.
 * Returns an array of black moves in UCI format.
 * If the student is black, returns white's moves.
 */
function extractOpponentMovesFromPgn(pgn: string): string[] {
  try {
    const chess = new Chess();
    chess.loadPgn(pgn);
    const movesVerbose = chess.history({ verbose: true });
    if (!movesVerbose || movesVerbose.length === 0) return [];

    // Determine starting side by loading and resetting
    const chessForFen = new Chess();
    chessForFen.loadPgn(pgn);
    chessForFen.reset();
    const fen = chessForFen.fen();
    const active = fen.split(' ')[1] || 'w';
    const studentIsWhite = active === 'w';

    // Extract opponent moves (black if student is white, white if student is black)
    const opponentMoves = movesVerbose
      .filter((m, idx) => (studentIsWhite ? idx % 2 === 1 : idx % 2 === 0))
      .map((m) => m.from + m.to + (m.promotion ? m.promotion : ''));

    return opponentMoves;
  } catch (e) {
    console.error('Error extracting opponent moves:', e);
    return [];
  }
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
  console.log('Populating opponent moves from', PGN_PATH);
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

    // Extract opponent moves
    const opponentMoves = extractOpponentMovesFromPgn(g);

    // For a puzzle with N solution moves, we expect N-1 opponent moves (interspersed between)
    // Trim opponent moves to match solution length - 1
    const expectedOpponentMoveCount = Math.max(0, puzzle.solution.length - 1);
    const trimmedOpponentMoves = opponentMoves.slice(0, expectedOpponentMoveCount);

    if (trimmedOpponentMoves.length !== puzzle.opponentMoves?.length) {
      puzzle.opponentMoves = trimmedOpponentMoves;
      updated++;
      console.log(
        `Updated ${name}: solution has ${puzzle.solution.length} moves, opponent has ${trimmedOpponentMoves.length} moves`
      );
      if (trimmedOpponentMoves.length > 0) {
        console.log(`  Opponent moves: ${trimmedOpponentMoves.join(', ')}`);
      }
    }
  });

  if (updated > 0) {
    savePuzzles(puzzles);
    console.log(`Wrote ${updated} updated puzzles to ${JSON_PATH}`);
  } else {
    console.log('No puzzles needed updating');
  }
}

main();
