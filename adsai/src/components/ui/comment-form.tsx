"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./user-avatar";
import { Button } from "./button";

export interface CommentFormProps extends Omit<React.HTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  /** Current user's avatar URL */
  userAvatarUrl?: string;
  /** Current user's name (for avatar fallback) */
  userName?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Submit button text */
  submitText?: string;
  /** Callback when comment is submitted */
  onSubmit?: (content: string) => void;
  /** Whether the form is in loading state */
  isLoading?: boolean;
}

/**
 * * A comment form component that allows users to write and submit comments.
 *  *
 *  * @param {CommentFormProps} props - The properties of the comment form.
 *  * @param {string} [props.userAvatarUrl] - The URL of the user's avatar.
 *  * @param {string} [props.userName="User"] - The name of the user.
 *  * @param {string} [props.placeholder="Write a comment..."] - The placeholder text for the textarea.
 *  * @param {string} [props.submitText="Post"] - The text to display on the submit button.
 *  * @param {function} [props.onSubmit] - A callback function to be called when the form is submitted.
 *  * @param {boolean} [props.isLoading=false] - Whether the form is currently being processed.
 *  * @param {string} [props.className=""] - Additional CSS class names for the form element.
 *  
 *
 * export function CommentForm({
 *   userAvatarUrl,
 *   userName = "User",
 *   placeholder = "Write a comment...",
 *   submitText = "Post",
 *   onSubmit,
 *   isLoading = false,
 *   className,
 *   ...props
 * }: CommentFormProps) {
 *   const [content, setContent] = React.useState("");
 *
 *   const handleSubmit = (e: React.FormEvent) => {
 *     e.preventDefault();
 *     if (content.trim() && onSubmit) {
 *       onSubmit(content.trim());
 *       setContent("");
 *     }
 *   };
 *
 *   return (
 *     <form
 *       onSubmit={handleSubmit}
 *       className={cn("flex gap-4", className)}
 *       {...props}
 *     >
 *       <UserAvatar src={userAvatarUrl} alt={userName} size="lg" />
 *       <div className="flex-1">
 *         <div className="relative">
 *           <textarea
 *             value={content}
 *             onChange={(e) => setContent(e.target.value)}
 *             rows={3}
 *             placeholder={placeholder}
 *             disabled={isLoading}
 *             className={cn(
 *               "w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 scrollbar-custom",
 *               "focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors resize-none",
 *               isLoading && "opacity-50 cursor-not-allowed"
 *             )}
 *           />
 *         </div>
 *         <div className="flex justify-end mt-2">
 *           <Button
 *             type="submit"
 *             size="sm"
 *             disabled={!content.trim() || isLoading}
 *             className="bg-brand-600 hover:bg-brand-500 text-white"
 *           >
 *             {isLoading ? "Posting..." : submitText}
 *           </Button>
 *         </div>
 *       </div>
 *     </form>
 *   );
 * }
 */
export function CommentForm({
  userAvatarUrl,
  userName = "User",
  placeholder = "Write a comment...",
  submitText = "Post",
  onSubmit,
  isLoading = false,
  className,
  ...props
}: CommentFormProps) {
  const [content, setContent] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && onSubmit) {
      onSubmit(content.trim());
      setContent("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex gap-4", className)}
      {...props}
    >
      <UserAvatar src={userAvatarUrl} alt={userName} size="lg" />
      <div className="flex-1">
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder={placeholder}
            disabled={isLoading}
            className={cn(
              "w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 scrollbar-custom",
              "focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors resize-none",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
          />
        </div>
        <div className="flex justify-end mt-2">
          <Button
            type="submit"
            size="sm"
            disabled={!content.trim() || isLoading}
            className="bg-brand-600 hover:bg-brand-500 text-white"
          >
            {isLoading ? "Posting..." : submitText}
          </Button>
        </div>
      </div>
    </form>
  );
}
