"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pgn2fen = pgn2fen;
exports.convertPuzzlesFromPgn = convertPuzzlesFromPgn;
exports.savePuzzlesToJson = savePuzzlesToJson;
exports.convertAndSavePuzzles = convertAndSavePuzzles;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chess_js_1 = require("chess.js");
/**
 * Convert PGN to FEN at the starting position
 * Extracts FEN before any moves are played
 *
 * @param pgn - PGN string (can be partial or full)
 * @returns FEN string or empty string if invalid
 */
function pgn2fen(pgn) {
    try {
        // Look for a [FEN "..."] tag in the PGN headers and return it if present
        const fenMatch = pgn.match(/\[FEN\s+"([^"]+)"\]/i);
        if (fenMatch && fenMatch[1]) {
            return fenMatch[1];
        }
        // If no FEN tag, fall back to standard starting position
        const game = new chess_js_1.Chess();
        game.reset();
        return game.fen();
    }
    catch (error) {
        console.error(`❌ Error parsing PGN: ${error instanceof Error ? error.message : error}`);
        return '';
    }
}
/**
 * Convert array of puzzles with PGN to FEN format
 *
 * @param puzzles - Array of puzzles with PGN
 * @returns Array of puzzles with FEN
 */
function convertPuzzlesFromPgn(puzzles) {
    return puzzles
        .map((puzzle, index) => {
        const fen = pgn2fen(puzzle.pgn);
        if (!fen) {
            console.warn(`⚠️  Puzzle ${puzzle.id} ("${puzzle.name}"): Invalid PGN - SKIPPING`);
            return null;
        }
        return {
            id: puzzle.id,
            name: puzzle.name,
            fen,
            solution: puzzle.solution,
            opponentMoves: puzzle.opponentMoves || [],
            difficulty: puzzle.difficulty,
        };
    })
        .filter((puzzle) => puzzle !== null);
}
/**
 * Save puzzles to JSON file
 *
 * @param puzzles - Array of puzzles with FEN
 * @param outputPath - Path to output JSON file (e.g., 'src/data/level1Puzzles.json')
 * @returns true if successful, false otherwise
 */
function savePuzzlesToJson(puzzles, outputPath) {
    try {
        // Create directory if it doesn't exist
        const dir = path_1.default.dirname(outputPath);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        // Write JSON file with nice formatting
        fs_1.default.writeFileSync(outputPath, JSON.stringify(puzzles, null, 2), 'utf-8');
        console.log(`✅ Saved ${puzzles.length} puzzles to ${outputPath}`);
        return true;
    }
    catch (error) {
        console.error(`❌ Error saving to ${outputPath}: ${error instanceof Error ? error.message : error}`);
        return false;
    }
}
/**
 * Main conversion function - orchestrates the entire process
 *
 * @param inputPuzzles - Array of puzzles with PGN
 * @param outputLevel - Which level file to save to (1, 2, or 3)
 * @returns true if successful, false otherwise
 */
function convertAndSavePuzzles(inputPuzzles, outputLevel) {
    console.log(`\n🔄 Converting ${inputPuzzles.length} puzzles for Level ${outputLevel}...`);
    // Convert PGN to FEN
    const convertedPuzzles = convertPuzzlesFromPgn(inputPuzzles);
    if (convertedPuzzles.length === 0) {
        console.error('❌ No valid puzzles to save!');
        return false;
    }
    // Determine output path
    const outputPath = `src/data/level${outputLevel}Puzzles.json`;
    // Save to JSON
    const success = savePuzzlesToJson(convertedPuzzles, outputPath);
    if (success) {
        console.log(`\n📊 Summary:`);
        console.log(`   Input puzzles: ${inputPuzzles.length}`);
        console.log(`   Converted: ${convertedPuzzles.length}`);
        console.log(`   Skipped: ${inputPuzzles.length - convertedPuzzles.length}`);
        console.log(`   Output: ${outputPath}\n`);
    }
    return success;
}
