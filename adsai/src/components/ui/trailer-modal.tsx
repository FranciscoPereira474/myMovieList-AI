"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailerUrl: string;
  movieTitle: string;
}

/**
 * Converts a YouTube watch URL to an embed URL
 * Example: https://www.youtube.com/watch?v=Wys_7B16BVY -> https://www.youtube.com/embed/Wys_7B16BVY
 */
function getYouTubeEmbedUrl(url: string): string {
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

/**
 * * Displays a trailer modal with video playback.
 *  *
 *  * @param {TrailerModalProps} props - Modal properties.
 *  * @returns {JSX.Element | null} The rendered modal or null if not open.
 *  
 * export function TrailerModal({ isOpen, onClose, trailerUrl, movieTitle }: TrailerModalProps) {
 *   // ... (rest of the code remains the same)
 * }
 */
export function TrailerModal({ isOpen, onClose, trailerUrl, movieTitle }: TrailerModalProps) {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const embedUrl = getYouTubeEmbedUrl(trailerUrl);

  // Use React Portal to render modal at the end of document.body
  // This ensures it's not clipped by any parent container's overflow properties
  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Backdrop with blur - FIXED positioning ensures full viewport coverage over navbar */}
      <div className="fixed inset-0 w-screen h-screen bg-black/80 backdrop-blur-md" />

      {/* Modal Content */}
      <div
        className={cn(
          "relative z-10 w-full max-w-5xl mx-4 bg-neutral-900 rounded-lg overflow-hidden shadow-2xl",
          "animate-in zoom-in-95 duration-200"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Video Container with aspect-video for consistent cinematic sizing */}
        <div className="relative w-full aspect-video">
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

  // Render modal using React Portal to ensure it's appended to document.body
  // This prevents z-index stacking context issues with parent containers
  return createPortal(modalContent, document.body);
}
