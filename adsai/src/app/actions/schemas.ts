import { z } from "zod";

// Zod schema for username validation
export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be at most 20 characters")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Username can only contain letters, numbers, underscores, and hyphens"
  )
  .refine(
    (val) => !/^[-_]/.test(val),
    "Username cannot start with a hyphen or underscore"
  )
  .refine(
    (val) => !/[-_]$/.test(val),
    "Username cannot end with a hyphen or underscore"
  );

export type UsernameSchema = z.infer<typeof usernameSchema>;
