"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signIn } from "next-auth/react";
import { registerUser } from "@/lib/auth-actions";

const inputClass =
  "w-full min-h-[44px] px-4 py-2.5 text-base border border-[#F3D6E2] focus:border-[#E97FB1] rounded-2xl focus:outline-none bg-[#FFFCFD] text-[#3E2A38]";
const labelClass = "block text-sm font-semibold text-[#3E2A38] mb-1.5";
const buttonClass =
  "w-full min-h-[44px] bg-[#3E2A38] hover:bg-[#E97FB1] text-white px-4 py-2.5 rounded-full font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed";
const cardClass = "bg-white rounded-3xl border border-[#F3D6E2] p-6 shadow-sm";
const errorClass =
  "rounded-2xl bg-[#FDECF3] border border-[#F3D6E2] text-[#B03A6E] text-sm px-4 py-3";
const linkClass = "text-[#D85C99] font-semibold hover:underline";

export function LoginFormReal({ callbackUrl = "/kelas-saya" }: { callbackUrl?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (!res || res.error) {
        setError("Email atau password salah ya, Ma.");
        setPending(false);
        return;
      }
      window.location.href = callbackUrl;
    } catch {
      setError("Terjadi kesalahan. Coba lagi sebentar ya, Ma.");
      setPending(false);
    }
  }

  return (
    <div className={cardClass}>
      <h1 className="text-2xl font-display font-black text-[#3E2A38] mb-1">Masuk ke Akun Mama</h1>
      <p className="text-sm text-[#7A5E6E] mb-5">Senang Mama kembali lagi 🌸</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className={errorClass}>{error}</div>}

        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="mama@contoh.com"
          />
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="Password Mama"
          />
        </div>

        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Sedang masuk…" : "Masuk"}
        </button>
      </form>

      <p className="text-sm text-[#7A5E6E] text-center mt-5">
        Belum punya akun?{" "}
        <Link href="/daftar" className={linkClass}>
          Daftar
        </Link>
      </p>
    </div>
  );
}

export function RegisterFormReal() {
  const [state, formAction, pending] = useActionState(registerUser, {});

  return (
    <div className={cardClass}>
      <h1 className="text-2xl font-display font-black text-[#3E2A38] mb-1">Daftar Akun Mama</h1>
      <p className="text-sm text-[#7A5E6E] mb-5">Yuk buat akun untuk mulai pendampingan 🌸</p>

      <form action={formAction} className="space-y-4">
        {state.error && <div className={errorClass}>{state.error}</div>}

        <div>
          <label htmlFor="nama" className={labelClass}>
            Nama
          </label>
          <input
            id="nama"
            name="nama"
            type="text"
            autoComplete="name"
            required
            className={inputClass}
            placeholder="Nama Mama"
          />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={inputClass}
            placeholder="mama@contoh.com"
          />
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className={inputClass}
            placeholder="Buat password"
          />
          <p className="text-xs text-[#7A5E6E] mt-1.5">minimal 8 karakter</p>
        </div>

        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Sedang mendaftar…" : "Daftar"}
        </button>
      </form>

      <p className="text-sm text-[#7A5E6E] text-center mt-5">
        Sudah punya akun?{" "}
        <Link href="/masuk" className={linkClass}>
          Masuk
        </Link>
      </p>
    </div>
  );
}
