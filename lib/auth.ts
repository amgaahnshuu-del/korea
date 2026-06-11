import { cookies } from "next/headers";
import { verifyToken, JWTPayload } from "./jwt";

export async function getUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireUser(): Promise<JWTPayload> {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireAdmin(): Promise<JWTPayload> {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("Forbidden");
  return user;
}
