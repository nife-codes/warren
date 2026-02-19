import { Layout } from "@/components/Layout";
import { mockCases } from "@/data/mockData";
import { CaseTypeBadge } from "@/components/CaseTypeBadge";
import { useParams, Link } from "react-router-dom";
import { Heart, Bookmark, Share2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const CasePage = () => {
  const { id } = useParams();
  const caseItem = mockCases.find((c) => c.id === id);
  const { toast } = useToast();
  const [liked, setLiked] = useState(caseItem?.liked ?? false);
  const [saved, setSaved] = useState(caseItem?.saved ?? false);

  if (!caseItem) {
    return (
      <Layout>
        <div className="container flex flex-col items-center justify-center py-24 text-center">
          <span className="mb-4 text-5xl">🕳️</span>
          <h1 className="mb-2 text-xl font-bold">Case not found</h1>
          <p className="mb-6 text-sm text-muted-foreground">This rabbit hole doesn't exist</p>
          <Button variant="hero" asChild>
            <Link to="/feed">Back to Feed</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied!", description: "Share this case with fellow investigators." });
  };

  return (
    <Layout>
      <div className="container max-w-2xl py-8">
        <Link to="/feed" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Feed
        </Link>

        <article className="animate-fade-in">
          <div className="mb-4 flex items-center gap-3">
            <CaseTypeBadge type={caseItem.type} />
            <span className="text-xs text-muted-foreground">{caseItem.createdAt}</span>
          </div>

          <h1 className="mb-4 text-3xl font-extrabold leading-tight">{caseItem.title}</h1>

          <p className="mb-6 text-base leading-relaxed text-muted-foreground">{caseItem.summary}</p>

          <div className="mb-6 flex items-center gap-4">
            <Link to="/profile" className="flex items-center gap-2">
              <img src={caseItem.author.avatar} alt={caseItem.author.username} className="h-8 w-8 rounded-full bg-muted" />
              <span className="text-sm font-semibold">{caseItem.author.username}</span>
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setLiked(!liked); }}
                className={liked ? "text-primary" : "text-muted-foreground"}
              >
                <Heart className={`h-4 w-4 ${liked ? "fill-primary" : ""}`} />
                {caseItem.likes + (liked && !caseItem.liked ? 1 : 0)}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSaved(!saved)}
                className={saved ? "text-primary" : "text-muted-foreground"}
              >
                <Bookmark className={`h-4 w-4 ${saved ? "fill-primary" : ""}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare} className="text-muted-foreground">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-1.5">
            {caseItem.tags.map((tag) => (
              <span key={tag} className="rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>

          <div className="space-y-6 rounded-lg border border-border bg-card p-6">
            {Object.entries(caseItem.content).map(([key, value]) => (
              <div key={key}>
                <h3 className="mb-1.5 text-sm font-bold text-primary">{key}</h3>
                <p className="text-sm leading-relaxed text-foreground/80">{value}</p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </Layout>
  );
};

export default CasePage;
