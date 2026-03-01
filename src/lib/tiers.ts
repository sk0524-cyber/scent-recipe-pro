// Subscription tier definitions and limits

export type TierName = 'free' | 'starter' | 'pro' | 'business';

export interface TierLimits {
  maxProducts: number;
  maxMaterials: number;
  maxRecipes: number;
  maxRetailStores: number;
  pdfExports: boolean;
  csvExports: boolean;
  wholesaleChannels: boolean;
  analytics: boolean;
  prioritySupport: boolean;
}

export interface Tier {
  name: TierName;
  displayName: string;
  price: number; // monthly price in USD
  yearlyPrice: number;
  limits: TierLimits;
  description: string;
  features: string[];
}

export const TIERS: Record<TierName, Tier> = {
  free: {
    name: 'free',
    displayName: 'Free',
    price: 0,
    yearlyPrice: 0,
    description: 'Perfect for getting started',
    limits: {
      maxProducts: 5,
      maxMaterials: 20,
      maxRecipes: 5,
      maxRetailStores: 0,
      pdfExports: false,
      csvExports: false,
      wholesaleChannels: false,
      analytics: false,
      prioritySupport: false,
    },
    features: [
      'Up to 5 products',
      'Up to 20 materials',
      'Up to 5 recipes',
      'Basic cost calculations',
      'Margin tracking',
    ],
  },
  starter: {
    name: 'starter',
    displayName: 'Starter',
    price: 9,
    yearlyPrice: 90,
    description: 'For growing makers',
    limits: {
      maxProducts: 25,
      maxMaterials: 100,
      maxRecipes: 25,
      maxRetailStores: 3,
      pdfExports: true,
      csvExports: true,
      wholesaleChannels: false,
      analytics: false,
      prioritySupport: false,
    },
    features: [
      'Up to 25 products',
      'Up to 100 materials',
      'Up to 25 recipes',
      'PDF & CSV exports',
      '3 retail store partners',
      'Everything in Free',
    ],
  },
  pro: {
    name: 'pro',
    displayName: 'Pro',
    price: 19,
    yearlyPrice: 190,
    description: 'For serious artisans',
    limits: {
      maxProducts: 100,
      maxMaterials: 500,
      maxRecipes: 100,
      maxRetailStores: 10,
      pdfExports: true,
      csvExports: true,
      wholesaleChannels: true,
      analytics: true,
      prioritySupport: false,
    },
    features: [
      'Up to 100 products',
      'Up to 500 materials',
      'Up to 100 recipes',
      'Wholesale channel manager',
      'Store analytics dashboard',
      '10 retail store partners',
      'Everything in Starter',
    ],
  },
  business: {
    name: 'business',
    displayName: 'Business',
    price: 39,
    yearlyPrice: 390,
    description: 'For established businesses',
    limits: {
      maxProducts: Infinity,
      maxMaterials: Infinity,
      maxRecipes: Infinity,
      maxRetailStores: Infinity,
      pdfExports: true,
      csvExports: true,
      wholesaleChannels: true,
      analytics: true,
      prioritySupport: true,
    },
    features: [
      'Unlimited products',
      'Unlimited materials',
      'Unlimited recipes',
      'Unlimited retail stores',
      'Priority support',
      'Everything in Pro',
    ],
  },
};

export function getTierLimits(tierName: TierName): TierLimits {
  return TIERS[tierName].limits;
}

export function canAddMore(
  currentCount: number,
  tierName: TierName,
  resource: keyof Pick<TierLimits, 'maxProducts' | 'maxMaterials' | 'maxRecipes' | 'maxRetailStores'>
): boolean {
  const limit = TIERS[tierName].limits[resource];
  return currentCount < limit;
}

export function getUsagePercentage(
  currentCount: number,
  tierName: TierName,
  resource: keyof Pick<TierLimits, 'maxProducts' | 'maxMaterials' | 'maxRecipes' | 'maxRetailStores'>
): number {
  const limit = TIERS[tierName].limits[resource];
  if (limit === Infinity) return 0;
  return Math.min((currentCount / limit) * 100, 100);
}
