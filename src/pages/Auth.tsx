import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Rabbit, Mail, Eye, EyeOff, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Google G icon SVG
const GoogleIcon = () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

// --- Password strength logic ---
function getStrength(pw: string): { score: number; label: string; color: string } {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;

    if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
    if (score <= 3) return { score, label: "Medium", color: "bg-yellow-400" };
    return { score, label: "Strong", color: "bg-green-500" };
}

// --- Requirement row ---
function Req({ met, label }: { met: boolean; label: string }) {
    return (
        <li className={cn("flex items-center gap-1.5 text-xs transition-colors", met ? "text-green-500" : "text-muted-foreground")}>
            {met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3 opacity-40" />}
            {label}
        </li>
    );
}

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [demoLoading, setDemoLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [isSignUp, setIsSignUp] = useState(false);

    const navigate = useNavigate();
    const { toast } = useToast();

    // Password requirements
    const reqs = useMemo(() => ({
        length: password.length >= 8,
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
    }), [password]);

    const allReqsMet = reqs.length && reqs.number && reqs.special;
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
    const strength = useMemo(() => getStrength(password), [password]);

    const isSubmitDisabled =
        loading || demoLoading || googleLoading ||
        (isSignUp && (!allReqsMet || !passwordsMatch));

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSignUp && !passwordsMatch) {
            toast({ variant: "destructive", title: "Passwords don't match", description: "Please make sure both passwords are identical." });
            return;
        }
        setLoading(true);
        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                toast({ title: "Check your email", description: "We sent you a confirmation link to complete your signup." });
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                navigate("/feed");
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setGoogleLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: `${window.location.origin}/feed` },
            });
            if (error) throw error;
        } catch (error: any) {
            toast({ variant: "destructive", title: "Google sign-in failed", description: error.message });
            setGoogleLoading(false);
        }
    };

    const handleDemo = async () => {
        setDemoLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email: "demo@warren.app", password: "warren2026" });
            if (error) throw error;
            toast({ title: "Welcome to the demo!", description: "You're signed in as the demo user." });
            navigate("/feed");
        } catch (error: any) {
            toast({ variant: "destructive", title: "Demo login failed", description: error.message });
        } finally {
            setDemoLoading(false);
        }
    };

    const switchMode = () => {
        setIsSignUp(!isSignUp);
        setPassword("");
        setConfirmPassword("");
        setShowPassword(false);
        setShowConfirm(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
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
                        {isSignUp ? "Start documenting your investigations" : "Continue down the rabbit hole"}
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
                        {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
                        Continue with Google
                    </Button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex-1 h-px bg-border" />
                        <span>or continue with email</span>
                        <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleAuth} className="space-y-3">
                        {/* Email */}
                        <Input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            disabled={loading || demoLoading || googleLoading}
                        />

                        {/* Password */}
                        <div className="space-y-1.5">
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={isSignUp ? 8 : 1}
                                    autoComplete={isSignUp ? "new-password" : "current-password"}
                                    disabled={loading || demoLoading || googleLoading}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    tabIndex={-1}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>

                            {/* Strength bar — sign up only */}
                            {isSignUp && password.length > 0 && (
                                <div className="space-y-1">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "h-1 flex-1 rounded-full transition-all duration-300",
                                                    i <= strength.score
                                                        ? strength.color
                                                        : "bg-muted"
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <p className={cn(
                                        "text-xs font-medium transition-colors",
                                        strength.label === "Weak" && "text-red-500",
                                        strength.label === "Medium" && "text-yellow-500",
                                        strength.label === "Strong" && "text-green-500",
                                    )}>
                                        {strength.label}
                                    </p>
                                </div>
                            )}

                            {/* Requirements — sign up only */}
                            {isSignUp && (
                                <ul className="space-y-0.5 pt-0.5">
                                    <Req met={reqs.length} label="At least 8 characters" />
                                    <Req met={reqs.number} label="At least one number" />
                                    <Req met={reqs.special} label="At least one special character (!@#$...)" />
                                </ul>
                            )}
                        </div>

                        {/* Confirm password — sign up only */}
                        {isSignUp && (
                            <div className="space-y-1">
                                <div className="relative">
                                    <Input
                                        type={showConfirm ? "text" : "password"}
                                        placeholder="Confirm password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        autoComplete="new-password"
                                        disabled={loading || demoLoading || googleLoading}
                                        className={cn(
                                            "pr-10",
                                            confirmPassword.length > 0 && !passwordsMatch && "border-red-500 focus-visible:ring-red-500"
                                        )}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        tabIndex={-1}
                                        aria-label={showConfirm ? "Hide password" : "Show password"}
                                    >
                                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {confirmPassword.length > 0 && (
                                    <p className={cn(
                                        "text-xs flex items-center gap-1",
                                        passwordsMatch ? "text-green-500" : "text-red-500"
                                    )}>
                                        {passwordsMatch
                                            ? <><Check className="h-3 w-3" /> Passwords match</>
                                            : <><X className="h-3 w-3" /> Passwords don't match</>
                                        }
                                    </p>
                                )}
                            </div>
                        )}

                        <Button
                            className="w-full gap-2"
                            type="submit"
                            disabled={isSubmitDisabled}
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            <Mail className="h-4 w-4" />
                            {isSignUp ? "Create Account" : "Sign In with Email"}
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
                        {demoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="text-base">🐇</span>}
                        Try Demo Account
                    </Button>
                </div>

                {/* Toggle */}
                <p className="text-center text-sm text-muted-foreground mt-5">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                    <button
                        onClick={switchMode}
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
