"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../supabaseClient";

// Fetch user results from Supabase
async function fetchUserResults() {
  // Fetch all users
  const { data: users, error: userError } = await supabase.from("users").select("*");
  if (userError || !users) return [];

  // Fetch all puzzle results
  const { data: puzzleResults, error: puzzleError } = await supabase.from("puzzle_results").select("*");
  if (puzzleError || !puzzleResults) return [];

  // Group puzzle results by user and compute per-level stats
  return users.map(user => {
    const userPuzzleResults = puzzleResults.filter(pr => pr.user_id === user.id);
    // Score: count of solved puzzles
    const score = userPuzzleResults.filter(pr => pr.result === true).length;
    // Level: highest puzzle_level attempted
    const level = userPuzzleResults.length > 0 ? `Level ${Math.max(...userPuzzleResults.map(pr => pr.puzzle_level ?? 0))}` : "N/A";
    // Answers: from user fields (customize as needed)
    const answers = [
      `Years Playing: ${user.years_playing ?? ""}`,
      `Knows Piece Movement: ${user.knows_piece_movement ? "Yes" : "No"}`,
      `Played Tournaments: ${user.played_tournaments ? "Yes" : "No"}`,
    ];

    // Compute per-level summary
    const levelsMap: Record<string, { correct: number; total: number }> = {};
    userPuzzleResults.forEach(pr => {
      const lvl = String(pr.puzzle_level ?? 0);
      if (!levelsMap[lvl]) levelsMap[lvl] = { correct: 0, total: 0 };
      levelsMap[lvl].total += 1;
      if (pr.result) levelsMap[lvl].correct += 1;
    });

    const puzzleSummary = Object.keys(levelsMap)
      .map(k => ({ level: Number(k), correct: levelsMap[k].correct, total: levelsMap[k].total }))
      .sort((a, b) => a.level - b.level);

    return {
      id: user.id,
      name: user.name ?? "Unknown",
      date: user.created_at ? new Date(user.created_at).toLocaleDateString() : "",
      level,
      score,
      answers,
      puzzleSummary,
    };
  });
}

export default function AdminDashboard() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simple auth check
    if (typeof window !== "undefined" && localStorage.getItem("isAdmin") !== "true") {
      router.push("/admin-login");
      return;
    }
    fetchUserResults().then(data => {
      setResults(data);
      setLoading(false);
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">Admin Dashboard</h1>
          <div>
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.removeItem("isAdmin");
                  // write a change key so other tabs/components detect change
                  localStorage.setItem("adminLastChange", String(Date.now()));
                }
                router.push("/");
              }}
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-800 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400">Loading user results...</div>
        ) : (
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
            {results.map(user => (
              <div key={user.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-lg text-indigo-600 dark:text-indigo-300">{user.name}</span>
                  <span className="text-sm text-gray-400">{user.date}</span>
                </div>
                <div className="mb-2">
                  <span className="font-medium">Level:</span> <span className="text-indigo-500 dark:text-indigo-200">{user.level}</span>
                </div>
                <div className="mb-2">
                  <span className="font-medium">Score:</span> <span className="text-green-600 dark:text-green-400">{user.score}/6</span>
                </div>
                <div className="mb-2">
                  <span className="font-medium">Answers:</span>
                  <ul className="list-disc ml-6 text-sm text-gray-700 dark:text-gray-300">
                    {user.answers.map((ans: string, i: number) => (
                      <li key={i}>{ans}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-medium">Puzzle Summary:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {user.puzzleSummary && user.puzzleSummary.length > 0 ? (
                      user.puzzleSummary.map((s: any, i: number) => (
                        <div key={i} className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-sm">
                          <span className="font-medium text-gray-700 dark:text-gray-200">{s.level === 0 ? 'Initial Eval' : `Level ${s.level}`}</span>
                          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{s.correct}/{s.total}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">No puzzle data</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
