import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const isAuthRoute = request.nextUrl.pathname.startsWith("/login");
  const isPublicRoute = request.nextUrl.pathname.startsWith("/c/");
  const isApiPublicRoute =
    request.nextUrl.pathname.startsWith("/api/public");

  if (isPublicRoute || isApiPublicRoute) {
    return NextResponse.next({ request });
  }

  // Auth disabled for demo — skip login redirect
  return NextResponse.next({ request });
}
