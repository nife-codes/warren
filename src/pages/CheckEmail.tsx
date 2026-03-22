import { useLocation, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckEmail() {
    const location = useLocation();
    const navigate = useNavigate();
    const email = (location.state as any)?.email || "your inbox";

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm text-center space-y-6">

                {/* Logo */}
                <div className="flex justify-center">
                    <img src="/logo.png" alt="Warren" className="h-10 w-10" />
                </div>

                {/* Icon */}
                <div className="flex justify-center">
                    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/5 border border-border">
                        <Mail className="h-9 w-9 text-primary" />
                    </div>
                </div>

                {/* Text */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">Check your inbox</h1>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        We've sent a confirmation link to{" "}
                        <span className="font-medium text-foreground">{email}</span>.
                        <br />
                        Click the link in the email to activate your account.
                    </p>
                </div>

                {/* Tips */}
                <div className="rounded-xl border border-border bg-muted/30 p-4 text-left space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Didn't get it?</p>
                    <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                        <li>Check your spam or junk folder</li>
                        <li>Make sure you entered the right email</li>
                        <li>Wait up to a few minutes for delivery</li>
                    </ul>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate("/auth")}
                    >
                        Back to Sign In
                    </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                    You can close this tab and come back once you've confirmed your email.
                </p>
            </div>
        </div>
    );
}
