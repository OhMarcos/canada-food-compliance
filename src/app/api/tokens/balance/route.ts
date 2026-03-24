import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { tokenService } from "@/lib/tokens/service";

export async function GET() {
  try {
    const { user, error } = await getCurrentUser();
    if (error || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const [balance, referralCode] = await Promise.all([
      tokenService.getUserBalance(user.id),
      tokenService.getUserReferralCode(user.id),
    ]);

    if (!balance) {
      return NextResponse.json({ error: "Balance not found" }, { status: 404 });
    }

    return NextResponse.json({ balance, referral_code: referralCode });
  } catch (err) {
    console.error("Token balance error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
