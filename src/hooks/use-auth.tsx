import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfileData = useCallback(async (userId: string) => {
    try {
      // Run both checks in parallel to save time
      const [roleResult, profileResult] = await Promise.all([
        supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
        supabase.from("profiles").select("full_name, avatar_url").eq("user_id", userId).single()
      ]);

      setIsAdmin(!!roleResult.data);
      
      if (profileResult.data) {
        setProfile(profileResult.data);
      }
    } catch (error) {
      console.error("Error fetching auth data:", error);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initializeSession() {
      // 1. Get initial session
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      
      if (!mounted) return;

      if (initialSession) {
        setSession(initialSession);
        setUser(initialSession.user);
        await fetchProfileData(initialSession.user.id);
      }
      
      setLoading(false);

      // 2. Listen for future changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mounted) return;

          // Only refetch if the session/user actually changed to avoid redundant work
          if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
              await fetchProfileData(session.user.id);
            }
          } else if (event === "SIGNED_OUT") {
            setSession(null);
            setUser(null);
            setProfile(null);
            setIsAdmin(false);
          }
          
          setLoading(false);
        }
      );

      return subscription;
    }

    const subscriptionPromise = initializeSession();

    return () => {
      mounted = false;
      subscriptionPromise.then(sub => sub?.unsubscribe());
    };
  }, [fetchProfileData]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    // Clear state first for instant UI response
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);

    // Then tell Supabase to sign out
    try {
      await supabase.auth.signOut();
      // Force a reload to ensure all state is definitely reset
      window.location.reload();
    } catch (e) {
      console.error("Sign out error:", e);
      // Fallback reload anyway
      window.location.reload();
    }
  }, []);

  return { user, session, profile, isAdmin, loading, signIn, signUp, signOut };
}
