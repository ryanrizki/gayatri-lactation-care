"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, CalendarCheck, GraduationCap, UserCircle, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

const baseNavItems = [
  { to: "/", label: "Edu Hub", Icon: Heart, end: true },
  { to: "/layanan", label: "Klinik & Homecare", Icon: CalendarCheck, end: false },
];

export default function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  const navItems = user
    ? [...baseNavItems, { to: "/kelas-saya", label: "Kelas Saya", Icon: GraduationCap, end: false }]
    : baseNavItems;

  /** react-router `end`: `/` cocok persis; `/layanan` cocok dirinya sendiri + sub-route (per segmen, bukan prefix string). */
  const isActive = (to: string, exact: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

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
                  <UserCircle className="w-4 h-4 text-[#D85C99]" /> {user.name?.split(" ")[0]}
                </span>
                <button
                  type="button"
                  onClick={() => signOut({ redirectTo: "/" })}
                  className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 rounded-full text-xs font-bold text-[#836E7A] hover:text-[#3E2A38] hover:bg-white/60 transition cursor-pointer"
                  aria-label="Keluar"
                >
                  <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <Link
                href="/masuk"
                className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 rounded-full text-sm font-bold bg-[#FCE9F1] border border-[#F3D6E2] text-[#3E2A38] hover:bg-[#F8B6D2]/40 transition cursor-pointer"
              >
                <UserCircle className="w-5 h-5 text-[#D85C99]" /> Masuk
              </Link>
            )}
          </div>
        </div>

        {/* Row 2: full-width segmented nav (mobile only) */}
        <nav className="grid grid-cols-2 gap-2 mt-2.5 md:hidden">
          {navItems.map(({ to, label, Icon, end }, idx) => (
            <Link
              key={to}
              href={to}
              className={`min-h-[48px] px-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-center leading-tight cursor-pointer border ${
                navItems.length % 2 === 1 && idx === navItems.length - 1 ? "col-span-2" : ""
              } ${
                isActive(to, end) ? "bg-[#3E2A38] text-white border-[#3E2A38] shadow-sm font-bold" : "bg-[#FFF6FA] text-[#5E4455] border-[#F3D6E2]/70 hover:bg-white"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </header>
    </>
  );
}
