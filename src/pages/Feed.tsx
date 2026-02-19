import { Layout } from "@/components/Layout";
import { CaseCard } from "@/components/CaseCard";
import { mockCases, type CaseType, type CaseItem } from "@/data/mockData";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Search, Loader2 } from "lucide-react";

const filters: { label: string; value: CaseType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "True Crime", value: "true-crime" },
  { label: "Lore", value: "lore" },
  { label: "Conspiracy", value: "conspiracy" },
];

const Feed = () => {
  const [activeFilter, setActiveFilter] = useState<CaseType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          author:profiles(username, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match CaseItem interface
      const formattedCases: CaseItem[] = (data || []).map(item => ({
        ...item,
        author: {
          id: item.author_id,
          username: item.author?.username || 'Unknown',
          avatar: item.author?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + item.author_id,
        },
        likes: 0, // TODO: Fetch from relations
        saves: 0, // TODO: Fetch from relations
        liked: false,
        saved: false,
        createdAt: new Date(item.created_at).toLocaleDateString(),
      }));

      setCases(formattedCases);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = cases.filter((c) => {
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

        <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search cases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        <div className="mb-6 flex items-center gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                activeFilter === f.value
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((c, i) => (
              <div key={c.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <CaseCard caseItem={c} />
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="py-16 text-center text-muted-foreground">
                <p className="text-lg">No cases found 🐰</p>
                <p className="text-sm">Try a different search or filter</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Feed;
