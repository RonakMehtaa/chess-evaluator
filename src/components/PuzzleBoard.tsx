"use client";

import { useState, useEffect, useMemo } from "react";
import { Chessboard } from "react-chessboard";
import type { PieceDropHandlerArgs } from "react-chessboard";
import { Chess } from "chess.js";
import { Puzzle } from "@/data/puzzles";

interface PuzzleBoardProps {
  puzzle: Puzzle;
  puzzleNumber: number;
  totalPuzzles: number;
  onSolve: (solved: boolean) => void;
}

export default function PuzzleBoard({
  puzzle,
  puzzleNumber,
  totalPuzzles,
  onSolve,
}: PuzzleBoardProps) {
  // Initialize game with puzzle FEN
  const initialGame = useMemo(() => {
    console.log("Initializing game with FEN:", puzzle.fen);
    try {
      const game = new Chess(puzzle.fen);
      console.log("Game initialized successfully, FEN:", game.fen());
      return game;
    } catch (e) {
      console.error("Failed to initialize game with FEN:", puzzle.fen, e);
      return new Chess();
    }
  }, [puzzle.fen]);

  const [game, setGame] = useState(initialGame);
  const [boardPosition, setBoardPosition] = useState(puzzle.fen);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isOpponentMoving, setIsOpponentMoving] = useState(false);

  useEffect(() => {
    // Reset game when puzzle changes
    console.log("Puzzle changed, resetting game. New FEN:", puzzle.fen);
    try {
      const newGame = new Chess(puzzle.fen);
      const newFen = newGame.fen();
      console.log("New game created, FEN:", newFen);
      setGame(newGame);
      setBoardPosition(newFen); // Explicitly set board position
      setMoveHistory([]);
      setFeedback(null);
      setIsComplete(false);
      setIsOpponentMoving(false);
    } catch (e) {
      console.error("Failed to create new game with FEN:", puzzle.fen, e);
      const fallback = new Chess();
      const fallbackFen = fallback.fen();
      console.log("Using fallback, FEN:", fallbackFen);
      setGame(fallback);
      setBoardPosition(fallbackFen);
    }
  }, [puzzle.fen, puzzle.id]);

  // Function to automatically play opponent's move
  const playOpponentMove = (currentGameFen: string, moveIndex: number) => {
    const opponentMove = puzzle.opponentMoves?.[moveIndex];
    if (!opponentMove) {
      setIsOpponentMoving(false);
      return;
    }

    setIsOpponentMoving(true);
    
    // Wait a moment before playing opponent move for better UX
    setTimeout(() => {
      try {
        const gameCopy = new Chess(currentGameFen);
        const move = gameCopy.move({
          from: opponentMove.substring(0, 2),
          to: opponentMove.substring(2, 4),
          promotion: "q",
        });

        if (move) {
          const newFen = gameCopy.fen();
          setGame(gameCopy);
          setBoardPosition(newFen);
          setIsOpponentMoving(false);
          setFeedback(null); // Clear feedback after opponent move
          console.log("Opponent played:", opponentMove);
        } else {
          console.error("Failed to play opponent move:", opponentMove);
          setIsOpponentMoving(false);
        }
      } catch (e) {
        console.error("Error playing opponent move:", e);
        setIsOpponentMoving(false);
      }
    }, 800); // 800ms delay for visual feedback
  };

  const makeMove = (from: string, to: string) => {
    if (isComplete || isOpponentMoving) return false;

    // First, try to make the move legally
    try {
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({
        from: from.toLowerCase(),
        to: to.toLowerCase(),
        promotion: "q",
      });

      if (move) {
        // Move is legal, now check if it matches solution
        const moveUCI = `${from}${to}`.toLowerCase();
        const expectedMove = puzzle.solution[moveHistory.length]?.toLowerCase();
        
        console.log("Move made:", moveUCI, "Expected:", expectedMove, "Match:", moveUCI === expectedMove);
        
        // Check if move matches solution BEFORE updating state
        if (expectedMove && moveUCI === expectedMove) {
          // Correct move! Update game state
          const newFen = gameCopy.fen();
          setGame(gameCopy);
          setBoardPosition(newFen); // Update board position explicitly
          const newMoveHistory = [...moveHistory, moveUCI];
          setMoveHistory(newMoveHistory);

          // Check if puzzle is complete
          if (newMoveHistory.length === puzzle.solution.length) {
            setFeedback("correct");
            setIsComplete(true);
            setTimeout(() => {
              onSolve(true);
            }, 1500);
          } else {
            // More moves needed - play opponent's response
            setFeedback("correct");
            // Play opponent move after student's correct move
            playOpponentMove(newFen, moveHistory.length);
          }
          return true;
        } else {
          // Wrong move - doesn't match solution
          // Don't update game state, just show feedback
          setFeedback("incorrect");
          setIsComplete(true);
          setTimeout(() => {
            onSolve(false);
          }, 1500);
          return false;
        }
      }
    } catch (e) {
      // Illegal move
      console.error("Illegal move:", e);
      return false;
    }

    return false;
  };

  const onDrop = ({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
    if (!targetSquare) return false;
    return makeMove(sourceSquare, targetSquare);
  };

  // Use boardPosition state for rendering
  console.log("Rendering with boardPosition:", boardPosition, "Expected:", puzzle.fen, "Game FEN:", game.fen());

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="w-full max-w-4xl mx-auto px-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
          {/* Progress Indicator */}
          <div className="mb-6 text-center">
            <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
              Puzzle {puzzleNumber} of {totalPuzzles}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(puzzleNumber / totalPuzzles) * 100}%` }}
              />
            </div>
          </div>

          {/* Puzzle Info */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {puzzle.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Find the best move sequence to checkmate your opponent
            </p>
            {/* Debug: Show current FEN and expected FEN */}
            <div className="text-xs text-gray-400 mt-2 space-y-1">
              <p>Expected FEN: {puzzle.fen}</p>
              <p>Board Position: {boardPosition}</p>
              <p>Game FEN: {game.fen()}</p>
              <p>Match: {boardPosition === puzzle.fen ? "✓" : "✗"}</p>
            </div>
          </div>

          {/* Chessboard */}
          <div className="flex justify-center mb-6">
            <div
              className={`transition-all duration-300 ${
                feedback === "correct"
                  ? "ring-4 ring-green-500 rounded-lg"
                  : feedback === "incorrect"
                  ? "ring-4 ring-red-500 rounded-lg"
                  : ""
              }`}
            >
              <div style={{ width: Math.min(600, typeof window !== "undefined" ? window.innerWidth - 100 : 600) }}>
                <Chessboard
                  key={`board-${puzzle.id}-${boardPosition}`}
                options={{
                  position: boardPosition,
                  onPieceDrop: onDrop,
                  allowDragging: !isComplete && !isOpponentMoving,
                }}
                />
              </div>
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`text-center py-4 rounded-lg mb-4 transition-all duration-300 ${
                feedback === "correct"
                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                  : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
              }`}
            >
              <p className="text-lg font-semibold">
                {feedback === "correct" ? "✓ Correct! Well done!" : "✗ Incorrect"}
              </p>
            </div>
          )}

          {/* Opponent moving indicator */}
          {isOpponentMoving && (
            <div className="text-center py-4 rounded-lg mb-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              <p className="text-lg font-semibold">Opponent is thinking...</p>
            </div>
          )}

          {/* Move History */}
          {moveHistory.length > 0 && (
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Moves played: {moveHistory.join(", ")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
