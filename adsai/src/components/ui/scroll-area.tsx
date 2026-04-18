"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

/**
 * * A ScrollArea component that provides a scrollable area for its children.
 *  *
 *  * @param {object} props - The properties of the ScrollArea component.
 *  * @param {string} [props.className] - The CSS class name to apply to the root element.
 *  * @param {ReactNode} props.children - The content to be rendered inside the scrollable area.
 *  * @param {...object} props.props - Additional props to be passed to the ScrollAreaPrimitive.Root component.
 *  *
 *  * @returns {JSX.Element} The JSX element representing the ScrollArea component.
 */
function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

/**
 * * @param {object} props - Props for the ScrollBar component.
 *  * @param {string} [props.className] - CSS class name to apply to the scrollbar.
 *  * @param {string} [props.orientation="vertical"] - Orientation of the scrollbar ("vertical" or "horizontal").
 *  * @param {...React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>} props - Additional props for the ScrollAreaPrimitive.ScrollAreaScrollbar component.
 *  * @returns {JSX.Element} The rendered ScrollBar component.
 */
function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="bg-border relative flex-1 rounded-full"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}

export { ScrollArea, ScrollBar }
