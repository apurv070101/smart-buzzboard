import { Link } from "@tanstack/react-router";
import { Moon, Sun, Bell, Shield, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  isDark: boolean;
  onToggleDark: () => void;
  isAdmin: boolean;
  isLoggedIn: boolean;
  newNoticesCount?: number;
  onSignOut?: () => void;
}

export function Header({ isDark, onToggleDark, isAdmin, isLoggedIn, newNoticesCount = 0, onSignOut }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-lg transition-theme">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Megaphone className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">NoticeBoard</span>
        </Link>

        <div className="flex items-center gap-2">
          {newNoticesCount > 0 && (
            <div className="relative flex items-center">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground animate-pulse-dot">
                {newNoticesCount}
              </span>
            </div>
          )}

          <Button variant="ghost" size="icon" onClick={onToggleDark} className="h-9 w-9">
            {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </Button>

          {isAdmin && (
            <Link to="/admin">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                Admin
              </Button>
            </Link>
          )}

          {isLoggedIn ? (
            <Button variant="ghost" size="sm" onClick={onSignOut}>
              Sign Out
            </Button>
          ) : (
            <Link to="/login">
              <Button variant="default" size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
