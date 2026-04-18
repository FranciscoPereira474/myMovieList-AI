"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface LoadMoreButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Loading state */
  isLoading?: boolean;
  /** Text to display */
  text?: string;
  /** Loading text */
  loadingText?: string;
}

/**
 * * @param {LoadMoreButtonProps} props - The properties for the Load More Button component.
 *  * @param {boolean} [props.isLoading=false] - Whether the button is currently loading.
 *  * @param {string} [props.text="Load More"] - The text to display on the button when not loading.
 *  * @param {string} [props.loadingText="Loading..."] - The text to display on the button when loading.
 *  * @param {string} [props.className] - Additional CSS class names for the button element.
 *  * @param {boolean} [props.disabled=false] - Whether the button is disabled.
 *  * @returns {JSX.Element} The Load More Button component.
 */
export function LoadMoreButton({
  isLoading = false,
  text = "Load More",
  loadingText = "Loading...",
  className,
  disabled,
  ...props
}: LoadMoreButtonProps) {
  return (
    <div className="flex justify-center">
      <button
        disabled={isLoading || disabled}
        className={cn(
          "bg-neutral-800 hover:bg-neutral-700 text-white px-8 py-3 rounded-full text-sm font-medium transition-colors border border-neutral-700",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "flex items-center gap-2",
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 size={16} className="animate-spin" />}
        {isLoading ? loadingText : text}
      </button>
    </div>
  );
}
