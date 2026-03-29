/**
 * Environment variable validation and typed access.
 * Validates all required env vars at import time and throws
 * clear error messages for missing required variables.
 */

interface RequiredEnvVar {
  readonly key: string;
  readonly description: string;
}

interface OptionalEnvVar {
  readonly key: string;
  readonly description: string;
  readonly defaultValue?: string;
}

const REQUIRED_VARS: readonly RequiredEnvVar[] = [
  { key: "ANTHROPIC_API_KEY", description: "Anthropic API key for Claude LLM calls" },
  { key: "NEXT_PUBLIC_SUPABASE_URL", description: "Supabase project URL" },
  { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", description: "Supabase anonymous/public key" },
] as const;

const OPTIONAL_VARS: readonly OptionalEnvVar[] = [
  { key: "SUPABASE_SERVICE_ROLE_KEY", description: "Supabase service role key for admin operations" },
  { key: "OPENAI_API_KEY", description: "OpenAI API key for embedding generation" },
  { key: "EXA_API_KEY", description: "Exa API key for web search" },
  { key: "STRIPE_SECRET_KEY", description: "Stripe secret key for payment processing" },
  { key: "STRIPE_WEBHOOK_SECRET", description: "Stripe webhook signing secret" },
  { key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", description: "Stripe publishable key (client-side)" },
  { key: "NEXT_PUBLIC_SITE_URL", description: "Public site URL (e.g. https://clearbite.ca) for Stripe redirects" },
  { key: "COOKIE_SIGNING_SECRET", description: "HMAC secret for guest tracking cookies" },
  { key: "ADMIN_EMAILS", description: "Comma-separated admin email whitelist" },
] as const;

export interface ValidatedEnv {
  readonly ANTHROPIC_API_KEY: string;
  readonly NEXT_PUBLIC_SUPABASE_URL: string;
  readonly NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string | undefined;
  readonly OPENAI_API_KEY: string | undefined;
  readonly EXA_API_KEY: string | undefined;
  readonly STRIPE_SECRET_KEY: string | undefined;
  readonly STRIPE_WEBHOOK_SECRET: string | undefined;
  readonly NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string | undefined;
}

function validateEnv(): ValidatedEnv {
  const missingVars: readonly string[] = REQUIRED_VARS
    .filter(({ key }) => !process.env[key]?.trim())
    .map(({ key, description }) => `  - ${key}: ${description}`);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missingVars.join("\n")}\n\n` +
      "Please set these variables in your .env.local file or environment.",
    );
  }

  const optionalWarnings = OPTIONAL_VARS
    .filter(({ key }) => !process.env[key]?.trim())
    .map(({ key, description }) => `  - ${key}: ${description}`);

  if (optionalWarnings.length > 0) {
    console.warn(
      `Optional environment variables not set (some features may be limited):\n${optionalWarnings.join("\n")}`,
    );
  }

  return {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY!.trim(),
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
    OPENAI_API_KEY: process.env.OPENAI_API_KEY?.trim(),
    EXA_API_KEY: process.env.EXA_API_KEY?.trim(),
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY?.trim(),
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET?.trim(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim(),
  };
}

/** Validated environment variables. Throws on import if required vars are missing. */
export const env: ValidatedEnv = validateEnv();
