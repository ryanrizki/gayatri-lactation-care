"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { createUser, deleteUser, setUserPassword } from "@/lib/users";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Aksi ADMIN: tambah user baru (role USER). */
export async function createUserAction(
  _prev: { error?: string; ok?: boolean } | undefined,
  formData: FormData,
): Promise<{ error?: string; ok?: boolean }> {
  await requireAdmin();
  const nama = String(formData.get("nama") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!nama) return { error: "Nama wajib diisi." };
  if (!emailRe.test(email)) return { error: "Email tidak valid." };
  if (password.length < 8) return { error: "Password minimal 8 karakter." };

  try {
    await createUser({ nama, email, password });
  } catch (e) {
    if (e instanceof Error && e.message === "EMAIL_TAKEN") {
      return { error: "Email sudah terpakai." };
    }
    throw e;
  }
  revalidatePath("/admin/pengguna");
  return { ok: true };
}

/** Aksi ADMIN: hapus user. Guard self / admin terakhir di lib. */
export async function deleteUserAction(id: string): Promise<{ error?: string }> {
  const adminId = await requireAdmin();
  try {
    await deleteUser(id, adminId);
  } catch (e) {
    if (e instanceof Error) {
      const map: Record<string, string> = {
        SELF_DELETE: "Tidak bisa menghapus akun sendiri.",
        LAST_ADMIN: "Tidak bisa menghapus admin terakhir.",
        NOT_FOUND: "User tidak ditemukan.",
      };
      if (map[e.message]) return { error: map[e.message] };
    }
    throw e;
  }
  revalidatePath("/admin/pengguna");
  return {};
}

/** Aksi ADMIN: reset password user. */
export async function resetPasswordAction(id: string, newPassword: string): Promise<{ error?: string }> {
  await requireAdmin();
  if (newPassword.length < 8) return { error: "Password minimal 8 karakter." };
  try {
    await setUserPassword(id, newPassword);
  } catch (e) {
    if (e instanceof Error && e.message === "NOT_FOUND") {
      return { error: "User tidak ditemukan." };
    }
    throw e;
  }
  revalidatePath("/admin/pengguna");
  return {};
}
