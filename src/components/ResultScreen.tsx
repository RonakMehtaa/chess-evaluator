"use client";

import { Answers } from "./QuestionScreen";
import { Puzzle } from "@/data/puzzles";

interface ResultScreenProps {
  answers: Answers;
  totalScore: number;
  assignedLevel: number;
  onRestart: () => void;
}

export default function ResultScreen({
  answers,
  totalScore,
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

          {/* Rating Summary */}
          <div className="bg-indigo-100 dark:bg-indigo-900 rounded-lg p-6 mb-8 text-center">
            <p className="text-lg text-indigo-800 dark:text-indigo-200 mb-2">
              Your Rating
            </p>
            <p className="text-5xl font-bold text-indigo-600 dark:text-indigo-400">
              {totalScore}
            </p>
          </div>

          {/* Results Table */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Results Summary
            </h2>
            <table className="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <thead>
                <tr className="text-left border-b border-gray-300 dark:border-gray-600">
                  <th className="py-2 px-4">Name</th>
                  <th className="py-2 px-4">Phone</th>
                  <th className="py-2 px-4">Years Playing</th>
                  <th className="py-2 px-4">Knows Pieces</th>
                  <th className="py-2 px-4">Tournaments</th>
                  <th className="py-2 px-4">Score</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-4">
                    {answers.firstName} {answers.lastName}
                  </td>
                  <td className="py-2 px-4">{answers.phone || "-"}</td>
                  <td className="py-2 px-4">{answers.yearsPlaying}</td>
                  <td className="py-2 px-4">
                    {answers.knowsPieceMovement ? "Yes" : "No"}
                  </td>
                  <td className="py-2 px-4">
                    {answers.playedTournaments ? "Yes" : "No"}
                  </td>
                  <td className="py-2 px-4">{totalScore}</td>
                </tr>
              </tbody>
            </table>
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

