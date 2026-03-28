/**
 * Stripe server-side client.
 * Uses lazy initialization to avoid errors when STRIPE_SECRET_KEY is not set.
 */

import "server-only";
import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY?.trim();
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set. Payment features are disabled.");
    }
    stripeInstance = new Stripe(key);
  }
  return stripeInstance;
}
