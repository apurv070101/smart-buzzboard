import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Notice = Tables<"notices">;
export type NoticeCategory = "exam" | "event" | "urgent" | "general";

export function useNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date>(new Date());

  const fetchNotices = useCallback(async () => {
    const { data, error } = await supabase
      .from("notices")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setNotices(data);
      setLastFetchedAt(new Date());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotices();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchNotices, 30000);
    return () => clearInterval(interval);
  }, [fetchNotices]);

  const newNoticesSince = useCallback(
    (since: Date) => notices.filter((n) => new Date(n.created_at) > since).length,
    [notices]
  );

  return { notices, loading, fetchNotices, lastFetchedAt, newNoticesSince };
}

export function useNoticeActions() {
  const createNotice = useCallback(
    async (notice: {
      title: string;
      description: string;
      category: NoticeCategory;
      attachment_url?: string | null;
      attachment_name?: string | null;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("notices").insert({
        ...notice,
        created_by: user.id,
      });
      if (error) throw error;
    },
    []
  );

  const updateNotice = useCallback(
    async (
      id: string,
      updates: {
        title?: string;
        description?: string;
        category?: NoticeCategory;
        attachment_url?: string | null;
        attachment_name?: string | null;
      }
    ) => {
      const { error } = await supabase.from("notices").update(updates).eq("id", id);
      if (error) throw error;
    },
    []
  );

  const deleteNotice = useCallback(async (id: string) => {
    const { error } = await supabase.from("notices").delete().eq("id", id);
    if (error) throw error;
  }, []);

  const uploadAttachment = useCallback(async (file: File) => {
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("attachments").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("attachments").getPublicUrl(path);
    return { url: data.publicUrl, name: file.name };
  }, []);

  return { createNotice, updateNotice, deleteNotice, uploadAttachment };
}
