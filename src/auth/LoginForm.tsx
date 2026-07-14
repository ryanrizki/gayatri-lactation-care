"use client";

import React, { useState } from "react";
import { User, LogIn } from "lucide-react";
import { useAuth } from "./AuthContext";

const inputClass = "w-full min-h-[44px] px-4 py-2.5 text-base border border-[#F3D6E2] focus:border-[#E97FB1] rounded-2xl focus:outline-none bg-[#FFFCFD] text-[#3E2A38]";

/** Mock login — any non-empty input logs the user in. Temporary, no backend. */
export default function LoginForm({ heading, body }: { heading?: string; body?: string }) {
  const { login } = useAuth();
  const [nama, setNama] = useState("");
  const [kontak, setKontak] = useState("");
  const [warn, setWarn] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !kontak.trim()) { setWarn(true); return; }
    login(nama.trim(), kontak.trim());
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {heading && <h3 className="text-lg font-display font-bold text-[#3E2A38]">{heading}</h3>}
      <p className="text-sm text-[#5E4455] leading-relaxed">
        {body ?? "Masuk ke akun Gayatri Mama untuk lanjut ya, Ma. 🌸"}
      </p>
      {warn && <p className="text-sm text-red-600">Mohon isi nama dan kontak ya, Ma. 🌸</p>}
      <div>
        <label className="text-sm font-bold text-[#5E4455] block mb-1.5">Nama Mama</label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C8593]/70" />
          <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Contoh: Rania Kirana" className={inputClass + " pl-10"} />
        </div>
      </div>
      <div>
        <label className="text-sm font-bold text-[#5E4455] block mb-1.5">WhatsApp / Email</label>
        <input value={kontak} onChange={(e) => setKontak(e.target.value)} placeholder="0812xxxx atau mama@email.com" className={inputClass} />
      </div>
      <button type="submit" className="w-full min-h-[48px] py-3 bg-[#3E2A38] hover:bg-[#E97FB1] text-white font-bold text-sm rounded-full transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md">
        <LogIn className="w-5 h-5" /> Masuk
      </button>
    </form>
  );
}
