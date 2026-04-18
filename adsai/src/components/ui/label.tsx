"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

/**
 * * Creates a Label component.
 *  *
 *  * @param {object} props - The properties to be passed to the LabelPrimitive.Root component.
 *  * @param {string} [props.className] - The CSS class name for the label element.
 *  * @param {...React.ComponentProps<typeof LabelPrimitive.Root>} props - Additional props to be passed to the LabelPrimitive.Root component.
 *  *
 *  * @returns {JSX.Element} The rendered Label component.
 */
function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
