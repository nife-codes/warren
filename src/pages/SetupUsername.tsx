import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SetupUsername() {
    const { user, setHasUsername } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [status, setStatus] = useState<"idle" | "checking" | "taken" | "available">("idle");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (username.trim().length < 2) { setStatus("idle"); return; }
        setStatus("checking");
        const t = setTimeout(async () => {
            const { data } = await supabase
                .from("profiles")
                .select("id")
                .eq("username", username.trim())
                .maybeSingle();
            setStatus(data ? "taken" : "available");
        }, 500);
        return () => clearTimeout(t);
    }, [username]);

    const handleSave = async () => {
        if (!user || status !== "available") return;
        setSaving(true);

        const { error } = await supabase
            .from("profiles")
            .upsert({ id: user.id, username: username.trim().toLowerCase() }, { onConflict: "id" });

        if (error) {
            console.error("Failed to save username:", error);
            setSaving(false);
            return;
        }

        setHasUsername(true);
        navigate("/feed");
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm space-y-6 text-center">
                <img src="/logo.png" alt="Warren" className="mx-auto h-10 w-10" />

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Pick a username</h1>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                        This is how others will see you on Warren.
                    </p>
                </div>

                <div className="space-y-1 text-left">
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                            className={cn(
                                "pr-10",
                                status === "taken" && "border-red-500 focus-visible:ring-red-500",
                                status === "available" && "border-green-500 focus-visible:ring-green-500",
                            )}
                            autoFocus
                        />
                        {status === "checking" && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="h-4 w-4 rounded-full border-2 border-muted border-t-primary animate-spin" />
                            </div>
                        )}
                        {status === "available" && <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
                        {status === "taken" && <X className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />}
                    </div>
                    {status === "taken" && <p className="text-xs text-red-500">Username is already taken</p>}
                    {status === "available" && <p className="text-xs text-green-500">Username is available</p>}
                </div>

                <Button
                    className="w-full"
                    onClick={handleSave}
                    disabled={status !== "available" || saving}
                >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
                </Button>
            </div>
        </div>
    );
}
