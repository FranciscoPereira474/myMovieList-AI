"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewBodyProps {
  content: string;
  hasSpoiler: boolean;
}

/**
 * * Renders the review body component.
 *  *
 *  * @param {ReviewBodyProps} props - The properties for the review body component.
 *  * @param {string} props.content - The content to be displayed in the review body.
 *  * @param {boolean} props.hasSpoiler - Whether the review body contains a spoiler overlay.
 *  *
 *  * @returns {JSX.Element} The rendered review body component.
 */
export function ReviewBody({ content, hasSpoiler }: ReviewBodyProps) {
  const [isRevealed, setIsRevealed] = React.useState(!hasSpoiler);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const [reservedHeight, setReservedHeight] = React.useState<string | undefined>(undefined);

  // Measure content height while spoiler overlay is visible so we can reserve
  // that height on the wrapper and avoid layout shifts when revealing.
  React.useEffect(() => {
    if (isRevealed) {
      setReservedHeight(undefined);
      return;
    }

    const el = contentRef.current;
    if (!el) return;

    const update = () => setReservedHeight(`${el.scrollHeight}px`);

    update();

    // Watch for size changes (images, fonts, etc.) while overlay is visible
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, [isRevealed, content]);

  if (!hasSpoiler) {
    return (
      <div className="prose prose-invert max-w-none text-neutral-300 leading-relaxed whitespace-pre-wrap">
        {content}
      </div>
    );
  }

  return (
    <div className="relative" style={reservedHeight ? { height: reservedHeight } : undefined}>
      {!isRevealed && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <Button 
            onClick={() => setIsRevealed(true)}
            className="bg-white text-black hover:bg-neutral-200 rounded-full font-bold flex items-center gap-2 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            Reveal Spoiler
          </Button>
        </div>
      )}
      
      <div
        ref={contentRef}
        className={cn(
          "prose prose-invert max-w-none text-neutral-300 leading-relaxed whitespace-pre-wrap transition-all duration-300",
          !isRevealed && "blur-md select-none pointer-events-none opacity-50"
        )}
      >
        {content}
      </div>
    </div>
  );
}
