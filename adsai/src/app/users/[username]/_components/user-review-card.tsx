"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { UserReview } from "../_lib/queries";
import { Eye } from "lucide-react";

export function UserReviewCard({ review }: { review: UserReview }) {
  const hasTitle = !!review.title;
  const hasSpoiler = !!review.contains_spoilers;
  const [spoilerRevealed, setSpoilerRevealed] = React.useState(false);
  const router = useRouter();
  const [hoverMovie, setHoverMovie] = React.useState(false);

  const cardContent = (
    <div
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(`/reviews/${review.id}`);
        }
      }}
      onClick={() => router.push(`/reviews/${review.id}`)}
      className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 flex gap-3 hover:border-neutral-700 transition-colors group block cursor-pointer"
    >
      <div className="w-12 shrink-0">
        {review.movie.poster_url ? (
          review.movie.slug ? (
            <Link href={`/movies/${review.movie.slug}`} onClick={(e) => e.stopPropagation()} onMouseEnter={() => setHoverMovie(true)} onMouseLeave={() => setHoverMovie(false)}>
              <Image src={review.movie.poster_url} alt={review.movie.title} width={48} height={72} className="w-full rounded border border-neutral-700" />
            </Link>
          ) : (
            <Image src={review.movie.poster_url} alt={review.movie.title} width={48} height={72} className="w-full rounded border border-neutral-700" />
          )
        ) : (
          <div className="w-full aspect-[2/3] bg-neutral-800 rounded border border-neutral-700 flex items-center justify-center"><span className="text-neutral-500 text-[8px] text-center">No poster</span></div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {review.movie.slug ? (
          <Link
            href={`/movies/${review.movie.slug}`}
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => setHoverMovie(true)}
            onMouseLeave={() => setHoverMovie(false)}
            className="block"
          >
            <h4 className={`text-sm font-bold truncate transition-colors ${hoverMovie ? "text-brand-400" : "text-white"}`}>
              {review.movie.title}
            </h4>
          </Link>
        ) : (
          <h4 className="text-sm font-bold text-white truncate">{review.movie.title}</h4>
        )}

        {/* If there's a title, show it and prefer it. */}
        {hasTitle ? (
            <p className="text-xs text-white line-clamp-2 mt-1">{review.title}</p>
        ) : (
          /* No title: show body. If it contains spoilers, show the body normally here (overlay will be applied to whole card if needed). */
          review.body ? (
            <p className="text-xs text-neutral-300 line-clamp-2 mt-1">{review.body}</p>
          ) : null
        )}
      </div>
    </div>
  );

  // If there's no title and the review contains spoilers, render the card normally
  // but blur only the description and show a centered reveal button that
  // toggles the local `spoilerRevealed` state. This keeps the rest of the
  // card readable while protecting the spoiler text.
  if (!hasTitle && hasSpoiler) {
    return (
      <div
        className="relative"
        role="link"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            router.push(`/reviews/${review.id}`);
          }
        }}
        onClick={() => router.push(`/reviews/${review.id}`)}
      >
        {/* Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 flex gap-3 hover:border-neutral-700 transition-colors group block cursor-pointer">
          <div className="w-12 shrink-0">
            {review.movie.poster_url ? (
              review.movie.slug ? (
                <Link
                  href={`/movies/${review.movie.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  onMouseEnter={() => setHoverMovie(true)}
                  onMouseLeave={() => setHoverMovie(false)}
                >
                  <Image src={review.movie.poster_url} alt={review.movie.title} width={48} height={72} className="w-full rounded border border-neutral-700" />
                </Link>
              ) : (
                <Image src={review.movie.poster_url} alt={review.movie.title} width={48} height={72} className="w-full rounded border border-neutral-700" />
              )
            ) : (
              <div className="w-full aspect-[2/3] bg-neutral-800 rounded border border-neutral-700 flex items-center justify-center"><span className="text-neutral-500 text-[8px] text-center">No poster</span></div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {review.movie.slug ? (
              <Link href={`/movies/${review.movie.slug}`} onClick={(e) => e.stopPropagation()} onMouseEnter={() => setHoverMovie(true)} onMouseLeave={() => setHoverMovie(false)} className="block">
                <h4 className={`text-sm font-bold truncate transition-colors ${hoverMovie ? "text-brand-400" : "text-white"}`}>{review.movie.title}</h4>
              </Link>
            ) : (
              <h4 className="text-sm font-bold text-white truncate">{review.movie.title}</h4>
            )}

            {review.body ? (
                <p className={"text-xs text-neutral-300 line-clamp-2 transition-all duration-500 filter " + (!spoilerRevealed ? "blur-sm brightness-95 select-none pointer-events-none" : "")}>{review.body}</p>
            ) : null}
          </div>
        </div>

        {/* Centered reveal button overlay (non-blocking except the button) */}
        {!spoilerRevealed && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setSpoilerRevealed(true);
              }}
              className="pointer-events-auto bg-white text-black hover:bg-neutral-200 rounded-full font-bold flex items-center gap-2 cursor-pointer px-3 py-1"
            >
              <Eye size={14} />
              Reveal Spoiler
            </button>
          </div>
        )}
      </div>
    );
  }

  return cardContent;
}
