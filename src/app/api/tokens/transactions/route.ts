import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { tokenService } from "@/lib/tokens/service";

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser();
    if (error || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20"), 100);

    const transactions = await tokenService.getTransactionHistory(user.id, limit);

    return NextResponse.json({ transactions });
  } catch (err) {
    console.error("Token transactions error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
