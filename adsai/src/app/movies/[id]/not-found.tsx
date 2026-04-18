import { EmptyState } from "@/components/ui/empty-state";
import { Film } from "lucide-react";

/**
 * * Renders a movie not found page with an empty state component.
 *  *
 *  * @param {object} props - The component's properties
 *  * @param {string} props.title - The title of the page
 *  * @param {string} props.description - A brief description of the error
 *  * @returns {JSX.Element} The JSX element representing the movie not found page
 */
export default function MovieNotFound() {
  return (
    <main className="relative z-10 pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <EmptyState
        icon={<Film className="h-8 w-8 text-neutral-400" />}
        title="Movie Not Found"
        description={"Sorry, we couldn't find the movie you're looking for. It may have been removed or the link might be incorrect."}
        action={{ label: "Go home", href: "/" }}
        secondaryAction={{ label: "Browse movies", href: "/movies" }}
      />
    </main>
  );
}
