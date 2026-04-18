"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";

export interface SpoilerOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Content to be hidden */
  children: React.ReactNode;
  /** Whether spoiler is initially revealed */
  defaultRevealed?: boolean;
  /** Button text */
  revealText?: string;
  /** Callback when revealed */
  onReveal?: () => void;
}

/**
 * * A reusable overlay component that can be used to reveal or hide content.
 *  *
 *  * @param {SpoilerOverlayProps} props - The properties for the SpoilerOverlay component.
 *  * @param {React.ReactNode} props.children - The content to be revealed or hidden.
 *  * @param {boolean} [props.defaultRevealed=false] - Whether the content is initially revealed.
 *  * @param {string} [props.revealText="Show Full Review"] - The text displayed on the reveal button.
 *  * @param {function} [props.onReveal] - A callback function to be executed when the content is revealed.
 *  * @param {string} [props.className] - Additional CSS class names for the component.
 *  *
 *  * @returns {JSX.Element} The JSX element representing the SpoilerOverlay component.
 */
export function SpoilerOverlay({
  children,
  defaultRevealed = false,
  revealText = "Reveal spoiler",
  onReveal,
  className,
  ...props
}: SpoilerOverlayProps) {
  const [isRevealed, setIsRevealed] = React.useState(defaultRevealed);

  const handleReveal = () => {
    setIsRevealed(true);
    onReveal?.();
  };

  return (
    <div className={cn("relative", className)} {...props}>
      {/* Content */}
      <div
        className={cn(
          "transition-all duration-500 filter",
          !isRevealed && "blur-sm brightness-95 select-none pointer-events-none"
        )}
      >
        {children}
      </div>

      {/* Overlay (subtle) */}
      {!isRevealed && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-b from-transparent via-neutral-900/10 to-neutral-900/20 rounded-lg">
          <button
            onClick={handleReveal}
            className="bg-white text-black text-sm font-medium py-1 px-3 rounded-md shadow-sm transition-transform hover:scale-105 flex items-center gap-2 cursor-pointer"
          >
            <Eye size={14} />
            {revealText}
          </button>
        </div>
      )}
    </div>
  );
}
