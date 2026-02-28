import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
