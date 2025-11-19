"use client";

import { useState } from "react";

export interface Answers {
  yearsPlaying: number;
  knowsPieceMovement: boolean | null;
  playedTournaments: boolean | null;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

interface QuestionScreenProps {
  onComplete: (answers: Answers) => void;
}

export default function QuestionScreen({ onComplete }: QuestionScreenProps) {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [yearsPlaying, setYearsPlaying] = useState<number>(0);
  const [knowsPieceMovement, setKnowsPieceMovement] = useState<boolean | null>(null);
  const [playedTournaments, setPlayedTournaments] = useState<boolean | null>(null);

  const handleSubmit = () => {
    if (knowsPieceMovement === null || playedTournaments === null) {
      alert("Please answer all questions before continuing.");
      return;
    }
    onComplete({
      firstName,
      lastName,
      phone,
      yearsPlaying,
      knowsPieceMovement,
      playedTournaments,
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
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="First name"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Last name"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Phone number"
              />
            </div>

            {/* Question 1 */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                How many years have you been playing chess?
              </label>
              <input
                type="number"
                min="0"
                value={yearsPlaying}
                onChange={(e) => setYearsPlaying(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter number of years"
              />
            </div>

            {/* Question 2 */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Do you know how to move the pieces?
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setKnowsPieceMovement(true)}
                  className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                    knowsPieceMovement === true
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setKnowsPieceMovement(false)}
                  className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                    knowsPieceMovement === false
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Question 3 */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Have you played any tournaments?
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setPlayedTournaments(true)}
                  className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                    playedTournaments === true
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setPlayedTournaments(false)}
                  className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                    playedTournaments === false
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  No
                </button>
              </div>
            </div>

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

