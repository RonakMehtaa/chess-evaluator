"use client";
import { useEffect, useState } from "react";

export default function AdminButton() {
  // Always render the button on the server, hide only after client mount
  const [hide, setHide] = useState(false);

  useEffect(() => {
    // Only run on client
    const check = () => {
      setHide(localStorage.getItem("isAdmin") === "true");
    };
    check();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "isAdmin" || e.key === "adminLastChange") {
        check();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (hide) return null;

  return (
    <a
      href="/admin-login"
      className="px-4 py-2 rounded-lg shadow bg-indigo-500 text-white hover:bg-indigo-600 transition dark:bg-gray-700 dark:hover:bg-gray-600"
    >
      Admin
    </a>
  );
}
