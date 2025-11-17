"use client";

import { Answers } from "./QuestionScreen";
import { Puzzle } from "@/data/puzzles";

interface PuzzleResult {
  puzzleId: number;
  puzzleName: string;
  solved: boolean;
}

interface ResultScreenProps {
  answers: Answers;
  puzzleResults: PuzzleResult[];
  assignedLevel: number;
  onRestart: () => void;
}

export default function ResultScreen({
  answers,
  puzzleResults,
  assignedLevel,
  onRestart,
}: ResultScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="w-full max-w-3xl mx-auto px-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Evaluation Complete
          </h1>

          {/* Assigned Level */}
          <div className="bg-indigo-100 dark:bg-indigo-900 rounded-lg p-6 mb-8 text-center">
            <p className="text-lg text-indigo-800 dark:text-indigo-200 mb-2">
              Your Assigned Level
            </p>
            <p className="text-5xl font-bold text-indigo-600 dark:text-indigo-400">
              Level {assignedLevel}
            </p>
          </div>

          {/* Answers Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Your Answers
            </h2>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 space-y-4">
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Years playing chess:
                </span>{" "}
                <span className="text-gray-600 dark:text-gray-400">
                  {answers.yearsPlaying} {answers.yearsPlaying === 1 ? "year" : "years"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Knows how to move pieces:
                </span>{" "}
                <span className="text-gray-600 dark:text-gray-400">
                  {answers.knowsPieceMovement ? "Yes" : "No"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Played tournaments:
                </span>{" "}
                <span className="text-gray-600 dark:text-gray-400">
                  {answers.playedTournaments ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          {/* Puzzle Results Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Puzzle Results
            </h2>
            <div className="space-y-3">
              {puzzleResults.map((result) => (
                <div
                  key={result.puzzleId}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    result.solved
                      ? "bg-green-50 dark:bg-green-900/30"
                      : "bg-red-50 dark:bg-red-900/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-2xl ${
                        result.solved ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {result.solved ? "✓" : "✗"}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {result.puzzleName}
                    </span>
                  </div>
                  <span
                    className={`font-semibold ${
                      result.solved
                        ? "text-green-700 dark:text-green-400"
                        : "text-red-700 dark:text-red-400"
                    }`}
                  >
                    {result.solved ? "Solved" : "Failed"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Restart Button */}
          <div className="text-center">
            <button
              onClick={onRestart}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Start New Evaluation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

