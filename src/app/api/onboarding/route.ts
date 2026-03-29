/**
 * Onboarding API: save business profile after sign-up.
 * GET: check if profile exists
 * POST: create/update business profile
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isAuthSuccess } from "@/lib/auth/middleware";
import { getSupabaseAdmin } from "@/lib/db/client";

const BusinessProfileSchema = z.object({
  business_name: z.string().max(200).optional(),
  food_type: z.string().max(200).optional(),
  website_url: z.string().url().max(500).optional().or(z.literal("")),
  product_description: z.string().max(1000).optional(),
  target_market: z.string().max(50).default("canada"),
});

/** GET: check if the user has completed onboarding */
export async function GET() {
  const authResult = await requireAuth();
  if (!isAuthSuccess(authResult)) return authResult;

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("business_profiles")
    .select("id")
    .eq("user_id", authResult.user.id)
    .single();

  return NextResponse.json({ has_profile: !!data });
}

/** POST: save business profile */
export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (!isAuthSuccess(authResult)) return authResult;

  const body = await request.json();
  const input = BusinessProfileSchema.parse(body);
  const userId = authResult.user.id;
  const supabase = getSupabaseAdmin();

  // Upsert: create or update
  const { error } = await supabase.from("business_profiles").upsert(
    {
      user_id: userId,
      business_name: input.business_name || null,
      food_type: input.food_type || null,
      website_url: input.website_url || null,
      product_description: input.product_description || null,
      target_market: input.target_market,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    console.error("Failed to save business profile:", error);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
