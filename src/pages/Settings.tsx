import { Layout } from "@/components/Layout";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { User, Lock, Mail, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground/50">{title}</h2>
      <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
        {children}
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, children }: { icon: any; label: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 bg-card px-4 py-3.5">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-sm font-medium flex-1">{label}</span>
      {children}
    </div>
  );
}

export default function Settings() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const [newEmail, setNewEmail] = useState("");
  const [emailSending, setEmailSending] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSending, setPasswordSending] = useState(false);

  const [expandEmail, setExpandEmail] = useState(false);
  const [expandPassword, setExpandPassword] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleEmailChange = async () => {
    if (!newEmail.trim()) return;
    setEmailSending(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    setEmailSending(false);
    if (error) {
      toast({ variant: "destructive", title: "Failed", description: error.message });
    } else {
      toast({ title: "Confirmation sent", description: "Check both your old and new email to confirm the change." });
      setNewEmail(""); setExpandEmail(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Passwords don't match" }); return;
    }
    if (newPassword.length < 6) {
      toast({ variant: "destructive", title: "Password too short", description: "Must be at least 6 characters." }); return;
    }
    setPasswordSending(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordSending(false);
    if (error) {
      toast({ variant: "destructive", title: "Failed", description: error.message });
    } else {
      toast({ title: "Password updated" });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setExpandPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    // Sign out for now — full deletion requires server-side
    await signOut();
  };

  return (
    <Layout>
      <div className="container max-w-xl py-8">
        <div className="mb-6 flex items-center gap-3">
          <h1 className="text-xl font-bold">Settings</h1>
        </div>

        {/* Profile */}
        <Section title="Profile">
          <Link to="/profile" className="flex items-center gap-3 bg-card px-4 py-3.5 hover:bg-muted/40 transition-colors">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium flex-1">Edit Profile</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
          </Link>
        </Section>

        {/* Account */}
        <Section title="Account">
          {/* Email */}
          <div>
            <button
              onClick={() => setExpandEmail(v => !v)}
              className="w-full flex items-center gap-3 bg-card px-4 py-3.5 hover:bg-muted/40 transition-colors text-left"
            >
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Email address</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <ChevronRight className={`h-4 w-4 text-muted-foreground/40 transition-transform ${expandEmail ? "rotate-90" : ""}`} />
            </button>
            {expandEmail && (
              <div className="bg-muted/20 px-4 py-3 space-y-2 border-t border-border">
                <Input
                  type="email"
                  placeholder="New email address"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                />
                <Button size="sm" onClick={handleEmailChange} disabled={emailSending || !newEmail.trim()}>
                  {emailSending ? "Sending..." : "Update email"}
                </Button>
              </div>
            )}
          </div>

          {/* Password */}
          <div>
            <button
              onClick={() => setExpandPassword(v => !v)}
              className="w-full flex items-center gap-3 bg-card px-4 py-3.5 hover:bg-muted/40 transition-colors text-left"
            >
              <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium flex-1">Change password</span>
              <ChevronRight className={`h-4 w-4 text-muted-foreground/40 transition-transform ${expandPassword ? "rotate-90" : ""}`} />
            </button>
            {expandPassword && (
              <div className="bg-muted/20 px-4 py-3 space-y-2 border-t border-border">
                <Input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
                <Button size="sm" onClick={handlePasswordChange} disabled={passwordSending || !newPassword}>
                  {passwordSending ? "Updating..." : "Update password"}
                </Button>
              </div>
            )}
          </div>
        </Section>

        {/* Danger zone */}
        <Section title="Danger Zone">
          <div className="bg-card px-4 py-3.5">
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-3 text-destructive/70 hover:text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">Delete account</span>
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Are you sure? This cannot be undone.</p>
                <div className="flex gap-2">
                  <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>Yes, delete</Button>
                  <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        </Section>
      </div>
    </Layout>
  );
}
