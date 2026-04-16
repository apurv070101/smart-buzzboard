import { Search, BookOpen, PartyPopper, AlertTriangle, Inbox, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { NoticeCategory } from "@/hooks/use-notices";

const categories: { value: NoticeCategory | "all"; label: string; icon: React.ElementType }[] = [
  { value: "all", label: "All", icon: LayoutGrid },
  { value: "exam", label: "Exam", icon: BookOpen },
  { value: "event", label: "Event", icon: PartyPopper },
  { value: "urgent", label: "Urgent", icon: AlertTriangle },
  { value: "general", label: "General", icon: Inbox },
];

interface NoticeFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  category: NoticeCategory | "all";
  onCategoryChange: (v: NoticeCategory | "all") => void;
}

export function NoticeFilters({ search, onSearchChange, category, onCategoryChange }: NoticeFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search notices..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const active = category === cat.value;
          return (
            <Button
              key={cat.value}
              variant={active ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(cat.value)}
              className="gap-1.5 text-xs"
            >
              <Icon className="h-3.5 w-3.5" />
              {cat.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
