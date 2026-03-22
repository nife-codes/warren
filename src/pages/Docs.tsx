import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BookOpen, Bookmark, MessageCircle,
  Bug, Mail, Menu, X, Users,
  FileText, Globe, Lock, Heart, Share2,
} from "lucide-react";

// ── sidebar structure ─────────────────────────────────────────────────────────

const sections = [
  {
    group: "Overview",
    items: [
      { id: "introduction",   label: "Introduction" },
      { id: "how-it-works",   label: "How It Works" },
    ],
  },
  {
    group: "Getting Started",
    items: [
      { id: "creating-account", label: "Creating an Account" },
      { id: "setup-username",   label: "Setting Up Your Username" },
    ],
  },
  {
    group: "Case Files",
    items: [
      { id: "case-types",   label: "Case Types" },
      { id: "filing-case",  label: "Filing a Case" },
      { id: "case-fields",  label: "Field Types" },
      { id: "tags",         label: "Tags" },
      { id: "visibility",   label: "Public & Private" },
    ],
  },
  {
    group: "Exploring",
    items: [
      { id: "feed",        label: "The Feed" },
      { id: "search",      label: "Search & Filters" },
      { id: "people",      label: "Finding People" },
    ],
  },
  {
    group: "Community",
    items: [
      { id: "reading-case",   label: "Reading a Case" },
      { id: "highlights",     label: "Highlighting & Reactions" },
      { id: "comments",       label: "Comments & Replies" },
      { id: "saving",         label: "Saving Cases" },
    ],
  },
  {
    group: "Your Profile",
    items: [
      { id: "my-warren",  label: "My Warren" },
      { id: "profile",    label: "Edit Profile" },
      { id: "badges",     label: "Badges" },
    ],
  },
  {
    group: "Support",
    items: [
      { id: "report-bug", label: "Report a Bug" },
      { id: "contact",    label: "Contact" },
    ],
  },
];

// ── content ───────────────────────────────────────────────────────────────────

const CASE_TYPES = [
  { label: "True Crime",        color: "bg-red-500/15 text-red-400 border-red-500/20",       desc: "Real criminal cases, unsolved murders, fraud, etc." },
  { label: "Lore",              color: "bg-purple-500/15 text-purple-400 border-purple-500/20", desc: "Urban legends, folklore, and local mythology." },
  { label: "Conspiracy",        color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20", desc: "Cover-ups, theories, and connections." },
  { label: "Missing Persons",   color: "bg-sky-500/15 text-sky-400 border-sky-500/20",       desc: "Disappearances, cold cases, and unidentified remains." },
  { label: "Paranormal",        color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20", desc: "Ghosts, cryptids, unexplained phenomena." },
  { label: "Historical Mystery", color: "bg-orange-500/15 text-orange-400 border-orange-500/20", desc: "Unsolved events from history." },
  { label: "Research",          color: "bg-teal-500/15 text-teal-400 border-teal-500/20",    desc: "Deep dives, study notes, topic breakdowns — forex, science, space, anything." },
  { label: "World Building",    color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", desc: "Characters, locations, factions, lore, magic systems — your world, documented." },
];

const FIELD_TYPES = [
  { label: "Text",     desc: "A single-line text field. Good for names, locations, dates." },
  { label: "Note",     desc: "Multi-line freeform text. For summaries, narratives, theories." },
  { label: "Options",  desc: "Pick from predefined choices. E.g. status, verdict." },
  { label: "List",     desc: "Bullet-point builder. Add items one by one." },
  { label: "People",   desc: "Person cards with name, age, and description. For suspects, victims, witnesses." },
  { label: "Rating",   desc: "1–5 scale. Rate credibility, severity, weirdness." },
];

// ── util ──────────────────────────────────────────────────────────────────────

function Tag({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold",
      color || "bg-muted text-muted-foreground border-border"
    )}>
      {children}
    </span>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 mb-14">
      <h2 className="mb-4 text-xl font-bold text-foreground">{title}</h2>
      <div className="space-y-4 text-sm text-foreground/75 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground/80">
      {children}
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

function ContactModal({ type, onClose }: { type: "bug" | "general"; onClose: () => void }) {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [message, setMessage] = useState("");

  const send = () => {
    const subject = type === "bug" ? `[Bug Report] ${name}` : `[Contact] ${name}`;
    const body    = `From: ${name} (${email})\n\n${message}`;
    const to      = type === "bug" ? "hephzibbahmorayo@gmail.com" : "hephzibbahmorayo@gmail.com";
    window.open(`mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-bold">{type === "bug" ? "Report a Bug" : "Get in Touch"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Name</label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email"
                placeholder="your@email.com"
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {type === "bug" ? "What happened?" : "Message"}
            </label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5}
              placeholder={type === "bug"
                ? "What were you doing? What did you expect? What happened instead?"
                : "What's on your mind?"}
              className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
          </div>
          <button onClick={send} disabled={!name.trim() || !message.trim()}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40">
            {type === "bug" ? "Send Bug Report" : "Send Message"}
          </button>
          <p className="text-center text-xs text-muted-foreground/40">
            This will open your email client with the form pre-filled.
          </p>
        </div>
      </div>
    </>
  );
}

export default function Docs() {
  const [active, setActive]     = useState("introduction");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contactModal, setContactModal] = useState<"bug" | "general" | null>(null);
  const navigate = useNavigate();

  // Track which section is in view
  useEffect(() => {
    const allIds = sections.flatMap(s => s.items.map(i => i.id));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    allIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setSidebarOpen(false);
  };

  const Sidebar = () => (
    <nav className="space-y-6">
      <Link to="/" className="flex items-center gap-2 font-bold text-base text-foreground mb-2">
        <img src="/logo.png" alt="Warren" className="h-6 w-6" />
        Warren
      </Link>
      {sections.map((s) => (
        <div key={s.group}>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
            {s.group}
          </p>
          <ul className="space-y-0.5">
            {s.items.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => scrollTo(item.id)}
                  className={cn(
                    "w-full text-left rounded-md px-2.5 py-1.5 text-sm transition-colors",
                    active === item.id
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex h-14 items-center gap-4 px-4 md:px-8">
          <button
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link to="/" className="flex items-center gap-2 font-bold text-base text-foreground">
            <img src="/logo.png" alt="Warren" className="h-6 w-6" />
            <span>Warren</span>
            <span className="ml-1 text-muted-foreground/40 font-normal text-sm">/ Docs</span>
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <Link to="/feed" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back to app →
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-60 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto border-r border-border px-5 py-8">
          <Sidebar />
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
            <aside className="fixed top-14 left-0 z-50 h-[calc(100vh-3.5rem)] w-64 overflow-y-auto border-r border-border bg-background px-5 py-8 md:hidden">
              <Sidebar />
            </aside>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 px-6 py-10 md:px-12 max-w-3xl">

          {/* ── Introduction ── */}
          <Section id="introduction" title="Welcome to Warren">
            <p>
              Warren is a community platform for documenting and exploring mystery cases — true crime, urban legends,
              conspiracies, paranormal events, missing persons, and historical mysteries. Think of it as a case file
              system built for curious people.
            </p>
            <p>
              Every case you file lives in the warren. Others can read it, react to it, annotate specific passages,
              and leave comments. You can explore what the community is documenting, follow investigators, and save
              cases you want to revisit.
            </p>
            <div className="grid gap-3 sm:grid-cols-3 pt-2">
              {[
                { icon: FileText,       label: "Document",  desc: "File structured case reports" },
                { icon: Users,          label: "Explore",   desc: "See what others are investigating" },
                { icon: MessageCircle,  label: "Annotate",  desc: "Highlight, react, and discuss" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="rounded-lg border border-border bg-card p-4">
                  <Icon className="mb-2 h-5 w-5 text-primary" />
                  <p className="font-semibold text-foreground text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ── How it works ── */}
          <Section id="how-it-works" title="How It Works">
            <p>
              Warren is built around <strong className="text-foreground">case files</strong> — structured documents you
              create to document a mystery. Each case has a type, a title, a summary, custom fields, and tags.
            </p>
            <ol className="list-decimal list-inside space-y-2 pl-1">
              <li>Create an account and set your username.</li>
              <li>File a case — choose a type, fill in the fields, add your tags.</li>
              <li>Publish it publicly (or keep it private while you work on it).</li>
              <li>Others can find it in the feed, react to passages, and comment.</li>
              <li>Save cases you want to come back to from My Warren.</li>
            </ol>
          </Section>

          {/* ── Creating an Account ── */}
          <Section id="creating-account" title="Creating an Account">
            <p>
              Head to <button onClick={() => navigate("/auth")} className="text-primary hover:underline">/auth</button> and
              sign up with your email. You'll receive a confirmation link — click it to verify your account.
            </p>
            <Note>
              Check your spam folder if the email doesn't arrive within a minute. The subject line is from Supabase Auth.
            </Note>
          </Section>

          {/* ── Setup Username ── */}
          <Section id="setup-username" title="Setting Up Your Username">
            <p>
              After confirming your email, you'll be prompted to choose a username. Your username is public and used
              to identify your case files and profile across Warren.
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>Lowercase letters, numbers, and underscores only.</li>
              <li>Must be at least 2 characters.</li>
              <li>You can change it later from your profile.</li>
            </ul>
          </Section>

          {/* ── Case Types ── */}
          <Section id="case-types" title="Case Types">
            <p>Every case belongs to one of six categories:</p>
            <div className="grid gap-2 pt-1">
              {CASE_TYPES.map(({ label, color, desc }) => (
                <div key={label} className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3">
                  <Tag color={color}>{label}</Tag>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Filing a Case ── */}
          <Section id="filing-case" title="Filing a Case">
            <p>
              Go to <strong className="text-foreground">New Case</strong> in the nav. You'll see six case type cards —
              hover them to feel the tilt. Click one to open the case file form.
            </p>
            <p>
              The form generates a unique case ID (e.g. <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-primary">WR-2025-4821</code>) automatically.
              Fill in the fields, pick your tags, set visibility, and hit <strong className="text-foreground">File Case</strong>.
            </p>
            <Note>
              You can open and close field sections — your input is preserved even when a section is collapsed.
            </Note>
          </Section>

          {/* ── Field Types ── */}
          <Section id="case-fields" title="Field Types">
            <p>Different fields are available depending on your case type:</p>
            <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
              {FIELD_TYPES.map(({ label, desc }) => (
                <div key={label} className="flex items-start gap-4 bg-card px-4 py-3">
                  <span className="w-16 shrink-0 rounded bg-muted px-1.5 py-0.5 text-center text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    {label}
                  </span>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Tags ── */}
          <Section id="tags" title="Tags">
            <p>
              Tags help others discover your case. Each case type has a set of predefined tags — click any to add it.
              You can also type a custom tag and hit Enter to add it.
            </p>
            <p>
              Tags appear on your case card in the feed and are searchable. Keep them relevant — think keywords
              someone would use to find your case.
            </p>
          </Section>

          {/* ── Visibility ── */}
          <Section id="visibility" title="Public & Private">
            <div className="flex gap-4">
              <div className="flex-1 rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm text-foreground">Public</span>
                </div>
                <p className="text-xs text-muted-foreground">Visible to everyone in the feed. Can be commented on and reacted to.</p>
              </div>
              <div className="flex-1 rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-sm text-foreground">Private</span>
                </div>
                <p className="text-xs text-muted-foreground">Only visible to you. Good for drafts or personal notes.</p>
              </div>
            </div>
            <p>You can toggle visibility before filing. Private cases still appear in your My Warren.</p>
          </Section>

          {/* ── Feed ── */}
          <Section id="feed" title="The Feed">
            <p>
              The Feed (<strong className="text-foreground">/feed</strong>) shows all public cases, newest first.
              It has two tabs:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-1">
              <li><strong className="text-foreground">Cases</strong> — the full case feed with type filters.</li>
              <li><strong className="text-foreground">People</strong> — search for investigators by name or username.</li>
            </ul>
            <p>Each card shows the case type, title, summary snippet, tags, author, like count, and comment count.</p>
          </Section>

          {/* ── Search ── */}
          <Section id="search" title="Search & Filters">
            <p>
              In the Cases tab, use the search bar to filter by title or tag. Below it, click any type filter pill to
              narrow by case category — or keep it on <strong className="text-foreground">All</strong>.
            </p>
            <Note>Search is local — it filters what's already loaded in the feed, not the entire database.</Note>
          </Section>

          {/* ── People ── */}
          <Section id="people" title="Finding People">
            <p>
              Switch to the <strong className="text-foreground">People</strong> tab in the Feed and start typing.
              Results match on both username and display name. Click a result to visit their public profile and see all
              their cases.
            </p>
          </Section>

          {/* ── Reading a Case ── */}
          <Section id="reading-case" title="Reading a Case">
            <p>
              Click any case card to open the full case file. You'll see the title, summary, author, tags, and all
              the structured fields that were filled in.
            </p>
            <p>
              The action bar lets you:
            </p>
            <div className="flex flex-wrap gap-3 py-1">
              {[
                { icon: Heart,          label: "Like the case" },
                { icon: Bookmark,       label: "Save for later" },
                { icon: MessageCircle,  label: "Open comments panel" },
                { icon: Share2,         label: "Copy link" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 text-primary" />{label}
                </div>
              ))}
            </div>
            <p>If you're the author, a trash icon also appears to delete the case (requires a second click to confirm).</p>
          </Section>

          {/* ── Highlights ── */}
          <Section id="highlights" title="Highlighting & Reactions">
            <p>
              Select any text in a case file to trigger the highlight popup. From there you can:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-1">
              <li>
                <strong className="text-foreground">React</strong> — click an emoji (
                <span className="text-base">🔥 👀 🤔 💀 ❓</span>) to leave a reaction on that passage.
                Reactions are grouped and shown in the comments panel.
              </li>
              <li>
                <strong className="text-foreground">Comment</strong> — click <span className="text-primary font-semibold">💬 comment</span> to
                open the panel with the highlighted text quoted in your reply.
              </li>
            </ul>
            <Note>
              The small hint below the case content ("Highlight any text to react or annotate") reminds readers this feature exists.
            </Note>
          </Section>

          {/* ── Comments ── */}
          <Section id="comments" title="Comments & Replies">
            <p>
              The comments panel slides in from the right when you click the chat icon or annotate a passage.
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-1">
              <li>Comments from the case author show an <Tag color="bg-primary/15 text-primary border-primary/30">Author</Tag> badge.</li>
              <li>Like any comment with the heart icon — updates instantly.</li>
              <li>Reply to a comment with the Reply button — replies are nested one level deep.</li>
              <li>Hover a comment to reveal the delete button (trash icon). You can delete your own comments; the case author can delete anyone's.</li>
              <li>Press <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono">Enter</kbd> to submit, <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono">Shift+Enter</kbd> for a new line.</li>
            </ul>
          </Section>

          {/* ── Saving ── */}
          <Section id="saving" title="Saving Cases">
            <p>
              Click the <Bookmark className="inline h-3.5 w-3.5 text-primary" /> bookmark icon on any case card or case
              page to save it. Saved cases appear in the <strong className="text-foreground">Saved</strong> tab inside My Warren.
            </p>
            <p>Click the bookmark again to unsave.</p>
          </Section>

          {/* ── My Warren ── */}
          <Section id="my-warren" title="My Warren">
            <p>
              <strong className="text-foreground">My Warren</strong> is your personal library — all the cases you've
              filed, plus cases you've saved. It has two tabs:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-1">
              <li><strong className="text-foreground">My Cases</strong> — everything you've documented, public and private.</li>
              <li><strong className="text-foreground">Saved</strong> — cases bookmarked from the feed or case pages.</li>
            </ul>
          </Section>

          {/* ── Profile ── */}
          <Section id="profile" title="Edit Profile">
            <p>
              Visit your <strong className="text-foreground">Profile</strong> page and click <strong className="text-foreground">Edit profile</strong> to update:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li><strong className="text-foreground">Avatar</strong> — upload any image. Click the camera icon.</li>
              <li><strong className="text-foreground">Display name</strong> — shown alongside your @username.</li>
              <li><strong className="text-foreground">Username</strong> — availability is checked in real time.</li>
              <li><strong className="text-foreground">Bio</strong> — up to 160 characters.</li>
            </ul>
          </Section>

          {/* ── Badges ── */}
          <Section id="badges" title="Badges & Recognition">
            <p>
              Some profiles carry a special badge next to their name — a small Warren logo icon.
            </p>
            <ul className="list-disc list-inside space-y-2 pl-1 mt-2">
              <li>
                <strong className="text-foreground">Founder badge</strong> — shown on the profile of the person who built Warren.
                Hover over it (or tap on mobile) to learn more. This badge is unique — there is only one founder.
              </li>
            </ul>
          </Section>

          {/* ── Report a Bug ── */}
          <Section id="report-bug" title="Report a Bug">
            <p>
              Found something broken? We want to know. Include as much detail as possible:
            </p>
            <div className="rounded-lg border border-border bg-card p-5 space-y-3">
              <div className="flex items-start gap-3">
                <Bug className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-foreground">What to include</p>
                  <ul className="mt-1.5 list-disc list-inside space-y-1 text-xs text-muted-foreground pl-1">
                    <li>What you were trying to do</li>
                    <li>What you expected to happen</li>
                    <li>What actually happened</li>
                    <li>Your browser and device type</li>
                    <li>Screenshots if possible</li>
                  </ul>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={() => setContactModal("bug")}
                  className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  <Mail className="h-4 w-4 text-primary" />
                  Send a bug report
                </button>
              </div>
            </div>
          </Section>

          {/* ── Contact ── */}
          <Section id="contact" title="Contact">
            <p>Questions, ideas, collabs? Get in touch.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => setContactModal("general")}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/30 hover:bg-muted/30 text-left"
              >
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">General</p>
                  <p className="text-xs text-muted-foreground">Questions, ideas, collabs</p>
                </div>
              </button>
              <button
                onClick={() => setContactModal("bug")}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/30 hover:bg-muted/30 text-left"
              >
                <Bug className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Bugs</p>
                  <p className="text-xs text-muted-foreground">Something broken? Tell us</p>
                </div>
              </button>
            </div>
            <p className="text-xs text-muted-foreground/50 pt-4 text-center">
              Warren is built with love (and a healthy obsession with unsolved mysteries).
            </p>
          </Section>

        </main>

        {/* Right gutter — on-this-page (md+) */}
        <aside className="hidden xl:block w-52 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto px-5 py-8">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">On this page</p>
          <ul className="space-y-1">
            {sections.flatMap(s => s.items).map(item => (
              <li key={item.id}>
                <button
                  onClick={() => scrollTo(item.id)}
                  className={cn(
                    "w-full text-left text-xs px-2 py-1 rounded transition-colors",
                    active === item.id
                      ? "text-primary font-semibold"
                      : "text-muted-foreground/50 hover:text-muted-foreground"
                  )}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>

    {contactModal && (
      <ContactModal type={contactModal} onClose={() => setContactModal(null)} />
    )}
    </>
  );
}
