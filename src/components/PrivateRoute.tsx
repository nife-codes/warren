import { Navigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";

export function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 rounded-full border-2 border-muted border-t-primary animate-spin" />
            </div>
        );
    }

    if (!user) return <Navigate to="/auth" replace />;

    return <>{children}</>;
}
