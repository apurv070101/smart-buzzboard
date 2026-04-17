import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { User, Mail, Shield, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/Header";
import { useDarkMode } from "@/hooks/use-dark-mode";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Notice Board" },
      { name: "description", content: "View and manage your account information." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, isAdmin, loading, signOut } = useAuth();
  const { isDark, toggle } = useDarkMode();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate({ to: "/login" });
    return null;
  }

  return (
    <div className="min-h-screen transition-theme">
      <Header 
        isDark={isDark} 
        onToggleDark={toggle} 
        isAdmin={isAdmin} 
        isLoggedIn={!!user} 
        onSignOut={signOut} 
      />

      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Board
            </Button>
          </Link>
        </div>

        <Card className="transition-theme">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <User className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">{profile?.full_name || "User Profile"}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-secondary p-2">
                    <Mail className="h-4 w-4 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Email Address</p>
                    <p className="text-sm font-semibold">{user.email}</p>
                  </div>
                </div>
                {user.email_confirmed_at && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-0">
                    Verified
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-secondary p-2">
                    <Shield className="h-4 w-4 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Account Role</p>
                    <p className="text-sm font-semibold capitalize">{isAdmin ? "Administrator" : "User"}</p>
                  </div>
                </div>
                <Badge variant={isAdmin ? "default" : "outline"}>
                  {isAdmin ? "Admin" : "Standard"}
                </Badge>
              </div>

              <div className="flex items-center justify-between pb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-secondary p-2">
                    <User className="h-4 w-4 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Full Name</p>
                    <p className="text-sm font-semibold">{profile?.full_name || "Not set"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={async () => {
                  await signOut();
                  navigate({ to: "/login" });
                }}
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
