import { cn } from "@/lib/utils"

/**
 * * Creates a skeleton component with the given class name and props.
 *  *
 *  * @param {React.ComponentProps<"div">} props - The properties of the div element.
 *  * @param {string} [className] - The CSS class name to apply to the component.
 *  
 * function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
 *   return (
 *     <div
 *       data-slot="skeleton"
 *       className={cn("bg-accent animate-pulse rounded-md", className)}
 *       {...props}
 *     />
 *   )
 * }
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
