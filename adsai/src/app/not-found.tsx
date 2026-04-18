import React from "react";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * * Renders a not found page with an empty state component.
 *  *
 *  * @param {object} props - The component's properties.
 *  * @param {string} props.title - The title of the not found page.
 *  * @param {string} props.description - A brief description of the not found page.
 *  * @param {object} props.action - An object containing the action to take when clicking on the "Go home" button.
 *  * @param {string} props.action.href - The URL for the "Go home" button's href attribute.
 *  * @param {object} props.secondaryAction - An object containing the secondary action to take when clicking on the "Browse movies" button.
 *  * @param {string} props.secondaryAction.label - The label for the "Browse movies" button.
 *  * @param {string} props.secondaryAction.href - The URL for the "Browse movies" button's href attribute.
 *  *
 *  * @returns {JSX.Element} The not found page component.
 */
export default function NotFound() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-28">
      <EmptyState
        type="no-data"
        icon={(
          <svg className="text-neutral-400" xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor" aria-hidden>
            <path d="M280-80q-83 0-141.5-58.5T80-280q0-83 58.5-141.5T280-480q83 0 141.5 58.5T480-280q0 83-58.5 141.5T280-80Zm544-40L568-376q-12-13-25.5-26.5T516-428q38-24 61-64t23-88q0-75-52.5-127.5T420-760q-75 0-127.5 52.5T240-580q0 6 .5 11.5T242-557q-18 2-39.5 8T164-535q-2-11-3-22t-1-23q0-109 75.5-184.5T420-840q109 0 184.5 75.5T680-580q0 43-13.5 81.5T629-428l251 252-56 56Zm-615-61 71-71 70 71 29-28-71-71 71-71-28-28-71 71-71-71-28 28 71 71-71 71 28 28Z" />
          </svg>
        )}
        title="Page not found"
        description={
          <>
            The page you&apos;re looking for doesn&apos;t exist or has been removed. Try
            returning to the homepage or check the url for typos.
          </>
        }
        action={{ label: "Go home", href: "/" }}
        secondaryAction={{ label: "Browse movies", href: "/movies" }}
      />
      
    </main>
  );
}
