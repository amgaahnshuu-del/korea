import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  if (!code) {
    return NextResponse.redirect(`${appUrl}/login?error=facebook`);
  }

  try {
    const redirectUri = `${appUrl}/api/auth/facebook/callback`;

    const tokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?` +
        new URLSearchParams({
          client_id: process.env.FACEBOOK_APP_ID!,
          client_secret: process.env.FACEBOOK_APP_SECRET!,
          redirect_uri: redirectUri,
          code,
        })
    );

    const tokens = await tokenRes.json();
    if (!tokens.access_token) {
      console.error("[facebook-callback] token exchange failed:", JSON.stringify(tokens));
      const msg = encodeURIComponent(tokens.error?.message || "token_failed");
      return NextResponse.redirect(`${appUrl}/login?error=facebook&msg=${msg}`);
    }

    const userRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${tokens.access_token}`
    );
    const fbUser = await userRes.json();
    console.log("[facebook-callback] fbUser:", fbUser.email);

    if (!fbUser.email) {
      return NextResponse.redirect(`${appUrl}/login?error=facebook&msg=no_email`);
    }

    let user = await prisma.user.findUnique({ where: { email: fbUser.email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: fbUser.email,
          name: fbUser.name || fbUser.email,
          password: crypto.randomBytes(32).toString("hex"),
          avatar: fbUser.picture?.data?.url ?? null,
        },
      });
    }

    if (user.isBlocked) {
      return NextResponse.redirect(`${appUrl}/login?error=blocked`);
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });

    const response = NextResponse.redirect(`${appUrl}${user.role === "ADMIN" ? "/admin" : "/jobs"}`);
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[facebook-callback] exception:", err);
    return NextResponse.redirect(`${appUrl}/login?error=facebook&msg=exception`);
  }
}
