import { Layout } from "@/components/Layout";
import { CaseCard } from "@/components/CaseCard";
import { type CaseItem } from "@/types/case";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Bookmark } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { cn, timeAgo, fetchCommentCounts } from "@/lib/utils";

type Tab = "my-cases" | "saved";

const MyWarren = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("my-cases");
  const [myCases, setMyCases] = useState<CaseItem[]>([]);
  const [savedCases, setSavedCases] = useState<CaseItem[]>([]);
  const [loadingMy, setLoadingMy] = useState(true);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [savedFetched, setSavedFetched] = useState(false);

  useEffect(() => {
    if (user) fetchMyCases();
  }, [user]);

  useEffect(() => {
    if (user && tab === "saved" && !savedFetched) fetchSaved();
  }, [tab, user]);

  const fetchMyCases = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('cases')
      .select(`*, author:profiles(username, avatar_url, is_founder), like_count:case_likes(count)`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    const commentCounts = await fetchCommentCounts((data || []).map(item => item.id));
    setMyCases(format(data || [], false, commentCounts));
    setLoadingMy(false);
  };

  const fetchSaved = async () => {
    if (!user) return;
    setLoadingSaved(true);
    const { data } = await supabase
      .from('case_saves')
      .select(`case_id, cases(*, author:profiles(username, avatar_url, is_founder), like_count:case_likes(count))`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    const cases = (data || []).map((row: any) => row.cases).filter(Boolean);
    const commentCounts = await fetchCommentCounts(cases.map((c: any) => c.id));
    setSavedCases(format(cases, true, commentCounts));
    setLoadingSaved(false);
    setSavedFetched(true);
  };

  const format = (data: any[], isSaved: boolean, commentCounts: Record<string, number> = {}): CaseItem[] =>
    data.map(item => ({
      ...item,
      content: item.fields || {},
      author: {
        id: item.user_id,
        username: item.author?.username || 'Unknown',
        avatar: item.author?.avatar_url || `https://api.dicebear.com/9.x/thumbs/svg?seed=${item.user_id}`,
        is_founder: item.author?.is_founder || false,
      },
      likes: (item.like_count as any)?.[0]?.count || 0, saves: 0, liked: false, saved: isSaved,
      comment_count: commentCounts[item.id] || 0,
      createdAt: timeAgo(item.created_at),
    }));

  const activeList  = tab === "my-cases" ? myCases : savedCases;
  const activeLoading = tab === "my-cases" ? loadingMy : loadingSaved;

  return (
    <Layout>
      <div className="container max-w-4xl py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Warren</h1>
            <p className="text-sm text-muted-foreground">Your personal case library</p>
          </div>
          <Button variant="hero" size="sm" asChild>
            <Link to="/new-case">
              <Plus className="h-4 w-4" />
              New Case
            </Link>
          </Button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 border-b border-border">
          {([
            { id: "my-cases", label: "My Cases",                  count: myCases.length  },
            { id: "saved",    label: "Saved", icon: Bookmark,     count: savedCases.length },
          ] as { id: Tab; label: string; icon?: any; count: number }[]).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px",
                tab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}>
              {t.icon && <t.icon className="h-3.5 w-3.5" />}
              {t.label}
              {t.count > 0 && (
                <span className="rounded-full bg-muted px-1.5 py-px text-[10px] font-bold text-muted-foreground">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : activeList.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {activeList.map((c, i) => (
              <div key={c.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <CaseCard caseItem={c} />
              </div>
            ))}
          </div>
        ) : tab === "my-cases" ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <img src="/logo.png" alt="Warren" className="mb-4 h-16 w-16 opacity-40" />
            <h2 className="mb-2 text-xl font-bold">Your warren is empty</h2>
            <p className="mb-6 text-sm text-muted-foreground">Start documenting your first case</p>
            <Button variant="hero" asChild>
              <Link to="/new-case">Create your first case</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Bookmark className="mb-4 h-10 w-10 text-muted-foreground/20" />
            <h2 className="mb-2 text-xl font-bold">Nothing saved yet</h2>
            <p className="mb-6 text-sm text-muted-foreground">Bookmark cases from the feed to find them here</p>
            <Button variant="outline" asChild>
              <Link to="/feed">Browse the feed</Link>
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyWarren;
