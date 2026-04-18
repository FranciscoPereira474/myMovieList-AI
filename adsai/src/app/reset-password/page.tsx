"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/browser-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * * Resets the user's password.
 *  *
 *  * @param {object} event - The form submission event.
 *  
 * export default function ResetPasswordPage() {
 *   const router = useRouter();
 *   const supabase = createBrowserClient();
 *
 *   // ...
 *
 *   
 *    * Handles the form submission.
 *    *
 *    * @param {React.FormEvent} e - The form submission event.
 *    
 *   const handleSubmit = async (e: React.FormEvent) => {
 *     e.preventDefault();
 *     setError(null);
 *     setMessage(null);
 *
 *     if (password.length < 6) {
 *       setError("Password must be at least 6 characters");
 *       return;
 *     }
 *
 *     if (password !== confirmPassword) {
 *       setError("Passwords do not match");
 *       return;
 *     }
 *
 *     setLoading(true);
 *
 *     try {
 *       const { data, error: updateErr } = await supabase.auth.updateUser({ password });
 *
 *       if (updateErr) {
 *         console.warn("updateUser error:", updateErr);
 *         const errMsg = String(updateErr.message || "");
 *         // Map common AuthApiError to a clearer, user-friendly message
 *         if (errMsg.includes("New password should be different")) {
 *           setError("New password must be different from your previous password.");
 *         } else if (errMsg) {
 *           setError(errMsg);
 *         } else {
 *           setError("Could not update password");
 *         }
 *       } else {
 *         setMessage("Your password has been updated. Redirecting to sign in...");
 *         setPassword("");
 *         setConfirmPassword("");
 *         setTimeout(() => router.push("/login?reset=1"), 1500);
 *       }
 *     } catch (err) {
 *       console.warn(err);
 *       setError("Unexpected error");
 *     } finally {
 *       setLoading(false);
 *     }
 *   };
 *
 *   // ...
 * }
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createBrowserClient();

  const [loadingSession, setLoadingSession] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [hasSession, setHasSession] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Parse tokens from URL fragment or query params
    try {
      const url = new URL(window.location.href);

      let access_token: string | null = null;
      let refresh_token: string | null = null;

      if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        access_token = params.get("access_token");
        refresh_token = params.get("refresh_token");
      }

      // Fallback to search params
      if (!access_token) {
        access_token = url.searchParams.get("access_token") || url.searchParams.get("token");
      }

      if (access_token) {
        setLoadingSession(true);
        supabase.auth
          .setSession({ access_token: access_token || "", refresh_token: refresh_token || "" })
          .then(({ error }) => {
              if (error) {
                console.warn("setSession error:", error);
                setSessionError(error.message || "Could not set session");
              } else {
              setHasSession(true);
            }

            setLoadingSession(false);
            // Clean up URL (remove hash) so the tokens aren't visible
            try {
              history.replaceState(null, "", url.pathname + url.search);
            } catch {}
          })
          .catch((err) => {
            console.warn(err);
            setSessionError("Unexpected error setting session");
            setLoadingSession(false);
          });
      }
    } catch (err) {
      console.warn("reset-password parse error:", err);
    }
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { error: updateErr } = await supabase.auth.updateUser({ password });

      if (updateErr) {
        console.warn("updateUser error:", updateErr);
        const errMsg = String(updateErr.message || "");
        // Map common AuthApiError to a clearer, user-friendly message
        if (errMsg.includes("New password should be different")) {
          setError("New password must be different from your previous password.");
        } else if (errMsg) {
          setError(errMsg);
        } else {
          setError("Could not update password");
        }
      } else {
        setMessage("Your password has been updated. Redirecting to sign in...");
        setPassword("");
        setConfirmPassword("");
        setTimeout(() => router.push("/login?reset=1"), 1500);
      }
    } catch (err) {
      console.warn(err);
      setError("Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <main className="pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex items-center justify-center">
        <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">Reset your password</h1>
          <p className="text-sm text-neutral-400 mt-2">
            {loadingSession
              ? "Processing recovery link..."
              : hasSession
              ? "Set a new password for your account."
              : "Open the password reset link from your email to continue."}
          </p>
        </div>

        {sessionError && (
          <div className="bg-destructive-500/10 border border-destructive-500/20 text-destructive-500 px-4 py-3 rounded-lg text-sm mb-4">
            {sessionError}
          </div>
        )}

        {message && (
          <div className="bg-green-600/10 border border-green-600/20 text-green-300 px-4 py-3 rounded-lg text-sm mb-4">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-destructive-500/10 border border-destructive-500/20 text-destructive-500 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password" className="text-neutral-300 mb-1.5">New password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-neutral-900 border-neutral-800 text-white focus:ring-brand-500 focus:border-brand-500 placeholder-neutral-600"
              placeholder="••••••••"
              disabled={!hasSession}
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-neutral-300 mb-1.5">Confirm password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-neutral-900 border-neutral-800 text-white focus:ring-brand-500 focus:border-brand-500 placeholder-neutral-600"
              placeholder="••••••••"
              disabled={!hasSession}
            />
          </div>

          <Button type="submit" disabled={!hasSession || loading} className="w-full py-3 bg-brand-500 hover:bg-brand-400 text-black font-bold">
            {loading ? "Updating..." : "Update password"}
          </Button>
        </form>
        </div>
      </main>
    </div>
  );
}
