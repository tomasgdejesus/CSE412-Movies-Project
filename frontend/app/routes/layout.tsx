import type { Route } from "./+types/home";
import { Outlet, Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";

export function loader() {
  return { name: "temp" };
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  function checkAuth() {
    const token = window.localStorage.getItem("token");
    setIsLoggedIn(!!token);
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