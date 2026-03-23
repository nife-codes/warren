import { Layout } from "@/components/Layout";
import { CaseCard } from "@/components/CaseCard";
import { Lock, Pencil, Camera, Check, X, Loader2, Settings } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useEffect, useState, useRef } from "react";
import { type CaseItem } from "@/types/case";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { cn, timeAgo, fetchCommentCounts } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FounderBadge } from "@/components/FounderBadge";
import { FollowListModal } from "@/components/FollowListModal";
import { AvatarCropModal } from "@/components/AvatarCropModal";

const Profile = () => {
  const { user, loading: authLoading, isFounder, isDemo } = useAuth();
  const { toast } = useToast();
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followModal, setFollowModal] = useState<"followers" | "following" | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // Edit form state
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "taken" | "available">("idle");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const USERNAME_LIMIT = 2;
  const USERNAME_PERIOD_DAYS = 30;

  const getUsernameChangesLeft = () => {
    if (!profile?.username_last_changed) return USERNAME_LIMIT;
    const daysSince = (Date.now() - new Date(profile.username_last_changed).getTime()) / 86400000;
    if (daysSince >= USERNAME_PERIOD_DAYS) return USERNAME_LIMIT;
    return Math.max(0, USERNAME_LIMIT - (profile.username_change_count || 0));
  };

  const getDaysUntilReset = () => {
    if (!profile?.username_last_changed) return 0;
    const daysSince = (Date.now() - new Date(profile.username_last_changed).getTime()) / 86400000;
    return Math.ceil(USERNAME_PERIOD_DAYS - daysSince);
  };

  useEffect(() => {
    if (user) { fetchProfile(); fetchMyCases(); }
  }, [user]);

  // Username availability check
  useEffect(() => {
    if (!editOpen) return;
    if (username.trim() === profile?.username) { setUsernameStatus("available"); return; }
    if (username.trim().length < 2) { setUsernameStatus("idle"); return; }
    setUsernameStatus("checking");
    const t = setTimeout(async () => {
      const { data } = await supabase.from("profiles").select("id").eq("username", username.trim()).maybeSingle();
      setUsernameStatus(data ? "taken" : "available");
    }, 500);
    return () => clearTimeout(t);
  }, [username, editOpen]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    setProfile(data);
    const [{ count: followers }, { count: following }] = await Promise.all([
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", user.id),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", user.id),
    ]);
    setFollowerCount(followers || 0);
    setFollowingCount(following || 0);
  };

  const fetchMyCases = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("cases")
      .select("*, author:profiles(username, avatar_url, is_founder), like_count:case_likes(count)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const commentCounts = await fetchCommentCounts((data || []).map(item => item.id));

    const formattedCases: CaseItem[] = (data || []).map(item => ({
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

    setCases(formattedCases);
    setLoading(false);
  };

  const openEdit = () => {
    setDisplayName(profile?.display_name || "");
    setUsername(profile?.username || "");
    setBio(profile?.bio || "");
    setPronouns(profile?.pronouns || "");
    setAvatarFile(null);
    setAvatarPreview(null);
    setUsernameStatus("available");
    setEditOpen(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropSrc(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleCropConfirm = (blob: Blob) => {
    const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(blob));
    setCropSrc(null);
  };

  const handleSave = async () => {
    if (!user || usernameStatus !== "available") return;

    const isChangingUsername = username.trim().toLowerCase() !== profile?.username;
    if (isChangingUsername && getUsernameChangesLeft() === 0) {
      toast({ variant: "destructive", title: "Username limit reached", description: `You can change your username again in ${getDaysUntilReset()} day${getDaysUntilReset() !== 1 ? "s" : ""}.` });
      return;
    }

    setSaving(true);
    let avatar_url = profile?.avatar_url;

    if (avatarFile) {
      const ext = avatarFile.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, avatarFile, { upsert: true });

      if (uploadError) {
        toast({ variant: "destructive", title: "Avatar upload failed", description: uploadError.message });
        setSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      avatar_url = `${urlData.publicUrl}?t=${Date.now()}`;
    }

    const daysSince = profile?.username_last_changed
      ? (Date.now() - new Date(profile.username_last_changed).getTime()) / 86400000
      : null;
    const resetCount = daysSince !== null && daysSince >= USERNAME_PERIOD_DAYS;

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      username: username.trim().toLowerCase(),
      display_name: displayName.trim() || null,
      bio: bio.trim() || null,
      pronouns: pronouns.trim() || null,
      avatar_url,
      ...(isChangingUsername ? {
        username_last_changed: new Date().toISOString(),
        username_change_count: resetCount ? 1 : (profile?.username_change_count || 0) + 1,
      } : {}),
    }, { onConflict: "id" });

    if (error) {
      toast({ variant: "destructive", title: "Failed to save", description: error.message });
      setSaving(false);
      return;
    }

    await fetchProfile();
    setEditOpen(false);
    setSaving(false);
    toast({ title: "Profile updated!" });
  };

  if (!user && !authLoading) {
    return (
      <Layout>
        <div className="container flex flex-col items-center justify-center py-20 text-center">
          <h1 className="mb-4 text-2xl font-bold">Sign in to view your profile</h1>
          <Button asChild><Link to="/auth">Sign In</Link></Button>
        </div>
      </Layout>
    );
  }

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 rounded-full border-2 border-muted border-t-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  const avatarSrc = profile?.avatar_url || `https://api.dicebear.com/9.x/thumbs/svg?seed=${user.id}`;

  return (
    <Layout>
      <div className="container max-w-3xl py-8">

        {/* Profile header */}
        <div className="mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <img
            src={avatarSrc}
            alt={profile?.username}
            className="h-20 w-20 rounded-full bg-muted ring-2 ring-primary/30 object-cover"
          />
          <div className="flex-1 flex flex-col items-center sm:items-start w-full">
            <div className="flex flex-col gap-0.5 items-center sm:items-start">
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                {isFounder && <span className="h-7 w-7 opacity-0 shrink-0" />}
                <h1 className="text-2xl font-bold">{profile?.display_name || profile?.username || user.email?.split("@")[0]}</h1>
                {isFounder && <FounderBadge />}
              </div>
              {profile?.display_name && (
                <span className="text-sm text-muted-foreground">@{profile?.username}</span>
              )}
            </div>
            {profile?.pronouns && (
              <p className="text-xs text-muted-foreground/50 mt-0.5 text-center sm:text-left">{profile.pronouns}</p>
            )}
            {profile?.bio && (
              <p className="mt-1 text-sm text-muted-foreground max-w-md text-center sm:text-left">{profile.bio}</p>
            )}
            <div className="mt-2 flex items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
              <span><strong className="text-foreground">{cases.length}</strong> cases</span>
              <button onClick={() => setFollowModal("followers")} className="hover:text-foreground transition-colors"><strong className="text-foreground">{followerCount}</strong> followers</button>
              <button onClick={() => setFollowModal("following")} className="hover:text-foreground transition-colors"><strong className="text-foreground">{followingCount}</strong> following</button>
            </div>
          </div>
          {!isDemo && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={openEdit}>
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Link to="/settings">
                <Button variant="ghost" size="sm" className="px-2">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Cases */}
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

        {/* Coming soon */}
        <div className="mt-10 rounded-lg border border-border bg-card p-6">
          <h3 className="mb-3 text-sm font-bold text-muted-foreground flex items-center gap-2">
            <Lock className="h-3.5 w-3.5" />
            Coming Soon
          </h3>
          <div className="flex flex-wrap gap-2">
            {["Follower management", "Case statistics"].map((f) => (
              <span key={f} className="rounded-md border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground/50">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Edit profile dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">

            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <img
                  src={avatarPreview || avatarSrc}
                  alt="Avatar"
                  className="h-20 w-20 rounded-full bg-muted object-cover ring-2 ring-primary/30"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <p className="text-xs text-muted-foreground">Click the camera to change your photo</p>
            </div>

            {/* Display name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Display Name</label>
              <Input
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            {/* Username */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Username</label>
                {(() => {
                  const left = getUsernameChangesLeft();
                  return (
                    <span className={cn("text-[10px] font-semibold", left === 0 ? "text-red-400" : "text-muted-foreground/50")}>
                      {left === 0
                        ? `Locked for ${getDaysUntilReset()}d`
                        : `${left}/${USERNAME_LIMIT} changes left this month`}
                    </span>
                  );
                })()}
              </div>
              <div className="relative">
                <Input
                  placeholder="username"
                  value={username}
                  disabled={getUsernameChangesLeft() === 0}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  className={cn(
                    "pr-10",
                    usernameStatus === "taken" && "border-red-500 focus-visible:ring-red-500",
                    usernameStatus === "available" && username !== profile?.username && "border-green-500 focus-visible:ring-green-500",
                    getUsernameChangesLeft() === 0 && "opacity-50 cursor-not-allowed",
                  )}
                />
                {usernameStatus === "checking" && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 rounded-full border-2 border-muted border-t-primary animate-spin" />
                  </div>
                )}
                {usernameStatus === "available" && username !== profile?.username && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {usernameStatus === "taken" && (
                  <X className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {usernameStatus === "taken" && <p className="text-xs text-red-500">Username is already taken</p>}
            </div>

            {/* Pronouns */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pronouns</label>
              <div className="flex flex-wrap gap-1.5">
                {["he/him", "she/her", "they/them", "she/they", "he/they", "any/all", "prefer not to say"].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPronouns(pronouns === p ? "" : p)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                      pronouns === p
                        ? "bg-primary/15 border-primary/40 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Bio</label>
              <textarea
                placeholder="Tell the community about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={160}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
              <p className="text-xs text-muted-foreground/40 text-right">{bio.length}/160</p>
            </div>

            <Button
              className="w-full gap-2"
              onClick={handleSave}
              disabled={saving || usernameStatus === "taken" || usernameStatus === "checking"}
            >
              {saving ? <><div className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" /> Saving...</> : "Save changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {followModal && user && (
        <FollowListModal userId={user.id} type={followModal} onClose={() => setFollowModal(null)} />
      )}
      {cropSrc && (
        <AvatarCropModal src={cropSrc} onConfirm={handleCropConfirm} onClose={() => setCropSrc(null)} />
      )}
    </Layout>
  );
};

export default Profile;
