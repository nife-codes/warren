import { type CaseType } from "@/types/case";
import { cn } from "@/lib/utils";

const typeConfig: Record<CaseType, { label: string; className: string }> = {
  "true-crime":      { label: "True Crime",        className: "bg-rose-500/15 text-rose-400 border-rose-500/20" },
  "lore":            { label: "Lore",               className: "bg-violet-500/15 text-violet-400 border-violet-500/20" },
  "conspiracy":      { label: "Conspiracy",         className: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  "missing-persons": { label: "Missing Persons",    className: "bg-sky-500/15 text-sky-400 border-sky-500/20" },
  "paranormal":      { label: "Paranormal",         className: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20" },
  "historical":      { label: "Historical Mystery", className: "bg-orange-500/15 text-orange-400 border-orange-500/20" },
  "research":        { label: "Research",           className: "bg-teal-500/15 text-teal-400 border-teal-500/20" },
  "world-building":  { label: "World Building",     className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
};

export function CaseTypeBadge({ type, className }: { type: CaseType; className?: string }) {
  const config = typeConfig[type];
  return (
    <span className={cn(
      "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold",
      config.className,
      className
    )}>
      {config.label}
    </span>
  );
}
