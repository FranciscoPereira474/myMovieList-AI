"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const footerLinks = {
  discover: [
    { label: "Movies", href: "/movies" },
    { label: "Lists", href: "/lists" },
    { label: "Members", href: "/users" },
    { label: "Reviews", href: "/reviews" },
  ],
  company: [
    { label: "About Us", href: "/about" },
  ],
};

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  /** Whether to show the full footer with links or just copyright */
  variant?: "full" | "minimal";
}

/**
 * * Renders the footer component with a minimal or full layout.
 *  *
 *  * @param {FooterProps} props - The properties for the footer component.
 *  * @param {string} [variant="minimal"] - The variant of the footer, either "minimal" or "full".
 *  * @param {string} [className] - Additional class names to apply to the footer element.
 *  * @returns {JSX.Element} The rendered footer element.
 *  
 * export function Footer({ variant = "minimal", className, ...props }: FooterProps) {
 *   const currentYear = new Date().getFullYear();
 *
 *   if (variant === "minimal") {
 *     return (
 *       <footer
 *         className={cn(
 *           "bg-neutral-900 border-t border-neutral-800 py-8 text-center",
 *           className
 *         )}
 *         {...props}
 *       >
 *         <p className="text-xs text-neutral-600">
 *           &copy; {currentYear} CineLog Inc. Made for movie lovers.
 *         </p>
 *       </footer>
 *     );
 *   }
 *
 *   return (
 *     <footer
 *       className={cn(
 *         "bg-neutral-900 border-t border-neutral-800 py-12",
 *         className
 *       )}
 *       {...props}
 *     >
 *       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 *         {/* 4-column grid with asymmetric layout: 2-1-1 }
 *         <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 mb-8">
 *           {/* Logo / Brand - Spans 2 columns }
 *           <div className="md:col-span-2">
 *             <Link href="/" className="flex items-center gap-2 mb-4">
 *               <div className="w-8 h-8 bg-brand-500 rounded-md flex items-center justify-center text-black font-bold text-lg">
 *                 C
 *               </div>
 *               <span className="text-xl font-bold tracking-tight">CineLog</span>
 *             </Link>
 *             <p className="text-sm text-neutral-500 leading-relaxed max-w-md">
 *               Track movies you've watched. Save those you want to see. Tell your
 *               friends what's good.
 *             </p>
 *           </div>
 *
 *           {/* Discover Column }
 *           <div>
 *             <h4 className="font-semibold text-white mb-4">Discover</h4>
 *             <ul className="space-y-2">
 *               {footerLinks.discover.map((link) => (
 *                 <li key={link.href}>
 *                   <Link
 *                     href={link.href}
 *                     className="text-sm text-neutral-500 hover:text-white transition-colors"
 *                   >
 *                     {link.label}
 *                   </Link>
 *                 </li>
 *               ))}
 *             </ul>
 *           </div>
 *
 *           {/* Company Column }
 *           <div>
 *             <h4 className="font-semibold text-white mb-4">Info</h4>
 *             <ul className="space-y-2">
 *               {footerLinks.company.map((link) => (
 *                 <li key={link.href}>
 *                   <Link
 *                     href={link.href}
 *                     className="text-sm text-neutral-500 hover:text-white transition-colors"
 *                   >
 *                     {link.label}
 *                   </Link>
 *                 </li>
 *               ))}
 *             </ul>
 *           </div>
 *         </div>
 *
 *         {/* Bottom }
 *         <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
 *           <p className="text-xs text-neutral-600">
 *             &copy; {currentYear} CineLog Inc. All rights reserved.
 *           </p>
 *           <p className="text-xs text-neutral-600">
 *             Movie data provided by{" "}
 *             <a
 *               href="https://www.themoviedb.org/"
 *               target="_blank"
 *               rel="noopener noreferrer"
 *               className="text-neutral-500 hover:text-green-500 transition-colors underline"
 *             >
 *               TMDB
 *             </a>
 *           </p>
 *         </div>
 *       </div>
 *     </footer>
 *   );
 * }
 */
export function Footer({ variant = "minimal", className, ...props }: FooterProps) {
  const currentYear = new Date().getFullYear();

  if (variant === "minimal") {
    return (
      <footer
        className={cn(
          "bg-neutral-900 border-t border-neutral-800 py-8 text-center",
          className
        )}
        {...props}
      >
        <p className="text-xs text-neutral-600">
          &copy; {currentYear} CineLog Inc. Made for movie lovers.
        </p>
      </footer>
    );
  }

  return (
    <footer
      className={cn(
        "bg-neutral-900 border-t border-neutral-800 py-12",
        className
      )}
      {...props}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 4-column grid with asymmetric layout: 2-1-1 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 mb-8">
          {/* Logo / Brand - Spans 2 columns */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-500 rounded-md flex items-center justify-center text-black font-bold text-lg">
                C
              </div>
              <span className="text-xl font-bold tracking-tight">CineLog</span>
            </Link>
            <p className="text-sm text-neutral-500 leading-relaxed max-w-md">
              Track movies you&apos;ve watched. Save those you want to see. Tell your
              friends what&apos;s good.
            </p>
          </div>

          {/* Discover Column */}
          <div>
            <h4 className="font-semibold text-white mb-4">Discover</h4>
            <ul className="space-y-2">
              {footerLinks.discover.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-500 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-semibold text-white mb-4">Info</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-500 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-600">
            &copy; {currentYear} CineLog Inc. All rights reserved.
          </p>
          <p className="text-xs text-neutral-600">
            Movie data provided by{" "}
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-green-500 transition-colors underline"
            >
              TMDB
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
