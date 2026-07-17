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
