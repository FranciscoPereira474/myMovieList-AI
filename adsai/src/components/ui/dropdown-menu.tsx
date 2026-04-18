"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * * Creates a dropdown menu component.
 *  *
 *  * @param {object} props - Props for the DropdownMenuPrimitive.Root component.
 *  * @returns {JSX.Element} The rendered dropdown menu component.
 */
function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

/**
 * * A portal component for the dropdown menu.
 *  *
 *  * @param {object} props - Props passed to the Portal component.
 *  * @param {string} props.data-slot - The slot name of the portal.
 *  * @returns {JSX.Element} The rendered portal element.
 */
function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  )
}

/**
 * * A trigger component for the dropdown menu.
 *  *
 *  * @param {object} props - The properties passed to the Trigger component.
 *  * @param {object} props.children - The children of the Trigger component.
 *  * @returns {JSX.Element} The DropdownMenuPrimitive.Trigger element.
 */
function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  )
}

/**
 * * Renders the content of a dropdown menu.
 *  *
 *  * @param {Object} props - The component's properties.
 *  * @param {string} [props.className] - The CSS class name for the content element.
 *  * @param {number} [props.sideOffset=4] - The side offset value for the content element.
 *  * @param {...React.ComponentProps<typeof DropdownMenuPrimitive.Content>} props - Additional properties to pass to the content element.
 *  *
 *  * @returns {JSX.Element} The dropdown menu content element.
 */
function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

/**
 * * A component that renders a group within the dropdown menu.
 *  *
 *  * @param {object} props - The properties passed to the DropdownMenuPrimitive.Group component.
 *  * @param {string} [props.data-slot] - The slot name for the group. Defaults to "dropdown-menu-group".
 *  * @returns {JSX.Element} A JSX element representing the dropdown menu group.
 */
function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  )
}

/**
 * * A DropdownMenuPrimitive.Item component that renders a dropdown menu item.
 *  *
 *  * @param {object} props - The properties of the DropdownMenuItem component.
 *  * @param {string} [props.className] - The CSS class name to apply to the component.
 *  * @param {boolean} [props.inset] - Whether the dropdown menu is inset.
 *  * @param {"default" | "destructive"} [props.variant="default"] - The variant of the dropdown menu item.
 *  * @returns {JSX.Element} The DropdownMenuPrimitive.Item component.
 */
function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

/**
 * * A checkbox item component for a dropdown menu.
 *  *
 *  * @param {object} props - The properties of the component.
 *  * @param {string} [props.className] - The CSS class name to apply to the component.
 *  * @param {React.ReactNode} [props.children] - The content to render inside the checkbox item.
 *  * @param {boolean} [props.checked=false] - Whether the checkbox is checked or not.
 *  *
 *  * @returns {JSX.Element} The rendered checkbox item component.
 */
function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

/**
 * * A custom radio group component wrapped in a dropdown menu.
 *  *
 *  * @param {object} props - The properties passed to the DropdownMenuPrimitive.RadioGroup component.
 *  
 * function DropdownMenuRadioGroup({
 *   ...props
 * }: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
 *   return (
 *     <DropdownMenuPrimitive.RadioGroup
 *       data-slot="dropdown-menu-radio-group"
 *       {...props}
 *     />
 *   )
 * }
 */
function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

/**
 * * A radio item component for a dropdown menu.
 *  *
 *  * @param {object} props - The properties of the component.
 *  * @param {string} [props.className] - The CSS class name to apply to the component.
 *  * @param {React.ReactNode} props.children - The content to render inside the radio item.
 *  * @param {...React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>} props - Additional props to pass to the RadioItem component.
 *  *
 *  * @returns {JSX.Element} The rendered radio item component.
 */
function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

/**
 * * A DropdownMenuLabel component that wraps the DropdownMenuPrimitive.Label.
 *  *
 *  * @param {object} props - The properties passed to the DropdownMenuPrimitive.Label.
 *  * @param {string} [props.className] - The CSS class name for the label.
 *  * @param {boolean} [props.inset] - Whether the label should be inset.
 *  * @returns {JSX.Element} The rendered DropdownMenuLabel component.
 */
function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  )
}

/**
 * * A separator component for the dropdown menu.
 *  *
 *  * @param {object} props - The properties of the component.
 *  * @param {string} [props.className] - The CSS class name to apply to the separator.
 *  * @param {...React.ComponentProps<typeof DropdownMenuPrimitive.Separator>} props - Additional props passed to the Separator component.
 *  * @returns {JSX.Element} The dropdown menu separator element.
 */
function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

/**
 * * A React component that renders a dropdown menu shortcut.
 *  *
 *  * @param {object} props - The properties of the component.
 *  * @param {string} [props.className] - The CSS class name to apply to the element.
 *  * @returns {JSX.Element} The rendered dropdown menu shortcut element.
 */
function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

/**
 * * A sub menu component for the dropdown menu.
 *  *
 *  * @param {object} props - The properties passed to the DropdownMenuPrimitive.Sub component.
 *  * @param {object} props.data - The data object containing the slot information.
 *  * @param {string} props.data.slot - The slot name of the sub menu.
 *  * @returns {JSX.Element} A JSX element representing the dropdown menu sub component.
 */
function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

/**
 * * A sub-trigger component for a dropdown menu.
 *  *
 *  * @param {object} props - The properties of the component.
 *  * @param {string} [props.className] - The CSS class name to apply to the component.
 *  * @param {boolean} [props.inset] - Whether the trigger should be inset or not.
 *  * @param {React.ReactNode} props.children - The children elements to render inside the trigger.
 *  * @returns {JSX.Element} The JSX element representing the sub-trigger component.
 */
function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

/**
 * * A sub content component for the dropdown menu.
 *  *
 *  * @param {object} props - The properties passed to the DropdownMenuPrimitive.SubContent component.
 *  * @param {string} [props.className] - The CSS class name to apply to the component.
 *  * @returns {JSX.Element} The rendered sub content component.
 */
function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
