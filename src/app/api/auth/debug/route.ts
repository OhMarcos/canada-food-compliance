import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAuthServerClient } from "@/lib/auth/server";

export async function GET() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  const supabaseCookies = allCookies.filter((c) =>
    c.name.startsWith("sb-"),
  );

  let user = null;
  let authError = null;
  try {
    const supabase = await createAuthServerClient();
    const { data, error } = await supabase.auth.getUser();
    user = data?.user
      ? { id: data.user.id, email: data.user.email }
      : null;
    authError = error?.message ?? null;
  } catch (e) {
    authError = e instanceof Error ? e.message : "unknown";
  }

  return NextResponse.json({
    totalCookies: allCookies.length,
    supabaseCookieNames: supabaseCookies.map((c) => c.name),
    supabaseCookieSizes: supabaseCookies.map((c) => ({
      name: c.name,
      size: c.value.length,
    })),
    user,
    authError,
  });
}
