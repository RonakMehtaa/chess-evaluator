export interface Puzzle {
  id: number;
  name: string;
  difficulty: string;
  fen: string;
  solution: string[]; // Array of moves in UCI format - only student's moves
  opponentMoves?: string[]; // Array of opponent's responses after each student move
}

export const puzzles: Puzzle[] = [
  {
    id: 1,
    name: "Very Easy Mate in 1",
    difficulty: "Very Easy",
    fen: "kr6/3Q4/K7/8/8/8/8/8 w - - 0 1",
    solution: ["d7a7"], // Qa7# - Queen to a7, checkmate
    opponentMoves: [], // No opponent moves for mate in 1
  },
  {
    id: 2,
    name: "Medium Mate in 1",
    difficulty: "Medium",
    fen: "3R4/8/8/8/8/1K6/8/k7 w - - 0 1",
    solution: ["d8d1"], // Rd1# - Rook to d1, checkmate
    opponentMoves: [], // No opponent moves for mate in 1
  },
  {
    id: 3,
    name: "Very Easy Mate in 2",
    difficulty: "Very Easy",
    fen: "8/8/5B1k/Q7/8/8/4K3/8 w - - 0 1",
    solution: ["a5g5", "g5g7"], // Qg5, Kh7, Qg7#
    opponentMoves: ["h6h7"], // Kh7 - King moves to h7
  },
  {
    id: 4,
    name: "Medium Mate in 2",
    difficulty: "Medium",
    fen: "3r3k/1p3Qp1/p6p/2p5/8/3B4/1q4PP/5R1K w - - 0 1",
    solution: ["f7f8", "f1f8"], // Qf8+, Rxf8, Rxf8#
    opponentMoves: ["d8f8"], // Rxf8 - Rook takes on f8
  },
  {
    id: 5,
    name: "Easy Mate in 3",
    difficulty: "Easy",
    fen: "r1b2krQ/1pq1bp2/p3pp2/n3P3/2p2P2/7R/1PP4P/R6K w - - 0 1",
    solution: ["h8g8", "h3g8", "g8h8"], // Qg8+, Kxg8, Rg8+, Kf8, Rh8#
    opponentMoves: ["f8g8", "g8f8"], // Kxg8, then Kf8
  },
  {
    id: 6,
    name: "Easy Mate in 4",
    difficulty: "Easy",
    fen: "2Qqk1rr/1p2b1p1/7p/8/2B2P2/8/P1P3KP/4R3 w k - 0 1",
    solution: ["e1e7", "c8e6", "e6f7"], // Re7+, Kxe7, Qe6+, Kf8, Qf7#
    opponentMoves: ["e8e7", "e7f8"], // Kxe7, then Kf8
  },
];
