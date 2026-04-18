"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * * A Dialog component that wraps the DialogPrimitive.Root component.
 *  *
 *  * @param {React.ComponentProps<typeof DialogPrimitive.Root>} props - Props to be passed to the DialogPrimitive.Root component.
 *  * @returns {JSX.Element} The Dialog component with the DialogPrimitive.Root component as its root element.
 */
function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

/**
 * * A DialogTrigger component that wraps the DialogPrimitive.Trigger component.
 *  *
 *  * @param {React.ComponentProps<typeof DialogPrimitive.Trigger>} props
 *  *   The properties to be passed to the DialogPrimitive.Trigger component.
 *  *
 *  * @returns {JSX.Element}
 *  *   The DialogTrigger component with the provided props.
 */
function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

/**
 * * A portal component for the dialog primitive.
 *  *
 *  * @param {React.ComponentProps<typeof DialogPrimitive.Portal>} props
 *  *   The properties to be passed to the portal component.
 *  *
 *  * @returns {JSX.Element}
 *  *   The rendered portal component.
 */
function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

/**
 * * A DialogClose component that wraps the native Close button of a DialogPrimitive.
 *  *
 *  * @param {React.ComponentProps<typeof DialogPrimitive.Close>} props - Props to be passed to the native Close button.
 *  * @returns {JSX.Element} The DialogClose component with the native Close button.
 */
function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

/**
 * * A DialogOverlay component that wraps the DialogPrimitive.Overlay.
 *  *
 *  * @param {object} props - The properties passed to the DialogPrimitive.Overlay.
 *  * @param {string} [props.className] - The CSS class name for the overlay.
 *  * @returns {JSX.Element} The DialogOverlay component.
 */
function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

/**
 * * Renders the content of a dialog.
 *  *
 *  * @param {Object} props - The properties passed to the DialogPrimitive.Content component.
 *  * @param {string} [props.className] - The CSS class name for the content element.
 *  * @param {React.ReactNode} props.children - The children elements to be rendered inside the dialog.
 *  * @param {boolean} [props.showCloseButton=true] - Whether to show the close button. Defaults to true.
 *  *
 *  * @returns {JSX.Element} The JSX element representing the dialog content.
 */
function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

/**
 * * A DialogHeader component that renders a header for a dialog.
 *  *
 *  * @param {React.ComponentProps<"div">} props - The properties of the div element.
 *  * @param {string} [className] - Optional CSS class name to apply to the component.
 *  
 * function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
 *   return (
 *     <div
 *       data-slot="dialog-header"
 *       className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
 *       {...props}
 *     />
 *   )
 * }
 */
function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

/**
 * * A React component representing the footer of a dialog.
 *  *
 *  * @param {React.ComponentProps<"div">} props - The properties passed to the div element.
 *  * @param {string} [className] - Optional CSS class name for the component.
 *  
 * function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
 *   return (
 *     <div
 *       data-slot="dialog-footer"
 *       className={cn(
 *         "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
 *         className
 *       )}
 *       {...props}
 *     />
 *   )
 * }
 */
function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

/**
 * * A DialogTitle component that wraps the DialogPrimitive.Title component.
 *  *
 *  * @param {object} props - The properties passed to the DialogPrimitive.Title component.
 *  * @param {string} [props.className] - The CSS class name for the title element.
 *  * @param {...React.ComponentProps<typeof DialogPrimitive.Title>} props - Additional props passed to the DialogPrimitive.Title component.
 *  * 
 *  * @returns {JSX.Element} A JSX element representing the DialogTitle component.
 */
function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  )
}

/**
 * * A DialogDescription component that renders a description for the dialog.
 *  *
 *  * @param {object} props - The properties of the component.
 *  * @param {string} [props.className] - The CSS class name to apply to the component.
 *  * @param {...React.ComponentProps<typeof DialogPrimitive.Description>} props - Additional props passed to the DialogPrimitive.Description component.
 *  * @returns {JSX.Element} The rendered DialogDescription component.
 */
function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
