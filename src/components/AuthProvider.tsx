import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    hasUsername: boolean;
    setHasUsername: (val: boolean) => void;
    isDemo: boolean;
    isFounder: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    hasUsername: false,
    setHasUsername: () => { },
    isDemo: false,
    isFounder: false,
    signOut: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasUsername, setHasUsername] = useState(false);
    const [isDemo, setIsDemo] = useState(false);
    const [isFounder, setIsFounder] = useState(false);

    const checkProfile = async (userId: string) => {
        const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle();
        setHasUsername(!!data?.username);
        setIsDemo(data?.is_demo === true);
        setIsFounder(data?.is_founder === true);
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) checkProfile(session.user.id);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) checkProfile(session.user.id);
            else { setHasUsername(false); setIsDemo(false); setIsFounder(false); }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ session, user, loading, hasUsername, setHasUsername, isDemo, isFounder, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
