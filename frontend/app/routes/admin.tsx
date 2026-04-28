import type { Route } from "./+types/home";
import { useEffect, useState } from "react";

export function loader() {
  return { name: "temp" };
}

export default function Admin({ loaderData }: Route.ComponentProps) {
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const token = window.localStorage.getItem("token");
    const userStr = window.localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    if (token && user && user.role === "admin") {
      setAuthorized(true);
    } else {
      setAuthorized(false);
    }
  }, []);

  if (authorized === null) {
    return null;
  }

  // Not authorized
  if (!authorized) {
    return (
      <div className="p-4">
        <h1 className="text-xl">Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl">Admin Dashboard</h1>
    </div>
  );
}