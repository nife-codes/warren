import { Layout } from "@/components/Layout";
import { CaseCard } from "@/components/CaseCard";
import { type CaseType, type CaseItem } from "@/types/case";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { cn, timeAgo, fetchCommentCounts } from "@/lib/utils";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

const filters: { label: string; value: CaseType | "all" }[] = [
  { label: "All",               value: "all"             },
  { label: "True Crime",        value: "true-crime"      },
  { label: "Lore",              value: "lore"            },
  { label: "Conspiracy",        value: "conspiracy"      },
  { label: "Missing Persons",   value: "missing-persons" },
  { label: "Paranormal",        value: "paranormal"      },
  { label: "Historical",        value: "historical"      },
  { label: "Research",          value: "research"        },
  { label: "World Building",    value: "world-building"  },
];

type Tab = "cases" | "people";

type UserResult = {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
};

const Feed = () => {
  const [tab, setTab] = useState<Tab>("cases");
  const [activeFilter, setActiveFilter] = useState<CaseType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [cases, setCases] = useState<CaseItem[]>([]);
  const [casesLoading, setCasesLoading] = useState(true);

  const [people, setPeople] = useState<UserResult[]>([]);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [peopleSearched, setPeopleSearched] = useState(false);
  const [recentPeople, setRecentPeople] = useState<UserResult[]>(() => {
    try { return JSON.parse(localStorage.getItem("warren_recent_people") || "[]"); } catch { return []; }
  });

  const saveRecent = (u: UserResult) => {
    setRecentPeople(prev => {
      const next = [u, ...prev.filter(p => p.id !== u.id)].slice(0, 5);
      localStorage.setItem("warren_recent_people", JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    fetchCases();
  }, []);

  // People search — debounced
  useEffect(() => {
    if (tab !== "people") return;
    if (searchQuery.trim().length < 1) { setPeople([]); setPeopleSearched(false); return; }
    setPeopleLoading(true);
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, display_name, bio, avatar_url")
        .or(`username.ilike.%${searchQuery.trim()}%,display_name.ilike.%${searchQuery.trim()}%`)
        .not("username", "is", null)
        .limit(20);
      setPeople(data || []);
      setPeopleLoading(false);
      setPeopleSearched(true);
    }, 350);
    return () => clearTimeout(t);
  }, [searchQuery, tab]);

  const fetchCases = async () => {
    try {
      const { data, error } = await supabase
        .from("cases")
        .select("*, author:profiles(username, avatar_url, is_founder), like_count:case_likes(count)")
        .eq("is_public", true)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const caseIds = (data || []).map(item => item.id);
      const { data: { user } } = await supabase.auth.getUser();
      let savedIds  = new Set<string>();
      let likedIds  = new Set<string>();
      const [commentCounts] = await Promise.all([
        fetchCommentCounts(caseIds),
        (async () => {
          if (user) {
            const [savesRes, likesRes] = await Promise.all([
              supabase.from("case_saves").select("case_id").eq("user_id", user.id),
              supabase.from("case_likes").select("case_id").eq("user_id", user.id),
            ]);
            savedIds = new Set(savesRes.data?.map(s => s.case_id));
            likedIds = new Set(likesRes.data?.map(l => l.case_id));
          }
        })(),
      ]);

      const formattedCases: CaseItem[] = (data || []).map(item => ({
        ...item,
        content: item.fields || {},
        author: {
          id: item.user_id,
          username: item.author?.username || "Unknown",
          avatar: item.author?.avatar_url || `https://api.dicebear.com/9.x/thumbs/svg?seed=${item.user_id}`,
          is_founder: item.author?.is_founder || false,
        },
        likes: (item.like_count as any)?.[0]?.count || 0, saves: 0, liked: likedIds.has(item.id), saved: savedIds.has(item.id),
        comment_count: commentCounts[item.id] || 0,
        createdAt: timeAgo(item.created_at),
      }));
      setCases(formattedCases);
    } catch (error) {
      console.error("Error fetching cases:", error);
    } finally {
      setCasesLoading(false);
    }
  };

  const filteredCases = cases.filter((c) => {
    const matchType = activeFilter === "all" || c.type === activeFilter;
    const matchSearch = !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.tags.some(t => t.includes(searchQuery.toLowerCase()));
    return matchType && matchSearch;
  });

  return (
    <Layout>
      <div className="container max-w-3xl py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Feed</h1>
          <p className="text-sm text-muted-foreground">See what the community is documenting</p>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-1 border-b border-border">
          {(["cases", "people"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setSearchQuery(""); }}
              className={cn(
                "px-4 py-2 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px",
                tab === t
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            placeholder={tab === "cases" ? "Search cases..." : "Search people..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {peopleLoading && (
            <div className="h-4 w-4 shrink-0 rounded-full border-2 border-muted border-t-primary animate-spin" />
          )}
        </div>

        {/* Case filters — cases tab only */}
        {tab === "cases" && (
          <div className="mb-6 flex flex-wrap items-center gap-0.5">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-semibold transition-colors",
                  activeFilter === f.value
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Cases tab */}
        {tab === "cases" && (
          casesLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 rounded-full border-2 border-muted border-t-primary animate-spin" />
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredCases.map((c, i) => (
                <div key={c.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                  <CaseCard caseItem={c} />
                </div>
              ))}
              {filteredCases.length === 0 && (
                <div className="py-16 text-center text-muted-foreground">
                  <p className="text-lg">No cases found</p>
                  <p className="text-sm">Try a different search or filter</p>
                </div>
              )}
            </div>
          )
        )}

        {/* People tab */}
        {tab === "people" && (
          <div className="space-y-2">
            {people.map((u) => (
              <Link
                key={u.id}
                to={`/user/${u.username}`}
                onClick={() => saveRecent(u)}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-accent"
              >
                <img
                  src={u.avatar_url || `https://api.dicebear.com/9.x/thumbs/svg?seed=${u.id}`}
                  alt={u.username}
                  className="h-11 w-11 rounded-full bg-muted object-cover ring-1 ring-border"
                />
                <div className="min-w-0">
                  <p className="font-semibold truncate">{u.display_name || u.username}</p>
                  {u.display_name && <p className="text-xs text-muted-foreground">@{u.username}</p>}
                  {u.bio && <p className="mt-0.5 text-xs text-muted-foreground/70 truncate">{u.bio}</p>}
                </div>
              </Link>
            ))}
            {peopleSearched && people.length === 0 && (
              <div className="py-16 text-center text-muted-foreground">
                <p className="text-base font-medium">No users found</p>
                <p className="text-sm">Try a different name or username</p>
              </div>
            )}
            {!peopleSearched && recentPeople.length > 0 && (
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">Recent</p>
                {recentPeople.map((u) => (
                  <Link
                    key={u.id}
                    to={`/user/${u.username}`}
                    onClick={() => saveRecent(u)}
                    className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 mb-2 transition-colors hover:border-primary/30 hover:bg-accent"
                  >
                    <img
                      src={u.avatar_url || `https://api.dicebear.com/9.x/thumbs/svg?seed=${u.id}`}
                      alt={u.username}
                      className="h-11 w-11 rounded-full bg-muted object-cover ring-1 ring-border"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{u.display_name || u.username}</p>
                      {u.display_name && <p className="text-xs text-muted-foreground">@{u.username}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {!peopleSearched && recentPeople.length === 0 && (
              <div className="py-16 text-center text-muted-foreground">
                <p className="text-sm">Type a name or username to search</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Feed;
