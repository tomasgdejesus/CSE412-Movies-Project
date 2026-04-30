import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// types for the API responses
type ContentRow = { release_year: number; type: string; count: number };
type ActorRow = { first_name: string; last_name: string; genre: string; total: number };
type CountryRow = { country_name: string; genre: string; total: number };

// pivot the content data into a more chart-friendly format
function pivotContent(rows: ContentRow[]) {
  const map: Record<number, { year: number; Movie: number; "TV Show": number }> = {};
  for (const r of rows) {
    if (!map[r.release_year]) map[r.release_year] = { year: r.release_year, Movie: 0, "TV Show": 0 };
    if (r.type === "Movie") map[r.release_year].Movie = r.count;
    if (r.type === "TV Show") map[r.release_year]["TV Show"] = r.count;
  }
  return Object.values(map).sort((a, b) => a.year - b.year);
}

// api fetcher with error handling
async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

// styling
function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 flex flex-col gap-1">
      <span className="text-xs uppercase tracking-widest text-gray-400">{label}</span>
      <span className="text-3xl font-bold text-white font-mono">{value}</span>
    </div>
  );
}

// styling stuff
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-200 tracking-wide border-b border-gray-700 pb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

// main component
export default function Dashboard() {
  const [content, setContent] = useState<ReturnType<typeof pivotContent>>([]);
  const [actors, setActors] = useState<ActorRow[]>([]);
  const [countries, setCountries] = useState<CountryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const BASE = "http://127.0.0.1:5000";
    Promise.all([
      fetchJSON<ContentRow[]>(`${BASE}/api/content-last-decade`),
      fetchJSON<ActorRow[]>(`${BASE}/api/actors-top-genres`),
    ])
      .then(([c, a]) => {
        setContent(pivotContent(c));
        setActors(a);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-400">
        Loading data…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-red-400">
        Failed to load: {error}
      </div>
    );
  }

  // useful stats for the stat cards
  const totalTitles = content.reduce((s, r) => s + r.Movie + r["TV Show"], 0);
  const totalMovies = content.reduce((s, r) => s + r.Movie, 0);
  const totalShows = content.reduce((s, r) => s + r["TV Show"], 0);
  const topActor = actors[0]
    ? `${actors[0].first_name} ${actors[0].last_name}`
    : "—";
  const topCountry = countries[0]?.country_name ?? "—";

  // top actors
  const actorChartData = actors.slice(0, 10).map((r) => ({
    name: `${r.first_name} ${r.last_name}`,
    genre: r.genre,
    total: r.total,
  }));

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-8 flex flex-col gap-10 max-w-6xl mx-auto">

      {/* title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Netflix Catalog: Analytics</h1>
        <p className="text-gray-400 mt-1 text-sm">Last decade of content · Top actors · Top producing countries</p>
      </div>

      {/* simple statistics using the stats above */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Titles (Last 10 yrs)" value={totalTitles} />
        <StatCard label="Movies" value={totalMovies} />
        <StatCard label="TV Shows" value={totalShows} />
        <StatCard label="Most Prolific Actor" value={topActor} />
        <StatCard label="Top Producing Country" value={topCountry} />
      </div>

      {/* this is the content by year */}
      <Section title="Content Added — Last Decade (by type)">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={content} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="year" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: 8 }}
                labelStyle={{ color: "#F9FAFB" }}
              />
              <Legend wrapperStyle={{ color: "#D1D5DB", fontSize: 13 }} />
              <Bar dataKey="Movie" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="TV Show" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>

      {/* top actors in the top country by genre */}
      <Section title="Top 10 Actors by Genre Appearances">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              layout="vertical"
              data={actorChartData}
              margin={{ top: 4, right: 24, left: 120, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#D1D5DB", fontSize: 12 }} width={115} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: 8 }}
                labelStyle={{ color: "#F9FAFB" }}
                formatter={(val, _, props) => [`${val} titles`, props.payload.genre]}
              />
              <Bar dataKey="total" fill="#A855F7" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* the full table also renders below the chart */}
        <div className="overflow-x-auto rounded-xl border border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-gray-400 uppercase text-xs tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">#</th>
                <th className="text-left px-4 py-3">Actor</th>
                <th className="text-left px-4 py-3">Top Genre</th>
                <th className="text-right px-4 py-3">Titles</th>
              </tr>
            </thead>
            <tbody>
              {actors.map((r, i) => (
                <tr
                  key={i}
                  className={`border-t border-gray-700 ${i % 2 === 0 ? "bg-gray-900" : "bg-gray-850"} hover:bg-gray-700 transition-colors`}
                >
                  <td className="px-4 py-2 text-gray-500">{i + 1}</td>
                  <td className="px-4 py-2 font-medium">{r.first_name} {r.last_name}</td>
                  <td className="px-4 py-2 text-gray-400">{r.genre}</td>
                  <td className="px-4 py-2 text-right font-mono text-purple-400">{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

    </div>
  );
}
