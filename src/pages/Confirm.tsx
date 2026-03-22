import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Status = "loading" | "success" | "error";

export default function Confirm() {
    const [status, setStatus] = useState<Status>("loading");
    const [errorMsg, setErrorMsg] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        // Supabase JS v2 automatically parses the token hash from the URL
        // and fires onAuthStateChange with SIGNED_IN when email is confirmed.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === "SIGNED_IN") {
                setStatus("success");
                // Redirect to feed after a short delay so user can read the message
                setTimeout(() => navigate("/feed", { replace: true }), 2500);
            }
            if (event === "USER_UPDATED") {
                setStatus("success");
                setTimeout(() => navigate("/feed", { replace: true }), 2500);
            }
        });

        // Also check if there's an error in the URL hash (e.g. expired link)
        const hash = window.location.hash;
        if (hash.includes("error=")) {
            const params = new URLSearchParams(hash.replace("#", ""));
            setErrorMsg(params.get("error_description") || "The confirmation link is invalid or has expired.");
            setStatus("error");
        }

        // Fallback: if no hash token present at all, still check existing session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session && status === "loading") {
                setStatus("success");
                setTimeout(() => navigate("/feed", { replace: true }), 2500);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm text-center space-y-6">

                <div className="flex justify-center">
                    <img src="/logo.png" alt="Warren" className="h-10 w-10" />
                </div>

                {status === "loading" && (
                    <>
                        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                        <div>
                            <h1 className="text-xl font-bold">Confirming your email…</h1>
                            <p className="text-sm text-muted-foreground mt-1">Just a moment while we verify your account.</p>
                        </div>
                    </>
                )}

                {status === "success" && (
                    <>
                        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                        <div>
                            <h1 className="text-xl font-bold">Email confirmed!</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                You're all set. Taking you into Warren…
                            </p>
                        </div>
                        {/* Progress bar */}
                        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full animate-[grow_2.5s_ease-in-out_forwards]" style={{ width: "100%" }} />
                        </div>
                    </>
                )}

                {status === "error" && (
                    <>
                        <XCircle className="h-12 w-12 text-destructive mx-auto" />
                        <div>
                            <h1 className="text-xl font-bold">Confirmation failed</h1>
                            <p className="text-sm text-muted-foreground mt-1">{errorMsg}</p>
                        </div>
                        <Button onClick={() => navigate("/auth")} className="w-full">
                            Back to Sign In
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
