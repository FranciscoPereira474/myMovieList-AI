"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@/lib/supabase/browser-client";
import { MainNav } from "./main-nav";

interface MainNavWrapperProps {
  transparent?: boolean;
}

interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
}

/**
 * * Renders the main navigation wrapper component.
 *  *
 *  * @param {MainNavWrapperProps} props - The component's properties.
 *  * @returns {JSX.Element | null} The rendered component or null if loading.
 *  
 * export function MainNavWrapper({ transparent = false }: MainNavWrapperProps) {
 *   const [user, setUser] = useState<User | null>(null);
 *   const [isLoading, setIsLoading] = useState(true);
 *
 *   useEffect(() => {
 *     async function getCurrentUser() {
 *       try {
 *         const supabase = createBrowserClient();
 *
 *         const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
 *
 *         if (authError || !authUser) {
 *           setUser(null);
 *           setIsLoading(false);
 *           return;
 *         }
 *
 *         // Fetch profile data
 *         const { data: profile, error: profileError } = await supabase
 *           .from("profiles")
 *           .select("id, username, avatar_url")
 *           .eq("id", authUser.id)
 *           .single();
 *
 *         if (profileError) {
 *           // Profile might not exist yet or RLS issue - use fallback
 *           console.warn("Could not fetch profile, using fallback:", profileError?.message);
 *           setUser({
 *             id: authUser.id,
 *             name: authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User",
 *             username: authUser.user_metadata?.username || authUser.id.slice(-8),
 *             avatarUrl: authUser.user_metadata?.avatar_url || undefined,
 *           });
 *         } else if (profile) {
 *           setUser({
 *             id: profile.id,
 *             name: profile.username,
 *             username: profile.username,
 *             avatarUrl: profile.avatar_url || undefined,
 *           });
 *         } else {
 *           setUser(null);
 *         }
 *       } catch (error) {
 *         console.error("Error in getCurrentUser:", error);
 *         setUser(null);
 *       } finally {
 *         setIsLoading(false);
 *       }
 *     }
 *
 *     getCurrentUser();
 *
 *     // Listen for auth state changes
 *     const supabase = createBrowserClient();
 *     const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
 *       getCurrentUser();
 *     });
 *
 *     return () => {
 *       subscription.unsubscribe();
 *     };
 *   }, []);
 *
 *   // Don't render until we've checked auth status to prevent flash
 *   if (isLoading) {
 *     return null;
 *   }
 *
 *   return <MainNav transparent={transparent} user={user} />;
 * }
 */
export function MainNavWrapper({ transparent = false }: MainNavWrapperProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const retryRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    async function getCurrentUser() {
      try {
        const supabase = createBrowserClient();

        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Fetch profile data
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .eq("id", authUser.id)
          .single();

        if (profileError) {
          // Profile might not exist yet or RLS issue - use fallback
          console.warn("Could not fetch profile, using fallback:", profileError?.message);
          setUser({
            id: authUser.id,
            name: authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User",
            username: authUser.user_metadata?.username || authUser.id.slice(-8),
            avatarUrl: authUser.user_metadata?.avatar_url || undefined,
          });
          // If profile isn't present yet, schedule a retry to allow DB trigger to complete
          // Retry a few times with exponential backoff
          if (retryRef.current < 3) {
            const delay = 500 * Math.pow(2, retryRef.current); // 500ms, 1000ms, 2000ms
            retryRef.current += 1;
            setTimeout(() => {
              if (mountedRef.current) {
                getCurrentUser();
              }
            }, delay);
          }
        } else if (profile) {
          setUser({
            id: profile.id,
            name: profile.username,
            username: profile.username,
            avatarUrl: profile.avatar_url || undefined,
          });
          // reset retry counter when we successfully fetch a profile
          retryRef.current = 0;
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error in getCurrentUser:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    getCurrentUser();

    // Listen for auth state changes
    const supabase = createBrowserClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      getCurrentUser();
    });

    // Also listen for a custom event dispatched when the profile was updated
    const onProfileUpdated = () => {
      // small delay to allow server-side update to settle
      setTimeout(() => getCurrentUser(), 100);
    };
    window.addEventListener("profile:updated", onProfileUpdated);

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
      window.removeEventListener("profile:updated", onProfileUpdated);
    };
  }, []);

  // Don't render until we've checked auth status to prevent flash
  if (isLoading) {
    return null;
  }

  return <MainNav transparent={transparent} user={user} />;
}