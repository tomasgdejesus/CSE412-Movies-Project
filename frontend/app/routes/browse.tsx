import { useEffect, useState, useRef } from "react";
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
  const [query, setQuery] = useState("");
  const [committed, setCommitted] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (val.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const lower = val.toLowerCase();
    const matches = media
      .map((m) => m.title)
      .filter((title) => title.toLowerCase().includes(lower))
      .slice(0, 6);
    setSuggestions(matches);
    setShowSuggestions(matches.length > 0);
  };

  const handleSelect = (title: string) => {
    setQuery(title);
    setCommitted(title);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setCommitted(query);
      setShowSuggestions(false);
    }
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setCommitted("");
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const filteredMedia = committed.trim()
    ? media.filter((m) =>
        m.title.toLowerCase().includes(committed.toLowerCase()) ||
        m.type.toLowerCase().includes(committed.toLowerCase()) ||
        m.rating?.toLowerCase().includes(committed.toLowerCase())
      )
    : media;

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

      {/* Search bar */}
      <div className="relative mb-8 max-w-md">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search titles, type, rating... (Enter to search)"
          className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-400"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-3 text-gray-400 hover:text-white"
          >
            ✕
          </button>
        )}
        {showSuggestions && (
          <ul className="absolute z-10 w-full bg-gray-800 border border-gray-600 rounded-xl mt-1 overflow-hidden">
            {suggestions.map((s) => (
              <li
                key={s}
                onClick={() => handleSelect(s)}
                className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-sm"
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      {filteredMedia.length === 0 ? (
        <p className="text-gray-400">No results for "{committed}".</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMedia.map((m) => (
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
      )}
    </div>
  );
}