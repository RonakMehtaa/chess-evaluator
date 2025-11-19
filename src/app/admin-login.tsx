"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (username === "admin" && password === "admin") {
      // Store simple auth flag in sessionStorage
      if (typeof window !== "undefined") {
        // persist admin flag so it survives reloads; also write a change key to trigger storage events
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("adminLastChange", String(Date.now()));
      }
      router.push("/admin");
    } else {
      setError("Invalid credentials");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-900 shadow-lg rounded-xl p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600 dark:text-indigo-300">Admin Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full px-4 py-2 rounded border dark:bg-gray-800 dark:text-white"
            autoFocus
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded border dark:bg-gray-800 dark:text-white"
          />
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="w-full py-2 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-600 transition dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
