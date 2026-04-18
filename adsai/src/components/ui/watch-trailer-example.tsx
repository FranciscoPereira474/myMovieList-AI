/**
 * STANDALONE EXAMPLE: Watch Trailer Button Implementation
 * 
 * This file demonstrates a complete, self-contained example of the Watch Trailer
 * button implementation that can be used as reference or dropped into any component.
 * 
 * Features:
 * - Conditional rendering (active when trailer exists, disabled when null)
 * - Modal with YouTube iframe player
 * - Backdrop blur and ESC key support
 * - Dark theme matching CineLog aesthetic
 * - Responsive design
 */

"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Play } from "lucide-react";

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

interface Movie {
  id: string;
  title: string;
  trailer_url: string | null;
}

/**
 * * Renders a hero section with two example movies, one with and one without a trailer.
 *  *
 *  * @param {object} props - The component's properties
 *  * @param {Movie} props.movieWithTrailer - An object containing data for the movie with a trailer
 *  * @param {Movie} props.movieWithoutTrailer - An object containing data for the movie without a trailer
 *  *
 *  * @returns {JSX.Element} The hero section JSX element
 */
export function ExampleHeroSection() {
  // Example movie data - replace with your actual data
  const movieWithTrailer: Movie = {
    id: "1",
    title: "Dune: Part Two",
    trailer_url: "https://www.youtube.com/watch?v=Wys_7B16BVY",
  };

  const movieWithoutTrailer: Movie = {
    id: "2",
    title: "Indie Movie",
    trailer_url: null,
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Example 1: Movie WITH trailer */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">{movieWithTrailer.title}</h2>
          <p className="text-neutral-300">
            This movie has a trailer available. Click the button to watch!
          </p>
          <WatchTrailerButtonStandalone
            trailerUrl={movieWithTrailer.trailer_url}
            movieTitle={movieWithTrailer.title}
          />
        </div>

        {/* Example 2: Movie WITHOUT trailer */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">{movieWithoutTrailer.title}</h2>
          <p className="text-neutral-300">
            This movie doesn&apos;t have a trailer. The button is disabled.
          </p>
          <WatchTrailerButtonStandalone
            trailerUrl={movieWithoutTrailer.trailer_url}
            movieTitle={movieWithoutTrailer.title}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STANDALONE BUTTON COMPONENT
// ============================================================================

interface WatchTrailerButtonStandaloneProps {
  trailerUrl: string | null;
  movieTitle: string;
}

function WatchTrailerButtonStandalone({
  trailerUrl,
  movieTitle,
}: WatchTrailerButtonStandaloneProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasTrailer = Boolean(trailerUrl && trailerUrl.trim().length > 0);

  const handleClick = () => {
    if (hasTrailer) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      {/* Button - matches screenshot aesthetic */}
      <button
        onClick={handleClick}
        disabled={!hasTrailer}
        className={`
          font-semibold py-3 px-6 rounded-lg transition-all flex items-center gap-2
          ${
            hasTrailer
              ? "bg-white text-black hover:bg-neutral-200 shadow-lg hover:shadow-xl cursor-pointer"
              : "bg-neutral-600 text-neutral-400 cursor-not-allowed opacity-50"
          }
        `}
        aria-label={
          hasTrailer ? `Watch trailer for ${movieTitle}` : "No trailer available"
        }
      >
        <Play size={18} fill={hasTrailer ? "currentColor" : "none"} />
        {hasTrailer ? "Watch Trailer" : "No Trailer Available"}
      </button>

      {/* Modal - only renders if trailer exists */}
      {hasTrailer && trailerUrl && (
        <TrailerModalStandalone
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
// STANDALONE MODAL COMPONENT
// ============================================================================

interface TrailerModalStandaloneProps {
  isOpen: boolean;
  onClose: () => void;
  trailerUrl: string;
  movieTitle: string;
}

function TrailerModalStandalone({
  isOpen,
  onClose,
  trailerUrl,
  movieTitle,
}: TrailerModalStandaloneProps) {
  // Handle ESC key and prevent body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Convert YouTube URL to embed format
  const embedUrl = convertToYouTubeEmbed(trailerUrl);

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center animate-fadeIn"
      onClick={onClose}
    >
      {/* Backdrop with blur - FIXED positioning ensures full viewport coverage */}
      <div className="fixed inset-0 w-screen h-screen bg-black/80 backdrop-blur-md" />

      {/* Modal Content */}
      <div
        className="relative z-10 w-full max-w-5xl mx-4 bg-neutral-900 rounded-lg overflow-hidden shadow-2xl animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Video Container - 16:9 aspect ratio */}
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src={embedUrl}
            title={`${movieTitle} trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );

  // Render using React Portal to bypass parent container stacking contexts
  return createPortal(modalContent, document.body);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Converts YouTube watch URLs to embed format with autoplay
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - Already embedded URLs
 */
function convertToYouTubeEmbed(url: string): string {
  try {
    const urlObj = new URL(url);

    // Handle youtube.com/watch?v=VIDEO_ID
    if (urlObj.hostname.includes("youtube.com")) {
      const videoId = urlObj.searchParams.get("v");
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
      }
    }

    // Handle youtu.be/VIDEO_ID
    if (urlObj.hostname === "youtu.be") {
      const videoId = urlObj.pathname.slice(1);
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
      }
    }

    // If already an embed URL, return as-is
    if (url.includes("/embed/")) {
      return url;
    }

    return url;
  } catch {
    return url;
  }
}

// ============================================================================
// TAILWIND CSS (Add to your globals.css or tailwind.config.ts)
// ============================================================================

/**
 * Add these animations to your Tailwind config:
 * 
 * module.exports = {
 *   theme: {
 *     extend: {
 *       keyframes: {
 *         fadeIn: {
 *           '0%': { opacity: '0' },
 *           '100%': { opacity: '1' },
 *         },
 *         scaleIn: {
 *           '0%': { opacity: '0', transform: 'scale(0.95)' },
 *           '100%': { opacity: '1', transform: 'scale(1)' },
 *         },
 *       },
 *       animation: {
 *         fadeIn: 'fadeIn 0.2s ease-in-out',
 *         scaleIn: 'scaleIn 0.2s ease-in-out',
 *       },
 *     },
 *   },
 * };
 */
