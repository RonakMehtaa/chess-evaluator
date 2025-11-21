"use client";

interface PuzzleResult {
  puzzleId: number;
  puzzleName: string;
  solved: boolean;
}

interface LevelDisplayProps {
  level: number;
  onContinue: () => void;
  tini?: number;
  results?: PuzzleResult[];
}

export default function LevelDisplay({ level, onContinue, tini, results }: LevelDisplayProps) {
  // Rating range logic
  const getRatingRange = (tini?: number): string => {
    if (tini === undefined || tini === null) return "Unknown";
    if (tini < 200) return "Rating Range: 0-200";
    if (tini >= 200 && tini < 350) return "Rating Range: 200-350";
    if (tini >= 350 && tini < 500) return "Rating Range: 350-500";
    if (tini >= 500 && tini < 650) return "Rating Range: 500-650";
    return "Rating Range: 650+";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="w-full max-w-2xl mx-auto px-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 text-center">
          <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-6">
            Great job! Your calculation test is complete.
          </h2>
          {/* Initial evaluation results (if any) */}
          {results && results.length > 0 && (
            <div className="mb-4">
              <h3 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-2">Your Initial Puzzle Results</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 text-left max-h-36 overflow-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left">
                      <th className="py-1">Puzzle</th>
                      <th className="py-1">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r: PuzzleResult) => (
                      <tr key={r.puzzleId} className="border-t border-gray-200 dark:border-gray-600">
                        <td className="py-1">{r.puzzleName}</td>
                        <td className="py-1">{r.solved ? <span className="text-green-600">✓ Solved</span> : <span className="text-red-600">✗ Incorrect</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-6 mb-8">
            <p className="text-xl font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
              {getRatingRange(tini)}
            </p>
            <p className="text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-line">
              This was a short test to estimate your strength.
              <br />
              To calculate your exact rating, please continue with the Final Test
            </p>
          </div>
          <button
            onClick={onContinue}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-md hover:shadow-lg w-full md:w-auto"
          >
            Start Final Test →
          </button>
        </div>
      </div>
    </div>
  );
}
