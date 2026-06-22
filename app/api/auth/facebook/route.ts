import { NextRequest, NextResponse } from "next/server";

function sanitizeNextPath(next: string | null) {
  if (!next) return "";
  if (!next.startsWith("/") || next.startsWith("//")) return "";
  if (next.startsWith("/api/") || next.startsWith("/_next/")) return "";
  if (next === "/login") return "";
  return next;
}

export async function GET(req: NextRequest) {
  const clientId = process.env.FACEBOOK_APP_ID!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/facebook`;
  const nextPath = sanitizeNextPath(req.nextUrl.searchParams.get("next"));

  const url = new URL("https://www.facebook.com/v19.0/dialog/oauth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "email,public_profile");
  url.searchParams.set("response_type", "code");
  if (nextPath) url.searchParams.set("state", nextPath);

  return NextResponse.redirect(url.toString());
}
