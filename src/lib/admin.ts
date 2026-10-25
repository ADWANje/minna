import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "./security";

export const ADMIN_COOKIE = "minna_admin";

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  try {
    return verifySession(jar.get(ADMIN_COOKIE)?.value);
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
