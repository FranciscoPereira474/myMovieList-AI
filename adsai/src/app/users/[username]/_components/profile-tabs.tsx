"use client"

import React, { useTransition, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ProfileTabsProps {
  activeTab: "ratings" | "activity" | "watchlist" | "lists";
  userId: string;
}

export default function ProfileTabs({ activeTab, userId }: ProfileTabsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticActive, setOptimisticActive] = useState(activeTab);
  const [showSpinner, setShowSpinner] = useState(true);

  const tabs = [
    { id: "activity", label: "Recent", href: `/users/${userId}` },
    { id: "watchlist", label: "Watchlist", href: `/users/${userId}?tab=watchlist` },
    { id: "ratings", label: "Ratings", href: `/users/${userId}?tab=ratings` },
    { id: "lists", label: "Lists", href: `/users/${userId}?tab=lists` },
  ] as const;

  useEffect(() => {
    function update() {
      setShowSpinner(window.innerWidth >= 400);
    }

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="relative border-b border-neutral-800 mb-8 sticky top-16 bg-neutral-950/95 backdrop-blur z-40">
      <nav className="flex space-x-8 overflow-x-auto no-scrollbar" aria-label="Profile tabs">
        {tabs.map((tab) => {
          const selected = optimisticActive === tab.id;
          return (
            <a
              key={tab.id}
              href={tab.href}
              onClick={(e) => {
                e.preventDefault();
                setOptimisticActive(tab.id);
                startTransition(() => {
                  router.push(tab.href);
                });
              }}
              className={cn(
                `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${selected ? "border-brand-500 text-brand-400" : "border-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-700"}`
              )}
            >
              {tab.label}
            </a>
          );
        })}
      </nav>

      {isPending && showSpinner && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <svg className="animate-spin h-5 w-5 text-brand-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        </div>
      )}
    </div>
  );
}
