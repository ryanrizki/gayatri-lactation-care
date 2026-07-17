"use server";

import { createUser } from "@/lib/users";
import { signIn } from "@/auth";

export interface RegisterState {
  error?: string;
}

/** Server action: daftar user baru lalu auto sign-in. */
export async function registerUser(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  const nama = String(formData.get("nama") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!nama || !email || !password) return { error: "Mohon lengkapi semua kolom ya, Ma." };
  if (password.length < 8) return { error: "Password minimal 8 karakter ya, Ma." };
  if (password.length > 256) return { error: "Password terlalu panjang (maks 256 karakter)." };
  if (nama.length > 120) return { error: "Nama terlalu panjang." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Format email belum benar ya, Ma." };

  try {
    await createUser({ nama, email, password });
  } catch (e) {
    if (e instanceof Error && e.message === "EMAIL_TAKEN") {
      return { error: "Email ini sudah terdaftar. Silakan masuk ya, Ma." };
    }
    return { error: "Terjadi kesalahan. Coba lagi sebentar ya, Ma." };
  }

  await signIn("credentials", { email, password, redirectTo: "/" });
  return {};
}
