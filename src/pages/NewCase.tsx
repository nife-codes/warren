import { Layout } from "@/components/Layout";
import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { type CaseType } from "@/types/case";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2, Skull, Ghost, Eye, X, ArrowLeft, ChevronRight, Plus, Check, ChevronDown, UserX, Telescope, BookOpen, Globe, Lock, Pencil, FlaskConical, Layers, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

// ── field types ───────────────────────────────────────────────────────────────

type FieldType = "input" | "textarea" | "chips" | "list" | "rating" | "people" | "cards" | "image";

type PersonEntry = { name: string; age: string; description: string };

type FieldDef = {
  key: string;
  label: string;
  placeholder: string;
  type?: FieldType;         // default: input
  options?: string[];       // for chips
  isSummary?: boolean;
  subtitleLabel?: string;   // for cards type (default "Age")
};

// ── template config ───────────────────────────────────────────────────────────

type TypeConfig = {
  icon: React.ElementType;
  label: string;
  badge: string;
  tagline: string;
  gradientFrom: string;
  gradientTo: string;
  borderHover: string;
  badgeColor: string;
  iconColor: string;
  progressColor: string;
  fields: FieldDef[];
};

const templateConfig: Record<CaseType, TypeConfig> = {
  "true-crime": {
    icon: Skull, label: "True Crime", badge: "CASE OPEN",
    tagline: "The real ones. The cold cases. The unsolved.",
    gradientFrom: "from-rose-950/60", gradientTo: "to-rose-900/20",
    borderHover: "hover:border-rose-500/40", badgeColor: "bg-rose-500/15 text-rose-400 border border-rose-500/20",
    iconColor: "text-rose-400", progressColor: "bg-rose-400",
    fields: [
      { key: "Case Name",      label: "Case Name",      placeholder: "What is this case known as?",                    type: "input"    },
      { key: "Victim(s)",      label: "Victim(s)",       placeholder: "Add a victim...",                                type: "people"   },
      { key: "Suspect(s)",     label: "Suspect(s)",      placeholder: "Add a suspect...",                               type: "people"   },
      { key: "What Happened",  label: "What Happened",   placeholder: "Walk me through it. Don't leave things out.",    type: "textarea", isSummary: true },
      { key: "Evidence",       label: "Evidence",        placeholder: "Add a piece of evidence...",                     type: "list"     },
      { key: "Current Status", label: "Current Status",  placeholder: "Something else...",                              type: "chips",
        options: ["Open", "Cold Case", "Closed", "Solved", "Wrongful Conviction", "Suspect Acquitted"] },
      { key: "Evidence Photo", label: "Evidence Photo",  placeholder: "",                                               type: "image"    },
      { key: "Source",         label: "Source",          placeholder: "Where does this come from?",                     type: "input"    },
    ],
  },
  lore: {
    icon: Ghost, label: "Lore / Urban Legend", badge: "UNVERIFIED",
    tagline: "Whispered. Passed down. Impossible to explain.",
    gradientFrom: "from-violet-950/60", gradientTo: "to-violet-900/20",
    borderHover: "hover:border-violet-500/40", badgeColor: "bg-violet-500/15 text-violet-400 border border-violet-500/20",
    iconColor: "text-violet-400", progressColor: "bg-violet-400",
    fields: [
      { key: "Title",                 label: "Title",                  placeholder: "What is it called?",                         type: "input"    },
      { key: "Origin",                label: "Origin",                 placeholder: "Where and when does this come from?",        type: "input"    },
      { key: "The Claim",             label: "The Claim",              placeholder: "What do people say happened?",               type: "textarea", isSummary: true },
      { key: "Why People Believe It", label: "Why People Believe It",  placeholder: "What makes this feel real to people?",       type: "textarea" },
      { key: "Debunked or Not",       label: "Verdict",                placeholder: "",                                           type: "chips",
        options: ["Confirmed True", "Debunked", "Still Unresolved", "Partially Explained", "Unknown"] },
      { key: "Creep Factor",          label: "Creep Factor",           placeholder: "",                                           type: "rating"   },
      { key: "Image",                 label: "Image",                  placeholder: "",                                           type: "image"    },
      { key: "Source",                label: "Source",                 placeholder: "Reddit thread? Old newspaper? Your uncle?",  type: "input"    },
    ],
  },
  conspiracy: {
    icon: Eye, label: "Conspiracy", badge: "CLASSIFIED",
    tagline: "Connect the dots. Follow the money. Trust no one.",
    gradientFrom: "from-amber-950/60", gradientTo: "to-amber-900/20",
    borderHover: "hover:border-amber-500/40", badgeColor: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
    iconColor: "text-amber-400", progressColor: "bg-amber-400",
    fields: [
      { key: "Title",           label: "Title",           placeholder: "Name this theory.",                                 type: "input"    },
      { key: "The Theory",      label: "The Theory",      placeholder: "What's the claim? What's being covered up?",       type: "textarea", isSummary: true },
      { key: "Who's Behind It", label: "Who's Behind It", placeholder: "Someone else...",                                  type: "chips",
        options: ["Government", "Corporations", "Secret Society", "Foreign Power", "The Media", "Unknown"] },
      { key: "Evidence For It", label: "Evidence For It", placeholder: "Add a dot that connects...",                       type: "list"     },
      { key: "The Holes In It", label: "The Holes In It", placeholder: "Where does the theory fall apart?",                type: "textarea" },
      { key: "Status",          label: "Status",          placeholder: "Something else...",                                type: "chips",
        options: ["Active Theory", "Growing", "Partially Confirmed", "Debunked", "Unknown"] },
      { key: "Image",           label: "Image",           placeholder: "",                                                 type: "image"    },
      { key: "Source",          label: "Source",          placeholder: "Links, books, forums, that one documentary...",   type: "input"    },
    ],
  },
  "missing-persons": {
    icon: UserX, label: "Missing Persons", badge: "STILL MISSING",
    tagline: "They were here. Then they weren't. Someone knows something.",
    gradientFrom: "from-sky-950/60", gradientTo: "to-sky-900/20",
    borderHover: "hover:border-sky-500/40", badgeColor: "bg-sky-500/15 text-sky-400 border border-sky-500/20",
    iconColor: "text-sky-400", progressColor: "bg-sky-400",
    fields: [
      { key: "Name",               label: "Name",               placeholder: "Full name of the missing person",                  type: "input"    },
      { key: "Last Seen",          label: "Last Seen",           placeholder: "Date, location, circumstances",                   type: "input"    },
      { key: "What We Know",       label: "What We Know",        placeholder: "Their last known movements, who saw them last...", type: "textarea", isSummary: true },
      { key: "Persons of Interest",label: "Persons of Interest", placeholder: "Add a person...",                                type: "people"   },
      { key: "Evidence",           label: "Evidence",            placeholder: "Add anything found or recovered...",              type: "list"     },
      { key: "Theories",           label: "Theories",            placeholder: "What do people think happened?",                  type: "textarea" },
      { key: "Status",             label: "Status",              placeholder: "Something else...",                               type: "chips",
        options: ["Active Search", "Case Closed", "Presumed Dead", "Found Alive", "Still Missing", "Cold Case"] },
      { key: "Photo",              label: "Photo",               placeholder: "",                                               type: "image"    },
      { key: "Source",             label: "Source",              placeholder: "News articles, family statements, databases...", type: "input"    },
    ],
  },
  paranormal: {
    icon: Telescope, label: "Paranormal", badge: "UNEXPLAINED",
    tagline: "Science has no answer. Witnesses can't forget. Make of that what you will.",
    gradientFrom: "from-indigo-950/60", gradientTo: "to-indigo-900/20",
    borderHover: "hover:border-indigo-500/40", badgeColor: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20",
    iconColor: "text-indigo-400", progressColor: "bg-indigo-400",
    fields: [
      { key: "Incident Name",  label: "Incident Name",  placeholder: "What do people call this?",                         type: "input"    },
      { key: "Location",       label: "Location",        placeholder: "Where did this happen?",                            type: "input"    },
      { key: "What Happened",  label: "What Happened",   placeholder: "Describe the incident as reported.",                type: "textarea", isSummary: true },
      { key: "Witnesses",      label: "Witnesses",       placeholder: "Add a witness or source...",                        type: "list"     },
      { key: "Evidence",       label: "Evidence",        placeholder: "Photos, recordings, physical traces, nothing...",   type: "list"     },
      { key: "Explanations",   label: "Explanations",    placeholder: "Natural? Supernatural? Staged?",                    type: "textarea" },
      { key: "Category",       label: "Category",        placeholder: "Something else...",                                 type: "chips",
        options: ["UFO / UAP", "Ghost / Haunting", "Cryptid", "Poltergeist", "Time Anomaly", "Mass Hallucination", "Unknown"] },
      { key: "Evidence Photo", label: "Evidence Photo",  placeholder: "",                                                   type: "image"    },
      { key: "Source",         label: "Source",          placeholder: "Report, interview, database, your own experience...", type: "input" },
    ],
  },
  historical: {
    icon: BookOpen, label: "Historical Mystery", badge: "UNSOLVED",
    tagline: "History has gaps. Some of them are intentional.",
    gradientFrom: "from-orange-950/60", gradientTo: "to-orange-900/20",
    borderHover: "hover:border-orange-500/40", badgeColor: "bg-orange-500/15 text-orange-400 border border-orange-500/20",
    iconColor: "text-orange-400", progressColor: "bg-orange-400",
    fields: [
      { key: "Title",          label: "Title",          placeholder: "The name of the mystery",                              type: "input"    },
      { key: "Time Period",    label: "Time Period",     placeholder: "When did this occur?",                                type: "input"    },
      { key: "The Mystery",    label: "The Mystery",    placeholder: "What is the unresolved question or event?",           type: "textarea", isSummary: true },
      { key: "Key Figures",    label: "Key Figures",    placeholder: "Add a person or group...",                           type: "people"   },
      { key: "Evidence",       label: "Evidence",       placeholder: "Add artifacts, documents, records...",                type: "list"     },
      { key: "Theories",       label: "Theories",       placeholder: "What do historians and researchers think?",           type: "textarea" },
      { key: "Status",         label: "Status",         placeholder: "Something else...",                                   type: "chips",
        options: ["Unsolved", "Partially Explained", "Officially Closed", "Ongoing Research", "Disputed"] },
      { key: "Image",          label: "Image",          placeholder: "",                                                    type: "image"    },
      { key: "Source",         label: "Source",         placeholder: "Academic papers, books, documentaries...",           type: "input"    },
    ],
  },
  research: {
    icon: FlaskConical, label: "Research", badge: "ONGOING",
    tagline: "Down the rabbit hole. Documenting everything you find.",
    gradientFrom: "from-teal-950/60", gradientTo: "to-teal-900/20",
    borderHover: "hover:border-teal-500/40", badgeColor: "bg-teal-500/15 text-teal-400 border border-teal-500/20",
    iconColor: "text-teal-400", progressColor: "bg-teal-400",
    fields: [
      { key: "Subject",        label: "Subject",        placeholder: "What are you researching?",                           type: "input"                 },
      { key: "Overview",       label: "Overview",       placeholder: "Give a broad summary of the topic.",                  type: "textarea", isSummary: true },
      { key: "Key Findings",   label: "Key Findings",   placeholder: "Add a finding...",                                    type: "list"                  },
      { key: "Open Questions", label: "Open Questions", placeholder: "Add a question you still need to answer...",          type: "list"                  },
      { key: "Sources",        label: "Sources",        placeholder: "Add a source, link, or reference...",                 type: "list"                  },
      { key: "Status",         label: "Status",         placeholder: "Something else...",                                   type: "chips",
        options: ["Ongoing", "Completed", "Paused", "Peer-Reviewed", "Debunked"] },
      { key: "Image",          label: "Image",          placeholder: "",                                                    type: "image"                 },
      { key: "Notes",          label: "Notes",          placeholder: "Anything else worth documenting...",                  type: "textarea"              },
    ],
  },
  "world-building": {
    icon: Layers, label: "World Building", badge: "IN PROGRESS",
    tagline: "Build the world. Document the chaos. Make it make sense.",
    gradientFrom: "from-emerald-950/60", gradientTo: "to-emerald-900/20",
    borderHover: "hover:border-emerald-500/40", badgeColor: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
    iconColor: "text-emerald-400", progressColor: "bg-emerald-400",
    fields: [
      { key: "World Name",    label: "World Name",    placeholder: "What is this world called?",                             type: "input"                              },
      { key: "Overview",      label: "Overview",      placeholder: "The elevator pitch. What is this world?",               type: "textarea", isSummary: true          },
      { key: "Genre",         label: "Genre",         placeholder: "Something else...",                                      type: "chips",
        options: ["Fantasy", "Sci-Fi", "Dystopian", "Horror", "Historical", "Contemporary", "Mythology", "Post-Apocalyptic"] },
      { key: "Characters",    label: "Characters",    placeholder: "Add a character...",                                     type: "cards", subtitleLabel: "Role"       },
      { key: "Locations",     label: "Locations",     placeholder: "Add a location...",                                      type: "cards", subtitleLabel: "Type"       },
      { key: "Factions",      label: "Factions",      placeholder: "Add a faction...",                                       type: "cards", subtitleLabel: "Alignment"  },
      { key: "Creatures",     label: "Creatures",     placeholder: "Add a creature...",                                      type: "cards", subtitleLabel: "Type"       },
      { key: "Magic & Tech",  label: "Magic & Tech",  placeholder: "How does power work in this world?",                    type: "textarea"                           },
      { key: "History",       label: "History",       placeholder: "Add a key historical event...",                         type: "list"                               },
      { key: "Conflicts",     label: "Conflicts",     placeholder: "Add a tension, war, or rivalry...",                     type: "list"                               },
      { key: "Map / Art",     label: "Map / Art",     placeholder: "",                                                       type: "image"                              },
      { key: "Themes",        label: "Themes",        placeholder: "Something else...",                                      type: "chips",
        options: ["Redemption", "Power", "Identity", "War", "Love", "Betrayal", "Survival", "Freedom", "Corruption", "Fate"] },
    ],
  },
};

// ── TiltCard ──────────────────────────────────────────────────────────────────

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const rx = -(((e.clientY - r.top)  / r.height) - 0.5) * 18;
    const ry =  (((e.clientX - r.left) / r.width)  - 0.5) * 18;
    el.style.transform = `perspective(500px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.05)`;
  }, []);
  const onLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "perspective(500px) rotateX(0deg) rotateY(0deg) scale(1)";
  }, []);
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      className={className} style={{ transition: "transform 0.18s ease", willChange: "transform" }}>
      {children}
    </div>
  );
}

// ── field components ──────────────────────────────────────────────────────────

function ChipsField({ options, value, onChange, placeholder }: {
  options: string[]; value: string; onChange: (v: string) => void; placeholder: string;
}) {
  const [custom, setCustom] = useState("");
  const selected = value;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <button key={o} onClick={() => onChange(selected === o ? "" : o)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold border transition-all duration-150",
              selected === o
                ? "bg-primary/20 border-primary/60 text-primary"
                : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
            )}>
            {selected === o && <Check className="inline h-3 w-3 mr-1" />}
            {o}
          </button>
        ))}
      </div>
      {/* Custom option */}
      {!options.includes(selected) && selected && (
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/20 border border-primary/60 text-primary px-3 py-1 text-xs font-semibold flex items-center gap-1">
            {selected}
            <button onClick={() => onChange("")}><X className="h-2.5 w-2.5" /></button>
          </span>
        </div>
      )}
      <div className="flex gap-2 items-center">
        <input value={custom} onChange={e => setCustom(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && custom.trim()) { onChange(custom.trim()); setCustom(""); } }}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-b border-border pb-1.5 text-sm text-foreground placeholder:text-muted-foreground/25 focus:outline-none focus:border-primary transition-colors" />
        {custom.trim() && (
          <button onClick={() => { onChange(custom.trim()); setCustom(""); }}
            className="text-xs text-primary hover:text-primary/80 transition-colors pb-1.5">add</button>
        )}
      </div>
    </div>
  );
}

function ListField({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder: string;
}) {
  const [input, setInput] = useState("");
  const items = value ? value.split("||").filter(Boolean) : [];
  const add = () => {
    const v = input.trim();
    if (!v) return;
    onChange([...items, v].join("||"));
    setInput("");
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i).join("||"));
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2 group">
          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
          <span className="flex-1 text-sm text-foreground">{item}</span>
          <button onClick={() => remove(i)}
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <div className="flex gap-2 items-center pt-1">
        <Plus className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-b border-border pb-1.5 text-sm text-foreground placeholder:text-muted-foreground/25 focus:outline-none focus:border-primary transition-colors" />
        {input.trim() && (
          <button onClick={add} className="text-xs text-primary pb-1.5">add</button>
        )}
      </div>
    </div>
  );
}

function PeopleField({ value, onChange, placeholder, subtitleLabel = "Age" }: {
  value: string; onChange: (v: string) => void; placeholder: string; subtitleLabel?: string;
}) {
  const people: PersonEntry[] = (() => { try { return value ? JSON.parse(value) : []; } catch { return []; } })();
  const [expanded, setExpanded]   = useState<number | null>(null);
  const [formOpen, setFormOpen]   = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm]           = useState<PersonEntry>({ name: "", age: "", description: "" });

  const openAdd = () => {
    setEditIndex(null);
    setForm({ name: "", age: "", description: "" });
    setFormOpen(true);
  };

  const openEdit = (i: number) => {
    setEditIndex(i);
    setForm({ ...people[i] });
    setFormOpen(true);
    setExpanded(null);
  };

  const closeForm = () => { setFormOpen(false); setEditIndex(null); setForm({ name: "", age: "", description: "" }); };

  const save = () => {
    if (!form.name.trim()) return;
    const entry = { name: form.name.trim(), age: form.age.trim(), description: form.description.trim() };
    const updated = editIndex !== null
      ? people.map((p, i) => i === editIndex ? entry : p)
      : [...people, entry];
    onChange(JSON.stringify(updated));
    closeForm();
  };

  const remove = (i: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(JSON.stringify(people.filter((_, idx) => idx !== i)));
    if (expanded === i) setExpanded(null);
  };

  return (
    <div className="space-y-2">
      {people.map((p, i) => (
        <div key={i} className="rounded-lg border border-border bg-muted/10 overflow-hidden">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <button onClick={() => setExpanded(expanded === i ? null : i)}
              className="flex items-center gap-3 flex-1 min-w-0 text-left">
              <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-bold text-muted-foreground">
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                {p.age && <p className="text-[11px] text-muted-foreground">{subtitleLabel}: {p.age}</p>}
              </div>
              {p.description && (
                <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground/40 transition-transform shrink-0", expanded === i && "rotate-180")} />
              )}
            </button>
            <div className="flex items-center gap-1.5 shrink-0">
              <button onClick={() => openEdit(i)}
                className="text-muted-foreground/40 hover:text-primary transition-colors p-0.5">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={e => remove(i, e)}
                className="text-muted-foreground/40 hover:text-foreground transition-colors p-0.5">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          {expanded === i && p.description && (
            <div className="px-3 pb-3">
              <p className="text-xs leading-relaxed text-muted-foreground border-t border-border pt-2">{p.description}</p>
            </div>
          )}
        </div>
      ))}

      {/* Inline form (add or edit) */}
      {formOpen ? (
        <div className="rounded-lg border border-primary/30 bg-muted/20 p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">
            {editIndex !== null ? "Edit Entry" : "New Entry"}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-bold">Name *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Full name or alias"
                className="w-full mt-1 bg-transparent border-b border-border pb-1.5 text-sm text-foreground placeholder:text-muted-foreground/25 focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-bold">{subtitleLabel}</label>
              <input value={form.age} onChange={e => setForm(p => ({ ...p, age: e.target.value }))}
                placeholder={subtitleLabel === "Age" ? "e.g. 34 or unknown" : `e.g. ${subtitleLabel.toLowerCase()}...`}
                className="w-full mt-1 bg-transparent border-b border-border pb-1.5 text-sm text-foreground placeholder:text-muted-foreground/25 focus:outline-none focus:border-primary transition-colors" />
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-bold">Description</label>
            <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Physical description, background, connection to the case..."
              className="w-full mt-1 bg-transparent border-b border-border pb-1.5 text-sm text-foreground placeholder:text-muted-foreground/25 focus:outline-none focus:border-primary transition-colors resize-none leading-relaxed" />
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button onClick={closeForm} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              cancel
            </button>
            <button onClick={save} disabled={!form.name.trim()}
              className="rounded-md bg-primary/20 border border-primary/40 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/30 transition-colors disabled:opacity-40">
              {editIndex !== null ? "Save changes" : "Add entry"}
            </button>
          </div>
        </div>
      ) : (
        <button onClick={openAdd}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-1">
          <Plus className="h-3.5 w-3.5" />
          {placeholder}
        </button>
      )}
    </div>
  );
}

function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const url = value.startsWith("__img__:") ? value.slice(8) : null;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("case-images").upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from("case-images").getPublicUrl(path);
      onChange(`__img__:${data.publicUrl}`);
    }
    setUploading(false);
  };

  return (
    <div className="space-y-3">
      {url && (
        <div className="group relative">
          <img src={url} alt="" className="w-full max-h-64 rounded-lg object-cover" />
          <button onClick={() => onChange("")}
            className="absolute right-2 top-2 rounded-full bg-background/80 p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <label className={cn(
        "flex cursor-pointer items-center gap-2 text-sm transition-colors",
        uploading ? "pointer-events-none text-muted-foreground/40" : "text-muted-foreground hover:text-foreground"
      )}>
        {uploading
          ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
          : <><Upload className="h-4 w-4" /> {url ? "Change image" : "Upload an image"}</>}
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
      </label>
    </div>
  );
}

function RatingField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const rating = parseInt(value) || 0;
  const labels = ["", "Slightly unsettling", "Odd vibes", "Sleep with lights on", "Don't google this alone", "Genuinely haunted"];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} onClick={() => onChange(rating === n ? "" : String(n))}
            className="transition-all duration-100 hover:scale-110">
            <Ghost className={cn("h-7 w-7 transition-colors",
              n <= rating ? "text-violet-400" : "text-muted-foreground/20")} />
          </button>
        ))}
      </div>
      {rating > 0 && (
        <p className="text-xs text-muted-foreground/60 italic">{labels[rating]}</p>
      )}
    </div>
  );
}

function TextareaField({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div className="relative">
      <textarea rows={5} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border-b border-border text-sm text-foreground placeholder:text-muted-foreground/25 focus:outline-none focus:border-primary transition-colors resize-none pb-2 leading-relaxed" />
      {value && (
        <span className="absolute bottom-3 right-0 text-[10px] font-mono text-muted-foreground/30">{value.length}</span>
      )}
    </div>
  );
}

// ── accordion field ───────────────────────────────────────────────────────────

function getPreview(field: FieldDef, value: string): string {
  if (!value) return "";
  if (field.type === "image") return value.startsWith("__img__:") ? "1 photo attached" : "";
  if (field.type === "list") {
    const items = value.split("||").filter(Boolean);
    return items.length === 1 ? items[0] : `${items[0]} +${items.length - 1} more`;
  }
  if (field.type === "people") {
    try {
      const people: PersonEntry[] = JSON.parse(value);
      if (!people.length) return "";
      return people.length === 1 ? people[0].name : `${people[0].name} +${people.length - 1} more`;
    } catch { return ""; }
  }
  if (field.type === "rating") return `${value}/5`;
  return value.length > 48 ? value.slice(0, 48) + "…" : value;
}

function isFilled(field: FieldDef, value: string): boolean {
  if (!value) return false;
  if (field.type === "image") return value.startsWith("__img__:");
  if (field.type === "list") return value.split("||").filter(Boolean).length > 0;
  if (field.type === "people") { try { return JSON.parse(value).length > 0; } catch { return false; } }
  return value.trim().length > 0;
}

function AccordionField({ field, value, onChange, index, isOpen, onToggle, accentColor }: {
  field: FieldDef; value: string; onChange: (v: string) => void;
  index: number; isOpen: boolean; onToggle: () => void; accentColor: string;
}) {
  const filled = isFilled(field, value);
  const preview = getPreview(field, value);

  return (
    <div className={cn(
      "rounded-lg border transition-colors duration-200",
      isOpen ? "border-primary/30 bg-muted/20" : "border-border hover:border-border/80"
    )}>
      {/* Header — always visible */}
      <button onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
        {/* Number */}
        <span className={cn("text-[10px] font-black tabular-nums shrink-0 w-5", accentColor, "opacity-40")}>
          {String(index + 1).padStart(2, "0")}
        </span>
        {/* Label + preview */}
        <div className="flex-1 min-w-0">
          <p className={cn("text-xs font-bold uppercase tracking-widest transition-colors",
            isOpen ? "text-foreground" : "text-muted-foreground/60")}>
            {field.label}
          </p>
          {!isOpen && preview && (
            <p className="mt-0.5 text-sm text-muted-foreground/60 truncate">{preview}</p>
          )}
        </div>
        {/* Status dot / chevron */}
        <div className="flex items-center gap-2 shrink-0">
          {filled && !isOpen && (
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          )}
          <ChevronDown className={cn(
            "h-4 w-4 text-muted-foreground/40 transition-transform duration-200",
            isOpen && "rotate-180"
          )} />
        </div>
      </button>

      {/* Expanded content — always rendered, hidden via CSS so state survives close */}
      <div className={cn("px-4 pb-4 pt-1", !isOpen && "hidden")}>
        {(!field.type || field.type === "input") && (
          <input type="text" value={value} onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="w-full bg-transparent border-b border-border pb-2 text-sm text-foreground placeholder:text-muted-foreground/25 focus:outline-none focus:border-primary transition-colors" />
        )}
        {field.type === "textarea" && (
          <TextareaField value={value} onChange={onChange} placeholder={field.placeholder} />
        )}
        {field.type === "chips" && (
          <ChipsField options={field.options!} value={value} onChange={onChange} placeholder={field.placeholder} />
        )}
        {field.type === "list" && (
          <ListField value={value} onChange={onChange} placeholder={field.placeholder} />
        )}
        {field.type === "people" && (
          <PeopleField value={value} onChange={onChange} placeholder={field.placeholder} />
        )}
        {field.type === "cards" && (
          <PeopleField value={value} onChange={onChange} placeholder={field.placeholder} subtitleLabel={field.subtitleLabel} />
        )}
        {field.type === "image" && (
          <ImageField value={value} onChange={onChange} />
        )}
        {field.type === "rating" && (
          <RatingField value={value} onChange={onChange} />
        )}
      </div>
    </div>
  );
}

// ── predefined topic tags per case type ──────────────────────────────────────

const topicTags: Record<CaseType, string[]> = {
  "true-crime": [
    "murder", "serial killer", "mass killing", "massacre", "mass shooting",
    "rape", "sexual assault", "kidnapping", "abduction", "trafficking",
    "domestic violence", "child abuse", "cult", "organized crime",
    "gang violence", "terrorism", "arson", "poisoning", "fraud",
    "corruption", "robbery", "cold case", "wrongful conviction",
    "unsolved", "exoneration", "missing persons",
  ],
  "lore": [
    "haunting", "ghost", "poltergeist", "cryptid", "monster", "creature",
    "witch", "demon", "possession", "curse", "ritual", "sacrifice",
    "urban legend", "folklore", "myth", "disappearance", "supernatural",
    "apparition", "ancient evil", "siren", "shapeshifter", "wendigo",
    "skinwalker", "black-eyed kids", "portal",
  ],
  "conspiracy": [
    "government cover-up", "false flag", "deep state", "assassination",
    "surveillance", "mind control", "secret society", "media manipulation",
    "pharmaceutical", "bioweapon", "alien", "new world order",
    "financial manipulation", "election fraud", "fake death", "psyop",
    "black budget", "mkultra", "shadow government", "freemasonry",
    "population control", "weather manipulation",
  ],
  "missing-persons": [
    "kidnapping", "abduction", "trafficking", "foul play", "cold case",
    "domestic violence", "child abduction", "voluntary disappearance",
    "runaways", "cult involvement", "organized crime", "murder",
    "serial killer", "unsolved", "jane doe", "john doe",
  ],
  "paranormal": [
    "UFO", "UAP", "alien abduction", "haunting", "poltergeist", "cryptid",
    "time anomaly", "possession", "near death experience", "orbs",
    "apparition", "interdimensional", "mass hysteria", "crop circles",
    "black holes", "teleportation", "shadow people", "skinwalker",
    "bermuda triangle", "mothman",
  ],
  "historical": [
    "assassination", "genocide", "war crime", "cover-up", "lost civilization",
    "ancient mystery", "royal mystery", "disaster", "mass grave",
    "plague", "revolution", "buried secret", "artifact", "prophecy",
    "missing artifact", "unsolved death", "execution", "exile",
    "colonialism", "lost city",
  ],
  "research": [
    "forex", "trading", "finance", "economics", "science", "space", "astronomy",
    "biology", "chemistry", "physics", "psychology", "philosophy", "history",
    "technology", "AI", "medicine", "nutrition", "environment", "climate",
    "politics", "sociology", "anthropology", "archaeology", "linguistics",
    "law", "education", "culture",
  ],
  "world-building": [
    "fantasy", "sci-fi", "dystopian", "horror", "mythology", "magic system",
    "space opera", "post-apocalyptic", "steampunk", "cyberpunk", "dark fantasy",
    "high fantasy", "urban fantasy", "political intrigue", "war", "prophecy",
    "chosen one", "anti-hero", "redemption arc", "found family", "heist",
    "romance", "morally grey", "multi-POV",
  ],
};

// ── TagPicker ─────────────────────────────────────────────────────────────────

function TagPicker({ caseType, tags, onChange }: {
  caseType: CaseType; tags: string[]; onChange: (t: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const suggestions = topicTags[caseType];

  const filtered = search.trim()
    ? suggestions.filter(s => s.includes(search.toLowerCase()) && !tags.includes(s))
    : suggestions.filter(s => !tags.includes(s));

  const toggle = (t: string) => {
    if (tags.includes(t)) onChange(tags.filter(x => x !== t));
    else onChange([...tags, t]);
  };

  const addCustom = () => {
    const v = search.trim().toLowerCase();
    if (v && !tags.includes(v)) { onChange([...tags, v]); setSearch(""); }
  };

  const isExactMatch = suggestions.includes(search.trim().toLowerCase()) || tags.includes(search.trim().toLowerCase());

  return (
    <div className="space-y-3">
      {/* Selected tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map(t => (
            <button key={t} onClick={() => toggle(t)}
              className="flex items-center gap-1 rounded-full bg-primary/20 border border-primary/40 px-2.5 py-1 text-xs font-semibold text-primary transition-all hover:bg-primary/10">
              #{t}
              <X className="h-2.5 w-2.5" />
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); isExactMatch ? undefined : addCustom(); } }}
          placeholder="Search topics or type a custom tag..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none"
        />
        {search.trim() && !isExactMatch && (
          <button onClick={addCustom}
            className="shrink-0 rounded-md bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary hover:bg-primary/25 transition-colors">
            + add
          </button>
        )}
      </div>

      {/* Suggestion chips */}
      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
        {filtered.slice(0, 40).map(s => (
          <button key={s} onClick={() => toggle(s)}
            className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground hover:bg-muted/40">
            {s}
          </button>
        ))}
        {filtered.length === 0 && search.trim() && (
          <p className="text-xs text-muted-foreground/40 py-1">
            No matching topics — press Enter or click + add to create a custom tag
          </p>
        )}
      </div>
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────────────────────

const DRAFT_KEY = "warren_draft";

const NewCase = () => {
  const [selectedType, setSelectedType] = useState<CaseType | null>(null);
  const [fields, setFields]   = useState<Record<string, string>>({});
  const [tags, setTags]       = useState<string[]>([]);
  const [openField, setOpenField] = useState<string | null>(null);
  const [isPublic, setIsPublic]   = useState(true);
  const [saving, setSaving]       = useState(false);
  const [hasDraft, setHasDraft]   = useState(false);
  const navigate  = useNavigate();
  const { toast } = useToast();
  const { user }  = useAuth();

  // Load draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.selectedType && templateConfig[draft.selectedType as CaseType]) {
          setSelectedType(draft.selectedType);
          setFields(draft.fields || {});
          setTags(draft.tags || []);
          setIsPublic(draft.isPublic ?? true);
          setOpenField(templateConfig[draft.selectedType as CaseType].fields[0].key);
          setHasDraft(true);
        }
      }
    } catch {}
  }, []);

  // Auto-save draft on any change
  useEffect(() => {
    if (!selectedType) return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ selectedType, fields, tags, isPublic }));
  }, [selectedType, fields, tags, isPublic]);

  const caseId  = useMemo(() => `WR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`, []);
  const dateStr = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date());

  const cfg = selectedType ? templateConfig[selectedType] : null;
  const filledCount = cfg ? cfg.fields.filter(f => isFilled(f, fields[f.key] || "")).length : 0;
  const total = cfg ? cfg.fields.length : 0;

  const handleToggle = (key: string) => setOpenField(prev => prev === key ? null : key);

  const handleSave = async () => {
    if (!user || !selectedType || !cfg) return;
    const titleField   = cfg.fields[0];
    const summaryField = cfg.fields.find(f => f.isSummary);
    setSaving(true);
    try {
      const { error } = await supabase.from("cases").insert({
        title:     fields[titleField.key]?.trim() || "Untitled Case",
        summary:   (summaryField ? fields[summaryField.key] : "") || "",
        type:      selectedType,
        tags,
        fields:   fields,
        user_id:  user.id,
        is_public: isPublic,
      });
      if (error) throw error;
      localStorage.removeItem(DRAFT_KEY);
      toast({ title: "Case filed.", description: `${caseId} is now in the warren.` });
      navigate("/my-warren");
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setSaving(false);
    }
  };

  const sortedTypes = (Object.keys(templateConfig) as CaseType[]).sort((a, b) =>
    templateConfig[a].label.localeCompare(templateConfig[b].label)
  );

  // ── template picker ─────────────────────────────────────────────────────────
  if (!selectedType) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className="hidden lg:block w-44 shrink-0">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Case Types</p>
              <ul className="space-y-0.5">
                {sortedTypes.map((type) => {
                  const c = templateConfig[type];
                  return (
                    <li key={type}>
                      <button
                        onClick={() => { setSelectedType(type); setFields({}); setTags([]); setIsPublic(true); setOpenField(c.fields[0].key); }}
                        className="w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-left text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <c.icon className={cn("h-3.5 w-3.5 shrink-0", c.iconColor)} />
                        {c.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </aside>

            {/* Main */}
            <div className="flex-1 min-w-0">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">Step 01</p>
              <h1 className="mb-2 text-3xl font-bold">What kind of case is this?</h1>
              <p className="mb-10 text-sm text-muted-foreground">
                Pick a type. Each one has its own format, its own questions.
              </p>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sortedTypes.map((type) => {
              const c = templateConfig[type];
              const Icon = c.icon;
              return (
                <TiltCard key={type}>
                  <button
                    onClick={() => { setSelectedType(type); setFields({}); setTags([]); setIsPublic(true); setOpenField(c.fields[0].key); }}
                    className={cn(
                      "group relative w-full overflow-hidden rounded-xl border border-border bg-card text-left transition-all duration-300",
                      c.borderHover
                    )}>
                    <div className={cn("relative flex flex-col items-start gap-3 p-5 bg-gradient-to-br overflow-hidden", c.gradientFrom, c.gradientTo)}>
                      {/* Background print */}
                      <Icon
                        className={cn("pointer-events-none absolute -right-3 -bottom-3 h-28 w-28 opacity-[0.12]", c.iconColor)}
                        strokeWidth={1}
                      />
                      <span className={cn("relative z-10 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-widest", c.badgeColor)}>{c.badge}</span>
                      <div className={cn("relative z-10 mt-1", c.iconColor)}><Icon className="h-9 w-9" strokeWidth={1.5} /></div>
                    </div>
                    <div className="p-5 pt-4">
                      <p className="text-base font-bold text-foreground">{c.label}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.tagline}</p>
                      <div className="mt-4 flex flex-wrap gap-1">
                        {c.fields.map(f => (
                          <span key={f.key} className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground/70">{f.label}</span>
                        ))}
                      </div>
                      <div className={cn("mt-4 flex items-center gap-1 text-xs font-semibold", c.iconColor)}>
                        Open file <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </button>
                </TiltCard>
              );
            })}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ── form ────────────────────────────────────────────────────────────────────
  const Icon = cfg!.icon;

  return (
    <Layout>
      <div className="container py-10">
        <div className="flex gap-8">

          {/* Type sidebar */}
          <aside className="hidden lg:block w-44 shrink-0 pt-14">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Case Types</p>
            <ul className="space-y-0.5">
              {sortedTypes.map((type) => {
                const c = templateConfig[type];
                const isActive = type === selectedType;
                return (
                  <li key={type}>
                    <button
                      onClick={() => { setSelectedType(type); setFields({}); setTags([]); setIsPublic(true); setOpenField(c.fields[0].key); }}
                      className={cn(
                        "w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-left transition-colors",
                        isActive
                          ? cn("font-semibold", c.iconColor, "bg-muted/40")
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <c.icon className={cn("h-3.5 w-3.5 shrink-0", isActive ? c.iconColor : "")} />
                      {c.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Form */}
          <div className="flex-1 min-w-0">
        <div className="mb-8 flex items-center justify-between gap-4">
          <button onClick={() => setSelectedType(null)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Change type
          </button>
          {hasDraft && (
            <span className="flex items-center gap-2 text-xs text-muted-foreground/50">
              Draft auto-saved
              <button
                onClick={() => { localStorage.removeItem(DRAFT_KEY); setSelectedType(null); setFields({}); setTags([]); setIsPublic(true); setHasDraft(false); }}
                className="text-destructive/60 hover:text-destructive transition-colors underline underline-offset-2"
              >
                Discard
              </button>
            </span>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden animate-fade-in">

          {/* Case file header */}
          <div className={cn("relative border-b border-border bg-gradient-to-r px-6 py-5 overflow-hidden", cfg!.gradientFrom, cfg!.gradientTo)}>
            {/* Background print */}
            <Icon
              className={cn("pointer-events-none absolute -right-4 -bottom-6 h-36 w-36 opacity-[0.08]", cfg!.iconColor)}
              strokeWidth={0.75}
            />
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Warren Case File</p>
                <div className={cn("mt-1 flex items-center gap-2 text-lg font-bold", cfg!.iconColor)}>
                  <Icon className="h-5 w-5" /> {cfg!.label}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider">{caseId}</p>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">{dateStr}</p>
              </div>
            </div>
            <div className="relative z-10 mt-4">
              <div className="flex justify-between text-[10px] text-muted-foreground/50 mb-1.5">
                <span>FIELDS COMPLETED</span>
                <span>{filledCount} / {total}</span>
              </div>
              <div className="h-0.5 w-full rounded-full bg-muted/40">
                <div className={cn("h-full rounded-full transition-all duration-500", cfg!.progressColor)}
                  style={{ width: `${total > 0 ? (filledCount / total) * 100 : 0}%` }} />
              </div>
            </div>
          </div>

          {/* Accordion fields */}
          <div className="px-4 py-5 space-y-2">
            {cfg!.fields.map((field, i) => (
              <AccordionField
                key={field.key}
                field={field}
                value={fields[field.key] || ""}
                onChange={v => setFields(p => ({ ...p, [field.key]: v }))}
                index={i}
                isOpen={openField === field.key}
                onToggle={() => handleToggle(field.key)}
                accentColor={cfg!.iconColor}
              />
            ))}

            {/* Tags accordion */}
            <div className={cn(
              "rounded-lg border transition-colors duration-200",
              openField === "__tags__" ? "border-primary/30 bg-muted/20" : "border-border hover:border-border/80"
            )}>
              <button onClick={() => handleToggle("__tags__")}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
                <span className={cn("text-[10px] font-black tabular-nums shrink-0 w-5", cfg!.iconColor, "opacity-40")}>
                  {String(total + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-xs font-bold uppercase tracking-widest transition-colors",
                    openField === "__tags__" ? "text-foreground" : "text-muted-foreground/60")}>
                    Tags
                    <span className="ml-2 normal-case tracking-normal font-normal text-muted-foreground/30">optional</span>
                  </p>
                  {openField !== "__tags__" && tags.length > 0 && (
                    <p className="mt-0.5 text-sm text-muted-foreground/60 truncate">
                      {tags.slice(0, 4).map(t => `#${t}`).join("  ")}{tags.length > 4 ? `  +${tags.length - 4} more` : ""}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {tags.length > 0 && openField !== "__tags__" && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground/40 transition-transform duration-200",
                    openField === "__tags__" && "rotate-180")} />
                </div>
              </button>
              {openField === "__tags__" && (
                <div className="px-4 pb-4 pt-1">
                  <TagPicker caseType={selectedType!} tags={tags} onChange={setTags} />
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border bg-muted/20 px-4 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedType(null)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Discard
              </button>

              {/* Public / Private toggle */}
              <button
                onClick={() => setIsPublic(p => !p)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                  isPublic
                    ? "bg-green-500/10 border-green-500/30 text-green-400"
                    : "bg-muted/40 border-border text-muted-foreground"
                )}
              >
                {isPublic ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                {isPublic ? "Public" : "Private"}
              </button>
            </div>

            <Button variant="hero" onClick={handleSave}
              disabled={saving || !fields[cfg!.fields[0].key]?.trim()} className="gap-2">
              {saving ? (
                <><div className="relative h-4 w-4"><Loader2 className="absolute inset-0 h-4 w-4 animate-spin" /></div> Filing...</>
              ) : (
                <><Icon className="h-4 w-4" /> File This Case</>
              )}
            </Button>
          </div>
          </div>
        </div>
        </div>
      </div>
    </Layout>
  );
};

export default NewCase;
