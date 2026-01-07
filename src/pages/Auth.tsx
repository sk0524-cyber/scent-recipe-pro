import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Calculator, ArrowLeft } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'update-password';

export default function Auth() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<AuthMode>(() => {
    // Check if this is a password recovery callback
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      return 'update-password';
    }
    return 'login';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only redirect if logged in and not updating password
  if (user && mode !== 'update-password') {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('Login error:', error);
          toast({
            title: 'Login failed',
            description: 'Unable to log in. Please check your credentials and try again.',
            variant: 'destructive',
          });
        }
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) {
          console.error('Sign up error:', error);
          toast({
            title: 'Sign up failed',
            description: 'Unable to create account. Please try again.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Account created',
            description: 'You can now log in with your credentials.',
          });
          setMode('login');
        }
      } else if (mode === 'forgot-password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });

        if (error) {
          console.error('Password reset error:', error);
          toast({
            title: 'Error',
            description: 'Unable to send reset link. Please try again.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Check your email',
            description: 'We sent you a password reset link.',
          });
          setMode('login');
        }
      } else if (mode === 'update-password') {
        const { error } = await supabase.auth.updateUser({
          password,
        });

        if (error) {
          console.error('Password update error:', error);
          toast({
            title: 'Error',
            description: 'Unable to update password. Please try again.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Password updated',
            description: 'Your password has been changed successfully.',
          });
          window.location.href = '/';
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      console.error('Google sign-in error:', error);
      toast({
        title: 'Error',
        description: 'Unable to sign in with Google. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'signup': return 'Create Account';
      case 'forgot-password': return 'Reset Password';
      case 'update-password': return 'Set New Password';
      default: return 'Welcome Back';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'signup': return 'Create an account to get started.';
      case 'forgot-password': return 'Enter your email to receive a reset link.';
      case 'update-password': return 'Enter your new password below.';
      default: return 'Sign in to your account.';
    }
  };

  const getButtonText = () => {
    if (isSubmitting) return 'Please wait...';
    switch (mode) {
      case 'signup': return 'Create Account';
      case 'forgot-password': return 'Send Reset Link';
      case 'update-password': return 'Update Password';
      default: return 'Sign In';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Calculator className="h-6 w-6" />
          </div>
          <CardTitle className="font-display text-2xl">{getTitle()}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          {(mode === 'forgot-password' || mode === 'update-password') && (
            <button
              type="button"
              onClick={() => setMode('login')}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </button>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode !== 'update-password' && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            )}
            
            {mode !== 'forgot-password' && (
              <div className="space-y-2">
                <Label htmlFor="password">
                  {mode === 'update-password' ? 'New Password' : 'Password'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {getButtonText()}
            </Button>
          </form>
          
          {(mode === 'login' || mode === 'signup') && (
            <>
              <div className="relative my-6">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  or
                </span>
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
            </>
          )}
          
          {mode === 'login' && (
            <>
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setMode('forgot-password')}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Forgot your password?
                </button>
              </div>
              <div className="mt-2 text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </button>
              </div>
            </>
          )}
          
          {mode === 'signup' && (
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
