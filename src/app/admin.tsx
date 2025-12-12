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

type SortField = 'firstName' | 'lastName' | 'phone' | 'finalRating';
type SortDirection = 'asc' | 'desc';

export default function AdminDashboard() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [sortField, setSortField] = useState<SortField>('finalRating');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
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

  // Handle column header click for sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending (except finalRating defaults to descending)
      setSortField(field);
      setSortDirection(field === 'finalRating' ? 'desc' : 'asc');
    }
  };

  // Filter and sort results
  const filteredResults = results
    .filter(user => {
      const name = `${user.firstName} ${user.lastName}`.toLowerCase();
      return name.includes(filter.toLowerCase());
    })
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle string comparison (case-insensitive)
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Render sort indicator
  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-gray-400 ml-1">↕</span>;
    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

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
                  <th 
                    onClick={() => handleSort('firstName')}
                    className="px-6 py-3 border-b-2 border-gray-300 dark:border-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    First Name <SortIndicator field="firstName" />
                  </th>
                  <th 
                    onClick={() => handleSort('lastName')}
                    className="px-6 py-3 border-b-2 border-gray-300 dark:border-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Last Name <SortIndicator field="lastName" />
                  </th>
                  <th 
                    onClick={() => handleSort('phone')}
                    className="px-6 py-3 border-b-2 border-gray-300 dark:border-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Phone <SortIndicator field="phone" />
                  </th>
                  <th 
                    onClick={() => handleSort('finalRating')}
                    className="px-6 py-3 border-b-2 border-gray-300 dark:border-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Final Rating <SortIndicator field="finalRating" />
                  </th>
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
