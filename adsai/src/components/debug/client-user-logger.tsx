"use client";

import { useEffect } from "react";

interface Props {
  user: { id: string; username: string; avatar_url: string | null } | null;
}

/**
 * * Logs the authenticated user information to the browser console for debugging purposes.
 *  *
 *  * @param {Object} user - The current user object, expected to contain user data.
 *  * @returns {null}
 */
export default function ClientUserLogger({ user }: Props) {
  useEffect(() => {
    // Print the authenticated user info to the browser console for debugging
    try {
      console.log("[ClientUserLogger] currentUser:", user);
    } catch (e) {
      console.warn("[ClientUserLogger] error logging user:", e);
    }
  }, [user]);

  return null;
}
