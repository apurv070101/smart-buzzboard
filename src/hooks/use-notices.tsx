import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Notice = Tables<"notices"> & {
  profiles: {
    full_name: string | null;
  } | null;
};
export type NoticeCategory = "exam" | "event" | "urgent" | "general";

export function useNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date>(new Date());

  const fetchNotices = useCallback(async () => {
    const { data, error } = await supabase
      .from("notices")
      .select(`
        *,
        profiles (
          full_name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notices:", error);
      return;
    }
    
    if (data) {
      console.log("Notices fetched successfully:", data);
      setNotices(data as unknown as Notice[]);
    }
    setLastFetchedAt(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotices();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("notices-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notices" },
        (payload) => {
          console.log("Realtime update received:", payload);
          fetchNotices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
    // Server-side validation: allowed MIME types and max size
    const ALLOWED_TYPES = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/webp",
    ];
    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error("File type not allowed. Please upload a PDF or image (PNG, JPG, GIF, WEBP).");
    }
    if (file.size > MAX_SIZE) {
      throw new Error("File too large. Maximum size is 5 MB.");
    }

    // Map MIME type to canonical extension (don't trust user filename extension)
    const MIME_TO_EXT: Record<string, string> = {
      "application/pdf": "pdf",
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/gif": "gif",
      "image/webp": "webp",
    };
    const ext = MIME_TO_EXT[file.type] || "bin";
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("attachments")
      .upload(path, file, { contentType: file.type });
    if (error) throw error;

    // Since bucket is private, generate a signed URL (1 year expiry)
    const { data } = await supabase.storage
      .from("attachments")
      .createSignedUrl(path, 60 * 60 * 24 * 365);
    if (!data?.signedUrl) throw new Error("Failed to generate download URL");
    return { url: data.signedUrl, name: file.name };
  }, []);

  return { createNotice, updateNotice, deleteNotice, uploadAttachment };
}
