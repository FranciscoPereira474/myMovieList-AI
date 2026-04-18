"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Eye, Heart, Plus, List, Share2, Bookmark } from "lucide-react";

const actionButtonVariants = cva(
  "flex items-center justify-center transition-all",
  {
    variants: {
      variant: {
        icon: "rounded-full bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700",
        labeled:
          "flex-col gap-1 bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700 rounded-lg py-3 text-neutral-200",
        ghost: "rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white",
      },
      size: {
        sm: "w-8 h-8 text-sm",
        md: "w-10 h-10 text-base",
        lg: "w-12 h-12 text-lg",
      },
    },
    defaultVariants: {
      variant: "icon",
      size: "md",
    },
  }
);

type ActionType = "watchlist" | "watched" | "like" | "list" | "share" | "save";

const actionIcons: Record<ActionType, React.ReactNode> = {
  watchlist: <Plus size={18} />,
  watched: <Eye size={18} />,
  like: <Heart size={18} />,
  list: <List size={18} />,
  share: <Share2 size={18} />,
  save: <Bookmark size={18} />,
};

const actionLabels: Record<ActionType, string> = {
  watchlist: "Watchlist",
  watched: "Watched",
  like: "Like",
  list: "List",
  share: "Share",
  save: "Save",
};

export interface ActionButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type">,
    VariantProps<typeof actionButtonVariants> {
  /** Type of action */
  actionType: ActionType;
  /** Whether the action is active/toggled */
  isActive?: boolean;
  /** Show label (only for labeled variant) */
  showLabel?: boolean;
  /** Custom icon override */
  icon?: React.ReactNode;
  /** Custom label override */
  label?: string;
}

/**
 * * Renders an Action Button component.
 *  *
 *  * @param {ActionButtonProps} props - The properties of the ActionButton component.
 *  * @returns {JSX.Element} The rendered Action Button element.
 *  
 * export function ActionButton({
 *   actionType,
 *   variant,
 *   size,
 *   isActive = false,
 *   showLabel = false,
 *   icon,
 *   label,
 *   className,
 *   ...props
 * }: ActionButtonProps) {
 *   const activeStyles: Record<ActionType, string> = {
 *     watchlist: "bg-brand-600 hover:bg-brand-500 border-brand-500 text-white",
 *     watched: "bg-brand-600 hover:bg-brand-500 border-brand-500 text-white",
 *     like: "bg-pink-600 hover:bg-pink-500 border-pink-500 text-white",
 *     list: "bg-brand-600 hover:bg-brand-500 border-brand-500 text-white",
 *     share: "",
 *     save: "bg-brand-600 hover:bg-brand-500 border-brand-500 text-white",
 *   };
 *
 *   return (
 *     <button
 *       className={cn(
 *         actionButtonVariants({ variant, size }),
 *         isActive && activeStyles[actionType],
 *         variant === "labeled" && "w-full",
 *         className
 *       )}
 *       {...props}
 *     >
 *       {icon || actionIcons[actionType]}
 *       {(showLabel || variant === "labeled") && (
 *         <span className={cn(variant === "labeled" ? "text-xs font-medium" : "ml-2 text-sm")}>
 *           {label || actionLabels[actionType]}
 *         </span>
 *       )}
 *     </button>
 *   );
 * }
 */
export function ActionButton({
  actionType,
  variant,
  size,
  isActive = false,
  showLabel = false,
  icon,
  label,
  className,
  ...props
}: ActionButtonProps) {
  const activeStyles: Record<ActionType, string> = {
    watchlist: "bg-brand-600 hover:bg-brand-500 border-brand-500 text-white",
    watched: "bg-brand-600 hover:bg-brand-500 border-brand-500 text-white",
    like: "bg-pink-600 hover:bg-pink-500 border-pink-500 text-white",
    list: "bg-brand-600 hover:bg-brand-500 border-brand-500 text-white",
    share: "",
    save: "bg-brand-600 hover:bg-brand-500 border-brand-500 text-white",
  };

  return (
    <button
      className={cn(
        actionButtonVariants({ variant, size }),
        isActive && activeStyles[actionType],
        variant === "labeled" && "w-full",
        className
      )}
      {...props}
    >
      {icon || actionIcons[actionType]}
      {(showLabel || variant === "labeled") && (
        <span className={cn(variant === "labeled" ? "text-xs font-medium" : "ml-2 text-sm")}>
          {label || actionLabels[actionType]}
        </span>
      )}
    </button>
  );
}

export interface ActionButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Actions to display */
  actions: Array<{
    type: ActionType;
    isActive?: boolean;
    onClick?: () => void;
  }>;
  /** Layout direction */
  direction?: "horizontal" | "vertical";
  /** Button variant */
  variant?: VariantProps<typeof actionButtonVariants>["variant"];
  /** Button size */
  size?: VariantProps<typeof actionButtonVariants>["size"];
}

/**
 * * Renders an Action Button Group component.
 *  *
 *  * @param {ActionButtonGroupProps} props - The properties of the component.
 *  * @param {Array<ActionButtonAction>} props.actions - An array of action buttons to render.
 *  * @param {string} [props.direction="horizontal"] - The direction of the button group (horizontal or vertical).
 *  * @param {string} [props.variant="icon"] - The variant of the button group (icon, labeled, etc.).
 *  * @param {string} [props.size="md"] - The size of the button group (sm, md, lg, etc.).
 *  * @param {string} [props.className] - Additional CSS class names to apply to the component.
 *  *
 *  * @returns {JSX.Element} The rendered Action Button Group component.
 */
export function ActionButtonGroup({
  actions,
  direction = "horizontal",
  variant = "icon",
  size = "md",
  className,
  ...props
}: ActionButtonGroupProps) {
  return (
    <div
      className={cn(
        "flex gap-2",
        direction === "vertical" && "flex-col",
        variant === "labeled" && "grid grid-cols-2 gap-3",
        className
      )}
      {...props}
    >
      {actions.map((action) => (
        <ActionButton
          key={action.type}
          actionType={action.type}
          variant={variant}
          size={size}
          isActive={action.isActive}
          onClick={action.onClick}
        />
      ))}
    </div>
  );
}

export { actionButtonVariants };
