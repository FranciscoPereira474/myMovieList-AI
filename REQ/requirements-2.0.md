# Requirements for Movie Recommendation Project

## 1 --- Project goals & constraints

-   Primary goal: a single-repo, monolithic full-stack web app (Next.js)
    that offers movie discovery, per-movie pages, user accounts,
    reviews, ratings, and simple recommendations. (Matches the PDF stack
    choice.)
-   Budget constraint: free tiers only (Vercel + Supabase + TMDB). Note
    Supabase free DB storage \~500MB → design to avoid storing large
    media blobs.
-   Deploy model: CI/CD automatic on GitHub → Vercel production.

## 2 --- Actors (users & roles)

-   Anonymous visitor (browse, search, see SSR pages)
-   Registered user (all visitor actions + post review, rate, like,
    watchlist)
-   Admin (manage seeded movie data, moderate reviews --- optional for
    MVP)

## 3 --- High-level user stories (prioritized)

1.  As a visitor I can see a homepage with recommendations, popular
    lists and a search box.
2.  As a visitor I can view an SSR movie page with metadata, cast (if
    available), ratings and reviews.
3.  As a user I can sign up / log in (Supabase Auth).
4.  As a user I can post/edit/delete my reviews and rate movies.
5.  As a user I can add/remove movies to my watchlist and mark as
    watched.
6.  As a user I can like other users' reviews.
7.  As a user I get personalized recommendations (exclude movies already
    watched).
8.  As an admin I can re-seed or refresh TMDB metadata (script).

## 4 --- Functional requirements (detailed)

### 4.1 Pages & navigation

-   `/` --- Home (SSR): top N recommendations, trending, genres, quick
    search.
-   `/movies/[id]` --- Movie page (SSR): title, release date, runtime,
    genres, poster (link to TMDB image), overview, average rating,
    reviews list, action UI (rate, add to watchlist).
-   `/users/[id]` --- User profile (SSR): public reviews, stats (reviews
    count, avg rating).
-   `/reviews/[id]` --- Review page (SSR optional).
-   Server routes (Next.js API routes) for mutations (POST /api/reviews,
    POST /api/ratings, PATCH /api/watchlist, etc.).

### 4.2 Authentication & user profile

-   Use Supabase Auth (email/password) for login/signup and session
    management (JWT). Profile table stored in DB to hold display name,
    avatar URL and preferences.

### 4.3 Movies metadata & TMDB integration

-   On first deploy run a seed script that pulls a curated set of movies
    (e.g., top 500 popular/now_playing/from specific years) from TMDB
    and stores minimal metadata (tmdbId, title, overview,
    poster/backdrop URLs, release_date, runtime, genres).
-   For pages not present in DB, server logic should fetch from TMDB on
    demand and persist (cache) the record.
-   Do **not** store poster images in Supabase storage; use TMDB image
    URLs to save DB space.

### 4.4 Reviews / Ratings / Likes / Watchlist

-   Reviews: create/edit/delete by author only. Reviews attach `rating`
    (1--10).
-   Ratings: a separate Rating entity for quick average computation;
    unique constraint (user, movie) --- user can change rating.
-   Likes: user can like a review (unique per user/review).
-   Watchlist: per-user watchlist with status enum
    `{want_to_watch, watching, watched}` and date fields.

### 4.5 Search & filters

-   Search by title (partial, case-insensitive) and overview (full-text
    optional).
-   Filters: genre(s), year, runtime range, sort by popularity /
    release_date / avg_rating / most_reviewed.
-   Pagination: cursor or page/limit support (page size default 20).

### 4.6 Recommendations (MVP)

-   Simple hybrid: combine popularity (TMDB popularity) + content-based
    similarity (shared genres + keywords) + exclude watched movies. This
    can be implemented entirely server-side with SQL + small weighting.
    (More advanced collaborative filtering is roadmap.)

## 5 --- Non-functional requirements

-   SSR first for SEO (Home, Movie, User) as in the PDF.
-   Accessibility: meet WCAG AA for key pages (movie page, search).
-   Performance: pages should be cached at edge where possible; API
    routes throttled; avoid storing images.
-   Scalability: monolith is fine for MVP; design DB with sensible
    indices (tmdbId, movie.title, ratings.movieId).
-   Security: mitigate OWASP Top 10 (RLS for per-user writes, input
    validation, CSRF protections via Supabase session handling).
-   Data retention & privacy: allow user to delete account and
    associated personal data; maintain minimal profile fields.

## 6 --- Data model (Prisma schema --- ready to drop into `schema.prisma`)

``` prisma
... (prisma schema omitted for brevity, see original answer) ...
```

## 7 --- API surface (Next.js API Routes / contract examples)

All write endpoints require auth (Supabase JWT). Use JSON bodies and
standard HTTP response codes.

-   `GET /api/movies?query=&genres=&page=&pageSize=&sort=` --- list (SSR
    can call this).
-   `GET /api/movies/:tmdbId` --- return DB movie + aggregated ratings +
    top reviews; if missing, fetch TMDB, persist and return.
-   `POST /api/reviews` --- body `{ movieTmdbId, title?, body, rating }`
    → create review + rating row. Auth required.
-   `PATCH /api/reviews/:id` --- edit by owner only.
-   `DELETE /api/reviews/:id` --- delete by owner or admin.
-   `POST /api/ratings` --- `{ movieTmdbId, value }` → upsert rating.
-   `POST /api/watchlist` --- add/remove/update.
-   `POST /api/reviews/:id/like` --- toggle like/unlike.
-   `GET /api/recommendations?userId=&size=10` --- returns list of
    recommended movies for user (server side combine popularity + genre
    similarity + user behavior).

## 8 --- Security & privacy specifics

-   Supabase Auth for auth; store user profile in `users` table.
-   Row Level Security (RLS) enforced on reviews/ratings/watchlist.
-   Input validation & sanitization on server (no raw HTML in reviews
    without sanitizing).
-   Protect API routes with middleware that verifies Supabase JWT.
-   Rate limit API (e.g. middleware using Vercel Edge or Next
    middleware): basic throttle to avoid abuse (e.g. 60 req/min per IP
    for mutation routes --- tune as needed).

## 9 --- Testing, CI/CD, linting

-   Unit, component, and E2E tests (Jest, React Testing Library,
    Playwright).
-   GitHub Actions CI pipeline with linting, typecheck, tests, deploy to
    Vercel.

## 10 --- Monitoring & logging

-   Sentry for error tracking.
-   Supabase logs + Vercel logs.
-   Simple analytics table in DB (events table) for DAU/MAU, reviews per
    day.

## 11 --- Acceptance criteria (testable)

-   User signup, movie page retrieval, review lifecycle, recommendation
    endpoint, seed script runs and populates DB.

## 12 --- Roadmap & MVP vs future

-   MVP: Auth, seed + cached TMDB metadata, movie SSR page,
    reviews/ratings CRUD, watchlist, simple recommendations, CI +
    tests + deploy.
-   Next: Likes, user profiles, pagination improvements, full-text
    search, analytics, RLS enforced & privacy controls, E2E pipeline.
-   Later: Collaborative filtering, social/sharing, admin moderation UI,
    image uploads.

## 13 --- Risks & mitigations

-   DB storage limit (Supabase free 500MB): avoid saving images, only
    keep metadata; purge old logs.
-   TMDB rate limits: cache aggressively, seed curated set, obey API key
    rules.
-   Vercel free limits: monitor bandwidth, use SSR caching and ISR for
    high-traffic pages.

## 14 --- Deliverables

-   README.md with architecture diagram and env var list.
-   schema.prisma and migrations.
-   Seed script scripts/seedTmdb.ts.
-   API spec documentation.
-   Test reports and Vercel deployment link.
