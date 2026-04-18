# ADS AI - Project Context (Source of Truth)

> **This file is the canonical reference for all development work on this repository.**

---

## Project Summary

Letterboxd-style movie platform using Next.js 16.

---

## Tech Stack (Strict Rules)

| Technology | Version/Details | Notes |
|------------|-----------------|-------|
| **Framework** | Next.js 16 | App Router only |
| **Rendering** | React Server Components (RSC) | Default for all components |
| **Styling** | Tailwind CSS | Utility-first approach |
| **Language** | TypeScript | Strict mode enabled |
| **Database** | Supabase | Via `@/lib/supabase` |
| **Auth** | Supabase Auth + `@supabase/ssr` | Cookie-based sessions |
| **Carousel** | `embla-carousel-react` | Horizontal scrolling lists |
| **Carousel Plugin** | `embla-carousel-wheel-gestures` | Mouse wheel support for carousels |

---

## Authentication

### Overview
Authentication is handled by Supabase Auth with `@supabase/ssr` for proper Next.js App Router integration.

### Auth Routes

| Route | Purpose |
|-------|---------|
| `/login` | Sign in with email/password or OAuth |
| `/register` | Create new account with username |
| `/auth/callback` | OAuth redirect handler |

### File Structure
```
src/
├── app/
│   ├── (auth)/                    # Auth route group (no nav/footer)
│   │   ├── layout.tsx             # Split-screen auth layout
│   │   ├── login/page.tsx         # Login page
│   │   ├── register/page.tsx      # Register page
│   │   └── _components/
│   │       └── auth-form.tsx      # Client component for auth forms
│   └── auth/
│       └── callback/route.ts      # OAuth callback API route
├── lib/supabase/
│   ├── browser-client.ts          # Client-side Supabase (use client)
│   └── server-client.ts           # Server-side Supabase (async, uses cookies)
└── middleware.ts                  # Refreshes auth session on every request
```

### Supabase Client Usage

```typescript
// Client Components (forms, interactions)
import { createBrowserClient } from "@/lib/supabase/browser-client"
const supabase = createBrowserClient()

// Server Components & API Routes (async!)
import { createServerClient } from "@/lib/supabase/server-client"
const supabase = await createServerClient()  // ⚠️ MUST await
```

### Database Schema: Profiles Table
```sql
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  username text NOT NULL UNIQUE,
  avatar_url text,
  bio text,
  username_is_temp BOOLEAN NOT NULL DEFAULT false, -- Flag for deferred registration
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
```

### Database Trigger (Guaranteed Unique Username)
This trigger auto-creates profiles for new users with a **guaranteed unique username**.
For OAuth users, it generates a temporary username (e.g., `john-a1b2`) using the UUID suffix.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  base_username text;
  temp_username text;
  uuid_suffix text;
BEGIN
  -- Extract base username from metadata or email
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Sanitize and truncate to 15 chars
  base_username := lower(base_username);
  base_username := regexp_replace(base_username, '\s+', '-', 'g');
  base_username := regexp_replace(base_username, '[^a-z0-9_-]', '', 'g');
  base_username := left(base_username, 15);
  
  IF base_username = '' OR base_username IS NULL THEN
    base_username := 'user';
  END IF;
  
  -- Append last 4 chars of UUID for guaranteed uniqueness
  uuid_suffix := right(NEW.id::text, 4);
  temp_username := base_username || '-' || uuid_suffix;
  
  INSERT INTO public.profiles (id, username, avatar_url, username_is_temp)
  VALUES (
    NEW.id,
    temp_username,
    NEW.raw_user_meta_data->>'avatar_url',
    CASE 
      WHEN NEW.raw_user_meta_data->>'username' IS NOT NULL THEN false
      ELSE true
    END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Deferred Registration Flow
Users with `username_is_temp = true` are redirected to `/onboarding/claim-username` by the middleware to choose their permanent username.

| Route | Purpose |
|-------|---------|
| `/onboarding/claim-username` | Choose permanent username after OAuth signup |

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Component Architecture

### Shared Components (`@/components/ui/`)

Reusable, atomic UI building blocks. **Always check here before creating new UI.**

| Component | Purpose |
|-----------|---------|
| `button.tsx` | Primary action buttons |
| `card.tsx` | Content container cards |
| `badge.tsx` | Status/label badges |
| `avatar.tsx` | User avatars |
| `input.tsx` | Form inputs |
| `dialog.tsx` | Modal dialogs |
| `dropdown-menu.tsx` | Dropdown menus |
| `checkbox.tsx` | Checkbox inputs |
| `label.tsx` | Form labels |
| `alert.tsx` | Alert messages |
| `breadcrumb.tsx` | Navigation breadcrumbs |
| `empty-state.tsx` | Empty state placeholders |
| `load-more-button.tsx` | Pagination load more |
| `horizontal-scroll-carousel.tsx` | Horizontal scrolling lists (legacy) |
| `movie-carousel.tsx` | **Standard carousel for movie lists** (see below) |
| `genre-tag.tsx` | Movie genre tags |
| `star-rating.tsx` | Star rating display/input |
| `cast-card.tsx` | Actor/cast member cards |
| `comment-form.tsx` | Comment input form |
| `comment-thread.tsx` | Threaded comments display |
| `comment-vote-buttons.tsx` | Like/dislike buttons for comments |
| `list-preview-card.tsx` | Movie list preview cards |
| `action-button.tsx` | Icon-based action buttons |
| `movie-card.tsx` | Movie poster cards with rating |
| `review-card.tsx` | Review display cards |
| `section-header.tsx` | Section titles with "View All" links |

#### `MovieCarousel` Component (Standard for Horizontal Lists)

**Location:** `@/components/ui/movie-carousel.tsx`

**Usage:** This is the **standard component** for all horizontal movie/content lists. Use it instead of custom scroll implementations.

**Features:**
- ✅ Infinite looping (`loop: true`)
- ✅ Drag-free interaction (`dragFree: true`) - smooth momentum scrolling
- ✅ Wheel gestures support via `WheelGesturesPlugin`
- ✅ Configurable gap sizes (`sm`, `md`, `lg`)
- ✅ Optional navigation arrows (`showArrows`)
- ✅ Optional edge gradient masks (`showMasks`)

**Props:**
```typescript
interface MovieCarouselProps {
  gap?: "sm" | "md" | "lg";      // Gap between slides (default: "md")
  showArrows?: boolean;          // Enable navigation arrows (default: true)
  showMasks?: boolean;           // Enable edge gradient masks (default: true)
  children: React.ReactNode;     // Carousel items
}
```

**Example:**
```tsx
<MovieCarousel gap="md" showArrows showMasks>
  {movies.map((movie) => (
    <MovieCard key={movie.id} {...movie} />
  ))}
</MovieCarousel>
```

### Layout Components (`@/components/layout/`)

| Component | Purpose |
|-----------|---------|
| `main-nav.tsx` | Main navigation header |
| `footer.tsx` | Site footer |

### Page Components (Route-Specific)

Located in `@/app/[route]/` directories. These are **not reusable** and are specific to each page.

| Page | Route | Key Components | Status |
|------|-------|----------------|--------|
| **Home** | `/` | Hero, featured movies, trending lists | ✅ **Completed** |
| **Movies** | `/movies` | Movie grid, filters, search | 🔲 Pending |
| **Movie Detail** | `/movies/[id]` | Movie info, cast, reviews, actions | 🔲 Pending |
| **Lists** | `/lists` | User-created lists grid | 🔲 Pending |
| **List Detail** | `/lists/[id]` | List movies, comments | 🔲 Pending |
| **Create/Edit List** | `/lists/new`, `/lists/[id]/edit` | List form, movie selector | 🔲 Pending |
| **Reviews** | `/reviews` | Review feed | 🔲 Pending |
| **Review Detail** | `/reviews/[id]` | Full review, comments | 🔲 Pending |
| **Users** | `/users` | User directory | 🔲 Pending |
| **User Profile** | `/users/[id]` | Profile, activity, lists | 🔲 Pending |
| **Recommendations** | `/recommendations` | AI-powered suggestions | 🔲 Pending |
| **Authentication** | `/login`, `/register` | Auth forms | 🔲 Pending |

---

## UI/UX Standards

### 1. Gradient Mask Technique (Carousel Edges)

Use CSS gradients to fade carousel edges into the background, creating a polished "infinite" feel:

```tsx
{/* Left mask */}
<div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 md:w-12 z-10 bg-gradient-to-r from-neutral-950 via-neutral-950/70 to-transparent" />

{/* Right mask */}
<div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 md:w-12 z-10 bg-gradient-to-l from-neutral-950 via-neutral-950/70 to-transparent" />
```

### 2. Hero Section Navigation Arrows

**Rule:** Use CSS `group-hover` for arrow visibility instead of React state.

❌ **Don't:** Use `useState` for hover state (causes flickers)
```tsx
// BAD - causes flicker on hydration
const [isHovered, setIsHovered] = useState(false);
```

✅ **Do:** Use Tailwind `group` and `group-hover` utilities
```tsx
// GOOD - pure CSS, no hydration flicker
<section className="group/hero">
  <button className="opacity-0 group-hover/hero:opacity-100 transition-opacity">
    <ChevronLeft />
  </button>
</section>
```

### 3. Card Aspect Ratios (Prevent Layout Shifts)

**Rule:** Always enforce strict aspect ratios on image containers to prevent Cumulative Layout Shift (CLS).

| Card Type | Aspect Ratio | Tailwind Class |
|-----------|--------------|----------------|
| Movie Poster | 2:3 | `aspect-[2/3]` |
| Backdrop/Hero | 16:9 | `aspect-video` |
| Square Thumbnail | 1:1 | `aspect-square` |

**Example:**
```tsx
<div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-neutral-800">
  {posterUrl ? (
    <Image src={posterUrl} alt={title} fill className="object-cover" />
  ) : (
    <div className="absolute inset-0 flex items-center justify-center">
      <Film className="h-12 w-12 text-neutral-600" />
    </div>
  )}
</div>
```

### 4. Fallback States for Missing Images

Always provide visual fallbacks:
```tsx
{imageUrl ? (
  <Image src={imageUrl} alt={alt} fill className="object-cover" />
) : (
  <div className="w-full h-full bg-neutral-800/50 flex items-center justify-center">
    <IconPlaceholder className="text-neutral-600" />
  </div>
)}
```

---

## Coding Rules

### 1. Component Reuse (DRY)
```
✅ ALWAYS check `@/components/ui/` before creating new UI elements.
✅ USE `MovieCarousel` for all horizontal scrolling lists.
❌ NEVER duplicate existing component functionality.
```

### 2. Data Fetching
```
✅ Use React Server Components (RSC) for data fetching.
✅ Use `server-only` package for data fetching utility files.
❌ NO `useEffect` for data fetching.
❌ NO client-side fetching unless absolutely necessary (e.g., real-time updates).
```

### 3. Component Default
```
✅ All components are Server Components by default.
✅ Only add "use client" when interactivity is required.
❌ Don't add "use client" preemptively.
```

### 4. File Organization
```
src/
├── app/                    # Routes (App Router)
│   └── [route]/
│       ├── page.tsx        # Page component (RSC)
│       ├── layout.tsx      # Layout (if needed)
│       ├── _components/    # Route-specific components
│       └── _lib/           # Route-specific utilities/queries
├── components/
│   ├── ui/                 # Shared UI components
│   └── layout/             # Layout components
└── lib/
    ├── utils.ts            # Utility functions
    └── supabase/           # Database client
```

### 5. Naming Conventions
```
- Components: PascalCase (e.g., `MovieCard.tsx`)
- Files: kebab-case (e.g., `movie-card.tsx`)
- Routes: kebab-case (e.g., `/movie-details`)
- Types: PascalCase with suffix (e.g., `MovieProps`, `UserType`)
```

### 6. TypeScript
```
✅ Strict mode enabled - no `any` types.
✅ Define interfaces for all props.
✅ Use proper return types for functions.
```

---

## Import Aliases

```typescript
import { Button } from "@/components/ui/button"
import { MovieCarousel } from "@/components/ui/movie-carousel"
import { MainNav } from "@/components/layout"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
```

---

## Quick Reference Commands

```bash
# Development
npm run dev

# Build
npm run build

# Lint
npm run lint
```

## Database tables
---

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.comment_votes (
  user_id uuid NOT NULL,
  comment_id uuid NOT NULL,
  vote_type integer NOT NULL CHECK (vote_type = ANY (ARRAY[1, '-1'::integer])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT comment_votes_pkey PRIMARY KEY (user_id, comment_id),
  CONSTRAINT comment_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT comment_votes_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comments(id)
);
CREATE TABLE public.comments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  review_id uuid,
  list_id uuid,
  body text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT comments_pkey PRIMARY KEY (id),
  CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT comments_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(id),
  CONSTRAINT comments_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.lists(id)
);
CREATE TABLE public.follows (
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT follows_pkey PRIMARY KEY (follower_id, following_id),
  CONSTRAINT follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.profiles(id),
  CONSTRAINT follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.genres (
  id integer NOT NULL,
  name text NOT NULL,
  CONSTRAINT genres_pkey PRIMARY KEY (id)
);
CREATE TABLE public.list_items (
  list_id uuid NOT NULL,
  movie_id uuid NOT NULL,
  added_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT list_items_pkey PRIMARY KEY (list_id, movie_id),
  CONSTRAINT list_items_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.lists(id),
  CONSTRAINT list_items_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(id)
);
CREATE TABLE public.list_saves (
  user_id uuid NOT NULL,
  list_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT list_saves_pkey PRIMARY KEY (user_id, list_id),
  CONSTRAINT list_saves_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT list_saves_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.lists(id)
);
CREATE TABLE public.lists (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  is_public boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT lists_pkey PRIMARY KEY (id),
  CONSTRAINT lists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.movie_credits (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  movie_id uuid NOT NULL,
  person_id uuid NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['director'::text, 'actor'::text])),
  character_name text,
  credit_order integer DEFAULT 0,
  CONSTRAINT movie_credits_pkey PRIMARY KEY (id),
  CONSTRAINT movie_credits_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(id),
  CONSTRAINT movie_credits_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.people(id)
);
CREATE TABLE public.movie_genres (
  movie_id uuid NOT NULL,
  genre_id integer NOT NULL,
  CONSTRAINT movie_genres_pkey PRIMARY KEY (movie_id, genre_id),
  CONSTRAINT movie_genres_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(id),
  CONSTRAINT movie_genres_genre_id_fkey FOREIGN KEY (genre_id) REFERENCES public.genres(id)
);
CREATE TABLE public.movies (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  tmdb_id integer UNIQUE,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  release_date date,
  poster_url text,
  backdrop_url text,
  overview text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  trailer_url text,
  CONSTRAINT movies_pkey PRIMARY KEY (id)
);
CREATE TABLE public.people (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  tmdb_id integer UNIQUE,
  name text NOT NULL,
  profile_path text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT people_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  username text NOT NULL UNIQUE,
  avatar_url text,
  bio text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  username_is_temp boolean NOT NULL DEFAULT false,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.ratings (
  user_id uuid NOT NULL,
  movie_id uuid NOT NULL,
  score integer NOT NULL CHECK (score >= 1 AND score <= 10),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT ratings_pkey PRIMARY KEY (user_id, movie_id),
  CONSTRAINT ratings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT ratings_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(id)
);
CREATE TABLE public.review_votes (
  user_id uuid NOT NULL,
  review_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  is_upvote boolean NOT NULL DEFAULT true,
  CONSTRAINT review_votes_pkey PRIMARY KEY (user_id, review_id),
  CONSTRAINT review_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT review_likes_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(id)
);
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  movie_id uuid NOT NULL,
  body text,
  contains_spoilers boolean DEFAULT false,
  watched_date date DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  title text,
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT reviews_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(id)
);
CREATE TABLE public.watchlist (
  user_id uuid NOT NULL,
  movie_id uuid NOT NULL,
  added_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT watchlist_pkey PRIMARY KEY (user_id, movie_id),
  CONSTRAINT watchlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT watchlist_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(id)
);