/**
 * Token management service.
 * All token operations use atomic PL/pgSQL functions to prevent race conditions.
 */

import "server-only";
import { getSupabaseAdmin } from "@/lib/db/client";

export interface TokenBalance {
  readonly balance: number;
  readonly total_earned: number;
  readonly total_spent: number;
}

export interface TokenTransaction {
  readonly id: string;
  readonly transaction_type: string;
  readonly amount: number;
  readonly balance_after: number;
  readonly description: string;
  readonly api_endpoint: string | null;
  readonly created_at: string;
}

export interface TokenPackage {
  readonly id: string;
  readonly name_en: string;
  readonly name_ko: string;
  readonly tokens: number;
  readonly price_cents: number;
  readonly price_currency: string;
}

export interface ApiTokenCost {
  readonly endpoint: string;
  readonly cost_per_request: number;
  readonly description_en: string;
  readonly description_ko: string;
}

class TokenService {
  private get supabase() {
    return getSupabaseAdmin();
  }

  async getUserBalance(userId: string): Promise<TokenBalance | null> {
    const { data, error } = await this.supabase
      .from("user_token_balances")
      .select("balance, total_earned, total_spent")
      .eq("user_id", userId)
      .single();

    if (error || !data) return null;
    return data as TokenBalance;
  }

  async getTokenCost(endpoint: string): Promise<number> {
    const { data, error } = await this.supabase
      .from("api_token_costs")
      .select("cost_per_request")
      .eq("endpoint", endpoint)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      throw new Error(`Token cost not configured for endpoint: ${endpoint}`);
    }
    return data.cost_per_request;
  }

  async getAllCosts(): Promise<readonly ApiTokenCost[]> {
    const { data, error } = await this.supabase
      .from("api_token_costs")
      .select("endpoint, cost_per_request, description_en, description_ko")
      .eq("is_active", true);

    if (error || !data) return [];
    return data as ApiTokenCost[];
  }

  async spendTokens(userId: string, endpoint: string, description?: string): Promise<boolean> {
    const cost = await this.getTokenCost(endpoint);

    const { data, error } = await this.supabase.rpc("spend_user_tokens", {
      p_user_id: userId,
      p_amount: cost,
      p_endpoint: endpoint,
      p_description: description ?? `${endpoint} usage`,
    });

    return !error && data === true;
  }

  async addTokens(
    userId: string,
    amount: number,
    type: string,
    description: string,
    metadata: Record<string, unknown> = {},
  ): Promise<boolean> {
    const { data, error } = await this.supabase.rpc("add_user_tokens", {
      p_user_id: userId,
      p_amount: amount,
      p_transaction_type: type,
      p_description: description,
      p_metadata: metadata,
    });

    return !error && data === true;
  }

  async getTransactionHistory(userId: string, limit = 20): Promise<readonly TokenTransaction[]> {
    const { data, error } = await this.supabase
      .from("token_transactions")
      .select("id, transaction_type, amount, balance_after, description, api_endpoint, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data as TokenTransaction[];
  }

  async getPackages(): Promise<readonly TokenPackage[]> {
    const { data, error } = await this.supabase
      .from("token_packages")
      .select("id, name_en, name_ko, tokens, price_cents, price_currency")
      .eq("is_active", true)
      .order("sort_order");

    if (error || !data) return [];
    return data as TokenPackage[];
  }

  async getUserReferralCode(userId: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from("user_profiles")
      .select("referral_code")
      .eq("id", userId)
      .single();

    if (error || !data) return null;
    return data.referral_code;
  }

  async processReferral(referrerCode: string, newUserId: string): Promise<boolean> {
    const { data: referrer } = await this.supabase
      .from("user_profiles")
      .select("id")
      .eq("referral_code", referrerCode)
      .single();

    if (!referrer || referrer.id === newUserId) return false;

    // Update referred_by on the new user's profile
    await this.supabase
      .from("user_profiles")
      .update({ referred_by: referrer.id })
      .eq("id", newUserId);

    // Grant bonus tokens to both
    const [referrerOk, referredOk] = await Promise.all([
      this.addTokens(referrer.id, 75, "referral_bonus", "Referral bonus — new user joined", {
        referred_user: newUserId,
      }),
      this.addTokens(newUserId, 50, "referral_bonus", `Referral bonus — code ${referrerCode}`, {
        referrer_code: referrerCode,
      }),
    ]);

    return referrerOk && referredOk;
  }
}

export const tokenService = new TokenService();
