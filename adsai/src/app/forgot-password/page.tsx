"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * * ForgotPasswordPage component.
 *  *
 *  * @param {object} props - Component properties
 *  * @param {function} props.handleSubmit - Handles form submission
 *  
 * export default function ForgotPasswordPage() {
 *   const [email, setEmail] = useState("");
 *   const [loading, setLoading] = useState(false);
 *   const [message, setMessage] = useState<string | null>(null);
 *   const [error, setError] = useState<string | null>(null);
 *
 *   
 *    * Handles form submission.
 *    *
 *    * @param {React.FormEvent} e - Form event
 *    
 *   const handleSubmit = async (e: React.FormEvent) => {
 *     e.preventDefault();
 *     setError(null);
 *     setMessage(null);
 *     setLoading(true);
 *
 *     try {
 *       const res = await fetch("/api/auth/forgot", {
 *         method: "POST",
 *         headers: { "Content-Type": "application/json" },
 *         body: JSON.stringify({ email }),
 *       });
 *
 *       if (!res.ok) {
 *         const body = await res.json().catch(() => ({}));
 *         throw new Error(body?.error || "Could not send reset email");
 *       }
 *
 *       // Always show a generic message to avoid email enumeration
 *       setMessage(
 *         "If an account with that email exists, a password reset link has been sent. Check your inbox."
 *       );
 *       setEmail("");
 *     } catch (err) {
 *       setError(err instanceof Error ? err.message : "Unexpected error");
 *     } finally {
 *       setLoading(false);
 *     }
 *   };
 *
 *   return (
 *     // ...
 *   );
 * }
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Could not send reset email");
      }

      // Always show a generic message to avoid email enumeration
      setMessage(
        "If an account with that email exists, a password reset link has been sent. Check your inbox."
      );
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <main className="pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex items-center justify-center">
        <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">Forgot your password?</h1>
          <p className="text-sm text-neutral-400 mt-2">Enter your email and we{"'"}ll send a reset link.</p>
        </div>

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
            <Label htmlFor="email" className="text-neutral-300 mb-1.5">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-neutral-900 border-neutral-800 text-white focus:ring-brand-500 focus:border-brand-500 placeholder-neutral-600"
              placeholder="name@example.com"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full py-3 bg-brand-500 hover:bg-brand-400 text-black font-bold">
            {loading ? "Sending..." : "Send reset link"}
          </Button>
        </form>

        <p className="text-sm text-neutral-400 mt-4">
          Remembered your password? <Link href="/login" className="text-white font-bold">Sign in</Link>
        </p>
        </div>
      </main>
    </div>
  );
}
