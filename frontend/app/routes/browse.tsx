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

export default function Browse() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);

    fetch("http://127.0.0.1:5000/api/media")
      .then((r) => r.json())
      .then((data) => {
        setMedia(data);
        setLoading(false);
      });

    if (!t) return;
    fetch("http://127.0.0.1:5000/favorites", {
      headers: { Authorization: `Bearer ${t}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFavorites(new Set(data.map((f: Media) => f.show_id)));
        }
      });
  }, []);

  const toggleFavorite = async (show_id: number) => {
    if (!token) return;
    const isFav = favorites.has(show_id);
    const method = isFav ? "DELETE" : "POST";
    await fetch(`http://127.0.0.1:5000/favorites/${show_id}`, {
      method,
      headers: { Authorization: `Bearer ${token}` },
    });
    setFavorites((prev) => {
      const next = new Set(prev);
      isFav ? next.delete(show_id) : next.add(show_id);
      return next;
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      Loading...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Top 100 Titles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {media.map((m) => (
          <div key={m.show_id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold text-lg">{m.title}</h2>
                <p className="text-gray-400 text-sm">{m.type} · {m.release_year} · {m.rating}</p>
                <Link to={`/movie/${m.show_id}`} className="text-blue-500 hover:underline">
                  View Details
                </Link>
              </div>
              {token && (
                <button
                  onClick={() => toggleFavorite(m.show_id)}
                  className="text-2xl ml-2"
                  title={favorites.has(m.show_id) ? "Unfavorite" : "Favorite"}
                >
                  {favorites.has(m.show_id) ? "❤️" : "🤍"}
                </button>
              )}
            </div>
            <p className="text-gray-300 text-sm line-clamp-3">{m.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}