import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Rabbit } from "lucide-react";

const Landing = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="animate-fade-in flex flex-col items-center text-center" style={{ animationDelay: "0ms" }}>
        <div className="mb-8 animate-float">
          <Rabbit className="h-24 w-24 text-primary sm:h-32 sm:w-32" />
        </div>

        <h1 className="mb-3 text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl">
          Warren
        </h1>

        <p className="mb-2 text-lg text-muted-foreground sm:text-xl">
          Your rabbit hole, organized.
        </p>

        <p className="mb-10 max-w-md text-sm text-muted-foreground/70 leading-relaxed">
          Document cases, explore theories, and go deeper together.
          For the curious, the obsessed, and the slightly unhinged.
        </p>

        <div className="flex items-center gap-3">
          <Button variant="hero" size="lg" asChild>
            <Link to="/feed">Sign Up</Link>
          </Button>
          <Button variant="hero-outline" size="lg" asChild>
            <Link to="/feed">Log In</Link>
          </Button>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
          {["Graph View", "Forking", "Collab", "Version Control", "Timeline"].map((feat) => (
            <span
              key={feat}
              className="rounded-md border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground/40"
            >
              {feat} — coming soon
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Landing;
