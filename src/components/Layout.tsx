import { Link, useLocation } from "react-router-dom";
import { Rabbit, Plus, Home, User, Search, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { to: "/feed", label: "Feed", icon: Home },
  { to: "/my-warren", label: "My Warren", icon: Rabbit },
  { to: "/new-case", label: "New Case", icon: Plus },
  { to: "/profile", label: "Profile", icon: User },
];

const comingSoon = [
  "Graph View",
  "Forking",
  "Collab",
  "Version Control",
  "Timeline",
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-foreground">
            <Rabbit className="h-5 w-5 text-primary" />
            <span>Warren</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
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
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="flex items-center justify-around border-t border-border py-1 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors",
                location.pathname === item.to
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
