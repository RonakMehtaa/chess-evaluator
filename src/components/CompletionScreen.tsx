"use client";

interface CompletionScreenProps {
  level: number;
  onRestart: () => void;
}

export default function CompletionScreen({ level, onRestart }: CompletionScreenProps) {
  const getLevelName = (level: number): string => {
    switch (level) {
      case 1:
        return "Beginner";
      case 2:
        return "Intermediate";
      case 3:
        return "Advanced";
      default:
        return "Level " + level;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="w-full max-w-2xl mx-auto px-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 text-center">
          <div className="text-6xl mb-6">🎉</div>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Evaluation Complete!
          </h1>
          
          <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-8 mb-8">
            <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg">
              You have successfully completed the Level {level} ({getLevelName(level)}) puzzles.
            </p>
            <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-2xl">
              Great job! 🌟
            </p>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Thank you for completing the evaluation.
          </p>
        </div>
      </div>
    </div>
  );
}
