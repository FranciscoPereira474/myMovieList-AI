"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * * A custom Select component that wraps the SelectPrimitive.Root component.
 *  *
 *  * @param {object} props - The properties passed to the SelectPrimitive.Root component.
 *  * @param {string} [data-slot="select"] - The slot name for the SelectPrimitive.Root component.
 *  * @returns {JSX.Element} The rendered SelectPrimitive.Root component with the specified slot.
 */
function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

/**
 * * A wrapper component for the SelectPrimitive.Group component.
 *  *
 *  * @param {object} props - The properties passed to the SelectPrimitive.Group component.
 *  * @param {string} [data-slot="select-group"] - The slot name for the group.
 *  * @returns {JSX.Element} The SelectPrimitive.Group component with the specified slot and props.
 */
function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

/**
 * * A functional component that renders a value from the SelectPrimitive.Value.
 *  *
 *  * @param {React.ComponentProps<typeof SelectPrimitive.Value>} props - The properties to be passed to the SelectPrimitive.Value.
 *  * @returns {JSX.Element} The JSX element representing the SelectPrimitive.Value with the provided data-slot and props.
 */
function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

/**
 * * A customizable trigger component for the Select primitive.
 *  *
 *  * @param {Object} props - The component's properties.
 *  * @param {string} [props.className] - The CSS class name to apply to the component.
 *  * @param {string} [props.size="default"] - The size of the component, either "sm" or "default".
 *  * @param {React.ReactNode} [props.children] - The content to render inside the component.
 *  *
 *  * @returns {JSX.Element} The SelectPrimitive.Trigger component with the provided props and children.
 */
function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

/**
 * * Renders the content of a select primitive.
 *  *
 *  * @param {object} props - The component's properties.
 *  * @param {string} [props.className] - The CSS class name for the content element.
 *  * @param {React.ReactNode} props.children - The content to be rendered inside the portal.
 *  * @param {string} [props.position="popper"] - The position of the content (either "popper" or "bottom").
 *  * @param {string} [props.align="center"] - The alignment of the content (either "center", "left", or "right").
 *  * @param {...React.ComponentProps<typeof SelectPrimitive.Content>} props - Additional properties to be passed to the `SelectPrimitive.Content` component.
 *  *
 *  * @returns {JSX.Element} The rendered select primitive content element.
 */
function SelectContent({
  className,
  children,
  position = "popper",
  align = "center",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        align={align}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

/**
 * * A reusable label component for the Select primitive.
 *  *
 *  * @param {object} props - The component's properties.
 *  * @param {string} [props.className] - Additional CSS class names to apply to the label.
 *  * @param {object} [props.children] - The content of the label.
 *  * @returns {JSX.Element} The rendered SelectPrimitive.Label component.
 */
function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
    />
  )
}

/**
 * * A custom SelectItem component that wraps the base SelectPrimitive.Item.
 *  *
 *  * @param {object} props - The properties passed to the base SelectPrimitive.Item.
 *  * @param {string} [props.className] - The CSS class name for the item.
 *  * @param {React.ReactNode} props.children - The text content of the item.
 *  * @returns {JSX.Element} The rendered SelectItem component.
 */
function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

/**
 * * A custom separator component for the Select primitive.
 *  *
 *  * @param {object} props - The properties passed to the SelectPrimitive.Separator component.
 *  * @param {string} [props.className] - The CSS class name of the separator.
 *  * @param {...React.ComponentProps<typeof SelectPrimitive.Separator>} props - Additional properties passed to the SelectPrimitive.Separator component.
 *  *
 *  * @returns {JSX.Element} A JSX element representing the custom separator.
 */
function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

/**
 * * @param {React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>} props 
 *  *   Props for the ScrollUpButton component.
 *  * @param {string} [className] 
 *  *   Optional CSS class name to apply to the component.
 *  *
 *  * @returns {JSX.Element} The rendered ScrollUpButton component.
 */
function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

/**
 * * A custom ScrollDownButton component for the Select primitive.
 *  *
 *  * @param {object} props - The properties passed to the component.
 *  * @param {string} [props.className] - The CSS class name of the button.
 *  * @param {...React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>} props - Additional props passed to the ScrollDownButton component.
 *  * @returns {JSX.Element} The rendered ScrollDownButton component with a ChevronDownIcon.
 */
function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
