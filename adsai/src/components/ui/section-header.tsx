"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Main title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** "View All" link href */
  viewAllHref?: string;
  /** "View All" link text (default: "View All") */
  viewAllText?: string;
  /** Right side custom content (replaces View All) */
  action?: React.ReactNode;
}

/**
 * * Renders a section header component with title, subtitle, and optional action or view all link.
 *  *
 *  * @param {SectionHeaderProps} props - Component properties
 *  * @param {string} props.title - Section title
 *  * @param {string} [props.subtitle] - Section subtitle
 *  * @param {string} [props.viewAllHref] - URL for "View All" link
 *  * @param {string} [props.viewAllText="View All"] - Text for "View All" link
 *  * @param {ReactNode} [props.action] - Optional action component
 *  * @param {string} [props.className] - Additional class names for the component
 */
export function SectionHeader({
  title,
  subtitle,
  viewAllHref,
  viewAllText = "View All",
  action,
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn("flex items-end justify-between mb-4", className)}
      {...props}
    >
      <div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {subtitle && (
          <p className="text-sm text-neutral-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      
      {action ? (
        action
      ) : viewAllHref ? (
        <Link
          href={viewAllHref}
          className="text-sm text-brand-400 hover:text-brand-300 font-medium transition-colors flex items-center gap-1 group"
        >
          {viewAllText}
          <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      ) : null}
    </div>
  );
}
