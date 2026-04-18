import React from "react";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * * Renders an EmptyState component with a list not found message.
 *  *
 *  * @param {object} props - The component's properties.
 *  * @param {string} props.title - The title of the empty state.
 *  * @param {string} props.description - A brief description of the error.
 *  * @param {object} props.action - An object containing the primary action.
 *  * @param {string} props.action.label - The label for the primary action.
 *  * @param {string} props.action.href - The URL for the primary action.
 *  * @param {object} props.secondaryAction - An object containing the secondary action.
 *  * @param {string} props.secondaryAction.label - The label for the secondary action.
 *  * @param {string} props.secondaryAction.href - The URL for the secondary action.
 *  *
 *  * @returns {JSX.Element} The rendered EmptyState component.
 */
export default function ListNotFound() {
  return (
    <main className="pt-24 pb-20 max-w-3xl mx-auto px-4 py-28">
      <EmptyState
        type="no-data"
        icon={(
          <svg className="text-neutral-400" xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor" aria-hidden>
            <path d="m576-80-56-56 104-104-104-104 56-56 104 104 104-104 56 56-104 104 104 104-56 56-104-104L576-80ZM120-320v-80h280v80H120Zm0-160v-80h440v80H120Zm0-160v-80h440v80H120Z" />
          </svg>
        )}
        title="List not found"
        description={"We couldn't find this list. It may have been removed or the link might be incorrect."}
        action={{ label: "Go home", href: "/" }}
        secondaryAction={{ label: "Browse lists", href: "/lists" }}
      />
    </main>
  );
}
