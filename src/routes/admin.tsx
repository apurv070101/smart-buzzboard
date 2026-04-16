import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Loader2, ShieldAlert, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useNotices, useNoticeActions } from "@/hooks/use-notices";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { Header } from "@/components/Header";
import { NoticeForm } from "@/components/NoticeForm";
import { NoticeFilters } from "@/components/NoticeFilters";
import type { Notice, NoticeCategory } from "@/hooks/use-notices";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Notice Board" },
      { name: "description", content: "Manage notices from the admin dashboard." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const { notices, loading: noticesLoading, fetchNotices } = useNotices();
  const { deleteNotice } = useNoticeActions();
  const { isDark, toggle } = useDarkMode();
  const navigate = useNavigate();

  const [formOpen, setFormOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<NoticeCategory | "all">("all");

  const filtered = useMemo(() => {
    return notices.filter((n) => {
      const matchesCategory = category === "all" || n.category === category;
      const matchesSearch = !search || n.title.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [notices, search, category]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteNotice(id);
      await fetchNotices();
    } catch {
      // ignore
    }
    setDeletingId(null);
  };

  const handleFormSuccess = async () => {
    setFormOpen(false);
    setEditingNotice(null);
    await fetchNotices();
  };

  if (authLoading) {
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

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="max-w-sm text-center">
          <CardHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <ShieldAlert className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You don't have admin privileges. Contact the administrator to get access.
            </p>
            <Link to="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-theme">
      <Header isDark={isDark} onToggleDark={toggle} isAdmin={isAdmin} isLoggedIn={!!user} onSignOut={signOut} />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage your notice board</p>
          </div>
          <Button onClick={() => { setEditingNotice(null); setFormOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            New Notice
          </Button>
        </div>

        <div className="mb-6">
          <NoticeFilters search={search} onSearchChange={setSearch} category={category} onCategoryChange={setCategory} />
        </div>

        {noticesLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((notice) => (
              <Card key={notice.id} className="transition-theme">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs capitalize">{notice.category}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(notice.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-medium text-card-foreground truncate">{notice.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{notice.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => { setEditingNotice(notice); setFormOpen(true); }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(notice.id)}
                      disabled={deletingId === notice.id}
                    >
                      {deletingId === notice.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <p className="text-center py-10 text-muted-foreground">No notices found</p>
            )}
          </div>
        )}
      </main>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingNotice ? "Edit Notice" : "Create New Notice"}</DialogTitle>
          </DialogHeader>
          <NoticeForm
            notice={editingNotice}
            onSuccess={handleFormSuccess}
            onCancel={() => { setFormOpen(false); setEditingNotice(null); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
