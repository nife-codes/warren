import { useState } from "react";

export function FounderBadge({ size = "md" }: { size?: "sm" | "md" }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-flex items-center">
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-center rounded-full transition-opacity hover:opacity-100 opacity-80"
        aria-label="Founder of Warren"
      >
        <img src="/logo.png" alt="Founder" className={size === "sm" ? "h-5 w-5" : "h-7 w-7"} />
      </button>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2.5 z-50 w-52 rounded-xl border border-border bg-card p-3.5 shadow-xl pointer-events-none">
          {/* Caret */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0"
            style={{ borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderBottom: "6px solid hsl(var(--border))" }} />
          <div className="flex items-center gap-2 mb-1.5">
            <img src="/logo.png" alt="Warren" className="h-4 w-4" />
            <span className="text-xs font-bold text-foreground">Founder</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            coolest person on here.
          </p>
        </div>
      )}
    </div>
  );
}
