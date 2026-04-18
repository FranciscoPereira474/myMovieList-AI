import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Authentication | CineLog",
  description: "Sign in or create an account to start tracking your movies.",
};

/**
 * * @param {Object} props - The component's properties.
 *  * @param {React.ReactNode} props.children - The content to be rendered inside the AuthLayout.
 *  *
 *  * @returns {JSX.Element} The AuthLayout component with its children and layout.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE: HERO VISUAL (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden bg-neutral-900">
        {/* Background Image (Collage) */}
        <Image
          src="/auth_wallpaper.jpg"
          className="absolute inset-0 w-full h-full object-cover opacity-60 blur-xs"
          alt="Movies Background"
          fill
          priority
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-r from-neutral-950/90 via-neutral-950/40 to-transparent" />

        {/* Content */}
        <div className="relative z-10 p-16 flex flex-col justify-between h-full w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-md flex items-center justify-center text-black font-bold text-lg">
              C
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              CineLog
            </span>
          </Link>

          {/* Value Prop */}
          <div className="max-w-xl">
            <h2 className="text-5xl font-black text-white leading-tight mb-6">
              Track movies you&apos;ve watched. <br />
              Save those you want to see.
            </h2>
            <p className="text-lg text-neutral-300 leading-relaxed">
              Join the social network for movie lovers. Create lists, write
              reviews, and discover your next favorite movie through people
              with similar taste.
            </p>
          </div>

          {/* Footer Copyright */}
          <div className="text-xs text-neutral-500">
            &copy; {new Date().getFullYear()} CineLog Inc.
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: AUTH FORM */}
      <div className="w-full lg:w-[40%] flex flex-col justify-center items-center p-8 bg-neutral-950 border-l border-neutral-900">
        {children}
      </div>
    </div>
  );
}
