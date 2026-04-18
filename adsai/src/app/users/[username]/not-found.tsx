import React from "react";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * * @function UserNotFound
 *  * @description A component that displays an empty state when a user is not found.
 *  *
 *  * @param {object} props - The component's properties.
 *  * @param {string} props.title - The title of the empty state.
 *  * @param {string} props.description - A description of the empty state.
 *  * @returns {JSX.Element} The JSX element representing the UserNotFound component.
 */
export default function UserNotFound() {
  return (
    <main className="pt-24 pb-20 max-w-3xl mx-auto px-4 py-28">
      <EmptyState
        type="no-data"
        icon={(
          <svg className="text-neutral-400" xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor" aria-hidden>
            <path d="M440-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T520-640q0-33-23.5-56.5T440-720q-33 0-56.5 23.5T360-640q0 33 23.5 56.5T440-560ZM884-20 756-148q-21 12-45 20t-51 8q-75 0-127.5-52.5T480-300q0-75 52.5-127.5T660-480q75 0 127.5 52.5T840-300q0 27-8 51t-20 45L940-76l-56 56ZM660-200q42 0 71-29t29-71q0-42-29-71t-71-29q-42 0-71 29t-29 71q0 42 29 71t71 29Zm-540 40v-111q0-34 17-63t47-44q51-26 115-44t142-18q-12 18-20.5 38.5T407-359q-60 5-107 20.5T221-306q-10 5-15.5 14.5T200-271v31h207q5 22 13.5 42t20.5 38H120Zm320-480Zm-33 400Z" />
          </svg>
        )}
        title="User not found"
        description={"We couldn't find this user. They may have been removed or the link might be incorrect."}
        action={{ label: "Go home", href: "/" }}
        secondaryAction={{ label: "Browse members", href: "/users" }}
      />
    </main>
  );
}
