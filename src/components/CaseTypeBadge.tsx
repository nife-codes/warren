import { type CaseType } from "@/data/mockData";
import { cn } from "@/lib/utils";

const typeConfig: Record<CaseType, { label: string; className: string }> = {
  "true-crime": {
    label: "True Crime",
    className: "bg-destructive/15 text-destructive border-destructive/20",
  },
  "lore": {
    label: "Lore",
    className: "bg-accent/15 text-accent border-accent/20",
  },
  "conspiracy": {
    label: "Conspiracy",
    className: "bg-primary/15 text-primary border-primary/20",
  },
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
