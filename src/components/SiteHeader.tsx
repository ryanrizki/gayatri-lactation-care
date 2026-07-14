"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, CalendarCheck, UserCircle, LogOut, X } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import LoginForm from "@/auth/LoginForm";

const navItems = [
  { to: "/", label: "Edu Hub", Icon: Heart, end: true },
  { to: "/layanan", label: "Klinik & Homecare", Icon: CalendarCheck, end: false },
];

export default function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => { if (user) setAuthOpen(false); }, [user]);

  /** react-router `end` prop: cocok persis untuk "/", cocok prefix untuk lainnya. */
  const isActive = (to: string, exact: boolean) =>
    exact ? pathname === to : pathname.startsWith(to);

  return (
    <>
      {/* 1. Header/Navigation Bar with responsive compact rounded styling */}
      <header className="sticky top-2 md:top-4 z-50 bg-white/95 backdrop-blur-md border border-[#F3D6E2]/80 rounded-2xl md:rounded-3xl p-2.5 md:p-4 shrink-0 shadow-sm max-w-7xl mx-auto w-full mb-4 md:mb-6">
        {/* Row 1: brand + (desktop nav) + account */}
        <div className="flex items-center justify-between gap-3">

          {/* Brand Logo with elegant warm display serif typography */}
          <div
            onClick={() => router.push("/")}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 md:w-10 md:h-10 bg-[#FCE9F1] rounded-full flex items-center justify-center text-lg md:text-xl shadow-inner border border-[#F3D6E2]">
              🌸
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-2xl font-display font-black tracking-tight leading-none text-[#3E2A38]">
                Gayatri<span className="text-[#E97FB1]">.</span>
              </span>
              <span className="text-[8px] uppercase tracking-[0.25em] mt-0.5 font-bold text-[#9C8593]">
                Pusat Laktasi
              </span>
            </div>
          </div>

          {/* Desktop inline nav (hidden on mobile) */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#FFF6FA] p-1 rounded-2xl border border-[#F3D6E2]/55">
            {navItems.map(({ to, label, Icon, end }) => (
              <Link
                key={to}
                href={to}
                className={`px-4 py-2 rounded-xl text-xs font-sans font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  isActive(to, end) ? "bg-[#3E2A38] text-white shadow-sm font-bold" : "text-[#836E7A] hover:text-[#3E2A38] hover:bg-white/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          {/* Account chip */}
          <div className="relative shrink-0">
            {user ? (
              <div className="flex items-center gap-1.5">
                <span className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#3E2A38] bg-[#FCE9F1] border border-[#F3D6E2] rounded-full px-3 min-h-[40px]">
                  <UserCircle className="w-4 h-4 text-[#D85C99]" /> {user.nama.split(" ")[0]}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 rounded-full text-xs font-bold text-[#836E7A] hover:text-[#3E2A38] hover:bg-white/60 transition cursor-pointer"
                  aria-label="Keluar"
                >
                  <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAuthOpen((o) => !o)}
                className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 rounded-full text-sm font-bold bg-[#FCE9F1] border border-[#F3D6E2] text-[#3E2A38] hover:bg-[#F8B6D2]/40 transition cursor-pointer"
              >
                <UserCircle className="w-5 h-5 text-[#D85C99]" /> Masuk
              </button>
            )}
          </div>
        </div>

        {/* Row 2: full-width segmented nav (mobile only) */}
        <nav className="grid grid-cols-2 gap-2 mt-2.5 md:hidden">
          {navItems.map(({ to, label, Icon, end }) => (
            <Link
              key={to}
              href={to}
              className={`min-h-[48px] px-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-center leading-tight cursor-pointer border ${
                isActive(to, end) ? "bg-[#3E2A38] text-white border-[#3E2A38] shadow-sm font-bold" : "bg-[#FFF6FA] text-[#5E4455] border-[#F3D6E2]/70 hover:bg-white"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </header>

      {/* Login overlay — rendered at root (outside the backdrop-blur header) so `fixed` anchors to the viewport */}
      {!user && authOpen && (
        <>
          {/* Scrim: dark on mobile, transparent click-away on desktop */}
          <div
            className="fixed inset-0 z-[100] bg-[#2A1C26]/40 md:bg-transparent animate-fadeIn"
            onClick={() => setAuthOpen(false)}
            aria-hidden
          />
          {/* Panel: bottom sheet on mobile, top-right card on desktop */}
          <div className="fixed inset-x-0 bottom-0 z-[110] bg-white border-t border-[#F3D6E2] rounded-t-3xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl animate-slideUp md:inset-x-auto md:bottom-auto md:right-4 md:top-24 md:w-72 md:rounded-2xl md:border md:p-4 md:shadow-xl md:animate-fadeIn">
            <div className="md:hidden mx-auto mb-3 h-1.5 w-12 rounded-full bg-[#F3D6E2]" />
            <button
              type="button"
              onClick={() => setAuthOpen(false)}
              aria-label="Tutup"
              className="md:hidden absolute right-4 top-4 inline-flex items-center justify-center w-9 h-9 rounded-full text-[#836E7A] hover:bg-[#FCE9F1] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <LoginForm heading="Masuk ke Akun Mama" />
          </div>
        </>
      )}
    </>
  );
}
