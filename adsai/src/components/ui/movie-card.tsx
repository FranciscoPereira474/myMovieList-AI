"use client";

import { cva, type VariantProps } from "class-variance-authority";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { RatingBadge } from "./rating-badge";
import { MatchBadge } from "./match-badge";

const movieCardVariants = cva("group cursor-pointer", {
  variants: {
    variant: {
      default: "w-[160px] md:w-[200px]",
      compact: "w-full",
      landscape: "w-full",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const posterContainerVariants = cva(
  "relative overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 shadow-lg transition-all duration-300",
  {
    variants: {
      variant: {
        default:
          "aspect-[2/3] group-hover:scale-[1.02] group-hover:shadow-xl group-hover:shadow-brand-500/20",
        compact:
          "aspect-[2/3] group-hover:scale-105",
        landscape: "aspect-video",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface MovieCardProps
  extends VariantProps<typeof movieCardVariants>,
    Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Movie title */
  title: string;
  /** URL of the poster image */
  posterUrl: string;
  /** Rating score (0-10 scale) */
  rating?: number;
  /** Match percentage for recommendations (0-100) */
  matchPercentage?: number;
  /** When false, hide the rating badge even if `rating` is provided */
  showRatingBadge?: boolean;
  /** When true, show the match badge only on hover */
  matchOnHover?: boolean;
  /** Release year */
  year: number | string;
  /** Callback when the card is clicked (used for quick view modal) */
  onClick?: () => void;
  /** Optional: Callback for quick view modal (if provided, card becomes clickable div instead of Link) */
  onQuickView?: () => void;
  /** Optional: URL to navigate to (if onQuickView is not provided, card becomes a Link) */
  href?: string;
}

/**
 * * @param {MovieCardProps} props - The properties of the MovieCard component.
 *  * @param {string} [title] - The title of the movie card.
 *  * @param {string} posterUrl - The URL of the movie poster.
 *  * @param {number} rating - The rating of the movie (optional).
 *  * @param {number} matchPercentage - The percentage of matches for the movie (optional).
 *  * @param {boolean} [showRatingBadge=true] - Whether to show the rating badge.
 *  * @param {boolean} [matchOnHover=false] - Whether to show the match badge on hover.
 *  * @param {string} [year] - The year of release (optional).
 *  * @param {string} variant - The layout variant for the movie card.
 *  * @param {function} onClick - The click event handler.
 *  * @param {function} onQuickView - The quick view event handler.
 *  * @param {string} href - The URL to link to.
 *  * @param {string} [className] - Additional CSS class names.
 *  
 * export function MovieCard({
 *   title,
 *   posterUrl,
 *   rating,
 *   matchPercentage,
 *   showRatingBadge = true,
 *   matchOnHover = false,
 *   year,
 *   variant,
 *   onClick,
 *   onQuickView,
 *   href,
 *   className,
 *   ...props
 * }: MovieCardProps) {
 *   // Determine if this should be a clickable div (for quick view) or a Link
 *   const handleClick = onQuickView || onClick;
 *   const useLink = !handleClick && href;
 *   
 *   // Landscape variant - horizontal layout for search results
 *   if (variant === "landscape") {
 *     const content = (
 *       <>
 *         <div className="flex gap-4 rounded-lg border border-neutral-800 bg-neutral-900 p-3 hover:border-neutral-700 transition-colors">
 *           <div className="relative w-16 h-24 shrink-0 overflow-hidden rounded-md border border-neutral-800">
 *             <Image
 *               src={posterUrl}
 *               alt={title}
 *               fill
 *               className="object-cover"
 *               sizes="64px"
 *             />
 *           </div>
 *           <div className="flex flex-col flex-1 min-w-0 justify-center">
 *             <h3 className="text-sm font-semibold text-neutral-200 truncate group-hover:text-white transition-colors">
 *               {title}
 *             </h3>
 *             <span className="text-xs text-neutral-500">{year}</span>
 *             <div className="mt-2">
 *               {showRatingBadge && rating !== undefined && (
 *                 <RatingBadge score={rating} size="sm" />
 *               )}
 *               {matchPercentage !== undefined && (
 *                 <div className={matchOnHover ? "opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out mt-1" : "mt-1"}>
 *                   <MatchBadge score={matchPercentage} size="sm" />
 *                 </div>
 *               )}
 *             </div>
 *           </div>
 *         </div>
 *       </>
 *     );
 *
 *     return useLink ? (
 *       <Link href={href!} className={cn(movieCardVariants({ variant }), className)}>
 *         {content}
 *       </Link>
 *     ) : (
 *       <div className={cn(movieCardVariants({ variant }), className)} onClick={handleClick} {...props}>
 *         {content}
 *       </div>
 *     );
 *   }
 *
 *   // Compact variant - smaller cards for user profile grids
 *   if (variant === "compact") {
 *     const content = (
 *       <>
 *         <div className={cn(posterContainerVariants({ variant }))}>
 *           <Image
 *             src={posterUrl}
 *             alt={title}
 *             fill
 *             className="object-cover"
 *             sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
 *           />
 *           {((showRatingBadge && rating !== undefined) || matchPercentage !== undefined) && (
 *             <div className="absolute top-1 right-1 text-right">
 *               {showRatingBadge && rating !== undefined && (
 *                 <RatingBadge score={rating} size="sm" showIcon />
 *               )}
 *               {matchPercentage !== undefined && (
 *                 <div className={matchOnHover ? "opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out" : ""}>
 *                   <MatchBadge score={matchPercentage} size="xs" />
 *                 </div>
 *               )}
 *             </div>
 *           )}
 *         </div>
 *         <h3 className="mt-2 text-xs font-semibold text-neutral-300 truncate group-hover:text-white transition-colors">
 *           {title}
 *         </h3>
 *       </>
 *     );
 *
 *     return useLink ? (
 *       <Link href={href!} className={cn(movieCardVariants({ variant }), className)}>
 *         {content}
 *       </Link>
 *     ) : (
 *       <div className={cn(movieCardVariants({ variant }), className)} onClick={handleClick} {...props}>
 *         {content}
 *       </div>
 *     );
 *   }
 *
 *   // Default variant - main discovery grid cards
 *   const content = (
 *     <>
 *       <div className={cn(posterContainerVariants({ variant }))}>
 *         <Image
 *           src={posterUrl}
 *           alt={title}
 *           fill
 *           className="object-cover"
 *           sizes="(max-width: 768px) 160px, 200px"
 *         />
 *
 *         {/* Rating Badge }
 *         {( (showRatingBadge && rating !== undefined) || matchPercentage !== undefined) && (
 *           <div className="absolute top-2 right-2 z-10 text-right">
 *             {showRatingBadge && rating !== undefined && <RatingBadge score={rating} />}
 *             {matchPercentage !== undefined && (
 *               <div className={matchOnHover ? "opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out" : ""}>
 *                 <MatchBadge score={matchPercentage} size="sm" />
 *               </div>
 *             )}
 *           </div>
 *         )}
 *       </div>
 *
 *       {/* Movie Info }
 *       <div className="mt-2">
 *         <h3 className="font-medium text-neutral-200 truncate group-hover:text-white transition-colors">
 *           {title}
 *         </h3>
 *         <span className="text-xs text-neutral-500">{year}</span>
 *       </div>
 *     </>
 *   );
 *
 *   return useLink ? (
 *     <Link href={href!} className={cn(movieCardVariants({ variant }), className)}>
 *       {content}
 *     </Link>
 *   ) : (
 *     <div className={cn(movieCardVariants({ variant }), className)} onClick={handleClick} {...props}>
 *       {content}
 *     </div>
 *   );
 * }
 */
export function MovieCard({
  title,
  posterUrl,
  rating,
  matchPercentage,
  showRatingBadge = true,
  matchOnHover = false,
  year,
  variant,
  onClick,
  onQuickView,
  href,
  className,
  ...props
}: MovieCardProps) {
  // Determine if this should be a clickable div (for quick view) or a Link
  const handleClick = onQuickView || onClick;
  const useLink = !handleClick && href;
  // Landscape variant - horizontal layout for search results
  if (variant === "landscape") {
    const content = (
      <>
        <div className="flex gap-4 rounded-lg border border-neutral-800 bg-neutral-900 p-3 hover:border-neutral-700 transition-colors">
          <div className="relative w-16 h-24 shrink-0 overflow-hidden rounded-md border border-neutral-800">
            <Image
              src={posterUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
          <div className="flex flex-col flex-1 min-w-0 justify-center">
            <h3 className="text-sm font-semibold text-neutral-200 truncate group-hover:text-white transition-colors">
              {title}
            </h3>
            <span className="text-xs text-neutral-500">{year}</span>
            <div className="mt-2">
              {showRatingBadge && rating !== undefined && (
                <RatingBadge score={rating} size="sm" />
              )}
              {matchPercentage !== undefined && (
                <div className={matchOnHover ? "opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out mt-1" : "mt-1"}>
                  <MatchBadge score={matchPercentage} size="sm" />
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );

    return useLink ? (
      <Link href={href!} className={cn(movieCardVariants({ variant }), className)}>
        {content}
      </Link>
    ) : (
      <div className={cn(movieCardVariants({ variant }), className)} onClick={handleClick} {...props}>
        {content}
      </div>
    );
  }

  // Compact variant - smaller cards for user profile grids
  if (variant === "compact") {
    const content = (
      <>
        <div className={cn(posterContainerVariants({ variant }))}>
          <Image
            src={posterUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
          />
          {((showRatingBadge && rating !== undefined) || matchPercentage !== undefined) && (
            <div className="absolute top-1 right-1 text-right">
              {showRatingBadge && rating !== undefined && (
                <RatingBadge score={rating} size="sm" showIcon />
              )}
              {matchPercentage !== undefined && (
                <div className={matchOnHover ? "opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out" : ""}>
                  <MatchBadge score={matchPercentage} size="xs" />
                </div>
              )}
            </div>
          )}
        </div>
        <h3 className="mt-2 text-xs font-semibold text-neutral-300 truncate group-hover:text-white transition-colors">
          {title}
        </h3>
      </>
    );

    return useLink ? (
      <Link href={href!} className={cn(movieCardVariants({ variant }), className)}>
        {content}
      </Link>
    ) : (
      <div className={cn(movieCardVariants({ variant }), className)} onClick={handleClick} {...props}>
        {content}
      </div>
    );
  }

  // Default variant - main discovery grid cards
  const content = (
    <>
      <div className={cn(posterContainerVariants({ variant }))}>
        <Image
          src={posterUrl}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 160px, 200px"
        />

        {/* Rating Badge */}
        {( (showRatingBadge && rating !== undefined) || matchPercentage !== undefined) && (
          <div className="absolute top-2 right-2 z-10 text-right">
            {showRatingBadge && rating !== undefined && <RatingBadge score={rating} />}
            {matchPercentage !== undefined && (
              <div className={matchOnHover ? "opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out" : ""}>
                <MatchBadge score={matchPercentage} size="sm" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Movie Info */}
      <div className="mt-2">
        <h3 className="font-medium text-neutral-200 truncate group-hover:text-white transition-colors">
          {title}
        </h3>
        <span className="text-xs text-neutral-500">{year}</span>
      </div>
    </>
  );

  return useLink ? (
    <Link href={href!} className={cn(movieCardVariants({ variant }), className)}>
      {content}
    </Link>
  ) : (
    <div className={cn(movieCardVariants({ variant }), className)} onClick={handleClick} {...props}>
      {content}
    </div>
  );
}

export { movieCardVariants };
