"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pgnConverter_1 = require("../src/utils/pgnConverter");
const chess_js_1 = require("chess.js");
// Use process.cwd() to resolve data directory from repository root so the script
// works the same when run via ts-node or when compiled to a temporary outDir.
const DATA_DIR = path_1.default.resolve(process.cwd(), 'src', 'data');
const INPUT_PGN = path_1.default.join(DATA_DIR, 'F1 Evaluate.pgn');
const OUTPUT_JSON = path_1.default.join(DATA_DIR, 'level1Puzzles.json');
function readPgnFile(filePath) {
    if (!fs_1.default.existsSync(filePath)) {
        console.error(`PGN file not found: ${filePath}`);
        process.exit(1);
    }
    return fs_1.default.readFileSync(filePath, 'utf8');
}
function splitPgns(raw) {
    // Split by blank line followed by a '[' which usually indicates next game's tag section
    const parts = raw
        .split(/\r?\n\r?\n(?=\[)/)
        .map((s) => s.trim())
        .filter(Boolean);
    return parts;
}
function loadExisting() {
    if (!fs_1.default.existsSync(OUTPUT_JSON))
        return [];
    try {
        return JSON.parse(fs_1.default.readFileSync(OUTPUT_JSON, 'utf8'));
    }
    catch (e) {
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
    while (existingIds.has(nextId))
        nextId++;
    const newPuzzles = [];
    function extractStudentMovesFromPgn(pgn) {
        try {
            const chessForMoves = new chess_js_1.Chess();
            chessForMoves.loadPgn(pgn);
            const movesVerbose = chessForMoves.history({ verbose: true });
            if (!movesVerbose || movesVerbose.length === 0)
                return [];
            const chessForFen = new chess_js_1.Chess();
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
        catch (e) {
            return [];
        }
    }
    games.forEach((g, idx) => {
        const fen = (0, pgnConverter_1.pgn2fen)(g);
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
    fs_1.default.writeFileSync(OUTPUT_JSON, JSON.stringify(merged, null, 2), 'utf8');
    console.log(`Wrote ${newPuzzles.length} new puzzles to ${OUTPUT_JSON}`);
}
main();
