"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

/**
 * * Creates a separator component with customizable orientation and decoration.
 *  *
 *  * @param {object} props - Component properties.
 *  * @param {string} [props.className] - Additional class names for the component.
 *  * @param {string} [props.orientation="horizontal"] - Orientation of the separator (horizontal or vertical).
 *  * @param {boolean} [props.decorative=true] - Whether the separator is decorative.
 *  *
 *  * @returns {JSX.Element} The rendered separator component.
 */
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
