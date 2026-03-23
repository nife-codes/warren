import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Person = { username: string; display_name: string | null; avatar_url: string | null };

export function FollowListModal({
  userId,
  type,
  onClose,
}: {
  userId: string;
  type: "followers" | "following";
  onClose: () => void;
}) {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (type === "followers") {
        const { data } = await supabase
          .from("follows")
          .select("follower_id")
          .eq("following_id", userId);
        const ids = (data || []).map((r: any) => r.follower_id);
        if (ids.length) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("username, display_name, avatar_url")
            .in("id", ids);
          setPeople(profiles || []);
        }
      } else {
        const { data } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", userId);
        const ids = (data || []).map((r: any) => r.following_id);
        if (ids.length) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("username, display_name, avatar_url")
            .in("id", ids);
          setPeople(profiles || []);
        }
      }
      setLoading(false);
    })();
  }, [userId, type]);

  return createPortal(
    <>
      <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-bold capitalize">{type}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-6 w-6 rounded-full border-2 border-muted border-t-primary animate-spin" />
            </div>
          ) : people.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Nobody here yet</p>
          ) : (
            people.map(p => (
              <Link
                key={p.username}
                to={`/user/${p.username}`}
                onClick={onClose}
                className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors"
              >
                <img
                  src={p.avatar_url || `https://api.dicebear.com/9.x/thumbs/svg?seed=${p.username}`}
                  className="h-8 w-8 rounded-full bg-muted"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{p.display_name || p.username}</p>
                  {p.display_name && <p className="text-xs text-muted-foreground">@{p.username}</p>}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
