"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import styles from "./main-nav.module.css";
import { SearchInput } from "@/components/ui/search-input";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Menu, X, LogOut, User, Star, Bookmark, List } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/browser-client";

const baseNavLinks = [
  { label: "Movies", href: "/movies" },
  { label: "Reviews", href: "/reviews" },
  { label: "Lists", href: "/lists" },
  { label: "Members", href: "/users" },
];

export interface MainNavProps extends React.HTMLAttributes<HTMLElement> {
  /** Current user (null if not logged in) */
  user?: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
  } | null;
  /** Whether the nav should be transparent (for hero sections) */
  transparent?: boolean;
  /** Callback when search is submitted */
  onSearch?: (query: string) => void;
  /** Current active route for highlighting */
  activeRoute?: string;
  /** Whether user has unread notifications */
  hasNotifications?: boolean;
}

/**
 * * MainNav component
 *  *
 *  * @param {MainNavProps} props - Component props
 *  * @returns {JSX.Element} - Rendered navigation bar
 *  
 * export function MainNav({
 *   user,
 *   transparent = false,
 *   onSearch,
 *   activeRoute,
 *   hasNotifications = false,
 *   className,
 *   ...props
 * }: MainNavProps) {
 *   // ...
 * }
 *
 *
 *  * @typedef {Object} MainNavProps
 *  * @property {User} user - Current user object
 *  * @property {Function} onSearch - Callback function for search input
 *  * @property {String} activeRoute - Active route path
 */
export function MainNav({
  user,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transparent: _transparent,
  onSearch,
  activeRoute,
  className,
  ...props
}: MainNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const [, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const mobileSearchInputRef = React.useRef<HTMLInputElement | null>(null);
  const [mobileSearchFocusRequested, setMobileSearchFocusRequested] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);
  const navRef = React.useRef<HTMLElement | null>(null);

  const handleLogout = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    setIsUserMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  // Close user menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = React.useCallback((query: string) => {
    if (query.trim()) {
      router.push(`/movies?q=${encodeURIComponent(query.trim())}`);
      setSearchValue("");
    }
  }, [router]);

  React.useEffect(() => {
    // Use a simple universal threshold so homepage behaves like other pages.
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    // initialize state
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // When the mobile menu opens via the search icon, focus the search input so it's ready for typing
  React.useEffect(() => {
    if (isMobileMenuOpen && mobileSearchFocusRequested) {
      // Delay focus until after the menu mounts and the input is available
      const t = setTimeout(() => {
        mobileSearchInputRef.current?.focus();
        // clear the flag after focusing so other openers (hamburger) don't trigger focus
        setMobileSearchFocusRequested(false);
      }, 50);
      return () => clearTimeout(t);
    }
    return;
  }, [isMobileMenuOpen, mobileSearchFocusRequested]);

  const navLinks = React.useMemo(() => {
    const links = [...baseNavLinks];
    // User-specific links (Ratings, Watchlist) are accessible from the user dropdown;
    // keep the main nav links generic and non-user-specific.
    return links;
  }, []);

  // NOW we can do conditional rendering - AFTER all hooks
  const hideNavbarPaths = ["/login", "/register", "/onboarding/claim-username"];
  if (hideNavbarPaths.includes(pathname || "")) {
    return null;
  }

  // Always show the solid/blur background immediately on all pages.
  const showSolidBg = true;
  const mobileMenuBgClass = showSolidBg ? "bg-neutral-950/90 backdrop-blur-md" : "bg-transparent";

  return (
    <nav
      ref={(el) => { navRef.current = el; }}
      className={cn("fixed top-0 w-full z-50 transition-all duration-300", className)}
      {...props}
    >
      {/* Full-bleed fixed background layer so blur/bg always reaches viewport edges */}
      <div
        aria-hidden
        className={cn(
          "fixed left-0 right-0 top-0 w-screen pointer-events-none transition-all duration-300",
          showSolidBg
            ? "z-30 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800 h-16"
            : "z-30 bg-transparent border-transparent h-16"
        )}
      />

      <div className="relative z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Nav Links */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-brand-500 rounded-md flex items-center justify-center text-black font-bold text-lg shadow-[0_0_15px_rgba(34,197,94,0.5)]">
                C
              </div>
              <span className={cn("text-xl font-bold tracking-tight group-hover:text-brand-400 transition-colors", styles.brandText)}>
                CineLog
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className={cn("hidden md:flex items-center space-x-6 text-sm font-medium text-neutral-400", styles.desktop)}>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "hover:text-white transition-colors",
                    activeRoute === link.href && "text-white font-semibold"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Search + User */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden sm:block">
              <SearchInput
                placeholder="Search movies"
                size="md"
                className="w-64"
                value={searchValue}
                onSearch={(val) => {
                  setSearchValue(val);
                  onSearch?.(val);
                }}
                onSubmit={handleSearchSubmit}
              />
            </div>

            {/* Mobile Search Button */}
            <button
              type="button"
              aria-label="Open search"
              onClick={() => {
                setIsMobileMenuOpen(true);
                setMobileSearchFocusRequested(true);
              }}
              className="sm:hidden text-neutral-400 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {user ? (
              <>
                {/* Notifications removed: moved to user dropdown */}

                {/* User Menu Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="relative group"
                  >
                    <UserAvatar
                      src={user.avatarUrl}
                      alt={user.name}
                      size="md"
                      className="ring-offset-2 ring-offset-neutral-950 group-hover:ring-2 group-hover:ring-brand-500 transition-all"
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl py-1 z-50">
                      <Link
                        href={`/users/${user.username}`}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User size={16} />
                        Profile
                      </Link>

                      <Link
                        href={`/ratings/${user.username}`}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Star size={16} />
                        My Ratings
                      </Link>

                      <Link
                        href={`/watchlist/${user.username}`}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Bookmark size={16} />
                        My Watchlist
                      </Link>

                      

                      <Link
                        href={`/lists/${user.username}`}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <List size={16} />
                        My Lists
                      </Link>

                      <Link
                        href={`/recommendations`}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" className="w-4 h-4" fill="currentColor" aria-hidden>
                          <path d="m160-840 80 160h120l-80-160h80l80 160h120l-80-160h80l80 160h120l-80-160h120q33 0 56.5 23.5T880-760v560q0 33-23.5 56.5T800-120H160q-33 0-56.5-23.5T80-200v-560q0-33 23.5-56.5T160-840Zm0 240v400h640v-400H160Zm0 0v400-400Zm160 360h320v-22q0-44-44-71t-116-27q-72 0-116 27t-44 71v22Zm160-160q33 0 56.5-23.5T560-480q0-33-23.5-56.5T480-560q-33 0-56.5 23.5T400-480q0 33 23.5 56.5T480-400Z"/>
                        </svg>
                        Recommendations
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-neutral-800 transition-colors cursor-pointer"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href={`/login${pathname && pathname !== '/' ? `?redirect=${encodeURIComponent(pathname)}` : ''}`}
                  className="text-sm text-neutral-400 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href={`/register${pathname && pathname !== '/' ? `?redirect=${encodeURIComponent(pathname)}` : ''}`}
                  className="bg-brand-500 hover:bg-brand-400 text-black font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className={cn("md:hidden text-neutral-400 hover:text-white", styles.mobile)}
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                // If opening via hamburger, ensure we don't auto-focus the search input
                setMobileSearchFocusRequested(false);
              }}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            className={cn(
              "md:hidden fixed left-0 right-0 top-16 z-40",
              styles.mobileMenu,
              mobileMenuBgClass,
              "border-t border-neutral-800"
            )}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col space-y-4">
                {/* Mobile Search */}
                <div className="px-2 sm:hidden">
                  <SearchInput
                    placeholder="Search movies..."
                    size="md"
                    className="w-full"
                    value={searchValue}
                    ref={mobileSearchInputRef}
                    onSearch={(val) => {
                      setSearchValue(val);
                      onSearch?.(val);
                    }}
                    onSubmit={(query) => {
                      handleSearchSubmit(query);
                      setIsMobileMenuOpen(false);
                    }}
                  />
                </div>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-neutral-400 hover:text-white transition-colors px-2 py-1",
                      activeRoute === link.href && "text-white font-semibold"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}