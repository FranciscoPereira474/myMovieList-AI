"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * * Redirects to the new list page with movie and redirect parameters.
 *  *
 *  * @param {object} router - The router instance.
 *  * @param {object} searchParams - The search parameters object.
 *  
 * export default function ListsNewRedirect(router, searchParams) {
 *   const movie = searchParams?.get("movie");
 *   const redirect = searchParams?.get("redirect") || "/lists";
 *
 *   const params = new URLSearchParams();
 *   if (movie) params.set("movie", movie);
 *   if (redirect) params.set("redirect", redirect);
 *
 *   const target = `/list/new?${params.toString()}`;
 *   // Use replace so history remains clean
 *   router.replace(target);
 * }
 */
export default function ListsNewRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const movie = searchParams?.get("movie");
    const redirect = searchParams?.get("redirect") || "/lists";

    const params = new URLSearchParams();
    if (movie) params.set("movie", movie);
    if (redirect) params.set("redirect", redirect);

    const target = `/list/new?${params.toString()}`;
    // Use replace so history remains clean
    router.replace(target);
  }, [router, searchParams]);

  return null;
}
