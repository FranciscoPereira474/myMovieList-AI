"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export interface CastCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Actor information */
  actor: {
    id: string;
    name: string;
    character?: string;
    imageUrl?: string;
  };
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: {
    container: "w-24",
    image: "w-24 h-24",
    name: "text-xs",
    character: "text-[10px]",
  },
  md: {
    container: "w-32",
    image: "w-32 h-32",
    name: "text-sm",
    character: "text-xs",
  },
  lg: {
    container: "w-40",
    image: "w-40 h-40",
    name: "text-base",
    character: "text-sm",
  },
};

/**
 * * Renders a card component for an actor in the movie cast.
 *  *
 *  * @param {CastCardProps} props - The properties of the CastCard component.
 *  * @param {string} [props.actor] - The name of the actor.
 *  * @param {string} [props.size="md"] - The size of the card (default: "md").
 *  * @param {string} [props.className] - Additional CSS class names for the card.
 *  *
 *  * @returns {JSX.Element} The rendered CastCard component.
 */
export function CastCard({
  actor,
  size = "md",
  className,
  ...props
}: CastCardProps) {
  const classes = sizeClasses[size];

  return (
    <div
      className={cn("group cursor-pointer", classes.container, className)}
      {...props}
    >
      <Link href={`/movies?q=${encodeURIComponent(actor.name)}`}>
        {/* Image */}
        <div
          className={cn(
            "rounded-lg overflow-hidden mb-2 border border-neutral-800 group-hover:border-brand-500/50 transition-colors relative",
            classes.image
          )}
        >
          {actor.imageUrl ? (
            <Image
              src={actor.imageUrl}
              alt={actor.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 128px, 160px"
            />
          ) : (
            <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-neutral-600">
              <span className="text-2xl">?</span>
            </div>
          )}
        </div>

        {/* Info */}
        <h4
          className={cn(
            "font-bold text-neutral-200 truncate group-hover:text-white transition-colors",
            classes.name
          )}
        >
          {actor.name}
        </h4>
        {actor.character && (
          <p className={cn("text-neutral-500 truncate", classes.character)}>
            {actor.character}
          </p>
        )}
      </Link>
    </div>
  );
}
