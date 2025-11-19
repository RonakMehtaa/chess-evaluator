/**
 * PGN Converter Script
 * 
 * This is an example script showing how to use the pgnConverter utility
 * to convert your PGN puzzles to FEN format.
 * 
 * USAGE:
 * 1. Add your puzzle data to the appropriate array below (level1Puzzles, level2Puzzles, level3Puzzles)
 * 2. Run: npx ts-node scripts/convertPgnToJson.ts
 * 3. Check the generated JSON files in src/data/
 * 
 * Format: Each puzzle needs:
 *   - id: Unique number
 *   - name: Puzzle description
 *   - pgn: The PGN string (can be partial)
 *   - solution: Array of correct moves in UCI format (e.g., ["e2e4", "e7e5"])
 *   - opponentMoves: (Optional) Opponent's automatic responses in UCI format
 *   - difficulty: (Optional) Difficulty description
 */

// ============================================
// LEVEL 1 PUZZLES - Beginner (Mate in 1)
// ============================================
const level1Puzzles = [
  {
    id: 1,
    name: "Mate in 1 - Back Rank",
    pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 Na5 9. Bc2 c5 10. h3 O-O 11. Nbd2 cxd4 12. cxd4 Qc7 13. Nf1 Nc6 14. Ng3 exd4 15. Nxd4 Nxd4 16. Qxd4 Bg4 17. Bxg4 Nxg4 18. hxg4 Qd7 19. Be3 f5 20. gxf5",
    solution: ["f1e1"],
    opponentMoves: [],
    difficulty: "Very Easy",
  },
  {
    id: 2,
    name: "Mate in 1 - Knight Fork",
    pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be3 e5 7. Nb3 Be6 8. f3 Be7 9. Qd2 O-O 10. O-O-O Nbd7 11. g4 b5 12. g5 b4 13. Ne2 Ne8 14. f4 a5 15. f5 Bf6 16. gxf6 Nxf6",
    solution: ["e2g3"],
    opponentMoves: [],
    difficulty: "Very Easy",
  },
  {
    id: 3,
    name: "Mate in 1 - Queen Checkmate",
    pgn: "1. f3 e5 2. g4 Qh4#",
    solution: ["h4e1"],
    opponentMoves: [],
    difficulty: "Very Easy",
  },
];

// ============================================
// LEVEL 2 PUZZLES - Intermediate (Mate in 2)
// ============================================
const level2Puzzles = [
  {
    id: 101,
    name: "Mate in 2 - Queen and Rook",
    pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Bg5 e6 7. f4 Be7 8. Qf3 Nbd7 9. O-O-O b5 10. Bxf6 Nxf6 11. f5 Bb7 12. fxe6 Nxe6 13. Nxe6 fxe6 14. Qh5+ g6 15. Qh6",
    solution: ["h5h7", "g8f8"],
    opponentMoves: ["g6h7"],
    difficulty: "Easy",
  },
  {
    id: 102,
    name: "Mate in 2 - Rook on 7th",
    pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 Na5 9. Bc2 c5 10. h3 O-O 11. Nbd2 Qc7 12. Nf1 Nc6 13. Ng3 exd4 14. cxd4 Bg4 15. Be3 Rac8 16. d5 Ne5 17. Nxe5 dxe5",
    solution: ["e1e7", "f7e7"],
    opponentMoves: ["f8e7"],
    difficulty: "Easy",
  },
];

// ============================================
// LEVEL 3 PUZZLES - Advanced (Mate in 3+)
// ============================================
const level3Puzzles = [
  {
    id: 201,
    name: "Mate in 3 - Complex Combination",
    pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be3 e5 7. Nb3 Be6 8. f3 Be7 9. Qd2 O-O 10. O-O-O Nbd7 11. g4 b5 12. g5 b4 13. Ne2 a5 14. f4 a4 15. Nd4 exd4 16. Bxd4 Ne5 17. fxe5 dxe5 18. Be3 Qa5 19. Kb1 Nxe4 20. Qxe4",
    solution: ["e4g6", "f7f8", "g6g8"],
    opponentMoves: ["g8f8", "f8e8"],
    difficulty: "Medium",
  },
  {
    id: 202,
    name: "Mate in 3 - Back Rank Trap",
    pgn: "1. e4 c5 2. Nf3 e6 3. d4 cxd4 4. Nxd4 Nc6 5. Nc3 Qc7 6. Be3 a6 7. f4 Be7 8. Qf3 Nf6 9. O-O-O O-O 10. Kb1 b5 11. a3 Bb7 12. Qg3 Rac8 13. Rhe1 Rc6 14. Rg1 Rfc8 15. Nf5 exf5 16. exf5 Re8 17. Rxe7",
    solution: ["e7e8", "f8e8", "d1e1"],
    opponentMoves: ["c7e8", "e8d8"],
    difficulty: "Hard",
  },
];
