"use client";

import { useEffect } from "react";

interface Props {
  to: string;
}

/**
 * * Redirects the user to a specified URL.
 *  *
 *  * @param {Props} props - The component's properties, including the URL to redirect to.
 *  * @returns {void}
 *  
 * export default function ClientRedirect({ to }: Props) {
 *   useEffect(() => {
 *     try {
 *       // Use location.replace to avoid adding history entry
 *       window.location.replace(to);
 *     } catch (e) {
 *       // Fallback: location.href
 *       try {
 *         window.location.href = to;
 *       } catch {}
 *     }
 *   }, [to]);
 *
 *   // Render nothing to avoid showing an interstitial page — redirect happens on mount
 *   return null;
 * }
 */
export default function ClientRedirect({ to }: Props) {
  useEffect(() => {
    try {
      // Use location.replace to avoid adding history entry
      window.location.replace(to);
    } catch {
      // Fallback: location.href
      try {
        window.location.href = to;
      } catch {}
    }
  }, [to]);

  // Render nothing to avoid showing an interstitial page — redirect happens on mount
  return null;
}
