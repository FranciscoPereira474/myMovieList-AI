"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

/**
 * * Creates an Avatar component.
 *  *
 *  * @param {Object} props - The properties of the Avatar component.
 *  * @param {string} [props.className] - Additional CSS class names for the avatar element.
 *  * @param {...React.ComponentProps<typeof AvatarPrimitive.Root>} props - All other props passed to the AvatarPrimitive.Root component.
 *  * @returns {JSX.Element} The rendered Avatar component.
 */
function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

/**
 * * A reusable AvatarImage component.
 *  *
 *  * @param {object} props - Component properties.
 *  * @param {string} [props.className] - Additional CSS class names for the image element.
 *  * @param {object} [props.props] - Additional props to be passed to the AvatarPrimitive.Image component.
 *  * @returns {JSX.Element} The rendered AvatarImage component.
 */
function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

/**
 * * A fallback component for the AvatarPrimitive.
 *  *
 *  * @param {object} props - The properties passed to the AvatarPrimitive.Fallback component.
 *  * @param {string} [props.className] - Additional class names to apply to the component.
 *  * @returns {JSX.Element} The rendered AvatarPrimitive.Fallback component.
 */
function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
