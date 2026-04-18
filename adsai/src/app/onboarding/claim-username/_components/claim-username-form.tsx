"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateUsername,
  checkUsernameAvailability,
} from "@/app/actions/username";
import { usernameSchema } from "@/app/actions/schemas";

// Form schema using the same validation as server
const formSchema = z.object({
  username: usernameSchema,
});

type FormData = z.infer<typeof formSchema>;

/**
 * * @param {string} username - The username to claim.
 *  
 * export function ClaimUsernameForm() {
 *   const router = useRouter();
 *   const [isPending, startTransition] = useTransition();
 *   const [serverError, setServerError] = useState<string | null>(null);
 *   const [availabilityStatus, setAvailabilityStatus] = useState<
 *     "idle" | "checking" | "available" | "taken"
 *   >("idle");
 *
 *   const {
 *     register,
 *     handleSubmit,
 *     watch,
 *     setError,
 *     formState: { errors, isValid },
 *   } = useForm<FormData>({
 *     resolver: zodResolver(formSchema),
 *     mode: "onChange",
 *     defaultValues: {
 *       username: "",
 *     },
 *   });
 *
 *   const usernameValue = watch("username");
 *
 *   
 *    * Debounced username availability check.
 *    
 *   const checkAvailability = useCallback(
 *     async (username: string) => {
 *       if (username.length < 3) {
 *         setAvailabilityStatus("idle");
 *         return;
 *       }
 *
 *       // Validate format first
 *       const validation = usernameSchema.safeParse(username);
 *       if (!validation.success) {
 *         setAvailabilityStatus("idle");
 *         return;
 *       }
 *
 *       setAvailabilityStatus("checking");
 *
 *       const result = await checkUsernameAvailability(username);
 *
 *       if (result.error) {
 *         setAvailabilityStatus("idle");
 *         return;
 *       }
 *
 *       setAvailabilityStatus(result.available ? "available" : "taken");
 *
 *       if (!result.available) {
 *         setError("username", {
 *           type: "manual",
 *           message: "This username is already taken",
 *         });
 *       }
 *     },
 *     [setError]
 *   );
 *
 *   
 *    * Handle blur to check availability.
 *    
 *   const handleBlur = () => {
 *     if (usernameValue && usernameValue.length >= 3 && !errors.username) {
 *       checkAvailability(usernameValue);
 *     }
 *   };
 *
 *   
 *    * Handle form submission.
 *    
 *   const onSubmit = (data: FormData) => {
 *     setServerError(null);
 *
 *     startTransition(async () => {
 *       const formData = new FormData();
 *       formData.append("username", data.username);
 *
 *       const result = await updateUsername(formData);
 *
 *       if (result.success) {
 *         router.push("/");
 *         router.refresh();
 *       } else if (result.fieldError) {
 *         setError("username", {
 *           type: "server",
 *           message: result.fieldError,
 *         });
 *       } else if (result.error) {
 *         setServerError(result.error);
 *       }
 *     });
 *   };
 *
 *   
 *    * Get input border class.
 *    
 *   const getInputBorderClass = () => {
 *     if (errors.username || availabilityStatus === "taken") {
 *       return "border-red-500 focus:ring-red-500";
 *     }
 *     if (availabilityStatus === "available") {
 *       return "border-green-500 focus:ring-green-500";
 *     }
 *     return "border-neutral-800 focus:ring-brand-500";
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
 *       {/* Server Error }
 *       {serverError && (
 *         <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
 *           <p className="text-sm text-red-400">{serverError}</p>
 *         </div>
 *       )}
 *
 *       {/* Username Field }
 *       <div className="space-y-2">
 *         <Label htmlFor="username" className="text-neutral-200">
 *           Username
 *         </Label>
 *         <div className="relative">
 *           <Input
 *             id="username"
 *             type="text"
 *             placeholder="johndoe"
 *             autoComplete="username"
 *             autoFocus
 *             className={`bg-neutral-900 text-white placeholder:text-neutral-600 ${getInputBorderClass()} pr-10`}
 *             {...register("username")}
 *             onBlur={handleBlur}
 *             disabled={isPending}
 *           />
 *           {/* Status Indicator }
 *           <div className="absolute right-3 top-1/2 -translate-y-1/2">
 *             {availabilityStatus === "checking" && (
 *               <svg
 *                 className="w-5 h-5 text-neutral-400 animate-spin"
 *                 fill="none"
 *                 viewBox="0 0 24 24"
 *               >
 *                 <circle
 *                   className="opacity-25"
 *                   cx="12"
 *                   cy="12"
 *                   r="10"
 *                   stroke="currentColor"
 *                   strokeWidth="4"
 *                 />
 *                 <path
 *                   className="opacity-75"
 *                   fill="currentColor"
 *                   d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
 *                 />
 *               </svg>
 *             )}
 *             {availabilityStatus === "available" && !errors.username && (
 *               <svg
 *                 className="w-5 h-5 text-green-500"
 *                 fill="none"
 *                 viewBox="0 0 24 24"
 *                 stroke="currentColor"
 *               >
 *                 <path
 *                   strokeLinecap="round"
 *                   strokeLinejoin="round"
 *                   strokeWidth={2}
 *                   d="M5 13l4 4L19 7"
 *                 />
 *               </svg>
 *             )}
 *             {(availabilityStatus === "taken" || errors.username) && (
 *               <svg
 *                 className="w-5 h-5 text-red-500"
 *                 fill="none"
 *                 viewBox="0 0 24 24"
 *                 stroke="currentColor"
 *               >
 *                 <path
 *                   strokeLinecap="round"
 *                   strokeLinejoin="round"
 *                   strokeWidth={2}
 *                   d="M6 18L18 6M6 6l12 12"
 *                 />
 *               </svg>
 *             )}
 *           </div>
 *         </div>
 *         {/* Error Message }
 *         {errors.username && (
 *           <p className="text-sm text-red-400">{errors.username.message}</p>
 *         )}
 *         {/* Availability Message }
 *         {availabilityStatus === "available" && !errors.username && (
 *           <p className="text-sm text-green-400">Username is available!</p>
 *         )}
 *       </div>
 *
 *       {/* Submit Button }
 *       <Button
 *         type="submit"
 *         className="w-full bg-brand-500 hover:bg-brand-600 text-black font-semibold py-2.5"
 *         disabled={
 *           isPending ||
 *           !isValid ||
 *           availabilityStatus === "taken" ||
 *           availabilityStatus === "checking"
 *         }
 *       >
 *         {isPending ? (
 *           <span className="flex items-center gap-2">
 *             <svg
 *               className="w-4 h-4 animate-spin"
 *               fill="none"
 *               viewBox="0 0 24 24"
 *             >
 *               <circle
 *                 className="opacity-25"
 *                 cx="12"
 *                 cy="12"
 *                 r="10"
 *                 stroke="currentColor"
 *                 strokeWidth="4"
 *               />
 *               <path
 *                 className="opacity-75"
 *                 fill="currentColor"
 *                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
 *               />
 *             </svg>
 *             Claiming username...
 *           </span>
 *         ) : (
 *           "Claim username"
 *         )}
 *       </Button>
 *     </form>
 *   );
 * }
 */
export function ClaimUsernameForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [availabilityStatus, setAvailabilityStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library -- React Hook Form's watch() is used safely here
  const usernameValue = watch("username");

  // Debounced username availability check
  const checkAvailability = useCallback(
    async (username: string) => {
      if (username.length < 3) {
        setAvailabilityStatus("idle");
        return;
      }

      // Validate format first
      const validation = usernameSchema.safeParse(username);
      if (!validation.success) {
        setAvailabilityStatus("idle");
        return;
      }

      setAvailabilityStatus("checking");

      const result = await checkUsernameAvailability(username);

      if (result.error) {
        setAvailabilityStatus("idle");
        return;
      }

      setAvailabilityStatus(result.available ? "available" : "taken");

      if (!result.available) {
        setError("username", {
          type: "manual",
          message: "This username is already taken",
        });
      }
    },
    [setError]
  );

  // Handle blur to check availability
  const handleBlur = () => {
    if (usernameValue && usernameValue.length >= 3 && !errors.username) {
      checkAvailability(usernameValue);
    }
  };

  const onSubmit = (data: FormData) => {
    setServerError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("username", data.username);

      const result = await updateUsername(formData);

      if (result.success) {
        // Notify other client components (e.g. MainNavWrapper) that the profile changed
        try {
          // give the server a moment to persist changes, then dispatch the event
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("profile:updated"));
          }, 100);
        } catch (e) {
          void e;
          
        }

        router.push("/");
        router.refresh();
      } else if (result.fieldError) {
        setError("username", {
          type: "server",
          message: result.fieldError,
        });
      } else if (result.error) {
        setServerError(result.error);
      }
    });
  };

  const getInputBorderClass = () => {
    if (errors.username || availabilityStatus === "taken") {
      return "border-red-500 focus:ring-red-500";
    }
    if (availabilityStatus === "available") {
      return "border-green-500 focus:ring-green-500";
    }
    return "border-neutral-800 focus:ring-brand-500";
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Server Error */}
      {serverError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400">{serverError}</p>
        </div>
      )}

      {/* Username Field */}
      <div className="space-y-2">
        <Label htmlFor="username" className="text-neutral-200">
          Username
        </Label>
        <div className="relative">
          <Input
            id="username"
            type="text"
            placeholder="johndoe"
            autoComplete="username"
            autoFocus
            className={`bg-neutral-900 text-white placeholder:text-neutral-600 ${getInputBorderClass()} pr-10`}
            {...register("username")}
            onBlur={handleBlur}
            disabled={isPending}
          />
          {/* Status Indicator */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {availabilityStatus === "checking" && (
              <svg
                className="w-5 h-5 text-neutral-400 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {availabilityStatus === "available" && !errors.username && (
              <svg
                className="w-5 h-5 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            {(availabilityStatus === "taken" || errors.username) && (
              <svg
                className="w-5 h-5 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>
        </div>
        {/* Error Message */}
        {errors.username && (
          <p className="text-sm text-red-400">{errors.username.message}</p>
        )}
        {/* Availability Message */}
        {availabilityStatus === "available" && !errors.username && (
          <p className="text-sm text-green-400">Username is available!</p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-brand-500 hover:bg-brand-600 text-black font-semibold py-2.5"
        disabled={
          isPending ||
          !isValid ||
          availabilityStatus === "taken" ||
          availabilityStatus === "checking"
        }
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <svg
              className="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Claiming username...
          </span>
        ) : (
          "Claim username"
        )}
      </Button>
    </form>
  );
}
