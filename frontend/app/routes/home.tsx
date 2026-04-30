import type { Route } from "./+types/home";
import { Link } from "react-router";
import { useEffect, useState } from "react";

export function loader() {
  return { name: "temp" };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem("token");
    const userStr = window.localStorage.getItem("user");
    if (!token || !userStr) return;
    const user = JSON.parse(userStr);
    setIsLoggedIn(true);
    setIsAdmin(user.role === "admin");
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Netflix Catalog</h1>
        <p className="text-gray-400">Explore the dataset</p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link to="/dashboard" className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl px-6 py-4 text-center transition-colors">
          Analytics Dashboard with Visualization
        </Link>

        {isLoggedIn && isAdmin && (
          <Link to="/admin" className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl px-6 py-4 text-center transition-colors">
            Admin Panel
          </Link>
        )}

        {!isLoggedIn && (
          <Link to="/login" className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl px-6 py-4 text-center transition-colors">
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
}