import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * * A Card component that renders a container with a card layout.
 *  *
 *  * @param {React.ComponentProps<"div">} props - The properties of the div element.
 *  * @param {string} [className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm"] - Additional class names for the component.
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

/**
 * * CardHeader component.
 *  *
 *  * @param {React.ComponentProps<"div">} props - Component properties.
 *  * @param {string} [className=""] - CSS class name for the card header element.
 *  * @returns {JSX.Element} The rendered CardHeader component.
 */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

/**
 * * A reusable card title component.
 *  *
 *  * @param {React.ComponentProps<"div">} props - The properties of the div element.
 *  * @param {string} [className] - Optional CSS class name to apply to the component.
 *  
 * function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
 *   return (
 *     <div
 *       data-slot="card-title"
 *       className={cn("leading-none font-semibold", className)}
 *       {...props}
 *     />
 *   )
 * }
 */
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

/**
 * * A reusable card description component.
 *  *
 *  * @param {React.ComponentProps<"div">} props - The properties of the div element.
 *  * @param {string} [className=""] - Optional CSS class name to apply to the component.
 */
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

/**
 * * A CardAction component that renders a div element with the specified class name and props.
 *  *
 *  * @param {React.ComponentProps<"div">} props - The properties of the div element to be rendered.
 *  * @param {string} [className=""] - The CSS class name for the div element.
 *  
 * function CardAction({ className, ...props }: React.ComponentProps<"div">) {
 *   return (
 *     <div
 *       data-slot="card-action"
 *       className={cn(
 *         "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
 *         className
 *       )}
 *       {...props}
 *     />
 *   )
 * }
 */
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

/**
 * * Renders a card content component.
 *  *
 *  * @param {React.ComponentProps<"div">} props - The properties of the div element.
 *  * @param {string} [className] - Optional CSS class name to apply to the component.
 *  
 * function CardContent({ className, ...props }: React.ComponentProps<"div">) {
 *   return (
 *     <div
 *       data-slot="card-content"
 *       className={cn("px-6", className)}
 *       {...props}
 *     />
 *   )
 * }
 */
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

/**
 * * CardFooter component.
 *  *
 *  * @param {React.ComponentProps<"div">} props - Component properties.
 *  * @param {string} [className] - CSS class name for the card footer element.
 *  * @returns {JSX.Element} The rendered CardFooter component.
 */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
