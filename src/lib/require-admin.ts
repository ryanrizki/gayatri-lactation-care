import { auth } from "@/auth";

/** Pastikan pemanggil ADMIN. Kembalikan id admin saat ini (untuk guard self-action). */
export async function requireAdmin(): Promise<string> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("FORBIDDEN");
  return session.user.id;
}
