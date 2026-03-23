import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";

export function RatingModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const send = async () => {
    if (!rating || !user) return;
    setSending(true);
    await supabase.from("ratings").insert({ user_id: user.id, rating, feedback: feedback.trim() || null });
    setSending(false);
    setSent(true);
    setTimeout(onClose, 1800);
  };

  const labels = ["", "Not great", "It's okay", "Pretty good", "Really good", "Love it"];

  return createPortal(
    <>
      <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-bold">Rate Warren</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {sent ? (
          <p className="py-6 text-center text-sm font-semibold text-primary">Thanks for the feedback 🙏</p>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(n)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        n <= (hovered || rating)
                          ? "fill-primary text-primary"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground h-4">
                {labels[hovered || rating]}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                Anything else? (optional)
              </label>
              <textarea
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                rows={3}
                placeholder="What do you love? What's missing? What's broken?"
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            <button
              onClick={send}
              disabled={!rating || sending}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
            >
              {sending ? "Sending..." : "Submit"}
            </button>
          </div>
        )}
      </div>
    </>,
    document.body
  );
}
