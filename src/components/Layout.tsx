import { Link, useLocation, useNavigate } from "react-router-dom";
import { Plus, Home, User, Lock, LogIn, LogOut, Rabbit, BookOpen, MoreHorizontal, Bug, X, Send, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/components/AuthProvider";
import { FounderBadge } from "@/components/FounderBadge";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";

function BugReportModal({ onClose }: { onClose: () => void }) {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);

  const send = async () => {
    if (!message.trim()) return;
    setSending(true);
    await supabase.from("bug_reports").insert({ name: name.trim() || null, email: email.trim() || null, message: message.trim() });
    setSending(false);
    setSent(true);
    setTimeout(onClose, 1500);
  };

  return createPortal(
    <>
      <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="h-4 w-4 text-primary" />
            <h2 className="text-base font-bold">Report a Bug</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Name</label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email"
                placeholder="your@email.com"
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">What happened?</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
              placeholder="What were you doing? What did you expect? What actually happened?"
              className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
          </div>
          {sent ? (
            <p className="text-center text-sm font-semibold text-primary py-2">Report sent — thank you!</p>
          ) : (
            <button onClick={send} disabled={sending || !message.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40">
              <Send className="h-3.5 w-3.5" />
              {sending ? "Sending..." : "Send Bug Report"}
            </button>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}

const navItems = [
  { to: "/feed",      label: "Feed",      icon: Home   },
  { to: "/my-warren", label: "My Warren", icon: Rabbit },
  { to: "/new-case",  label: "New Case",  icon: Plus   },
  { to: "/profile",   label: "Profile",   icon: User   },
];

const comingSoon = ["Graph View", "Forking", "Collab", "Version Control", "Timeline"];

function MoreMenu({ user, onSignOut }: { user: any; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [bugOpen, setBugOpen] = useState(false);
  const navigate = useNavigate();

  const close = () => { setOpen(false); setConfirmSignOut(false); };

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(v => !v); setConfirmSignOut(false); }}
        className="flex flex-col items-center gap-0.5 px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors md:flex-row md:gap-1 md:rounded-md md:px-2 md:py-1.5"
      >
        <MoreHorizontal className="h-4 w-4" />
        <span className="md:hidden">More</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={close} />
          <div className="absolute right-0 top-full mt-1.5 z-50 w-48 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
            <Link
              to="/docs"
              onClick={close}
              className="flex items-center gap-2.5 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              Documentation
            </Link>
            <button
              onClick={() => { close(); setBugOpen(true); }}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Bug className="h-4 w-4" />
              Report a bug
            </button>

            <div className="border-t border-border" />

            {user ? (
              confirmSignOut ? (
                <div className="px-4 py-3 space-y-2">
                  <p className="text-xs text-muted-foreground">Sure you want to leave?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { onSignOut(); close(); }}
                      className="flex-1 rounded-lg bg-destructive/10 border border-destructive/20 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-colors"
                    >
                      Sign out
                    </button>
                    <button
                      onClick={() => setConfirmSignOut(false)}
                      className="flex-1 rounded-lg border border-border py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmSignOut(true)}
                  className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              )
            ) : (
              <button
                onClick={() => { navigate("/auth"); close(); }}
                className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </button>
            )}
          </div>
        </>
      )}

      {bugOpen && <BugReportModal onClose={() => setBugOpen(false)} />}
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate  = useNavigate();
  const { user, signOut, isDemo } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase.from("notifications").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("read", false)
      .then(({ count }) => setUnreadCount(count || 0));
  }, [user, location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-foreground">
            <img src="/logo.png" alt="Warren" className="h-7 w-7" />
            <span>Warren</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.filter(item => !(isDemo && item.to === "/new-case")).map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  location.pathname === item.to
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {user && (
              <Link to="/notifications" className="relative flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{unreadCount}</span>}
              </Link>
            )}
            {comingSoon.slice(0, 2).map((feat) => (
              <Tooltip key={feat}>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1 rounded-md bg-muted/50 px-2 py-1 text-xs text-muted-foreground/50 cursor-default">
                    <Lock className="h-3 w-3" />
                    {feat}
                  </span>
                </TooltipTrigger>
                <TooltipContent>Coming soon</TooltipContent>
              </Tooltip>
            ))}
            <MoreMenu user={user} onSignOut={handleSignOut} />
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="flex items-center justify-around border-t border-border py-1 md:hidden">
          {navItems.filter(item => !(isDemo && item.to === "/new-case")).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors",
                location.pathname === item.to ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          {user && (
            <Link to="/notifications" className="relative flex flex-col items-center gap-0.5 px-3 py-1 text-xs text-muted-foreground">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && <span className="absolute top-0 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{unreadCount}</span>}
            </Link>
          )}
          <MoreMenu user={user} onSignOut={handleSignOut} />
        </nav>
      </header>

      <main className="flex-1 pb-16 md:pb-0">{children}</main>
    </div>
  );
}
