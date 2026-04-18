"use client";

import React, { createContext, useContext, useState } from "react";

export type QuickViewSource = "recommended" | "top-rated" | "grid" | "other";

export interface QuickViewPayload {
  id: string;
  slug: string;
  title: string;
  posterUrl?: string | null;
  year?: string | number | null;
  rating?: number | null;
  matchPercentage?: number | null;
  source?: QuickViewSource;
}

export interface QuickViewContextValue {
  isOpen: boolean;
  isAnimating: boolean;
  payload?: QuickViewPayload | null;
  open: (p: QuickViewPayload) => void;
  close: () => void;
  finalizeClose: () => void;
}

const QuickViewContext = createContext<QuickViewContextValue | undefined>(undefined);

/**
 * * QuickViewProvider component.
 *  *
 *  * Provides a context for managing the quick view state and functionality.
 *  *
 *  * @param {Object} props - Component properties.
 *  * @param {React.ReactNode} props.children - Child components to render within the provider.
 *  
 * export function QuickViewProvider({ children }: { children: React.ReactNode }) {
 *   const [isOpen, setIsOpen] = useState(false);
 *   const [isAnimating, setIsAnimating] = useState(false);
 *   const [payload, setPayload] = useState<QuickViewPayload | null>(null);
 *   const [fallbackTimer, setFallbackTimer] = useState<number | null>(null);
 *
 *   
 *    * Opens the quick view with the provided payload.
 *    *
 *    * @param {QuickViewPayload} p - Payload to display in the quick view.
 *    
 *   function open(p: QuickViewPayload) {
 *     setPayload(p);
 *     setIsOpen(true);
 *     requestAnimationFrame(() => {
 *       setIsAnimating(true);
 *     });
 *   }
 *
 *   
 *    * Closes the quick view, starting a fallback timer if necessary.
 *    
 *   function close() {
 *     setIsAnimating(false);
 *     // Start a fallback timer in case transitionend doesn't fire for any reason.
 *     // The backdrop transition is 500ms; use a slightly larger fallback (800ms).
 *     if (typeof window !== "undefined") {
 *       const t = window.setTimeout(() => {
 *         finalizeClose();
 *       }, 800);
 *       setFallbackTimer(t);
 *     }
 *   }
 *
 *   
 *    * Finalizes the close operation, clearing any remaining timers.
 *    
 *   function finalizeClose() {
 *     if (fallbackTimer) {
 *       clearTimeout(fallbackTimer);
 *       setFallbackTimer(null);
 *     }
 *     setIsOpen(false);
 *     setPayload(null);
 *   }
 *
 *   return (
 *     <QuickViewContext.Provider value={{ isOpen, isAnimating, payload, open, close, finalizeClose }}>
 *       {children}
 *     </QuickViewContext.Provider>
 *   );
 * }
 */
export function QuickViewProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [payload, setPayload] = useState<QuickViewPayload | null>(null);
  const [fallbackTimer, setFallbackTimer] = useState<number | null>(null);

  function open(p: QuickViewPayload) {
    setPayload(p);
    setIsOpen(true);
    requestAnimationFrame(() => {
      setIsAnimating(true);
    });
  }

  function close() {
    setIsAnimating(false);
    // Start a fallback timer in case transitionend doesn't fire for any reason.
    // The backdrop transition is 500ms; use a slightly larger fallback (800ms).
    if (typeof window !== "undefined") {
      const t = window.setTimeout(() => {
        finalizeClose();
      }, 800);
      setFallbackTimer(t);
    }
  }

  function finalizeClose() {
    if (fallbackTimer) {
      clearTimeout(fallbackTimer);
      setFallbackTimer(null);
    }
    setIsOpen(false);
    setPayload(null);
  }

  return (
    <QuickViewContext.Provider value={{ isOpen, isAnimating, payload, open, close, finalizeClose }}>
      {children}
    </QuickViewContext.Provider>
  );
}

/**
 * * @function useQuickView
 *  * @description Returns the context of the current QuickView provider.
 *  *
 *  * @param {object} [options] - Optional options object.
 *  *
 *  * @returns {object} The context of the current QuickView provider, or throws an error if not within a QuickViewProvider.
 */
export function useQuickView() {
  const ctx = useContext(QuickViewContext);
  if (!ctx) throw new Error("useQuickView must be used within QuickViewProvider");
  return ctx;
}

export default QuickViewProvider;
