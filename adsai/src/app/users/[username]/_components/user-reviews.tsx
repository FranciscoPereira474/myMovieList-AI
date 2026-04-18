// Removed unused imports: Link, Image, and lucide icons
import type { UserReview } from "../_lib/queries";
import { SectionHeader } from "@/components/ui/section-header";
import { UserReviewCard } from "./user-review-card";


interface UserReviewsProps {
  reviews: UserReview[];
  username: string;
}

/**
 * * Renders a list of recent reviews for a user.
 *  *
 *  * @param {UserReviewsProps} props - The component's properties.
 *  * @param {Object[]} [props.reviews] - An array of review objects.
 *  * @param {string} [props.username] - The username of the user whose reviews are being displayed.
 *  
 * export function UserReviews({ reviews, username }: UserReviewsProps) {
 *   return (
 *     <div>
 *       <SectionHeader
 *               title="Recent Reviews"
 *               viewAllHref={reviews.length > 0 ? `/users/${username}/reviews` : undefined}
 *             />
 *
 *       {reviews.length === 0 ? (
 *         <div className="text-center py-8 bg-neutral-900/50 rounded-lg border border-neutral-800">
 *           <p className="text-neutral-400 text-sm">@{username} hasn&apos;t written any reviews yet</p>
 *         </div>
 *       ) : (
 *         <div className="space-y-4">
 *           {reviews.map((review) => (
 *             <ReviewCard key={review.id} review={review} />
 *           ))}
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 */
export function UserReviews({ reviews, username }: UserReviewsProps) {
  return (
    <div>
      <SectionHeader
        title="Recent Reviews"
        viewAllHref={
          reviews.length > 0 ? `/users/${username}/reviews?sort=recent` : undefined
        }
      />

      {reviews.length === 0 ? (
        <div className="text-center py-8 bg-neutral-900/50 rounded-lg border border-neutral-800">
          <p className="text-neutral-400 text-sm">@{username} hasn&apos;t written any reviews yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <UserReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}


// StarRatingDisplay removed — not used in this file
