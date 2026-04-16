import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Loader2, Megaphone } from "lucide-react";
import { useNotices } from "@/hooks/use-notices";
import { useAuth } from "@/hooks/use-auth";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { Header } from "@/components/Header";
import { NoticeCard } from "@/components/NoticeCard";
import { NoticeFilters } from "@/components/NoticeFilters";
import type { NoticeCategory } from "@/hooks/use-notices";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Digital Notice Board" },
      { name: "description", content: "View the latest notices, announcements, and updates for students and staff." },
      { property: "og:title", content: "Smart Digital Notice Board" },
      { property: "og:description", content: "View the latest notices, announcements, and updates." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { notices, loading } = useNotices();
  const { user, isAdmin, signOut } = useAuth();
  const { isDark, toggle } = useDarkMode();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<NoticeCategory | "all">("all");

  const filtered = useMemo(() => {
    return notices.filter((n) => {
      const matchesCategory = category === "all" || n.category === category;
      const matchesSearch = !search || n.title.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [notices, search, category]);

  return (
    <div className="min-h-screen transition-theme">
      <Header
        isDark={isDark}
        onToggleDark={toggle}
        isAdmin={isAdmin}
        isLoggedIn={!!user}
        onSignOut={signOut}
      />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Hero */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Megaphone className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Digital Notice Board
          </h1>
          <p className="mt-2 text-muted-foreground">
            Stay updated with the latest announcements, exams, and events
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <NoticeFilters
            search={search}
            onSearchChange={setSearch}
            category={category}
            onCategoryChange={setCategory}
          />
        </div>

        {/* Notices Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Megaphone className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No notices found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {search || category !== "all"
                ? "Try adjusting your filters"
                : "No notices have been posted yet"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((notice) => (
              <NoticeCard key={notice.id} notice={notice} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-xs text-muted-foreground transition-theme">
        <p>Smart Digital Notice Board System &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
