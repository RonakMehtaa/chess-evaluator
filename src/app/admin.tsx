"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../supabaseClient";

// Fetch user results from Supabase
async function fetchUserResults() {
  // Fetch all users
  const { data: users, error: userError } = await supabase.from("users").select("*");
  if (userError || !users) return [];

  return users.map(user => {
    // Split name into first and last
    let firstName = "";
    let lastName = "";
    if (user.name) {
      const parts = user.name.split(" ");
      firstName = parts[0] || "";
      lastName = parts.slice(1).join(" ") || "";
    }

    return {
      id: user.id,
      firstName,
      lastName,
      phone: user.phone ?? "",
      finalRating: user.final_rating ?? 0, // Use final_rating column
    };
  });
}

export default function AdminDashboard() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
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

  // Filter results by name
  const filteredResults = results.filter(user => {
    const name = `${user.firstName} ${user.lastName}`.toLowerCase();
    return name.includes(filter.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">Admin Dashboard</h1>
          <div>
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.removeItem("isAdmin");
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
        <div className="mb-6 flex items-center gap-4">
          <input
            type="text"
            placeholder="Filter by name..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 w-full max-w-xs"
          />
        </div>
        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400">Loading user results...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b-2 border-gray-300 dark:border-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">First Name</th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 dark:border-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Last Name</th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 dark:border-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Phone</th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 dark:border-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Final Rating</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((user, index) => (
                  <tr key={user.id} className={index % 2 === 0 ? "bg-gray-50 dark:bg-gray-800" : "bg-white dark:bg-gray-900"}>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{user.firstName}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{user.lastName}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{user.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{user.finalRating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
