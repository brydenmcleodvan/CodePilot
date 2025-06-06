import type { User } from './schema';

export const PremiumFeatures = {
  advancedTrendAnalysis: true,
  exportCsv: true,
} as const;

export type PremiumFeatureKey = keyof typeof PremiumFeatures;

export function hasFeature(user: User | null | undefined, feature: PremiumFeatureKey): boolean {
  return !!user?.isPremium && PremiumFeatures[feature];
}
