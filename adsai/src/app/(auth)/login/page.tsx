import React, { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "../_components/auth-form";

export const metadata: Metadata = {
  title: "Sign In | CineLog",
  description: "Sign in to your CineLog account to track and discover movies.",
};

// This page uses client hooks (useSearchParams) inside `AuthForm`. Wrap the
// client component in a Suspense boundary so Next can properly handle the
// client-side navigation API during rendering.
/**
 * * Renders the login page with a suspense component that displays a loading indicator
 *  * while the AuthForm is being loaded.
 *  *
 *  * @returns {JSX.Element} The rendered LoginPage component.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-sm h-40" />}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
