import { Puzzle } from "./puzzles";
import level1Data from "./level1Puzzles.json";
import level2Data from "./level2Puzzles.json";
import level3Data from "./level3Puzzles.json";
import level4Data from "./level4Puzzles.json";
import { Chess } from "chess.js";

function convertSanToUci(puzzle: any): Puzzle {
	const game = new Chess(puzzle.fen);
	const solutionUci: string[] = [];
	const opponentUci: string[] = [];
	for (let i = 0; i < puzzle.solution.length; i++) {
		// Play student's move (White)
		const sanOrUci = puzzle.solution[i];
		const move = applyMove(game, sanOrUci);
		if (move) {
			solutionUci.push(move.from + move.to + (move.promotion ? move.promotion : ""));
		} else {
			// If move is invalid, push empty string for debugging
			solutionUci.push("");
		}
		// Play opponent's move (Black) if exists
		if (puzzle.opponentMoves && puzzle.opponentMoves[i]) {
			const oppSanOrUci = puzzle.opponentMoves[i];
			const oppMove = applyMove(game, oppSanOrUci);
			if (oppMove) {
				opponentUci.push(oppMove.from + oppMove.to + (oppMove.promotion ? oppMove.promotion : ""));
			} else {
				opponentUci.push("");
			}
		}
	}
	return {
		...puzzle,
		solution: solutionUci,
		opponentMoves: opponentUci,
	};
}

/**
 * Apply a move string which may be SAN (e.g., "Qxh7+") or UCI (e.g., "c4f7" or "c4f7q").
 * Returns the Chess.Move object or null if invalid.
 */
function applyMove(game: Chess, moveStr: string) {
	if (!moveStr || typeof moveStr !== 'string') return null;
	const uciMatch = moveStr.match(/^([a-h][1-8])([a-h][1-8])([qrbn])?$/i);
	if (uciMatch) {
		const from = uciMatch[1].toLowerCase();
		const to = uciMatch[2].toLowerCase();
		const promotion = uciMatch[3] ? uciMatch[3].toLowerCase() : undefined;
		try {
				return game.move({ from, to, promotion });
		} catch (err) {
				console.warn(`Invalid UCI move '${moveStr}' on fen ${game.fen()}`);
				return null;
		}
	}
	// Otherwise treat as SAN (chess.js understands '+' and '#')
	try {
			const mv = game.move(moveStr);
			if (!mv) console.warn(`Invalid SAN move '${moveStr}' on fen ${game.fen()}`);
			return mv;
	} catch (err) {
			console.warn(`Error parsing move '${moveStr}': ${err}`);
			return null;
	}
}

export const level1Puzzles: Puzzle[] = level1Data.map(convertSanToUci);
export const level2Puzzles: Puzzle[] = level2Data.map(convertSanToUci);
export const level3Puzzles: Puzzle[] = level3Data.map(convertSanToUci);
export const level4Puzzles: Puzzle[] = level4Data.map(convertSanToUci);
