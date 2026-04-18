import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * * A React component that renders a breadcrumb navigation element.
 *  *
 *  * @param {React.ComponentProps<"nav">} props - The properties of the nav component.
 *  * @returns {JSX.Element} The rendered breadcrumb navigation element.
 */
function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />
}

/**
 * * Renders a breadcrumb list component.
 *  *
 *  * @param {React.ComponentProps<"ol">} props - The properties of the ol element.
 *  * @param {string} [className=""] - The CSS class name for the breadcrumb list.
 *  * @returns {JSX.Element} The breadcrumb list JSX element.
 */
function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5",
        className
      )}
      {...props}
    />
  )
}

/**
 * * A BreadcrumbItem component that renders a list item with a breadcrumb slot.
 *  *
 *  * @param {React.ComponentProps<"li">} props - The properties of the li element.
 *  * @param {string} [className] - Optional CSS class name to apply to the component.
 *  
 * function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
 *   return (
 *     <li
 *       data-slot="breadcrumb-item"
 *       className={cn("inline-flex items-center gap-1.5", className)}
 *       {...props}
 *     />
 *   )
 * }
 */
function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  )
}

/**
 * * BreadcrumbLink component.
 *  *
 *  * @param {Object} props - Component properties.
 *  * @param {boolean} [props.asChild] - Whether to render the link as a child element.
 *  * @param {string} [props.className] - Additional CSS class names for the link.
 *  * @param {...React.ComponentProps<"a">} props - Remaining HTML anchor tag attributes.
 *  *
 *  * @returns {JSX.Element} The rendered BreadcrumbLink component.
 */
function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn("hover:text-foreground transition-colors", className)}
      {...props}
    />
  )
}

/**
 * * BreadcrumbPage component.
 *  *
 *  * @param {React.ComponentProps<"span">} props
 *  * @param {string} [className] - Optional CSS class name for the breadcrumb page element.
 *  * @returns {JSX.Element} The rendered breadcrumb page element.
 */
function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("text-foreground font-normal", className)}
      {...props}
    />
  )
}

/**
 * * BreadcrumbSeparator component.
 *  *
 *  * @param {React.ComponentProps<"li">} props
 *  * @param {React.ReactNode} [props.children] - The child element to render as the separator.
 *  * @param {string} [props.className] - Additional CSS class names for the component.
 *  
 * function BreadcrumbSeparator({
 *   children,
 *   className,
 *   ...props
 * }: React.ComponentProps<"li">) {
 *   return (
 *     <li
 *       data-slot="breadcrumb-separator"
 *       role="presentation"
 *       aria-hidden="true"
 *       className={cn("[&>svg]:size-3.5", className)}
 *       {...props}
 *     >
 *       {children ?? <ChevronRight />}
 *     </li>
 *   )
 * }
 */
function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  )
}

/**
 * * BreadcrumbEllipsis component.
 *  *
 *  * @param {React.ComponentProps<"span">} props
 *  * @param {string} [props.className] - Optional CSS class name for the component.
 *  * @returns {JSX.Element} The rendered breadcrumb ellipsis element.
 */
function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
