import { useState, useEffect, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { ArrowRight, Skull, Ghost, Eye, FilePlus, Search, Users, GitFork, Network, Clock, Shield, ArrowUpRight } from "lucide-react";

function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateY =  ((x - rect.width  / 2) / (rect.width  / 2)) * 18;
    const rotateX = -((y - rect.height / 2) / (rect.height / 2)) * 18;
    el.style.transition = "transform 0.08s ease-out";
    el.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05,1.05,1.05)`;
  };

  const onMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform 0.5s ease-out";
    el.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
  };

  return (
    <div ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} className={className}>
      {children}
    </div>
  );
}

const SEQUENCE = [
  { text: "organized.",        cancel: false },
  { text: "documented.",       cancel: false },
  { text: "uhm....",           cancel: true  },
  { text: "your problem now?", cancel: false },
  { text: "catalogued.",       cancel: false },
  { text: "idk mehn",          cancel: true  },
  { text: "obsessive beh",     cancel: true  },
  { text: "a lifestyle.",      cancel: false },
  { text: "mapped out.",       cancel: false },
  { text: "kind of—",          cancel: true  },
  { text: "never finished.",   cancel: false },
];

function useTypewriter() {
  const [seqIndex, setSeqIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase] = useState<"typing" | "paused" | "deleting">("typing");

  useEffect(() => {
    const item = SEQUENCE[seqIndex];

    if (phase === "typing") {
      if (displayed.length < item.text.length) {
        const t = setTimeout(
          () => setDisplayed(item.text.slice(0, displayed.length + 1)),
          130
        );
        return () => clearTimeout(t);
      } else {
        const pause = item.cancel ? 380 : 1800;
        const t = setTimeout(() => setPhase("deleting"), pause);
        return () => clearTimeout(t);
      }
    }

    if (phase === "deleting") {
      if (displayed.length > 0) {
        const speed = SEQUENCE[seqIndex].cancel ? 40 : 60;
        const t = setTimeout(() => setDisplayed((d) => d.slice(0, -1)), speed);
        return () => clearTimeout(t);
      } else {
        setSeqIndex((i) => (i + 1) % SEQUENCE.length);
        setPhase("typing");
      }
    }
  }, [displayed, phase, seqIndex]);

  return { displayed, phase };
}

const Landing = () => {
  const { user, loading } = useAuth();
  const { displayed, phase } = useTypewriter();

  if (!loading && user) {
    return <Navigate to="/feed" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">

      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 sm:px-10">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Warren" className="h-6 w-6" />
            <span className="text-sm font-bold tracking-tight">Warren</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
              <Link to="/auth">Log In</Link>
            </Button>
            <Button variant="hero" size="sm" asChild>
              <Link to="/auth">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="flex flex-col items-center justify-center px-6 py-28 text-center">
        <div className="animate-fade-in max-w-2xl">
          <img src="/logo.png" alt="Warren" className="mx-auto mb-8 h-16 w-16" />

          <h1 className="mb-5 text-5xl font-extrabold leading-[1.15] tracking-tight sm:text-7xl">
            Your rabbit hole,<br />
            <span className="inline-flex items-baseline gap-1 text-primary">
              {displayed}
              <span
                className={`ml-0.5 inline-block w-[3px] rounded-full bg-primary align-middle ${phase === "paused" ? "animate-pulse" : "opacity-100"}`}
                style={{ height: "0.85em", verticalAlign: "middle" }}
              />
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            Document true crime cases, conspiracies, and unsolved mysteries.
            For the curious, the obsessed, and the slightly unhinged.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button variant="hero" size="lg" asChild className="gap-2">
              <Link to="/auth">
                Start documenting
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/auth">Log In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── CASE TYPES ── */}
      <section className="border-t border-border px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">What you can document</p>
          <h2 className="mb-12 text-3xl font-extrabold tracking-tight sm:text-4xl">Three templates.<br />Infinite rabbit holes.</h2>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Skull,
                label: "True Crime",
                desc: "Document real cases with structured fields for victims, suspects, evidence, timelines, and current status. Built for serious investigators.",
                fields: ["Case Name", "Victim(s)", "Suspect(s)", "Evidence", "Current Status"],
              },
              {
                icon: Ghost,
                label: "Lore & Legends",
                desc: "Capture urban myths, folklore, and creepy unexplained phenomena. Rate the creep factor, track the origins, decide if it's real.",
                fields: ["Origin", "The Claim", "Why People Believe It", "Creep Factor", "Debunked?"],
              },
              {
                icon: Eye,
                label: "Conspiracies",
                desc: "Map out theories, identify who's behind them, lay out the evidence for and against, and find the holes. Stay skeptical.",
                fields: ["The Theory", "Who's Behind It", "Evidence For", "The Holes", "Status"],
              },
            ].map(({ icon: Icon, label, desc, fields }) => (
              <TiltCard key={label} className="flex flex-col rounded-xl border border-border bg-card p-8">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <p className="mb-3 text-lg font-bold">{label}</p>
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                <div className="mt-auto space-y-1.5">
                  {fields.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground/60">
                      <span className="h-px w-3 bg-border" />
                      {f}
                    </div>
                  ))}
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="border-t border-border px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">How it works</p>
          <h2 className="mb-12 text-3xl font-extrabold tracking-tight sm:text-4xl">Down the hole in three steps.</h2>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { icon: FilePlus, step: "03", label: "Pick a template", desc: "Choose from True Crime, Lore, or Conspiracy. Each one has fields tailored to that type of case." },
              { icon: Search,   step: "02", label: "Fill in the details", desc: "Document everything you know — evidence, theories, sources, status. Structure your obsession." },
              { icon: Users,    step: "01", label: "Share with the community", desc: "Post your case to the feed. Let others read, react, and go down the same hole with you." },
            ].map(({ icon: Icon, step, label, desc }) => (
              <div key={step} className="relative">
                <p className="mb-4 text-5xl font-extrabold text-border">{step}</p>
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <p className="mb-2 font-bold">{label}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMING SOON ── */}
      <section className="border-t border-border px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">On the roadmap</p>
          <h2 className="mb-12 text-3xl font-extrabold tracking-tight sm:text-4xl">We're just getting started.</h2>

          <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Network,  label: "Graph View",       desc: "Visualise connections between cases, suspects, and evidence as an interactive graph." },
              { icon: GitFork,  label: "Forking",          desc: "Take someone's case and branch it into your own version with a different theory." },
              { icon: Users,    label: "Collab",           desc: "Invite others to co-author a case. Investigate together in real time." },
              { icon: Shield,   label: "Version Control",  desc: "Full edit history for every case. See what changed, when, and who changed it." },
              { icon: Clock,    label: "Timeline",         desc: "Automatically generate a visual timeline from the events in your case." },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-background px-8 py-7">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-4 w-4 text-muted-foreground/50" />
                </div>
                <p className="mb-1.5 font-bold text-muted-foreground/60">{label}</p>
                <p className="text-xs leading-relaxed text-muted-foreground/40">{desc}</p>
                <span className="mt-4 inline-block rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground/30">
                  Coming soon
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="border-t border-border px-6 py-28 text-center sm:px-10">
        <div className="mx-auto max-w-xl">
          <img src="/logo.png" alt="Warren" className="mx-auto mb-6 h-12 w-12 opacity-80" />
          <h2 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Ready to go deeper?
          </h2>
          <p className="mb-10 text-base text-muted-foreground">
            Join Warren and start documenting the cases that keep you up at night.
          </p>
          <Button variant="hero" size="lg" asChild className="gap-2">
            <Link to="/auth">
              Create your account
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <img src="/logo.png" alt="Warren" className="h-5 w-5 opacity-60" />
                <span className="text-sm font-bold text-muted-foreground/60">Warren</span>
              </div>
              <p className="text-xs text-muted-foreground/40">
                Document the unknown. Share the obsession.
              </p>
            </div>

            <div className="flex gap-10 text-xs text-muted-foreground/40">
              <div className="space-y-2">
                <p className="font-semibold text-muted-foreground/60">App</p>
                <Link to="/auth" className="block hover:text-muted-foreground transition-colors">Sign Up</Link>
                <Link to="/auth" className="block hover:text-muted-foreground transition-colors">Log In</Link>
                <Link to="/feed" className="block hover:text-muted-foreground transition-colors">Feed</Link>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-muted-foreground/60">Coming</p>
                {["Graph View", "Forking", "Collab"].map(f => (
                  <p key={f} className="opacity-50">{f}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-1 border-t border-border pt-6 text-center sm:flex-row sm:text-left">
            <span className="text-xs text-muted-foreground/30">
              © {new Date().getFullYear()} Warren. All rights reserved.
            </span>
            <span className="text-xs text-muted-foreground/20">
              Early access — things may break.
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
