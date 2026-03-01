
## Restore GitHub Changes: Profiles Table and Subscription Hook

### What happened
Your GitHub push included a `profiles` table and a `useSubscription.ts` hook that queries it, but these changes weren't fully synced. The migration file exists in the codebase but was never applied to the database, and the subscription hook was reverted to a hardcoded "free" tier.

### Plan

#### 1. Create the profiles table in the database
Run a migration to create the `profiles` table with:
- `id` (UUID, references auth.users)
- `subscription_tier` (text, default 'free')
- `stripe_customer_id` and `stripe_subscription_id` (text, nullable)
- `subscription_status` (text, default 'active')
- Timestamps
- RLS policies (users can only read/update/insert their own profile)
- Trigger to auto-create a profile row when a new user signs up
- Index on `subscription_tier`

#### 2. Restore the useSubscription.ts hook
Update `useSubscription.ts` to query the `profiles` table for the user's `subscription_tier` instead of hardcoding `'free'`. The restored code will:
- Query `profiles` table with `maybeSingle()` to handle missing rows gracefully
- Fall back to `'free'` tier if no profile exists or on error
- Log warnings (not errors) for missing profiles

### Technical Details

**Migration SQL** will match the existing `supabase/migrations/20260301_add_profiles_subscription.sql` file content.

**useSubscription.ts changes** (lines 50-63): Replace the hardcoded free tier block with a query to `supabase.from('profiles').select('subscription_tier').eq('id', user.id).maybeSingle()`, with graceful fallback on error.
