import { Layout } from "@/components/Layout";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { timeAgo } from "@/lib/utils";
import { Heart, MessageCircle, UserPlus } from "lucide-react";

type Notif = {
  id: string;
  type: "follow" | "like" | "comment";
  read: boolean;
  created_at: string;
  actor: { username: string; avatar_url: string | null } | null;
  case: { title: string; id: string } | null;
};

const icons = {
  follow:  <UserPlus className="h-4 w-4 text-primary" />,
  like:    <Heart className="h-4 w-4 text-primary" />,
  comment: <MessageCircle className="h-4 w-4 text-primary" />,
};

const message = (n: Notif) => {
  const name = n.actor?.username || "Someone";
  if (n.type === "follow")  return <><strong>{name}</strong> started following you</>;
  if (n.type === "like")    return <><strong>{name}</strong> liked your case{n.case ? <> &mdash; <em>{n.case.title}</em></> : ""}</>;
  if (n.type === "comment") return <><strong>{name}</strong> commented on your case{n.case ? <> &mdash; <em>{n.case.title}</em></> : ""}</>;
  return null;
};

export default function Notifications() {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*, actor:profiles!actor_id(username, avatar_url), case:cases(id, title)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setNotifs((data as any) || []);
      setLoading(false);
      // mark all as read
      await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    })();
  }, [user]);

  return (
    <Layout>
      <div className="container max-w-xl py-8">
        <h1 className="mb-6 text-xl font-bold">Notifications</h1>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-7 w-7 rounded-full border-2 border-muted border-t-primary animate-spin" />
          </div>
        ) : notifs.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm">
            Nothing here yet
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
            {notifs.map(n => {
              const inner = (
                <div className={`flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-muted/30 ${!n.read ? "bg-primary/5" : "bg-card"}`}>
                  <img
                    src={n.actor?.avatar_url || `https://api.dicebear.com/9.x/thumbs/svg?seed=${n.id}`}
                    className="h-8 w-8 rounded-full bg-muted shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {icons[n.type]}
                      <p className="text-sm text-foreground/80 leading-snug">{message(n)}</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground/50">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.read && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />}
                </div>
              );

              if (n.type === "follow" && n.actor?.username) {
                return <Link key={n.id} to={`/user/${n.actor.username}`}>{inner}</Link>;
              }
              if (n.case?.id) {
                return <Link key={n.id} to={`/case/${n.case.id}`}>{inner}</Link>;
              }
              return <div key={n.id}>{inner}</div>;
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
