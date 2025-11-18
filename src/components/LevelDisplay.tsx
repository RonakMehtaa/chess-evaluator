"use client";

interface LevelDisplayProps {
  level: number;
  onContinue: () => void;
}

export default function LevelDisplay({ level, onContinue }: LevelDisplayProps) {
  const getLevelDescription = (level: number): { title: string; description: string; emoji: string } => {
    switch (level) {
      case 1:
        return {
          title: "Beginner",
          description: "You're starting your chess journey! Master basic tactics and checkmate patterns.",
          emoji: "🌱",
        };
      case 2:
        return {
          title: "Intermediate",
          description: "You have solid fundamentals! Time to work on intermediate tactics.",
          emoji: "📈",
        };
      case 3:
        return {
          title: "Advanced",
          description: "You're a skilled player! Challenge yourself with advanced puzzles.",
          emoji: "⭐",
        };
      default:
        return {
          title: "Unknown",
          description: "Keep practicing!",
          emoji: "🎯",
        };
    }
  };

  const { title, description, emoji } = getLevelDescription(level);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="w-full max-w-2xl mx-auto px-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 text-center">
          <div className="text-6xl mb-6">{emoji}</div>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Your Level: {level}
          </h1>
          
          <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-6">
            {title}
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            {description}
          </p>

          <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-6 mb-8">
            <p className="text-gray-700 dark:text-gray-300">
              Ready to practice puzzles tailored to your level?
            </p>
          </div>

          <button
            onClick={onContinue}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-md hover:shadow-lg w-full md:w-auto"
          >
            Start Level {level} Puzzles
          </button>
        </div>
      </div>
    </div>
  );
}
