# Context: Google Auth Username Uniqueness Issue

## Problem Description
When a user signs up using Google OAuth, their user profile is created automatically via a Supabase Database Trigger (`handle_new_user`). This trigger attempts to generate a `username` for the `public.profiles` table based on the user's metadata (Name or Email prefix).

The `public.profiles` table enforces a **UNIQUE** constraint on the `username` column.

**The Issue:**
If two users have the same name or the same email prefix (e.g., `john.doe@gmail.com` and `john.doe@yahoo.com`), the generated username will be identical (e.g., `john.doe`).
1. The first user signs up successfully.
2. The second user attempts to sign up.
3. The trigger tries to insert the duplicate username.
4. The database raises a unique constraint violation error.
5. The user creation transaction fails, preventing the second user from signing up.

## Relevant Code & Configuration

### 1. Database Schema & Trigger (from `project_context.md`)

**Profiles Table:**
```sql
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  username text NOT NULL UNIQUE, -- This constraint causes the collision
  avatar_url text,
  bio text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
```

**Trigger Function:**
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    -- Logic that generates non-unique usernames:
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. Frontend Auth Logic (`src/app/(auth)/_components/auth-form.tsx`)

The `handleOAuthSignIn` function initiates the Google login but does not provide a custom username, relying entirely on the trigger.

```typescript
  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };
```

### 3. Auth Callback (`src/app/auth/callback/route.ts`)

The callback exchanges the code for a session but does not handle profile creation or username conflict resolution.

```typescript
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // ...
    const { error } = await supabase.auth.exchangeCodeForSession(code);
  // ...
}
```

## Goal
We need to modify the system (likely the SQL trigger) to ensure that if a username collision occurs during auto-generation, a unique suffix is appended (e.g., `john.doe-1234`) or a random username is generated, ensuring the user can always sign up successfully.
