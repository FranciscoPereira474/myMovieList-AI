"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const searchInputVariants = cva(
  "flex items-center bg-neutral-900 border border-neutral-800 text-neutral-200 transition-all",
  {
    variants: {
      variant: {
        default: "rounded-full",
        square: "rounded-lg",
      },
      size: {
        sm: "h-8 text-sm px-3",
        md: "h-10 text-sm px-4",
        lg: "h-12 text-base px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "onSubmit">,
    VariantProps<typeof searchInputVariants> {
  /** Callback when search value changes */
  onSearch?: (value: string) => void;
  /** Callback when user presses Enter to submit search */
  onSubmit?: (value: string) => void;
  /** Whether to show clear button */
  showClear?: boolean;
  /** Icon to show (defaults to Search) */
  icon?: React.ReactNode;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput({
  variant,
  size,
  className,
  placeholder = "Search...",
  value,
  onChange,
  onSearch,
  onSubmit,
  showClear = true,
  icon,
  ...props
}: SearchInputProps, ref) {
  const [internalValue, setInternalValue] = React.useState(value || "");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Forward the internal ref to the parent ref passed via forwardRef
  React.useEffect(() => {
    if (!ref) return;
    if (typeof ref === "function") {
      try {
        ref(inputRef.current);
      } catch {
        // ignore
      }
    } else {
      (ref as React.MutableRefObject<HTMLInputElement | null>).current = inputRef.current;
    }
  }, [ref]);

  const displayValue = value !== undefined ? value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange?.(e);
    onSearch?.(newValue);
  };

  const handleClear = () => {
    setInternalValue("");
    onSearch?.("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSubmit) {
      e.preventDefault();
      onSubmit(String(displayValue));
    }
  };

  const iconSize = size === "lg" ? 20 : size === "sm" ? 14 : 16;

  return (
    <div
      className={cn(
        searchInputVariants({ variant, size }),
        "focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent",
        className
      )}
    >
      <span className="text-neutral-500 mr-2 shrink-0">
        {icon || <Search size={iconSize} />}
      </span>
      <input
        ref={inputRef}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none placeholder-neutral-600 min-w-0"
        {...props}
      />
      {showClear && displayValue && (
        <button
          type="button"
          onClick={handleClear}
          className="text-neutral-500 hover:text-neutral-300 ml-2 shrink-0 transition-colors"
        >
          <X size={iconSize} />
        </button>
      )}
    </div>
  );

});

export { searchInputVariants };
