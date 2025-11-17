"use client";

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-2xl mx-auto px-6 py-12 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Caissa Chess Evaluator
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
            Welcome! We'll evaluate your chess level through a quick assessment.
          </p>
          <p className="text-base text-gray-500 dark:text-gray-400 mb-8">
            You'll answer a few questions and solve some chess puzzles. The evaluation will help us determine your appropriate skill level.
          </p>
          <button
            onClick={onStart}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Begin Evaluation
          </button>
        </div>
      </div>
    </div>
  );
}

