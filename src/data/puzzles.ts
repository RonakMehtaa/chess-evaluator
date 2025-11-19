import initialEvalData from "./initialEvalPuzzles.json";

export interface Puzzle {
  id: number;
  name: string;
  difficulty: string;
  fen: string;
  solution: string[]; // Array of moves in UCI format - only student's moves
  opponentMoves?: string[]; // Array of opponent's responses after each student move
  points?: number | string;
  puzzle_desc?: string;
}

export const puzzles: Puzzle[] = initialEvalData;
