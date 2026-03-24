import { NextResponse } from "next/server";
import { tokenService } from "@/lib/tokens/service";

export async function GET() {
  try {
    const [packages, costs] = await Promise.all([
      tokenService.getPackages(),
      tokenService.getAllCosts(),
    ]);

    return NextResponse.json({ packages, costs });
  } catch (err) {
    console.error("Token packages error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
