import { prisma } from "./db";
import { hashPassword } from "./password";

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
}

/** Buat user baru (role USER). Melempar Error("EMAIL_TAKEN") bila email sudah ada. */
export async function createUser(input: { nama: string; email: string; password: string }) {
  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("EMAIL_TAKEN");
  const passwordHash = await hashPassword(input.password);
  return prisma.user.create({
    data: { nama: input.nama, email, passwordHash },
  });
}

export type AdminUserRow = {
  id: string;
  nama: string;
  email: string;
  role: "USER" | "ADMIN";
  enrollmentCount: number;
  createdAt: Date;
};

/** Daftar semua user untuk panel admin, dengan jumlah enrollment. Admin dulu, lalu terbaru. */
export async function listUsersForAdmin(): Promise<AdminUserRow[]> {
  const users = await prisma.user.findMany({
    orderBy: [{ role: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      nama: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { enrollments: true } },
    },
  });
  return users.map((u) => ({
    id: u.id,
    nama: u.nama,
    email: u.email,
    role: u.role,
    enrollmentCount: u._count.enrollments,
    createdAt: u.createdAt,
  }));
}

/**
 * Hapus user. Enrollment ikut terhapus (cascade).
 * Guard: tak bisa hapus diri sendiri, tak bisa hapus admin terakhir.
 * Melempar Error("SELF_DELETE" | "LAST_ADMIN" | "NOT_FOUND").
 */
export async function deleteUser(id: string, currentAdminId: string) {
  if (id === currentAdminId) throw new Error("SELF_DELETE");
  const user = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (!user) throw new Error("NOT_FOUND");
  if (user.role === "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) throw new Error("LAST_ADMIN");
  }
  await prisma.user.delete({ where: { id } });
}

/** Set password baru (hash argon2). Melempar Error("NOT_FOUND") bila user tak ada. */
export async function setUserPassword(id: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!user) throw new Error("NOT_FOUND");
  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id }, data: { passwordHash } });
}
