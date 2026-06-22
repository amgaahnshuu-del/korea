import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = new Set(["/", "/about", "/contact", "/login", "/register", "/forgot-password", "/reset-password", "/jobs"]);
const PUBLIC_PREFIXES = ["/api/auth", "/_next"];
const FILE_EXTENSION_RE = /\.[^/]+$/;

function base64UrlToString(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return globalThis.atob(padded);
}

function bytesToBase64Url(bytes: ArrayBuffer): string {
  const view = new Uint8Array(bytes);
  let binary = "";
  for (const byte of view) binary += String.fromCharCode(byte);
  return globalThis
    .btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function verifyToken(token: string): Promise<boolean> {
  const secret = process.env.JWT_SECRET;
  if (!secret) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [headerPart, payloadPart, signaturePart] = parts;

  try {
    const header = JSON.parse(base64UrlToString(headerPart)) as { alg?: string };
    if (header.alg !== "HS256") return false;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(`${headerPart}.${payloadPart}`),
    );

    if (bytesToBase64Url(signature) !== signaturePart) return false;

    const payload = JSON.parse(base64UrlToString(payloadPart)) as { exp?: number };
    if (typeof payload.exp === "number" && Date.now() / 1000 >= payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}

function isPublicJobsDetailPath(pathname: string): boolean {
  if (!pathname.startsWith("/jobs/")) return false;

  const segments = pathname.split("/").filter(Boolean);
  return segments.length === 2 && segments[0] === "jobs" && segments[1] !== "post";
}
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const normalizedPathname = pathname !== "/" ? pathname.replace(/\/+$/, "") : pathname;

  if (PUBLIC_PATHS.has(normalizedPathname)) return NextResponse.next();
  if (isPublicJobsDetailPath(normalizedPathname)) return NextResponse.next();
  if (PUBLIC_PREFIXES.some((prefix) => normalizedPathname.startsWith(prefix))) return NextResponse.next();
  if (normalizedPathname.startsWith("/favicon.ico")) return NextResponse.next();
  if (FILE_EXTENSION_RE.test(normalizedPathname)) return NextResponse.next();

  const token = req.cookies.get("token")?.value;
  if (!token || !(await verifyToken(token))) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
