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

          {/* Minimal completion: show rating and a non-interactive 'Evaluation Complete' button */}
          <div className="mb-8 text-center">
            <div className="mt-2">
              <p className="text-xl font-semibold">🏆 You finished all the puzzles!</p>
              <p className="text-xl">🌟 Great job, champ!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

