import { Layout } from "@/components/Layout";
import { CaseCard } from "@/components/CaseCard";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { type CaseItem } from "@/types/case";
import { timeAgo, fetchCommentCounts } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus, UserCheck } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { FounderBadge } from "@/components/FounderBadge";

const UserProfile = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    if (username) fetchUser();
  }, [username]);

  const fetchUser = async () => {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .maybeSingle();

    if (!profileData) { setNotFound(true); setLoading(false); return; }
    setProfile(profileData);

    const [followCountRes, followStatusRes] = await Promise.all([
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", profileData.id),
      user ? supabase.from("follows").select("follower_id").eq("follower_id", user.id).eq("following_id", profileData.id).maybeSingle() : Promise.resolve({ data: null }),
    ]);
    setFollowerCount(followCountRes.count || 0);
    setFollowing(!!followStatusRes.data);

    const { data: casesData } = await supabase
      .from("cases")
      .select("*, author:profiles(username, avatar_url, is_founder), like_count:case_likes(count)")
      .eq("user_id", profileData.id)
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    const commentCounts = await fetchCommentCounts((casesData || []).map(item => item.id));

    const formatted: CaseItem[] = (casesData || []).map(item => ({
      ...item,
      content: item.fields || {},
      author: {
        id: item.user_id,
        username: item.author?.username || "Unknown",
        avatar: item.author?.avatar_url || `https://api.dicebear.com/9.x/thumbs/svg?seed=${item.user_id}`,
        is_founder: item.author?.is_founder || false,
      },
      likes: (item.like_count as any)?.[0]?.count || 0, saves: 0, liked: false, saved: false,
      comment_count: commentCounts[item.id] || 0,
      createdAt: timeAgo(item.created_at),
    }));

    setCases(formatted);
    setLoading(false);
  };

  const handleFollow = async () => {
    if (!user || !profile) return;
    const next = !following;
    setFollowing(next);
    setFollowerCount(c => next ? c + 1 : c - 1);
    if (next) {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: profile.id });
    } else {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", profile.id);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 rounded-full border-2 border-muted border-t-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  if (notFound) {
    return (
      <Layout>
        <div className="container flex flex-col items-center justify-center py-24 text-center">
          <h1 className="mb-2 text-xl font-bold">User not found</h1>
          <p className="mb-6 text-sm text-muted-foreground">@{username} doesn't exist</p>
          <Button variant="hero" asChild>
            <Link to="/feed">Back to Feed</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-3xl py-8">
        <Link
          to="/feed"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Search
        </Link>

        {/* Profile header */}
        <div className="mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <img
            src={profile.avatar_url || `https://api.dicebear.com/9.x/thumbs/svg?seed=${profile.id}`}
            alt={profile.username}
            className="h-20 w-20 rounded-full bg-muted ring-2 ring-primary/30 object-cover"
          />
          <div className="flex-1">
            <div className="flex flex-col gap-0.5 items-center sm:items-start">
              <div className="flex items-center gap-1.5">
                <h1 className="text-2xl font-bold">
                  {profile.display_name || profile.username}
                </h1>
                {profile.is_founder && <FounderBadge />}
              </div>
              {profile.display_name && (
                <span className="text-sm text-muted-foreground">@{profile.username}</span>
              )}
            </div>
            {profile.pronouns && (
              <p className="text-xs text-muted-foreground/50 mt-0.5 text-center sm:text-left">{profile.pronouns}</p>
            )}
            {profile.bio && (
              <p className="mt-1 text-sm text-muted-foreground max-w-md">{profile.bio}</p>
            )}
            <div className="mt-2 flex items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
              <span><strong className="text-foreground">{cases.length}</strong> cases</span>
              <span><strong className="text-foreground">{followerCount}</strong> followers</span>
            </div>
          </div>
          {user && user.id !== profile.id && (
            <Button
              variant={following ? "outline" : "hero"}
              size="sm"
              onClick={handleFollow}
              className="gap-1.5 shrink-0"
            >
              {following
                ? <><UserCheck className="h-3.5 w-3.5" /> Following</>
                : <><UserPlus className="h-3.5 w-3.5" /> Follow</>}
            </Button>
          )}
        </div>

        {/* Cases */}
        <div className="mb-6">
          <h2 className="mb-1 text-lg font-bold">Cases</h2>
          <p className="text-sm text-muted-foreground">Everything @{profile.username} has documented</p>
        </div>

        {cases.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {cases.map((c, i) => (
              <div key={c.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <CaseCard caseItem={c} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-muted-foreground">
            <p>No cases yet</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UserProfile;
