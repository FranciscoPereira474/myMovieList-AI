import {
  SectionHeader,
  MovieCarousel,
  ListPreviewCard,
} from "@/components/ui";
import type { PopularList } from "../_lib/queries";

interface ListsSectionProps {
  lists: PopularList[];
}

/**
 * * Renders a section with a carousel of popular lists.
 *  *
 *  * @param {ListsSectionProps} props - The component's properties.
 *  * @returns {JSX.Element|null} The rendered section, or null if no lists are provided.
 */
export function ListsSection({ lists }: ListsSectionProps) {
  if (lists.length === 0) {
    return null;
  }

  // Duplicate lists to create infinite carousel effect
  const duplicatedLists = [...lists, ...lists, ...lists];

  return (
    <section>
      <SectionHeader
        title="Popular Lists this Week"
        viewAllHref="/lists"
      />

      <MovieCarousel gap="md" loop={true}>
        {duplicatedLists.map((list, index) => {
          return (
            <div key={`${list.id}-${index}`} className="w-[280px]">
              <ListPreviewCard
                list={{
                  id: list.id,
                  title: list.name,
                  itemCount: list.item_count,
                  saveCount: list.save_count,
                  isPublic: list.isPublic ?? true,
                }}
                author={{
                  name: list.user.username,
                  username: list.user.username,
                  avatarUrl: list.user.avatar_url || undefined,
                }}
                posterUrls={list.movie_posters}
                posterLinkToList={true}
              />
            </div>
          );
        })}
      </MovieCarousel>
    </section>
  );
}
