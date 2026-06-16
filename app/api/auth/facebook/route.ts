import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.FACEBOOK_APP_ID!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/facebook`;

  const url = new URL("https://www.facebook.com/v19.0/dialog/oauth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "email,public_profile");
  url.searchParams.set("response_type", "code");

  return NextResponse.redirect(url.toString());
}
