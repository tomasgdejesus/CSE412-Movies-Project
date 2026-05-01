import type { Route } from "./+types/home";
import { Outlet, Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";

export function loader() {
  return { name: "temp" };
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);

  function checkAuth() {
    const token = window.localStorage.getItem("token");
    const userStr = window.localStorage.getItem("user");
    setIsLoggedIn(!!token);

    if (userStr)
      setUser(JSON.parse(userStr));
    else
      setUser(null);
  }

  useEffect(() => {
    checkAuth();

    window.addEventListener("authChange", checkAuth);

    return () => {
      window.removeEventListener("authChange", checkAuth);
    };
  }, []);

  function handleLogout() {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/login");
  }

  return (
    <div>
      <div className="fixed top-0 left-0 w-full z-50 bg-gray-800">
        <div className="mx-auto flex h-16 items-center justify-between px-4 text-white">
          
          <div className="flex items-center gap-4">
            <span className="font-semibold">Movie Project</span>
            <Link to="/" className="hover:bg-gray-700 px-3 py-2 rounded-full">
              Home
            </Link>
          </div>

          {isLoggedIn && user && (
            <span className="text-sm text-gray-300">
              Welcome, {user.username}
            </span>
          )}

          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="hover:bg-gray-700 px-3 py-2 rounded-full"
            >
              Logout
            </button>
          )}

        </div>
      </div>

      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}