import {
  SectionHeader,
  MovieCarousel,
  ReviewCard,
} from "@/components/ui";
import type { PopularReview } from "../_lib/queries";

interface ReviewsSectionProps {
  reviews: PopularReview[];
  isLoggedIn?: boolean;
}

/**
 * * Renders a reviews section with a movie carousel.
 *  *
 *  * @param {ReviewsSectionProps} props - The component's properties.
 *  * @returns {JSX.Element|null} The rendered reviews section, or null if no reviews are available.
 *  
 * export function ReviewsSection({ reviews, isLoggedIn = false }: ReviewsSectionProps) {
 *   // ... (rest of the code remains the same)
 * }
 */
export function ReviewsSection({ reviews, isLoggedIn = false }: ReviewsSectionProps) {
  if (reviews.length === 0) {
    return null;
  }

  return (
    <section>
      <SectionHeader
        title="Popular Reviews"
        viewAllHref="/reviews"
        viewAllText="More Reviews"
      />

      <MovieCarousel gap="md" loop={true}>
        {reviews.map((review) => {
          const year = review.movie.release_date
            ? new Date(review.movie.release_date).getFullYear()
            : "—";

          // Format timestamp
          const timestamp = new Date(review.created_at).toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
            }
          );

          return (
            <div key={review.id} className="w-[320px]">
              <ReviewCard
                reviewId={review.id}
                user={{
                  name: review.user.username,
                  username: review.user.username,
                  avatarUrl: review.user.avatar_url || undefined,
                }}
                movie={{
                  id: review.movie.id,
                  slug: review.movie.slug,
                  title: review.movie.title,
                  year: year,
                  posterUrl: review.movie.poster_url || "/placeholder-poster.jpg",
                }}
                rating={review.user_rating ? review.user_rating / 2 : 0}
                reviewTitle={review.title}
                content={review.body || ""}
                hasSpoiler={!!review.contains_spoilers}
                timestamp={timestamp}
                likes={review.upvotes_count}
                dislikes={review.downvotes_count}
                comments={review.comments_count}
                currentUserVote={review.currentUserVote}
                isLoggedIn={isLoggedIn}
              />
            </div>
          );
        })}
      </MovieCarousel>
    </section>
  );
}
