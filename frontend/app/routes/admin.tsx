import type { Route } from "./+types/home";
import { useEffect, useState } from "react";

export function loader() {
  return { name: "temp" };
}

type User = {
  user_id: number;
  username: string;
  created_at: string;
  role: string;
}

export default function Admin({ loaderData }: Route.ComponentProps) {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const token = window.localStorage.getItem("token");
    const userStr = window.localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    if (token && user && user.role === "admin") {
      setAuthorized(true);

      // call admin/listusers
      fetch(`http://127.0.0.1:5000/admin/listusers`)
        .then((r) => r.json())
        .then((data) => {
          console.log("Fetched users: ", data);
          setUsers(data);
        })
        .catch((err) => {
          console.error("Error fetching users: ", err);
        });
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

  const deleteUser = async (user_id: number) => {
    if (!window.confirm("Are you sure you want to delete this user?\nUser ID: " + user_id)) return;

    try {
      const res = await fetch(`http://127.0.0.1:5000/admin/deleteuser/${user_id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.user_id !== user_id));
      } else {
        console.error("Failed to delete user with ID: ", user_id);
        alert("Failed to delete user. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting user: ", error);
      alert("An error occurred while deleting the user. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-xl">Admin Dashboard</h1>
      <p>Welcome admin! You can view all users and delete them.</p>

      <div className="max-h-64 overflow-y-auto bg-gray-800 rounded p-4">
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <ul>
            {users.map((u) => (
              <li
                key={u.user_id}
                className="border-b border-gray-700 py-2"
              >
                <span className="font-semibold">{u.username}</span>{" "}
                ({u.role === '1' ? "Admin" : "User"}) <br />
                <span className="text-sm text-gray-400">
                  Created: {new Date(u.created_at).toLocaleString()}&#9;User ID: {u.user_id}
                </span>
                <button
                  className="ml-4 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                  onClick={() => deleteUser(u.user_id)}
                >Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}