"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/browser-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateUsernameForRegistration } from "@/app/actions/auth";

interface AuthFormProps {
  mode: "login" | "register";
}

/**
 * * AuthForm component
 *  *
 *  * @param {AuthFormProps} props - Component props
 *  * @returns {JSX.Element} Form element
 *  
 * export function AuthForm({ mode }: AuthFormProps) {
 *   // ... (rest of the code remains the same)
 * }
 */
export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        const redirectTo = searchParams?.get("redirect") || "/";
        router.push(redirectTo);
        router.refresh();
      } else {
        // Register flow - validate username first
        const usernameValidation = await validateUsernameForRegistration(username);
        if (!usernameValidation.valid) {
          throw new Error(usernameValidation.error || "Invalid username");
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
            },
          },
        });

        if (error) throw error;

        // Check if user already exists (Supabase returns a user with identities = [] for existing emails)
        // This is a security feature to prevent email enumeration, but we want to warn users
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          throw new Error("An account with this email already exists. Please sign in instead.");
        }

        // Profiles are auto-created by the DB trigger on auth.user insert.
        // No client-side insert is required here to avoid unauthenticated REST calls.

        // Redirect to login and show confirmation message
        router.push("/login?registered=1");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setError(null);
    setLoading(true);

    try {
      const redirectParam = searchParams?.get("redirect") || "/";
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectParam)}`,
        },
      });

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  const isLogin = mode === "login";
  const registeredParam = searchParams?.get("registered");
  const showConfirmMessage = isLogin && registeredParam === "1";

  return (
    <div className="w-full max-w-sm space-y-8">
      {/* Mobile Header (Visible only on mobile to show logo) */}
      <div className="lg:hidden text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-brand-500 rounded-md flex items-center justify-center text-black font-bold text-lg">
            C
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            CineLog
          </span>
        </Link>
      </div>

      {/* Form Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white tracking-tight">
          {isLogin ? "Welcome back" : "Create an account"}
        </h2>
        <p className="mt-2 text-sm text-neutral-400">
          {isLogin
            ? "Enter your details to sign in to your account."
            : "Enter your details to create your account."}
        </p>
      </div>

      {/* Social Auth */}
      <div>
        <Button
          type="button"
          variant="outline"
          className="w-full bg-neutral-900 hover:bg-neutral-800 border-neutral-800 hover:border-neutral-700 text-white py-2.5"
          onClick={() => handleOAuthSignIn("google")}
          disabled={loading}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span>Continue with Google</span>
        </Button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-800" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-neutral-950 text-neutral-500 uppercase text-xs font-bold tracking-wider">
            Or continue with
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {showConfirmMessage && (
        <div className="bg-green-600/10 border border-green-600/20 text-green-300 px-4 py-3 rounded-lg text-sm">
          Confirm your account. Check your email for a confirmation link.
        </div>
      )}
      {error && (
        <div className="bg-destructive-500/10 border border-destructive-500/20 text-destructive-500 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Username (only for register) */}
        {!isLogin && (
          <div>
            <Label htmlFor="username" className="text-neutral-300 mb-1.5">
              Username
            </Label>
            <Input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-neutral-900 border-neutral-800 text-white focus:ring-brand-500 focus:border-brand-500 placeholder-neutral-600"
              placeholder="cinephile_123"
            />
          </div>
        )}

        {/* Email */}
        <div>
          <Label htmlFor="email" className="text-neutral-300 mb-1.5">
            Email address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-neutral-900 border-neutral-800 text-white focus:ring-brand-500 focus:border-brand-500 placeholder-neutral-600"
            placeholder="name@example.com"
          />
        </div>

        {/* Password */}
        <div>
          <Label htmlFor="password" className="text-neutral-300 mb-1.5">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-neutral-900 border-neutral-800 text-white focus:ring-brand-500 focus:border-brand-500 placeholder-neutral-600"
            placeholder="••••••••"
          />
          {isLogin && (
            <div className="mt-1 text-right">
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-brand-400 hover:text-brand-300"
              >
                Forgot password?
              </Link>
            </div>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-brand-500 hover:bg-brand-400 text-black font-bold"
        >
          {loading
            ? "Loading..."
            : isLogin
            ? "Sign In"
            : "Create Account"}
        </Button>
      </form>

      {/* Toggle to Register/Login */}
      <p className="text-center text-sm text-neutral-400">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <Link
          href={`${isLogin ? "/register" : "/login"}${searchParams?.get("redirect") ? `?redirect=${encodeURIComponent(searchParams.get("redirect")!)}` : ""}`}
          className="font-bold text-white hover:text-brand-400 transition-colors"
        >
          {isLogin ? "Sign up for free" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}
