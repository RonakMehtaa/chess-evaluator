"use client";

import { useState, useEffect, useMemo } from "react";
import { Chessboard } from "react-chessboard";
import type { PieceDropHandlerArgs, SquareHandlerArgs } from "react-chessboard";
import { Chess } from "chess.js";
import type { Square } from "chess.js";
import { Puzzle } from "@/data/puzzles";
// Piece images (SVGs in public/pieces/)
const pieceImgs = {
  w: {
    q: "/pieces/wQ.svg",
    r: "/pieces/wR.svg",
    b: "/pieces/wB.svg",
    n: "/pieces/wN.svg",
  },
  b: {
    q: "/pieces/bQ.svg",
    r: "/pieces/bR.svg",
    b: "/pieces/bB.svg",
    n: "/pieces/bN.svg",
  },
};

interface PuzzleBoardProps {
  puzzle: Puzzle;
  puzzleNumber: number;
  totalPuzzles: number;
  onSolve: (solved: boolean) => void;
  currentRating?: number;
}

export default function PuzzleBoard({
  puzzle,
  puzzleNumber,
  totalPuzzles,
  onSolve,
  currentRating,
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
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  // Promotion overlay state
  const [promotionDetails, setPromotionDetails] = useState<null | { from: string; to: string; color: 'w' | 'b' }>(null);

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
      setSelectedSquare(null);
      setLegalMoves([]);
    } catch (e) {
      console.error("Failed to create new game with FEN:", puzzle.fen, e);
      const fallback = new Chess();
      const fallbackFen = fallback.fen();
      console.log("Using fallback, FEN:", fallbackFen);
      setGame(fallback);
      setBoardPosition(fallbackFen);
      setSelectedSquare(null);
      setLegalMoves([]);
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

  const makeMove = (from: string, to: string, promotion?: string) => {
    if (isComplete || isOpponentMoving) return false;

    // Check for pawn promotion
    const piece = game.get(from as Square);
    if (
      piece?.type === "p" &&
      ((piece.color === "w" && to[1] === "8") || (piece.color === "b" && to[1] === "1")) &&
      !promotion
    ) {
      setPromotionDetails({ from, to, color: piece.color });
      return false;
    }

    try {
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({
        from: from.toLowerCase(),
        to: to.toLowerCase(),
        promotion: promotion || "q",
      });

      if (move) {
        // Move is legal, now check if it matches solution
        const moveUCI = promotion ? `${from}${to}${promotion}`.toLowerCase() : `${from}${to}`.toLowerCase();
        const expectedMove = puzzle.solution[moveHistory.length]?.toLowerCase();

        // For promotion, expectedMove may include promotion piece
        const match = expectedMove && (moveUCI === expectedMove || `${from}${to}` === expectedMove);

        if (match) {
          const newFen = gameCopy.fen();
          setGame(gameCopy);
          setBoardPosition(newFen);
          const newMoveHistory = [...moveHistory, moveUCI];
          setMoveHistory(newMoveHistory);

          if (newMoveHistory.length === puzzle.solution.length) {
            setFeedback("correct");
            setIsComplete(true);
            setTimeout(() => {
              onSolve(true);
            }, 1500);
          } else {
            setFeedback("correct");
            playOpponentMove(newFen, moveHistory.length);
          }
          return true;
        } else {
          setFeedback("incorrect");
          setIsComplete(true);
          setTimeout(() => {
            onSolve(false);
          }, 1500);
          return false;
        }
      }
    } catch (e) {
      console.error("Illegal move:", e);
      return false;
    }
    return false;
  };

  const onDrop = ({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
    if (!targetSquare) return false;
    // If promotion overlay is active, block moves
    if (promotionDetails) return false;
    return makeMove(sourceSquare, targetSquare);
  };

  /**
   * Handle square click for click-to-move functionality
   */
  const handleSquareClick = ({ square }: SquareHandlerArgs) => {
    if (isComplete || isOpponentMoving) return;
    if (promotionDetails) return;

    const squareTyped = square as Square;

    if (!selectedSquare) {
      const piece = game.get(squareTyped);
      if (piece) {
        setSelectedSquare(square);
        const moves = game.moves({ square: squareTyped, verbose: true });
        setLegalMoves(moves.map((m) => m.to));
      }
      return;
    }

    if (selectedSquare === square) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    if (legalMoves.includes(square)) {
      const success = makeMove(selectedSquare, square);
      if (success) {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    } else {
      const piece = game.get(squareTyped);
      if (piece) {
        setSelectedSquare(square);
        const moves = game.moves({ square: squareTyped, verbose: true });
        setLegalMoves(moves.map((m) => m.to));
      } else {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    }
  };

  // Use boardPosition state for rendering
  // Helper to get overlay position near promotion square
  const getPromotionOverlayStyle = () => {
    if (!promotionDetails) return { top: "50%", left: "50%" };
    // Board is always 8x8, 600px max width
    const boardPx = Math.min(600, typeof window !== "undefined" ? window.innerWidth - 100 : 600);
    const squarePx = boardPx / 8;
    const file = promotionDetails.to[0].charCodeAt(0) - "a".charCodeAt(0);
    const rank = 8 - parseInt(promotionDetails.to[1]);
    const left = file * squarePx + squarePx / 2;
    const top = rank * squarePx + squarePx / 2;
    return { top: `${top}px`, left: `${left}px`, width: "auto" };
  };

  // Promotion piece selection handler
  const handlePromotionSelect = (piece: "q" | "r" | "b" | "n") => {
    if (!promotionDetails) return;
    makeMove(promotionDetails.from, promotionDetails.to, piece);
    setPromotionDetails(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="w-full max-w-4xl mx-auto px-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
          {/* Current Rating Display */}
          {typeof currentRating === "number" && (
            <div className="mb-4 text-center">
              <span className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
                Current Rating: {currentRating}
              </span>
            </div>
          )}

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
            <p className="text-gray-600 dark:text-gray-400">
              {puzzle.puzzle_desc || "Find the best move sequence to checkmate your opponent"}
            </p>
          </div>

          {/* Chessboard */}
          <div className="flex justify-center mb-6" style={{ position: "relative" }}>
            <div
              className={`transition-all duration-300 ${
                feedback === "correct"
                  ? "ring-4 ring-green-500 rounded-lg"
                  : feedback === "incorrect"
                  ? "ring-4 ring-red-500 rounded-lg"
                  : ""
              }`}
            >
              <div style={{ width: Math.min(600, typeof window !== "undefined" ? window.innerWidth - 100 : 600), position: "relative" }}>
                <Chessboard
                  key={`board-${puzzle.id}-${boardPosition}`}
                  options={{
                    position: boardPosition,
                    onPieceDrop: onDrop,
                    onSquareClick: handleSquareClick,
                    allowDragging: !isComplete && !isOpponentMoving,
                    squareStyles: {
                      [selectedSquare || ""]: {
                        backgroundColor: selectedSquare ? "rgba(186, 202, 68, 0.8)" : undefined,
                      },
                      ...legalMoves.reduce(
                        (acc, square) => ({
                          ...acc,
                          [square]: {
                            backgroundColor: "rgba(186, 202, 68, 0.4)",
                          },
                        }),
                        {} as Record<string, object>
                      ),
                    },
                  }}
                />
                {/* Promotion overlay */}
                {promotionDetails && (
                  <div
                    className="absolute z-30 flex flex-row gap-2 p-2 bg-white dark:bg-gray-900 rounded shadow-lg border border-gray-300 dark:border-gray-700"
                    style={{ ...getPromotionOverlayStyle(), transform: "translate(-50%, -50%)" }}
                  >
                    {(["q", "r", "b", "n"] as const).map((piece) => (
                      <button
                        key={piece}
                        onClick={() => handlePromotionSelect(piece)}
                        className="focus:outline-none hover:ring-2 hover:ring-indigo-400 rounded"
                      >
                        <img
                          src={pieceImgs[promotionDetails.color as 'w' | 'b'][piece as 'q' | 'r' | 'b' | 'n']}
                          alt={piece}
                          className="w-12 h-12"
                        />
                      </button>
                    ))}
                  </div>
                )}
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
