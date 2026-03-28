/**
 * POST /api/tokens/checkout
 * Creates a Stripe Checkout session for a token package.
 *
 * Body: { packageId: string }
 * Returns: { url: string } — Stripe Checkout redirect URL
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe/client";
import { requireAuth } from "@/lib/auth/middleware";
import { getSupabaseAdmin } from "@/lib/db/client";

const CheckoutSchema = z.object({
  packageId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  // 1. Auth check
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  // 2. Validate input
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // 3. Fetch package from DB
  const supabase = getSupabaseAdmin();
  const { data: pkg, error: pkgError } = await supabase
    .from("token_packages")
    .select("id, name_en, tokens, price_cents, price_currency, stripe_price_id")
    .eq("id", parsed.data.packageId)
    .eq("is_active", true)
    .single();

  if (pkgError || !pkg) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  // 4. Create Stripe Checkout session
  try {
    const stripe = getStripe();
    const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email ?? undefined,
      metadata: {
        user_id: user.id,
        package_id: pkg.id,
        tokens: String(pkg.tokens),
      },
      line_items: [
        pkg.stripe_price_id
          ? { price: pkg.stripe_price_id, quantity: 1 }
          : {
              price_data: {
                currency: pkg.price_currency.toLowerCase(),
                product_data: {
                  name: `OHMAZE ${pkg.name_en} — ${pkg.tokens} tokens`,
                  description: `${pkg.tokens} compliance query tokens`,
                },
                unit_amount: pkg.price_cents,
              },
              quantity: 1,
            },
      ],
      success_url: `${origin}/tokens/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?purchase=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
