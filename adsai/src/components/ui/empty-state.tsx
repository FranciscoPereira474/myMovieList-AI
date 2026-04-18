"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Film, Inbox, Search, AlertCircle } from "lucide-react";

type EmptyStateType = "no-results" | "no-data" | "not-rated" | "error" | "custom";

const emptyStateIcons: Record<Exclude<EmptyStateType, "custom">, React.ReactNode> = {
  "no-results": <Search size={32} />,
  "no-data": <Inbox size={32} />,
  "not-rated": <Film size={32} />,
  error: <AlertCircle size={32} />,
};

const emptyStateTitles: Record<Exclude<EmptyStateType, "custom">, string> = {
  "no-results": "No results found",
  "no-data": "Nothing here yet",
  "not-rated": "Unlock Recommendations",
  error: "Something went wrong",
};

const emptyStateDescriptions: Record<Exclude<EmptyStateType, "custom">, string> = {
  "no-results": "Try adjusting your search or filters to find what you're looking for.",
  "no-data": "There's nothing to display here at the moment.",
  "not-rated": "Rate at least 5 movies to unlock your personalized recommendations.",
  error: "We encountered an error. Please try again later.",
};

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Type of empty state (determines default icon, title, description) */
  type?: EmptyStateType;
  /** Custom icon (overrides type icon) */
  icon?: React.ReactNode;
  /** Title content (overrides type title) — can be string or React node */
  title?: React.ReactNode;
  /** Description content (overrides type description) */
  description?: React.ReactNode;
  /** Optional class(es) applied to the icon wrapper (allows larger icon badges) */
  iconClassName?: string;
  /** Primary action button */
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  /** Secondary action button */
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

/**
 * * Renders an empty state component with optional icon, title, description, and actions.
 *  *
 *  * @param {EmptyStateProps} props - Component properties.
 *  * @param {string} [props.type="no-data"] - Type of the empty state (e.g. "no-data", "custom").
 *  * @param {*} [props.icon] - Optional icon to display.
 *  * @param {*} [props.title] - Optional title to display.
 *  * @param {*} [props.description] - Optional description to display.
 *  * @param {function} [props.action] - Optional action to perform on click.
 *  * @param {function} [props.secondaryAction] - Optional secondary action to perform on click.
 *  * @param {string} [props.className] - Additional class name for the component.
 *  *
 *  * @returns {JSX.Element} The rendered empty state component.
 */
export function EmptyState({
  type = "no-data",
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  ...props
}: EmptyStateProps) {
  const displayIcon = icon || (type !== "custom" ? emptyStateIcons[type] : null);
  const displayTitle = title || (type !== "custom" ? emptyStateTitles[type] : "");
  const displayDescription: React.ReactNode = description || (type !== "custom" ? emptyStateDescriptions[type] : "");

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
      {...props}
    >
      {/* Icon */}
      {displayIcon && (
        <div className={cn(
          "inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-900 text-neutral-500 mb-6 border border-neutral-800",
          // allow passing a custom icon wrapper size/class from callers
          (props as EmptyStateProps).iconClassName
        )}>
          {displayIcon}
        </div>
      )}

          {/* Title */}
          {displayTitle && (
            // If caller provided a React node for title, render it directly so callers
            // can control markup/size. Strings will be wrapped in the default H2.
            typeof displayTitle === "string" || typeof displayTitle === "number" ? (
                <h2 className="text-xl font-semibold text-white mb-3">{displayTitle}</h2>
              ) : (
                <>{displayTitle}</>
              )
          )}

      {/* Description */}
      {displayDescription && (
        <p className="text-neutral-400 mb-8 max-w-md leading-relaxed">
          {displayDescription}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-4">
          {action && (
            <Button
              onClick={action.onClick}
              className="bg-brand-600 hover:bg-brand-500 text-black font-bold shadow-[0_0_15px_rgba(34,197,94,0.3)]"
              asChild={!!action.href}
            >
              {action.href ? (
                <a href={action.href}>{action.label}</a>
              ) : (
                action.label
              )}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              asChild={!!secondaryAction.href}
            >
              {secondaryAction.href ? (
                <a href={secondaryAction.href}>{secondaryAction.label}</a>
              ) : (
                secondaryAction.label
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
