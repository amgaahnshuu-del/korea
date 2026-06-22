import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import crypto from "crypto";

function sanitizeNextPath(next: string | null) {
  if (!next) return "";
  if (!next.startsWith("/") || next.startsWith("//")) return "";
  if (next.startsWith("/api/") || next.startsWith("/_next/")) return "";
  if (next === "/login") return "";
  return next;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const nextPath = sanitizeNextPath(searchParams.get("state"));
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  if (!code) {
    return NextResponse.redirect(`${appUrl}/login?error=google`);
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${appUrl}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) {
      console.error("[google-callback] token exchange failed:", JSON.stringify(tokens));
      const msg = encodeURIComponent(tokens.error_description || tokens.error || "token_failed");
      return NextResponse.redirect(`${appUrl}/login?error=google&msg=${msg}`);
    }

    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const googleUser = await userRes.json();
    console.log("[google-callback] googleUser:", googleUser.email);

    if (!googleUser.email) {
      return NextResponse.redirect(`${appUrl}/login?error=google&msg=no_email`);
    }

    let user = await prisma.user.findUnique({ where: { email: googleUser.email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name || googleUser.email,
          password: crypto.randomBytes(32).toString("hex"),
          avatar: googleUser.picture ?? null,
        },
      });
    }

    if (user.isBlocked) {
      return NextResponse.redirect(`${appUrl}/login?error=blocked`);
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });
    const destination = nextPath || (user.role === "ADMIN" ? "/admin" : "/jobs");

    const response = NextResponse.redirect(`${appUrl}${destination}`);
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[google-callback] exception:", err);
    return NextResponse.redirect(`${appUrl}/login?error=google&msg=exception`);
  }
}
