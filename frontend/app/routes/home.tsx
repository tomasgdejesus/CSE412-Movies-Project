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
    const user = userStr ? JSON.parse(userStr) : null;
    setIsLoggedIn(!!token);
    setIsAdmin(!!user && user.role === "admin");
  }, []);

  return (
    <div className="text-center p-4">
      <h1 className="text-2xl">Welcome to the Movie Catalog!</h1>

      {!isLoggedIn && (
        <Link
          to="/login"
          className="hover:bg-gray-700 px-3 py-2 rounded-full"
        >
          Login
        </Link>
      )}
      {isLoggedIn && isAdmin && (
        <Link
          to="/admin"
          className="hover:bg-gray-700 px-3 py-2 rounded-full"
        >
          Admin Panel
        </Link>
      )}
    </div>
  );
}