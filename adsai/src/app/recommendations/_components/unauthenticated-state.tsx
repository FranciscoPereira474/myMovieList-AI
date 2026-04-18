import { Film } from "lucide-react";
import Link from "next/link";

/**
 * * Renders the UnauthenticatedState component, displaying a message and two links to sign in or browse movies.
 *  *
 *  * @returns {JSX.Element} The JSX element representing the UnauthenticatedState component.
 *  
 * export function UnauthenticatedState() {
 *   // ... (rest of the code remains the same)
 */
export function UnauthenticatedState() {
  return (
    <div className="pt-32 pb-20 max-w-2xl mx-auto px-4 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-900 text-neutral-500 mb-6 border border-neutral-800">
        <Film className="w-8 h-8" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-3">Sign in to view recommendations</h2>

      <p className="text-neutral-400 mb-8 leading-relaxed">
        Personalized recommendations are available for signed-in users.
        Sign in to track what you&apos;ve watched, save movies for later,
        and get suggestions tailored to your taste.
      </p>

      <div className="flex items-center justify-center gap-4">
        <Link
          href={`/login?redirect=${encodeURIComponent(`/recommendations`)}`}
          className="inline-block bg-brand-600 hover:bg-brand-500 text-black font-bold py-3 px-6 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
        >
          Sign In
        </Link>

        <Link
          href="/movies"
          className="inline-block border border-neutral-800 text-neutral-300 hover:text-white py-3 px-6 rounded-lg transition-colors"
        >
          Browse Movies
        </Link>
      </div>
    </div>
  );
}
