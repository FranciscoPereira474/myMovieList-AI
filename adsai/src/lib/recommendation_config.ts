// Centralized recommendation-related configuration
// Export named constants so callers can opt into specific thresholds

/** Default minimum number of ratings required by the algorithm */
export const DEFAULT_MIN_RATINGS = 3;

/** Minimum ratings required for the home page to show personalized recommendations */
export const HOME_MIN_RATINGS = 3;

/** Minimum ratings used by the dedicated recommendations page */
export const RECOMMENDATIONS_PAGE_MIN_RATINGS = 3;
