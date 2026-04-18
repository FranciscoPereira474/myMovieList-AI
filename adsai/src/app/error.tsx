"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * * Displays an error message to the user with options to try again or return home.
 *  *
 *  * @param {Object} props - The component's properties.
 *  * @param {Error} props.error - The error object that occurred.
 *  * @param {function} props.reset - A function to reset the application state.
 *  *
 *  * @returns {JSX.Element} The JSX element representing the error message.
 */
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  // Keep console logging for server-side diagnostics during development
  console.error("Unhandled error in route:", error);

  return (
    <main className="max-w-3xl mx-auto px-4 py-28 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-900 text-destructive-500 mb-6 border border-neutral-800 mx-auto">
        <AlertCircle size={28} />
      </div>

      <h1 className="text-2xl font-bold text-white mb-3">Something went wrong</h1>

      <p className="text-neutral-400 mb-6 max-w-lg mx-auto">
        An unexpected error occurred while rendering this page. You can try
        reloading the page or return to the homepage.
      </p>

      <div className="flex items-center justify-center gap-4">
        <Button onClick={() => reset()} className="bg-brand-600 hover:bg-brand-500 text-black font-bold shadow-[0_0_15px_rgba(34,197,94,0.3)]">
          Try again
        </Button>

        <Button variant="outline" asChild>
          <Link href="/">Go home</Link>
        </Button>
      </div>

      <details className="mt-8 text-left text-xs text-neutral-500 max-w-2xl mx-auto p-4 bg-neutral-900 border border-neutral-800 rounded-md">
        <summary className="cursor-pointer">Error details</summary>
        <pre className="whitespace-pre-wrap mt-2 text-xs text-neutral-400">{String(error?.message ?? "No details available")}</pre>
      </details>
    </main>
  );
}
