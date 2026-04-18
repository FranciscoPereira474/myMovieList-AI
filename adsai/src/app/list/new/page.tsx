"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/browser-client";
import { ListEditor } from "../_components/list-editor";

/**
 * * NewListPage component.
 *  *
 *  * @param {object} props - Component properties
 *  * @param {object} props.router - Router instance
 *  * @returns {JSX.Element | null} The rendered component or null if not authenticated
 */
export default function NewListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Preserve the current search params when redirecting to login so we can return here
        const currentPath = `/list/new${window.location.search || ""}`;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
        return;
      }

      setIsAuthenticated(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <main className="pt-24 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-[50vh]">
          <div className="loading-overlay" role="status" aria-live="polite">
            <div className="spinner" aria-hidden="true" />
            <span className="sr-only">Loading</span>
          </div>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Read optional query params to pre-fill editor or handle redirect
  const movieId = searchParams?.get("movie") || undefined;
  const redirect = searchParams?.get("redirect") || undefined;

  return (
    <main className="pt-24 pb-32 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <ListEditor initialMovieId={movieId} redirect={redirect} />
    </main>
  );
}
