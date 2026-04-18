"use client";

import { cva, type VariantProps } from "class-variance-authority";
import Image from "next/image";
import { cn } from "@/lib/utils";

const userAvatarVariants = cva(
  "relative rounded-full overflow-hidden border border-neutral-700 bg-neutral-800 flex items-center justify-center shrink-0",
  {
    variants: {
      size: {
        sm: "h-6 w-6 text-[10px]",
        md: "h-8 w-8 text-xs",
        lg: "h-10 w-10 text-sm",
        xl: "h-12 w-12 text-base",
        "2xl": "h-24 w-24 text-2xl md:h-32 md:w-32",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export interface UserAvatarProps
  extends VariantProps<typeof userAvatarVariants>,
    Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** URL of the avatar image */
  src?: string | null;
  /** Alt text for the image / name for initials fallback */
  alt: string;
}

/**
 * * Renders a user avatar component.
 *  *
 *  * @param {UserAvatarProps} props - The properties for the UserAvatar component.
 *  * @param {string} [props.src] - The source URL of the avatar image.
 *  * @param {string} [props.alt] - The alt text for the avatar image.
 *  * @param {string} [props.size] - The size of the avatar (2xl, xl, lg, md).
 *  * @param {string} [props.className] - Additional CSS class names for the component.
 *  *
 *  * @returns {JSX.Element} The rendered UserAvatar component.
 */
export function UserAvatar({
  src,
  alt,
  size,
  className,
  ...props
}: UserAvatarProps) {
  const initials = getInitials(alt);

  return (
    <div className={cn(userAvatarVariants({ size }), className)} {...props}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes={
            size === "2xl"
              ? "128px"
              : size === "xl"
                ? "48px"
                : size === "lg"
                  ? "40px"
                  : size === "md"
                    ? "32px"
                    : "24px"
          }
        />
      ) : (
        <span className="font-medium text-neutral-400 select-none">
          {initials}
        </span>
      )}
    </div>
  );
}

export { userAvatarVariants };
