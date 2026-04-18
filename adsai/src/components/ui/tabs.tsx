"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

/**
 * * @param {React.ComponentProps<typeof TabsPrimitive.Root>} props - Props for the Tabs component.
 *  * @param {string} [className] - Optional CSS class name to apply to the root element.
 *  *
 *  * @returns {JSX.Element} The rendered Tabs component.
 */
function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

/**
 * * A TabsList component that renders a list of tabs.
 *  *
 *  * @param {object} props - The properties passed to the component.
 *  * @param {string} [props.className] - The CSS class name for the component.
 *  * @param {...React.ComponentProps<typeof TabsPrimitive.List>} props - Additional props passed to the TabsPrimitive.List component.
 *  * @returns {JSX.Element} The rendered TabsList component.
 */
function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className
      )}
      {...props}
    />
  )
}

/**
 * * @param {object} props - Props for the TabsTrigger component.
 *  * @param {string} [props.className] - Additional class names to apply to the trigger element.
 *  * @param {object} [props.data-slot] - Data slot attribute value. Defaults to "tabs-trigger".
 *  * @returns {JSX.Element} The rendered TabsPrimitive.Trigger component.
 */
function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

/**
 * * @param {React.ComponentProps<typeof TabsPrimitive.Content>} props 
 *  *   Props passed to the TabsContent component.
 *  * @param {string} [className] 
 *  *   Optional CSS class name for the content element.
 *  *
 *  * @returns {JSX.Element} The rendered TabsContent component.
 */
function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
