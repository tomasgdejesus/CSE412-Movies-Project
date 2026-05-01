import { useParams } from "react-router";
import { useEffect, useState } from "react";

type MovieType = {
  show_id: number;
  title: string;
  type: string;
  release_year: number;
  rating: string;
  description: string;
  directors: string[];
  actors: string[];
  countries: string[];
  genres: string[];
};

export default function Movie() {
  const { id } = useParams();
  const [movie, setMovie] = useState<MovieType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    fetch(`http://127.0.0.1:5000/api/details/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setMovie(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <p>Loading...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <p>Movie not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>

      <p className="text-gray-400 mb-4">
        {movie.type} · {movie.release_year} · {movie.rating}
      </p>

      <p className="mb-6">{movie.description}</p>

      <div className="space-y-2 text-sm">
        <p>
          <span className="font-semibold">Directors:</span>{" "}
          {movie.directors.join(", ") || "N/A"}
        </p>

        <p>
          <span className="font-semibold">Actors:</span>{" "}
          {movie.actors.join(", ") || "N/A"}
        </p>

        <p>
          <span className="font-semibold">Countries:</span>{" "}
          {movie.countries.join(", ") || "N/A"}
        </p>

        <p>
          <span className="font-semibold">Genres:</span>{" "}
          {movie.genres.join(", ") || "N/A"}
        </p>
      </div>
    </div>
  );
}