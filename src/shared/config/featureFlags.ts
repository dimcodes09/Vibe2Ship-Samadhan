import { env } from "./environment";

export const FEATURE_FLAGS = {
  AI_ASSISTANT: true,
  FORM_ANALYZER: env.isDev,    // Mocked: enable in dev, hide in prod
  DOCUMENT_LOCKER: env.isDev,  // Mocked: enable in dev, hide in prod
  SCHEMES_ENGINE: env.isDev,   // Mocked: enable in dev, hide in prod
  NOTIFICATIONS: true,
} as const;

export type FeatureFlagName = keyof typeof FEATURE_FLAGS;

export function isFeatureEnabled(name: FeatureFlagName): boolean {
  return FEATURE_FLAGS[name];
}
