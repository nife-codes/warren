import { Layout } from "@/components/Layout";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Search as SearchIcon } from "lucide-react";
import { Link } from "react-router-dom";

type UserResult = {
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  id: string;
};

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, display_name, bio, avatar_url")
        .or(`username.ilike.%${query.trim()}%,display_name.ilike.%${query.trim()}%`)
        .not("username", "is", null)
        .limit(20);

      setResults(data || []);
      setLoading(false);
      setSearched(true);
    }, 350);

    return () => clearTimeout(t);
  }, [query]);

  return (
    <Layout>
      <div className="container max-w-2xl py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Search</h1>
          <p className="text-sm text-muted-foreground">Find investigators on Warren</p>
        </div>

        {/* Search input */}
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <SearchIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by username or name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {loading && (
            <div className="h-4 w-4 shrink-0 rounded-full border-2 border-muted border-t-primary animate-spin" />
          )}
        </div>

        {/* Results */}
        <div className="space-y-2">
          {results.map((u) => (
            <Link
              key={u.id}
              to={`/user/${u.username}`}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-accent"
            >
              <img
                src={u.avatar_url || `https://api.dicebear.com/9.x/thumbs/svg?seed=${u.id}`}
                alt={u.username}
                className="h-11 w-11 rounded-full bg-muted object-cover ring-1 ring-border"
              />
              <div className="min-w-0">
                <p className="font-semibold truncate">
                  {u.display_name || u.username}
                </p>
                {u.display_name && (
                  <p className="text-xs text-muted-foreground">@{u.username}</p>
                )}
                {u.bio && (
                  <p className="mt-0.5 text-xs text-muted-foreground/70 truncate">{u.bio}</p>
                )}
              </div>
            </Link>
          ))}

          {searched && results.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              <p className="text-base font-medium">No users found</p>
              <p className="text-sm">Try a different name or username</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Search;
