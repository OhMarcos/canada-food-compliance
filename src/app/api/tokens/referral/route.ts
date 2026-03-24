import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/server";
import { tokenService } from "@/lib/tokens/service";

const ReferralSchema = z.object({
  referral_code: z.string().min(1).max(20),
});

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser();
    if (error || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const input = ReferralSchema.parse(body);

    const success = await tokenService.processReferral(input.referral_code, user.id);
    if (!success) {
      return NextResponse.json(
        { error: "Invalid referral code or already used" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, message: "Referral bonus applied!" });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid referral code format" }, { status: 400 });
    }
    console.error("Referral error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
