import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * * Merges the provided class names into a single string using `twMerge` and `clsx`.
 *  *
 *  * @param {ClassValue[]} inputs - An array of class names to be merged.
 *  * @returns {string} The merged class name string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
