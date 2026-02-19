import { Heart, Bookmark } from "lucide-react";
import { type CaseItem } from "@/data/mockData";
import { CaseTypeBadge } from "./CaseTypeBadge";
import { Link } from "react-router-dom";
import { useState } from "react";

export function CaseCard({ caseItem }: { caseItem: CaseItem }) {
  const [liked, setLiked] = useState(caseItem.liked);
  const [saved, setSaved] = useState(caseItem.saved);
  const [likeCount, setLikeCount] = useState(caseItem.likes);

  return (
    <Link
      to={`/case/${caseItem.id}`}
      className="group block rounded-lg border border-border bg-card p-5 transition-all duration-300 hover:translate-y-[-2px] hover:border-primary/30 hover:warren-glow-sm"
    >
      <div className="mb-3 flex items-center justify-between">
        <CaseTypeBadge type={caseItem.type} />
        <span className="text-xs text-muted-foreground">{caseItem.createdAt}</span>
      </div>

      <h3 className="mb-2 text-lg font-bold leading-tight text-foreground group-hover:text-primary transition-colors duration-200">
        {caseItem.title}
      </h3>

      <p className="mb-4 text-sm leading-relaxed text-muted-foreground line-clamp-2">
        {caseItem.summary}
      </p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {caseItem.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={caseItem.author.avatar}
            alt={caseItem.author.username}
            className="h-6 w-6 rounded-full bg-muted"
          />
          <span className="text-xs font-medium text-muted-foreground">
            {caseItem.author.username}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              setLiked(!liked);
              setLikeCount((c) => (liked ? c - 1 : c + 1));
            }}
            className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            <Heart className={`h-3.5 w-3.5 ${liked ? "fill-primary text-primary" : ""}`} />
            {likeCount}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              setSaved(!saved);
            }}
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            <Bookmark className={`h-3.5 w-3.5 ${saved ? "fill-primary text-primary" : ""}`} />
          </button>
        </div>
      </div>
    </Link>
  );
}
