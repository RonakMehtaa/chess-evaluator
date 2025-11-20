"use client";

interface LevelDisplayProps {
  level: number;
  onContinue: () => void;
  tini?: number;
}

export default function LevelDisplay({ level, onContinue, tini }: LevelDisplayProps) {
  // Rating range logic
  const getRatingRange = (tini?: number): string => {
    if (tini === undefined || tini === null) return "Unknown";
    if (tini < 200) return "Rating Range: 0-200";
    if (tini >= 200 && tini < 350) return "Rating Range: 200-350";
    if (tini >= 350 && tini < 500) return "Rating Range: 350-500";
    if (tini >= 500 && tini < 750) return "Rating Range: 500-750";
    return "Rating Range: 750+";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="w-full max-w-2xl mx-auto px-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 text-center">
          <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-6">
            Keep practicing!
          </h2>
          <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-6 mb-8">
            <p className="text-xl font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
              {getRatingRange(tini)}
            </p>
            <p className="text-gray-700 dark:text-gray-300 mt-2">
              To calculate your rating better, proceed with next level puzzles.
            </p>
          </div>
          <button
            onClick={onContinue}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-md hover:shadow-lg w-full md:w-auto"
          >
            Start Level Puzzles
          </button>
        </div>
      </div>
    </div>
  );
}
