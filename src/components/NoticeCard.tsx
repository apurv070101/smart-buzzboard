import { BookOpen, Calendar as CalendarIcon, PartyPopper, AlertTriangle, Inbox, Paperclip, Download, User as UserIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Notice } from "@/hooks/use-notices";

const categoryConfig = {
  exam: { icon: BookOpen, label: "Exam", colorClass: "bg-notice-exam text-notice-exam-fg" },
  event: { icon: PartyPopper, label: "Event", colorClass: "bg-notice-event text-notice-event-fg" },
  urgent: { icon: AlertTriangle, label: "Urgent", colorClass: "bg-notice-urgent text-notice-urgent-fg" },
  general: { icon: Inbox, label: "General", colorClass: "bg-notice-general text-notice-general-fg" },
};

export function NoticeCard({ notice }: { notice: Notice }) {
  const config = categoryConfig[notice.category];
  const Icon = config.icon;
  const date = new Date(notice.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Card className="animate-card-hover transition-theme overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge className={`${config.colorClass} gap-1 border-0 px-2.5 py-0.5 text-xs font-semibold`}>
              <Icon className="h-3 w-3" />
              {config.label}
            </Badge>
            {notice.category === "urgent" && (
              <span className="h-2 w-2 rounded-full bg-destructive animate-pulse-dot" />
            )}
          </div>
          <div className="flex flex-col items-end gap-1 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-2.5 w-2.5" />
              {date}
            </div>
            {notice.profiles?.full_name && (
              <div className="flex items-center gap-1">
                <UserIcon className="h-2.5 w-2.5" />
                {notice.profiles.full_name}
              </div>
            )}
          </div>
        </div>
        <h3 className="mt-2 text-base font-semibold leading-snug text-card-foreground">{notice.title}</h3>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">{notice.description}</p>
        {notice.attachment_url && (
          <a
            href={notice.attachment_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-accent transition-colors"
          >
            <Paperclip className="h-3 w-3" />
            {notice.attachment_name || "Attachment"}
            <Download className="h-3 w-3 ml-1" />
          </a>
        )}
      </CardContent>
    </Card>
  );
}
