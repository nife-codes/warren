import { Layout } from "@/components/Layout";
import { CaseCard } from "@/components/CaseCard";
import { myCases } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const MyWarren = () => {
  return (
    <Layout>
      <div className="container max-w-4xl py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Warren</h1>
            <p className="text-sm text-muted-foreground">Your personal case library</p>
          </div>
          <Button variant="hero" size="sm" asChild>
            <Link to="/new-case">
              <Plus className="h-4 w-4" />
              New Case
            </Link>
          </Button>
        </div>

        {myCases.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {myCases.map((c, i) => (
              <div key={c.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <CaseCard caseItem={c} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="mb-4 text-5xl">🐰</span>
            <h2 className="mb-2 text-xl font-bold">Your warren is empty</h2>
            <p className="mb-6 text-sm text-muted-foreground">Start documenting your first case</p>
            <Button variant="hero" asChild>
              <Link to="/new-case">Create your first case</Link>
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyWarren;
