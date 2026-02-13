

# Fix Google Sign-In 403 Error

## Problem
The "Continue with Google" button calls `supabase.auth.signInWithOAuth()` directly, which returns a 403 error on Lovable Cloud. Lovable Cloud provides a managed Google OAuth flow that must be used instead.

## Fix

### Step 1: Generate the Lovable Cloud auth module
Use the Configure Social Login tool to generate the `src/integrations/lovable/` module and install `@lovable.dev/cloud-auth-js`.

### Step 2: Update `src/pages/Auth.tsx`
Replace the `handleGoogleSignIn` function to use the managed OAuth:

```typescript
import { lovable } from "@/integrations/lovable/index";

const handleGoogleSignIn = async () => {
  const { error } = await lovable.auth.signInWithOAuth("google", {
    redirect_uri: window.location.origin,
  });

  if (error) {
    toast({
      title: 'Error',
      description: 'Unable to sign in with Google. Please try again.',
      variant: 'destructive',
    });
  }
};
```

### No other changes needed
- Authentication context, auth guard, and all other auth logic remain the same
- The managed OAuth integrates with the same authentication system behind the scenes

