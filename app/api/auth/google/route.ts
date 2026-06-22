import { NextRequest, NextResponse } from "next/server";

function sanitizeNextPath(next: string | null) {
  if (!next) return "";
  if (!next.startsWith("/") || next.startsWith("//")) return "";
  if (next.startsWith("/api/") || next.startsWith("/_next/")) return "";
  if (next === "/login") return "";
  return next;
}

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;
  const nextPath = sanitizeNextPath(req.nextUrl.searchParams.get("next"));

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "select_account");
  if (nextPath) url.searchParams.set("state", nextPath);

  return NextResponse.redirect(url.toString());
}
