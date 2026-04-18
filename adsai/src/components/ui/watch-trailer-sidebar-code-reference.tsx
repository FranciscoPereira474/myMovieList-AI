/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-no-undef */
/**
 * COMPLETE CODE REFERENCE: Watch Trailer Button in Sidebar
 * 
 * This file shows the complete implementation for adding the Watch Trailer
 * button to your movie detail page sidebar.
 * 
 * NOTE: This is a documentation file containing code examples.
 * It is not meant to be compiled or imported.
 */

// ============================================================================
// 1. REUSABLE COMPONENT (Enhanced with new props)
// ============================================================================

// File: src/components/ui/watch-trailer-button.tsx

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
  fullWidth?: boolean;              // NEW: Makes button full width
  hideWhenUnavailable?: boolean;    // NEW: Returns null when no trailer
}

/**
 * * Watch Trailer Button component.
 *  *
 *  * @param {WatchTrailerButtonProps} props
 *  * @returns {JSX.Element|null}
 *  
 * export function WatchTrailerButton({ 
 *   trailerUrl, 
 *   movieTitle, 
 *   className,
 *   variant = "primary",
 *   fullWidth = false,
 *   hideWhenUnavailable = false,
 * }: WatchTrailerButtonProps) {
 *   // ... rest of the code ...
 * }
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
  const hasTrailer = Boolean(trailerUrl && trailerUrl.trim().length > 0);

  // Return null if no trailer and hideWhenUnavailable is true
  if (!hasTrailer && hideWhenUnavailable) {
    return null;
  }

  const handleClick = () => {
    if (hasTrailer) {
      setIsModalOpen(true);
    }
  };

  // Base styles with full width support
  const baseStyles = cn(
    "font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2",
    fullWidth && "w-full"
  );

  const variantStyles = {
    primary: hasTrailer
      ? "bg-white text-black hover:bg-neutral-200 shadow-lg hover:shadow-xl"
      : "bg-neutral-600 text-neutral-400 cursor-not-allowed opacity-50",
    secondary: hasTrailer
      ? "bg-neutral-800/80 backdrop-blur-sm border border-neutral-700 text-white hover:bg-neutral-700"
      : "bg-neutral-800/50 border border-neutral-800 text-neutral-500 cursor-not-allowed opacity-50",
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

// ============================================================================
// 2. SIDEBAR IMPLEMENTATION
// ============================================================================

// File: src/app/movies/[id]/_components/movie-sidebar.tsx

import { WatchTrailerButton } from "@/components/ui";
// ... other imports

/**
 * * Renders the movie sidebar component.
 *  *
 *  * @param {Object} props - Component properties
 *  * @param {Object} props.movie - Movie data object
 *  * @param {Object} props.ratingStats - Rating statistics object
 *  * @param {Object} props.currentUser - Current user data object
 *  * @param {Object} props.userMovieState - User's movie state object
 *  *
 *  * @returns {JSX.Element} The rendered movie sidebar component
 */
export function MovieSidebar({ movie, ratingStats, currentUser, userMovieState }) {
  return (
    <div className="relative space-y-6">
      
      {/* 1. MOVIE POSTER */}
      <div className="hidden md:block rounded-lg overflow-hidden shadow-2xl border border-neutral-800">
        <div className="relative aspect-[2/3] w-full bg-neutral-800">
          <Image
            src={movie.poster_url}
            alt={`${movie.title} poster`}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* 2. WATCH TRAILER BUTTON - NEW! */}
      <WatchTrailerButton
        trailerUrl={movie.trailer_url}
        movieTitle={movie.title}
        variant="primary"
        fullWidth
        hideWhenUnavailable
      />

      {/* 3. RATING CARD */}
      <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-xl p-4">
        {/* Rating content */}
      </div>

      {/* 4. ACTION BUTTONS */}
      <div className="grid grid-cols-2 gap-3">
        {/* Rate, Watchlist, List, Share buttons */}
      </div>
    </div>
  );
}

// ============================================================================
// 3. USAGE EXAMPLES
// ============================================================================

/*
// Example 1: Sidebar (Full width, hidden when unavailable)
<WatchTrailerButton
  trailerUrl={movie.trailer_url}
  movieTitle="Dune: Part Two"
  variant="primary"
  fullWidth
  hideWhenUnavailable
/>

// Example 2: Hero Section (Auto width, shown even when unavailable)
<WatchTrailerButton
  trailerUrl={movie.trailer_url}
  movieTitle="Dune: Part Two"
  variant="primary"
/>

// Example 3: Card Component (Custom width)
<WatchTrailerButton
  trailerUrl={movie.trailer_url}
  movieTitle="Dune: Part Two"
  variant="secondary"
  className="max-w-sm"
/>

// Example 4: Mobile (Centered, auto width)
<div className="flex justify-center">
  <WatchTrailerButton
    trailerUrl={movie.trailer_url}
    movieTitle="Dune: Part Two"
    variant="primary"
  />
</div>
*/

// ============================================================================
// 4. PROP COMBINATIONS
// ============================================================================

/*
// A. Show disabled state when no trailer
<WatchTrailerButton
  trailerUrl={null}
  movieTitle="Movie Title"
  // hideWhenUnavailable defaults to false
/>
// Result: Shows grey disabled button with "No Trailer Available"

// B. Hide completely when no trailer
<WatchTrailerButton
  trailerUrl={null}
  movieTitle="Movie Title"
  hideWhenUnavailable
/>
// Result: Returns null, nothing rendered

// C. Full width with active trailer
<WatchTrailerButton
  trailerUrl="https://youtube.com/watch?v=..."
  movieTitle="Movie Title"
  fullWidth
/>
// Result: White button spanning full container width

// D. Secondary variant (dark button)
<WatchTrailerButton
  trailerUrl="https://youtube.com/watch?v=..."
  movieTitle="Movie Title"
  variant="secondary"
/>
// Result: Dark button with border
*/

// ============================================================================
// 5. STYLING REFERENCE
// ============================================================================

/*
Primary Variant (White Button):
- Background: white
- Text: black
- Hover: bg-neutral-200
- Shadow: lg → xl on hover
- Icon: Play (filled)

Secondary Variant (Dark Button):
- Background: neutral-800/80 with backdrop blur
- Text: white
- Hover: bg-neutral-700
- Border: neutral-700
- Icon: Play (filled)

Disabled State:
- Background: neutral-600
- Text: neutral-400
- Opacity: 50%
- Cursor: not-allowed
- Icon: Play (outline only)

Full Width:
- width: 100% (w-full)
- justify-content: center
- Takes full container width
*/

// ============================================================================
// 6. DATABASE SCHEMA
// ============================================================================

/*
The movie.trailer_url field should contain YouTube URLs in formats like:
- https://www.youtube.com/watch?v=VIDEO_ID
- https://youtu.be/VIDEO_ID
- https://www.youtube.com/embed/VIDEO_ID

Example:
{
  id: "123",
  title: "Dune: Part Two",
  trailer_url: "https://www.youtube.com/watch?v=Wys_7B16BVY",
  poster_url: "...",
  backdrop_url: "..."
}

If trailer_url is null or empty string, the button will handle it gracefully.
*/

// ============================================================================
// 7. RESPONSIVE BEHAVIOR
// ============================================================================

/*
Desktop (md+): 
- Sidebar visible with button
- Button full width matching poster

Mobile (< md):
- Sidebar hidden by default
- If you add mobile version, adjust fullWidth prop

Tablet:
- Follows desktop layout
- Button scales appropriately
*/

// ============================================================================
// 8. ACCESSIBILITY FEATURES
// ============================================================================

/*
✓ Keyboard Navigation
  - Tab to focus
  - Enter/Space to activate
  - ESC to close modal

✓ Screen Readers
  - aria-label provides context
  - Disabled state announced
  - Button role implicit

✓ Visual Indicators
  - Clear hover states
  - Disabled styling
  - Focus ring visible
*/

// ============================================================================
// 9. TESTING SCENARIOS
// ============================================================================

/*
Test Case 1: Trailer Exists
✓ Button shows with white background
✓ Play icon is filled
✓ Text reads "Watch Trailer"
✓ Clicking opens modal
✓ Video plays in modal

Test Case 2: No Trailer + hideWhenUnavailable=true
✓ Button doesn't render at all
✓ Sidebar spacing adjusts automatically

Test Case 3: No Trailer + hideWhenUnavailable=false
✓ Button shows with grey background
✓ Play icon is outline only
✓ Text reads "No Trailer Available"
✓ Button is disabled
✓ Clicking does nothing

Test Case 4: Full Width
✓ Button spans entire container width
✓ Content is centered
✓ Aligns with poster edges

Test Case 5: Modal Functionality
✓ Modal opens on click
✓ ESC key closes modal
✓ Click outside closes modal
✓ Body scroll prevented
✓ Video autoplays
*/

// ============================================================================
// 10. COMMON PATTERNS
// ============================================================================

// Pattern A: Conditional Rendering Based on Context
function MyComponent({ movie, isHero = false }) {
  if (isHero) {
    return (
      <WatchTrailerButton
        trailerUrl={movie.trailer_url}
        movieTitle={movie.title}
        variant="primary"
      />
    );
  }
  
  return (
    <WatchTrailerButton
      trailerUrl={movie.trailer_url}
      movieTitle={movie.title}
      variant="primary"
      fullWidth
      hideWhenUnavailable
    />
  );
}

// Pattern B: With Loading State
function MovieSidebarWithLoading({ movie, isLoading }) {
  if (isLoading) {
    return <div className="animate-pulse bg-neutral-800 h-12 rounded-lg" />;
  }
  
  return (
    <WatchTrailerButton
      trailerUrl={movie.trailer_url}
      movieTitle={movie.title}
      variant="primary"
      fullWidth
      hideWhenUnavailable
    />
  );
}

// Pattern C: With Analytics
function TrackedWatchTrailerButton({ movie }) {
  const handleTrailerView = () => {
    // Track analytics
    analytics.track('trailer_viewed', {
      movieId: movie.id,
      movieTitle: movie.title,
    });
  };
  
  return (
    <div onClick={handleTrailerView}>
      <WatchTrailerButton
        trailerUrl={movie.trailer_url}
        movieTitle={movie.title}
        variant="primary"
        fullWidth
      />
    </div>
  );
}
