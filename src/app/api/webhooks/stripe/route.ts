/**
 * POST /api/webhooks/stripe
 * Handles Stripe webhook events.
 * On checkout.session.completed → credits user tokens.
 *
 * IMPORTANT: This endpoint must NOT use the default body parser
 * because Stripe requires the raw body for signature verification.
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { tokenService } from "@/lib/tokens/service";

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 },
    );
  }

  // 1. Read raw body for signature verification
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  // 2. Verify webhook signature
  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 },
    );
  }

  // 3. Handle events
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Only process paid sessions
    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    const userId = session.metadata?.user_id;
    const packageId = session.metadata?.package_id;
    const tokens = Number(session.metadata?.tokens);

    if (!userId || !packageId || !tokens || isNaN(tokens)) {
      console.error("Webhook missing metadata:", session.metadata);
      return NextResponse.json(
        { error: "Invalid session metadata" },
        { status: 400 },
      );
    }

    // 4. Credit tokens to user (idempotent check via session ID)
    const success = await tokenService.addTokens(
      userId,
      tokens,
      "purchase",
      `Purchased ${tokens} tokens (Stripe ${session.id})`,
      {
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent,
        package_id: packageId,
        amount_total: session.amount_total,
        currency: session.currency,
      },
    );

    if (!success) {
      console.error("Failed to credit tokens:", { userId, tokens, sessionId: session.id });
      return NextResponse.json(
        { error: "Failed to credit tokens" },
        { status: 500 },
      );
    }

    console.info(`Tokens credited: ${tokens} to user ${userId} (session ${session.id})`);
  }

  return NextResponse.json({ received: true });
}
