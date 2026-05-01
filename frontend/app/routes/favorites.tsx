import { useEffect, useState } from "react";
import { Link } from "react-router";

type Media = {
  show_id: number;
  title: string;
  type: string;
  release_year: number;
  rating: string;
  description: string;
};

export default function Favorites() {
    //make consts for favorites
  const [favorites, setFavorites] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");

    setToken(t);
    if (!t) {
      setLoading(false);
      return;
    }
    fetch("http://127.0.0.1:5000/favorites", {
      headers: { Authorization: `Bearer ${t}` },
    }) //goes to get in backend
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setFavorites(data);
        setLoading(false);
      });
  }, []);

  //unfavorite function

  const unfavorite = async (show_id: number) => {
    if (!token) return;
    await fetch(`http://127.0.0.1:5000/favorites/${show_id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setFavorites((prev) => prev.filter((m) => m.show_id !== show_id));
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      Loading...
    </div>
  );

  if (!token) return (
    //if not logged in
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      Please sign in to view favorites!
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">My Favorites</h1>
      {favorites.length === 0 ? (
        <p className="text-gray-400">You haven't favorited anything yet!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((m) => (
            <div key={m.show_id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold text-lg">{m.title}</h2>
                  <p className="text-gray-400 text-sm">{m.type} · {m.release_year} · {m.rating}</p>
                  <Link to={`/movie/${m.show_id}`} className="text-blue-500 hover:underline">
                  View Details
                  </Link>
                </div>
                <button
                  onClick={() => unfavorite(m.show_id)}
                  className="text-2xl ml-2"
                  title="Unfavorite"
                >
                  ❤️
                </button>
              </div>
              <p className="text-gray-300 text-sm line-clamp-3">{m.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}