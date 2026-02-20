import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Rabbit, Mail } from "lucide-react";

// Google G icon SVG
const GoogleIcon = () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
        <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
        />
        <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
        />
        <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            fill="#FBBC05"
        />
        <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
        />
    </svg>
);

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [demoLoading, setDemoLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                toast({
                    title: "Check your email",
                    description: "We sent you a confirmation link to complete your signup.",
                });
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                navigate("/");
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setGoogleLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/`,
                },
            });
            if (error) throw error;
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Google sign-in failed",
                description: error.message,
            });
            setGoogleLoading(false);
        }
    };

    const handleDemo = async () => {
        setDemoLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: "demo@warren.app",
                password: "warren2026",
            });
            if (error) throw error;
            toast({ title: "Welcome to the demo!", description: "You're signed in as the demo user." });
            navigate("/");
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Demo login failed",
                description: error.message,
            });
        } finally {
            setDemoLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                        <Rabbit className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {isSignUp ? "Create your account" : "Welcome back"}
                    </h1>
                    <p className="mt-1.5 text-sm text-muted-foreground text-center">
                        {isSignUp
                            ? "Start documenting your investigations"
                            : "Continue down the rabbit hole"}
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-border bg-card shadow-sm p-6 space-y-4">

                    {/* Google */}
                    <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={handleGoogle}
                        disabled={googleLoading || loading || demoLoading}
                        type="button"
                    >
                        {googleLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <GoogleIcon />
                        )}
                        Continue with Google
                    </Button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex-1 h-px bg-border" />
                        <span>or continue with email</span>
                        <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* Email / Password form */}
                    <form onSubmit={handleAuth} className="space-y-3">
                        <Input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            disabled={loading || demoLoading || googleLoading}
                        />
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            autoComplete={isSignUp ? "new-password" : "current-password"}
                            disabled={loading || demoLoading || googleLoading}
                        />
                        <Button
                            className="w-full gap-2"
                            type="submit"
                            disabled={loading || demoLoading || googleLoading}
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            <Mail className="h-4 w-4" />
                            {isSignUp ? "Sign Up with Email" : "Sign In with Email"}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex-1 h-px bg-border" />
                        <span>just exploring?</span>
                        <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* Demo Login */}
                    <Button
                        variant="secondary"
                        className="w-full gap-2"
                        onClick={handleDemo}
                        disabled={demoLoading || loading || googleLoading}
                        type="button"
                    >
                        {demoLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <span className="text-base">🐇</span>
                        )}
                        Try Demo Account
                    </Button>
                </div>

                {/* Toggle sign up / sign in */}
                <p className="text-center text-sm text-muted-foreground mt-5">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-primary font-medium hover:underline underline-offset-4"
                        type="button"
                    >
                        {isSignUp ? "Sign in" : "Sign up"}
                    </button>
                </p>
            </div>
        </div>
    );
}
