import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server-client";
import Link from "next/link";
import { ClaimUsernameForm } from "./_components/claim-username-form";

/**
 * * ClaimUsernamePage component
 *  *
 *  * @param {object} supabase - Supabase server client instance
 *  * @returns {JSX.Element} The JSX element representing the page
 *  
 * export default async function ClaimUsernamePage(supabase) {
 *   const user = await supabase.auth.getUser();
 *   
 *   if (!user) {
 *     redirect("/login");
 *   }
 *
 *   const profile = await supabase
 *     .from("profiles")
 *     .select("username_is_temp")
 *     .eq("id", user.id)
 *     .single();
 *
 *   if (profile && !profile.username_is_temp) {
 *     redirect("/");
 *   }
 *
 *   return (
 *     <div className="w-full max-w-sm space-y-8">
 *       {/* Mobile Header }
 *       <div className="lg:hidden text-center mb-8">
 *         <Link href="/" className="inline-flex items-center gap-2 mb-4">
 *           <div className="w-8 h-8 bg-brand-500 rounded-md flex items-center justify-center text-black font-bold text-lg">
 *             C
 *           </div>
 *           <span className="text-xl font-bold tracking-tight text-white">
 *             CineLog
 *           </span>
 *         </Link>
 *       </div>
 *
 *       {/* Form Header }
 *       <div className="text-center">
 *         <h2 className="text-3xl font-bold text-white tracking-tight">
 *           Choose your username
 *         </h2>
 *         <p className="mt-2 text-sm text-neutral-400">
 *           Pick a unique username for your CineLog profile. This is how other
 *           users will find you.
 *         </p>
 *       </div>
 *
 *       {/* Username Form }
 *       <ClaimUsernameForm />
 *
 *       {/* Help Text }
 *       <div className="text-center">
 *         <p className="text-xs text-neutral-500">
 *           Your username must be 3-20 characters and can only contain letters,
 *           numbers, underscores, and hyphens.
 *         </p>
 *       </div>
 *     </div>
 *   );
 * }
 */
export default async function ClaimUsernamePage() {
  const supabase = await createServerClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get current profile to check whether the username is still temporary
  const { data: profile } = await supabase
    .from("profiles")
    .select("username_is_temp")
    .eq("id", user.id)
    .single();

  // If user already has a permanent username, redirect to home
  if (profile && !profile.username_is_temp) {
    redirect("/");
  }

  return (
    <div className="w-full max-w-sm space-y-8">
      {/* Mobile Header */}
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
          Choose your username
        </h2>
        <p className="mt-2 text-sm text-neutral-400">
          Pick a unique username for your CineLog profile. This is how other
          users will find you.
        </p>
      </div>

      {/* Username Form */}
      <ClaimUsernameForm />

      {/* Help Text */}
      <div className="text-center">
        <p className="text-xs text-neutral-500">
          Your username must be 3-20 characters and can only contain letters,
          numbers, underscores, and hyphens.
        </p>
      </div>
    </div>
  );
}
