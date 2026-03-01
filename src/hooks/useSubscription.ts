import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { TierName, getTierLimits, TierLimits, TIERS, canAddMore, getUsagePercentage } from '@/lib/tiers';

interface SubscriptionState {
  tier: TierName;
  limits: TierLimits;
  isLoading: boolean;
  error: string | null;
}

interface UseSubscriptionReturn extends SubscriptionState {
  isFreeTier: boolean;
  canExportPdf: boolean;
  canExportCsv: boolean;
  canUseWholesale: boolean;
  canUseAnalytics: boolean;
  canAddProduct: (currentCount: number) => boolean;
  canAddMaterial: (currentCount: number) => boolean;
  canAddRecipe: (currentCount: number) => boolean;
  canAddRetailStore: (currentCount: number) => boolean;
  getProductUsage: (currentCount: number) => number;
  getMaterialUsage: (currentCount: number) => number;
  getRecipeUsage: (currentCount: number) => number;
  getStoreUsage: (currentCount: number) => number;
  refreshSubscription: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    tier: 'free',
    limits: getTierLimits('free'),
    isLoading: true,
    error: null,
  });

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setState({
        tier: 'free',
        limits: getTierLimits('free'),
        isLoading: false,
        error: null,
      });
      return;
    }

    try {
      // Check if user has a subscription in the profiles table
      // For now, we'll use a simple approach - you can expand this
      // to integrate with Stripe or another payment provider
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle to avoid error when no row exists

      // Handle various error cases gracefully
      if (error) {
        // Table might not exist yet or other DB errors - default to free
        console.warn('Could not fetch subscription, defaulting to free:', error.message);
        setState({
          tier: 'free',
          limits: getTierLimits('free'),
          isLoading: false,
          error: null, // Don't show error to user for this
        });
        return;
      }

      const tierName = (profile?.subscription_tier as TierName) || 'free';
      
      setState({
        tier: tierName,
        limits: getTierLimits(tierName),
        isLoading: false,
        error: null,
      });
    } catch (err) {
      console.error('Error fetching subscription:', err);
      // Default to free tier on error
      setState({
        tier: 'free',
        limits: getTierLimits('free'),
        isLoading: false,
        error: null, // Don't block the user on subscription errors
      });
    }
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const isFreeTier = state.tier === 'free';

  return {
    ...state,
    isFreeTier,
    canExportPdf: state.limits.pdfExports,
    canExportCsv: state.limits.csvExports,
    canUseWholesale: state.limits.wholesaleChannels,
    canUseAnalytics: state.limits.analytics,
    canAddProduct: (currentCount: number) => canAddMore(currentCount, state.tier, 'maxProducts'),
    canAddMaterial: (currentCount: number) => canAddMore(currentCount, state.tier, 'maxMaterials'),
    canAddRecipe: (currentCount: number) => canAddMore(currentCount, state.tier, 'maxRecipes'),
    canAddRetailStore: (currentCount: number) => canAddMore(currentCount, state.tier, 'maxRetailStores'),
    getProductUsage: (currentCount: number) => getUsagePercentage(currentCount, state.tier, 'maxProducts'),
    getMaterialUsage: (currentCount: number) => getUsagePercentage(currentCount, state.tier, 'maxMaterials'),
    getRecipeUsage: (currentCount: number) => getUsagePercentage(currentCount, state.tier, 'maxRecipes'),
    getStoreUsage: (currentCount: number) => getUsagePercentage(currentCount, state.tier, 'maxRetailStores'),
    refreshSubscription: fetchSubscription,
  };
}
