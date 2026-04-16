import { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { Notice, NoticeCategory } from "@/hooks/use-notices";
import { useNoticeActions } from "@/hooks/use-notices";

interface NoticeFormProps {
  notice?: Notice | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function NoticeForm({ notice, onSuccess, onCancel }: NoticeFormProps) {
  const { createNotice, updateNotice, uploadAttachment } = useNoticeActions();
  const [title, setTitle] = useState(notice?.title ?? "");
  const [description, setDescription] = useState(notice?.description ?? "");
  const [category, setCategory] = useState<NoticeCategory>(notice?.category ?? "general");
  const [attachmentUrl, setAttachmentUrl] = useState(notice?.attachment_url ?? "");
  const [attachmentName, setAttachmentName] = useState(notice?.attachment_name ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadAttachment(file);
      setAttachmentUrl(result.url);
      setAttachmentName(result.name);
    } catch {
      setError("Failed to upload file");
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        attachment_url: attachmentUrl || null,
        attachment_name: attachmentName || null,
      };
      if (notice) {
        await updateNotice(notice.id, payload);
      } else {
        await createNotice(payload);
      }
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save notice");
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notice title" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Notice description..."
          rows={4}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Category</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as NoticeCategory)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="exam">Exam</SelectItem>
            <SelectItem value="event">Event</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Attachment (PDF/Image)</Label>
        {attachmentUrl ? (
          <div className="flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm">
            <span className="truncate flex-1 text-secondary-foreground">{attachmentName}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => { setAttachmentUrl(""); setAttachmentName(""); }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <div className="relative">
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.gif,.webp"
              onChange={handleFileUpload}
              className="absolute inset-0 cursor-pointer opacity-0"
              disabled={uploading}
            />
            <div className="flex items-center justify-center gap-2 rounded-md border border-dashed px-4 py-3 text-sm text-muted-foreground hover:bg-accent transition-colors">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? "Uploading..." : "Click to upload a file"}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {notice ? "Update Notice" : "Create Notice"}
        </Button>
      </div>
    </form>
  );
}
