import React from "react";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * * Renders an EmptyState component with a no-data type, icon, title, description, and actions.
 *  *
 *  * @param {object} props - The component's properties.
 *  * @param {string} props.icon - The SVG icon to display.
 *  * @param {string} props.title - The title of the empty state.
 *  * @param {string} props.description - A brief description of the empty state.
 *  * @param {object} props.action - The primary action to take, with a label and href.
 *  * @param {object} [props.secondaryAction] - An optional secondary action, with a label and href.
 *  *
 *  * @returns {JSX.Element} The rendered EmptyState component.
 */
export default function ListsNotFound() {
  return (
    <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <EmptyState
        type="no-data"
        icon={(
          <svg className="text-neutral-400" xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor" aria-hidden>
            <path d="m576-80-56-56 104-104-104-104 56-56 104 104 104-104 56 56-104 104 104 104-56 56-104-104L576-80ZM120-320v-80h280v80H120Zm0-160v-80h440v80H120Zm0-160v-80h440v80H120Z" />
          </svg>
        )}
        title="Lists not found"
        description={"We couldn't find lists for this user. They may have been removed or the link might be incorrect."}
        action={{ label: "Go home", href: "/" }}
        secondaryAction={{ label: "Browse lists", href: "/lists" }}
      />
    </main>
  );
}
