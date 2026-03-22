import { useState } from "react";

export function FounderBadge() {
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
        <img src="/logo.png" alt="Founder" className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2.5 z-50 w-56 rounded-xl border border-border bg-card p-3.5 shadow-xl pointer-events-none">
          <div className="flex items-center gap-2 mb-1.5">
            <img src="/logo.png" alt="Warren" className="h-4 w-4" />
            <span className="text-xs font-bold text-foreground">Founder of Warren</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            This person built Warren — the rabbit hole starts here.
          </p>
          {/* Caret */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
            style={{ borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "6px solid hsl(var(--border))" }} />
        </div>
      )}
    </div>
  );
}
