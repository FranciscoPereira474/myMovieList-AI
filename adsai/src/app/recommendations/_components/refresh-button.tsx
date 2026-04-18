"use client";

import { RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * * Renders a refresh button that, when clicked, triggers a page reload.
 *  *
 *  * @param {object} props - The component's properties.
 *  * @returns {JSX.Element} The refresh button element.
 *  
 * export function RefreshButton(props) {
 *   const router = useRouter();
 *   const [isRefreshing, setIsRefreshing] = useState(false);
 *
 *   
 *    * Handles the refresh button click event.
 *    *
 *    * @async
 *    
 *   const handleRefresh = async () => {
 *     setIsRefreshing(true);
 *     router.refresh();
 *     
 *     // Reset the spinning state after animation completes
 *     setTimeout(() => {
 *       setIsRefreshing(false);
 *     }, 500);
 *   };
 *
 *   return (
 *     <button
 *       onClick={handleRefresh}
 *       disabled={isRefreshing}
 *       className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-500 text-white px-4 py-2 rounded-lg transition-all text-sm font-medium group disabled:opacity-50"
 *     >
 *       <RotateCw
 *         className={`w-4 h-4 text-brand-500 transition-transform duration-500 ${
 *           isRefreshing ? "rotate-180" : "group-hover:rotate-180"
 *         }`}
 *       />
 *       Refresh
 *     </button>
 *   );
 * }
 */
export function RefreshButton() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    router.refresh();
    
    // Reset the spinning state after animation completes
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-500 text-white px-4 py-2 rounded-lg transition-all text-sm font-medium group disabled:opacity-50"
    >
      <RotateCw
        className={`w-4 h-4 text-brand-500 transition-transform duration-500 ${
          isRefreshing ? "rotate-180" : "group-hover:rotate-180"
        }`}
      />
      Refresh
    </button>
  );
}
