"use client";

import { useState } from "react";

export interface Answers {
  // Older fields removed; keep only the data we collect now
  fullName?: string;
  phone?: string;
}

interface QuestionScreenProps {
  onComplete: (answers: Answers) => void;
}

export default function QuestionScreen({ onComplete }: QuestionScreenProps) {
  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  // yearsPlaying/knowsPieceMovement/playedTournaments removed per UX request

  const handleSubmit = () => {
    // Phone is required
    if (!phone) {
      alert("Please enter your phone number before continuing.");
      return;
    }
    onComplete({
      fullName,
      phone,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Tell Us About Yourself
          </h2>

          <div className="space-y-6">
            {/* Personal fields merged into questions page */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Full name"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9+()\-\s]/g, ''))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Phone number (required)"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Enter digits, spaces, +, -, or parentheses only.</p>
            </div>

            {/* Removed extra questions per UX request */}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors duration-200 shadow-md hover:shadow-lg mt-8"
            >
              Continue to Puzzles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

