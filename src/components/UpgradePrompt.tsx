import { Link } from 'react-router-dom';
import { AlertCircle, Sparkles, Lock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface UpgradePromptProps {
  variant: 'banner' | 'card' | 'modal' | 'inline';
  currentCount?: number;
  maxCount?: number;
  itemName?: string;
  feature?: string;
  className?: string;
}

export function UpgradePrompt({
  variant,
  currentCount,
  maxCount,
  itemName,
  feature,
  className,
}: UpgradePromptProps) {
  const usagePercent = currentCount && maxCount ? (currentCount / maxCount) * 100 : 0;
  const isAtLimit = currentCount !== undefined && maxCount !== undefined && currentCount >= maxCount;
  const isNearLimit = usagePercent >= 80 && !isAtLimit;

  // Usage banner - shows progress toward limit
  if (variant === 'banner' && currentCount !== undefined && maxCount !== undefined) {
    return (
      <Alert 
        className={cn(
          'mb-4',
          isAtLimit ? 'border-destructive bg-destructive/10' : isNearLimit ? 'border-amber-500 bg-amber-50' : 'border-muted',
          className
        )}
      >
        <AlertCircle className={cn(
          'h-4 w-4',
          isAtLimit ? 'text-destructive' : isNearLimit ? 'text-amber-600' : 'text-muted-foreground'
        )} />
        <AlertTitle className="flex items-center justify-between">
          <span>
            {isAtLimit 
              ? `${itemName} limit reached` 
              : isNearLimit 
                ? `Approaching ${itemName?.toLowerCase()} limit`
                : `${itemName} usage`
            }
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            {currentCount} / {maxCount}
          </span>
        </AlertTitle>
        <AlertDescription className="mt-2">
          <Progress 
            value={usagePercent} 
            className={cn(
              'h-2 mb-2',
              isAtLimit ? '[&>div]:bg-destructive' : isNearLimit ? '[&>div]:bg-amber-500' : ''
            )}
          />
          {(isAtLimit || isNearLimit) && (
            <div className="flex items-center justify-between">
              <span className="text-sm">
                {isAtLimit 
                  ? 'Upgrade to add more.' 
                  : `You're using ${Math.round(usagePercent)}% of your limit.`
                }
              </span>
              <Button asChild size="sm" variant={isAtLimit ? 'default' : 'outline'}>
                <Link to="/pricing">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Upgrade
                </Link>
              </Button>
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Feature lock card - for locked features
  if (variant === 'card' && feature) {
    return (
      <div className={cn(
        'rounded-lg border-2 border-dashed border-muted p-6 text-center',
        className
      )}>
        <Lock className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
        <h3 className="font-semibold text-lg mb-2">{feature}</h3>
        <p className="text-muted-foreground text-sm mb-4">
          This feature is available on paid plans. Upgrade to unlock.
        </p>
        <Button asChild>
          <Link to="/pricing">
            <Sparkles className="mr-2 h-4 w-4" />
            View Plans
          </Link>
        </Button>
      </div>
    );
  }

  // Inline prompt - small inline upgrade nudge
  if (variant === 'inline') {
    return (
      <span className={cn('inline-flex items-center gap-1 text-sm text-muted-foreground', className)}>
        <Lock className="h-3 w-3" />
        <Link to="/pricing" className="underline hover:text-foreground">
          Upgrade to unlock
        </Link>
      </span>
    );
  }

  // Modal variant - for blocking actions
  if (variant === 'modal') {
    return (
      <div className={cn('text-center p-6', className)}>
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4">
          <TrendingUp className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-2">
          {isAtLimit ? `You've reached your ${itemName?.toLowerCase()} limit` : 'Upgrade Required'}
        </h3>
        <p className="text-muted-foreground mb-6">
          {feature 
            ? `${feature} is a premium feature.`
            : `Your free plan allows ${maxCount} ${itemName?.toLowerCase()}. Upgrade to add more.`
          }
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild variant="outline">
            <Link to="/pricing">See All Plans</Link>
          </Button>
          <Button asChild>
            <Link to="/pricing">
              <Sparkles className="mr-2 h-4 w-4" />
              Upgrade Now
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
