"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import Link from "next/link";

const genreTagVariants = cva(
  "inline-flex items-center justify-center rounded-full border transition-colors cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "border-neutral-700 bg-neutral-900/50 text-neutral-300 hover:bg-neutral-800 hover:text-white",
        active:
          "border-brand-500 bg-brand-500/10 text-brand-400 hover:bg-brand-500/20",
        outline:
          "border-neutral-600 bg-transparent text-neutral-400 hover:border-neutral-500 hover:text-neutral-300",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-3 py-1 text-xs",
        lg: "px-4 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface GenreTagProps
  extends VariantProps<typeof genreTagVariants>,
    React.HTMLAttributes<HTMLElement> {
  /** Genre label */
  label: string;
  /** Optional link href */
  href?: string;
  /** Whether the tag is selected/active */
  active?: boolean;
}

/**
 * * Renders a genre tag component.
 *  *
 *  * @param {GenreTagProps} props - The properties for the genre tag component.
 *  * @returns {JSX.Element | null} The rendered genre tag component or null if no href is provided.
 */
export function GenreTag({
  label,
  href,
  variant,
  size,
  active,
  className,
  ...props
}: GenreTagProps) {
  const finalVariant = active ? "active" : variant;
  const classes = cn(genreTagVariants({ variant: finalVariant, size }), className);

  if (href) {
    return (
      <Link href={href} className={classes} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {label}
      </Link>
    );
  }

  return (
    <span className={classes} {...props}>
      {label}
    </span>
  );
}

export { genreTagVariants };
