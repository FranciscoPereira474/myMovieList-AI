"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrailerModal } from "./trailer-modal";

interface WatchTrailerButtonProps {
  trailerUrl: string | null;
  movieTitle: string;
  className?: string;
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  hideWhenUnavailable?: boolean;
}

/**
 * Watch Trailer button with conditional styling and modal functionality
 * 
 * The button is ALWAYS visible regardless of trailer availability.
 * 
 * Scenarios:
 * - Trailer exists: Active button with white bg, opens modal on click
 * - No trailer: Disabled button with grey bg, reduced opacity, cursor-not-allowed
 * 
 * Props:
 * - fullWidth: Makes button take full width of container (useful for sidebar)
 * - variant: "primary" (white) or "secondary" (dark)
 */
export function WatchTrailerButton({ 
  trailerUrl, 
  movieTitle, 
  className,
  variant = "primary",
  fullWidth = false,
  hideWhenUnavailable = false,
}: WatchTrailerButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper: Check if trailer URL exists and is not empty
  const hasTrailer = !!trailerUrl && trailerUrl.trim().length > 0;

  // If caller wants to hide the button when no trailer is available, return null
  if (!hasTrailer && hideWhenUnavailable) {
    return null;
  }

  const handleClick = () => {
    if (hasTrailer) {
      setIsModalOpen(true);
    }
  };

  // Base styles for all states
  const baseStyles = cn(
    "font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2",
    fullWidth && "w-full"
  );

  // Conditional styling based on trailer availability
  const variantStyles = {
    primary: hasTrailer
      ? "bg-white text-black hover:bg-neutral-200 shadow-lg hover:shadow-xl cursor-pointer"
      : "bg-gray-700 text-neutral-400 opacity-50 cursor-not-allowed",
    secondary: hasTrailer
      ? "bg-neutral-800/80 backdrop-blur-sm border border-neutral-700 text-white hover:bg-neutral-700 cursor-pointer"
      : "bg-gray-700 border border-neutral-800 text-neutral-500 opacity-50 cursor-not-allowed",
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={!hasTrailer}
        className={cn(baseStyles, variantStyles[variant], className)}
        aria-label={hasTrailer ? `Watch trailer for ${movieTitle}` : "No trailer available"}
      >
        <Play size={18} fill={hasTrailer ? "currentColor" : "none"} />
        {hasTrailer ? "Watch Trailer" : "No Trailer Available"}
      </button>

      {/* Only render modal if trailer exists */}
      {hasTrailer && trailerUrl && (
        <TrailerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          trailerUrl={trailerUrl}
          movieTitle={movieTitle}
        />
      )}
    </>
  );
}
