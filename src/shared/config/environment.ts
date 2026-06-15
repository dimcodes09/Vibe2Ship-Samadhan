import { z } from "zod";

const environmentSchema = z.object({
  VITE_SUPABASE_URL: z.string().url("VITE_SUPABASE_URL must be a valid URL"),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1, "VITE_SUPABASE_PUBLISHABLE_KEY is required"),
});

let envParsed: z.infer<typeof environmentSchema>;

try {
  envParsed = environmentSchema.parse({
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  });
} catch (error) {
  console.error("❌ Environment configuration validation failed:", error);
  // Fail-safe default in case we are in testing/build environments that lack dynamic variables
  envParsed = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co",
    VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "placeholder-key",
  };
}

export const env = {
  supabaseUrl: envParsed.VITE_SUPABASE_URL,
  supabasePublishableKey: envParsed.VITE_SUPABASE_PUBLISHABLE_KEY,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
