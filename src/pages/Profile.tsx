import { Layout } from "@/components/Layout";
import { CaseCard } from "@/components/CaseCard";
import { Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { CaseItem } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchMyCases();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(data);
  };

  const fetchMyCases = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('cases')
      .select(`
        *,
        author:profiles(username, avatar_url)
      `)
      .eq('author_id', user.id)
      .order('created_at', { ascending: false });

    const formattedCases: CaseItem[] = (data || []).map(item => ({
      ...item,
      author: {
        id: item.author_id,
        username: item.author?.username || 'Unknown',
        avatar: item.author?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + item.author_id,
      },
      likes: 0,
      saves: 0,
      liked: false,
      saved: false,
      createdAt: new Date(item.created_at).toLocaleDateString(),
    }));

    setCases(formattedCases);
    setLoading(false);
  };

  if (!user && !authLoading) {
    return (
      <Layout>
        <div className="container flex flex-col items-center justify-center py-20 text-center">
          <h1 className="mb-4 text-2xl font-bold">Sign in to view your profile</h1>
          <Button asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }


  return (
    <Layout>
      <div className="container max-w-3xl py-8">
        <div className="mb-8 flex items-center gap-5">
          <img
            src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
            alt={profile?.username || user.email}
            className="h-20 w-20 rounded-full bg-muted ring-2 ring-primary/30"
          />
          <div>
            <h1 className="text-2xl font-bold">{profile?.username || user.email?.split('@')[0]}</h1>
            <p className="text-sm text-muted-foreground">Documenting the unknown</p>
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <span><strong className="text-foreground">{cases.length}</strong> cases</span>
              <span><strong className="text-foreground">0</strong> followers</span>
              <span><strong className="text-foreground">0</strong> following</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="mb-1 text-lg font-bold">Public Cases</h2>
          <p className="text-sm text-muted-foreground">Cases you've shared with the community</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {cases.map((c, i) => (
            <div key={c.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
              <CaseCard caseItem={c} />
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-lg border border-border bg-card p-6">
          <h3 className="mb-3 text-sm font-bold text-muted-foreground flex items-center gap-2">
            <Lock className="h-3.5 w-3.5" />
            Coming Soon
          </h3>
          <div className="flex flex-wrap gap-2">
            {["Edit profile", "Profile pic upload", "Follower management", "Case statistics"].map((f) => (
              <span key={f} className="rounded-md border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground/50">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
