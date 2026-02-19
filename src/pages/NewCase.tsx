import { Layout } from "@/components/Layout";
import { useState } from "react";
import { type CaseType } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Save, Loader2, Skull, Ghost, Eye, type LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

const templateFields: Record<CaseType, string[]> = {
  "true-crime": ["Case Name", "Victim(s)", "Suspect(s)", "What Happened", "Evidence", "Current Status", "Source"],
  "lore": ["Title", "Origin", "The Claim", "Why People Believe It", "Debunked or Not", "Creep Factor (1-5)", "Source"],
  "conspiracy": ["Title", "The Theory", "Who's Behind It", "The Evidence For It", "The Holes In It", "Status", "Source"],
};

const typeLabels: Record<CaseType, { label: string; icon: LucideIcon }> = {
  "true-crime": { label: "True Crime", icon: Skull },
  "lore": { label: "Lore / Urban Legend", icon: Ghost },
  "conspiracy": { label: "Conspiracy", icon: Eye },
};

const NewCase = () => {
  const [selectedType, setSelectedType] = useState<CaseType | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFieldChange = (field: string, value: string) => {
    setFields((prev) => ({ ...prev, [field]: value }));
  };

  const { user } = useAuth();

  const handleSave = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to save a case." });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('cases').insert({
        title: fields["Title"] || fields["Case Name"] || "Untitled Case",
        summary: fields["What Happened"] || fields["The Claim"] || fields["The Theory"] || "No summary provided",
        type: selectedType,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        content: fields,
        author_id: user.id
      });

      if (error) throw error;

      toast({ title: "Case saved!", description: "Your case has been added to the database." });
      navigate("/profile");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-2xl py-8">
        <h1 className="mb-2 text-2xl font-bold">New Case</h1>
        <p className="mb-8 text-sm text-muted-foreground">Pick a template, then fill in the details</p>

        {!selectedType ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {(Object.keys(typeLabels) as CaseType[]).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setSelectedType(type);
                  setFields({});
                }}
                className="group flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-6 text-center transition-all duration-300 hover:translate-y-[-2px] hover:border-primary/30 hover:warren-glow-sm"
              >
                {(() => { const Icon = typeLabels[type].icon; return <Icon className="h-7 w-7 text-primary" />; })()}
                <span className="font-semibold text-foreground">{typeLabels[type].label}</span>
                <span className="text-xs text-muted-foreground">
                  {templateFields[type].length} fields
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="animate-fade-in">
            <button
              onClick={() => setSelectedType(null)}
              className="mb-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Change template
            </button>

            <div className="mb-6 flex items-center gap-2">
              {(() => { const Icon = typeLabels[selectedType].icon; return <Icon className="h-5 w-5 text-primary" />; })()}
              <h2 className="text-lg font-bold">{typeLabels[selectedType].label}</h2>
            </div>

            <div className="space-y-5">
              {templateFields[selectedType].map((field) => {
                const isLong = ["What Happened", "The Claim", "The Theory", "Why People Believe It", "Evidence", "The Evidence For It", "The Holes In It"].includes(field);
                return (
                  <div key={field}>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">
                      {field}
                    </label>
                    {isLong ? (
                      <textarea
                        rows={4}
                        value={fields[field] || ""}
                        onChange={(e) => handleFieldChange(field, e.target.value)}
                        placeholder={`Enter ${field.toLowerCase()}...`}
                        className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      />
                    ) : (
                      <input
                        type="text"
                        value={fields[field] || ""}
                        onChange={(e) => handleFieldChange(field, e.target.value)}
                        placeholder={`Enter ${field.toLowerCase()}...`}
                        className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    )}
                  </div>
                );
              })}

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">
                  Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Comma-separated tags..."
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">
                  Related Cases
                </label>
                <input
                  type="text"
                  placeholder="Link related cases..."
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={() => setSelectedType(null)}>
                  Cancel
                </Button>
                <Button variant="hero" onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Case
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NewCase;
