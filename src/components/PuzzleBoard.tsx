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

// Use a weakly-typed alias to avoid rendering TypeScript comments in JSX and to allow
// passing non-standard props like `boardWidth` and `orientation` without compile errors.
const ChessboardAny: any = Chessboard;

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
  // Local state for rating animation
  const [ratingPulse, setRatingPulse] = useState(false);
  const prevRatingRef = useMemo(() => ({ current: currentRating ?? 0 }), []);
  // AudioContext ref
  const audioCtxRef = useMemo(() => ({ ctx: null as AudioContext | null }), []);
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

  // Initialize AudioContext lazily
  useEffect(() => {
    return () => {
      if (audioCtxRef.ctx) {
        try {
          audioCtxRef.ctx.close();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Play simple tones using WebAudio
  const playTone = (freq: number, duration = 0.12, type: OscillatorType = 'sine') => {
    try {
      if (!audioCtxRef.ctx) audioCtxRef.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.ctx;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      o.stop(ctx.currentTime + duration + 0.02);
    } catch (e) {
      // ignore if audio API not available
      console.error('Audio play failed', e);
    }
  };

  // Sound for correct: two ascending tones; incorrect: low buzz
  const playCorrectSound = () => {
    playTone(880, 0.08, 'sine');
    setTimeout(() => playTone(1320, 0.12, 'sine'), 90);
  };
  const playIncorrectSound = () => {
    playTone(220, 0.18, 'sine');
  };

  // Watch for rating changes to trigger pulse & sound
  useEffect(() => {
    const prev = prevRatingRef.current ?? 0;
    const curr = currentRating ?? 0;
    if (curr > prev) {
      setRatingPulse(true);
      playCorrectSound();
      const t = setTimeout(() => setRatingPulse(false), 700);
      // update prev
      prevRatingRef.current = curr;
      return () => clearTimeout(t);
    }
    // update prev even if not greater
    prevRatingRef.current = curr;
  }, [currentRating]);

  // Play incorrect sound on feedback change to incorrect
  useEffect(() => {
    if (feedback === 'incorrect') {
      playIncorrectSound();
    }
    if (feedback === 'correct') {
      // small confirmation tone (already handled by rating change)
    }
  }, [feedback]);

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
            // Trigger rating pulse when solved
            setRatingPulse(true);
            setTimeout(() => setRatingPulse(false), 600);
            setTimeout(() => {
              onSolve(true);
            }, 1500);
          } else {
            // Don't show "correct" feedback for intermediate moves
            setFeedback(null);
            playOpponentMove(newFen, moveHistory.length);
            // small pulse for correct intermediate move
            setRatingPulse(true);
            setTimeout(() => setRatingPulse(false), 400);
          }
          return true;
        } else {
          setFeedback("incorrect");
          setIsComplete(true);
          // pulse and incorrect sound
          setRatingPulse(true);
          setTimeout(() => setRatingPulse(false), 600);
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
    // For narrow viewports just center the overlay above the board for better tap targets
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      return { top: "50%", left: "50%" };
    }
    // Board is always 8x8; use the reactive boardWidth to compute square size
    const boardPx = boardWidth || 480;
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

  // Determine board orientation: flip if it's black to move
  const boardOrientation = (game && typeof game.turn === 'function' && game.turn() === 'b') ? 'black' : 'white';

  // Dynamically compute board width to avoid overflowing the page on small screens
  const [boardWidth, setBoardWidth] = useState<number>(480);

  useEffect(() => {
    const compute = () => {
      if (typeof window === 'undefined') return;
      const ww = window.innerWidth;
      // On small screens leave some margin (32px each side), on larger screens allow room for side columns
      const horizontalPadding = ww < 768 ? 64 : 240;
      const maxBoard = 480;
      const calculated = Math.min(maxBoard, Math.max(240, ww - horizontalPadding));
      setBoardWidth(calculated);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  return (
    <div className="w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
    <div className="w-full px-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center min-h-[calc(100vh-120px)]">
          {/* Left column: Rating panel */}
          <div className="md:col-span-3 col-span-1 flex items-center justify-center">
            <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow p-4 md:p-6 w-full max-w-xs transition-transform duration-300 ${ratingPulse ? 'scale-105 animate-pulse' : ''}`}>
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-300 mb-1">Current Points</div>
                <div className="text-4xl md:text-5xl font-extrabold text-indigo-600 dark:text-indigo-300">
                  {typeof currentRating === 'number' ? currentRating : 0}
                </div>
              </div>
            </div>
          </div>

          {/* Center column: main card with chessboard */}
          <div className="md:col-span-6 col-span-1 flex items-center justify-center">
            <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 max-w-3xl">
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
              <div className={`transition-all duration-300 ${
                feedback === "correct"
                  ? "ring-4 ring-green-500 rounded-lg"
                  : feedback === "incorrect"
                  ? "ring-4 ring-red-500 rounded-lg"
                  : ""
              }`}>
                <div className="mx-auto" style={{ width: `${boardWidth}px`, position: "relative" }}>
                  <ChessboardAny
                    key={`board-${puzzle.id}-${boardPosition}`}
                    boardWidth={boardWidth}
                    options={{
                      position: boardPosition,
                      onPieceDrop: onDrop,
                      onSquareClick: handleSquareClick,
                      allowDragging: !isComplete && !isOpponentMoving,
                    }}
                    orientation={boardOrientation}
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

              {/* Feedback and opponent indicator moved to the right column to avoid shifting the board */}

              {/* Move history intentionally hidden per UX request */}
            </div>
          </div>

          {/* Right column: feedback */}
          <div className="md:col-span-3 col-span-1 flex items-start justify-center">
            <div className="w-full max-w-xs">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
