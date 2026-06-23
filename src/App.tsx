/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Routes, Route, Navigate, NavLink, useNavigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import ServicesLayout from "./services/ServicesLayout";
import ServiceList from "./services/ServiceList";
import ServiceDetail from "./services/ServiceDetail";
import ServiceBooking from "./services/ServiceBooking";
import { useAuth } from "./auth/AuthContext";
import LoginForm from "./auth/LoginForm";
import { Heart, CalendarCheck, Lock, UserCircle, LogOut } from "lucide-react";

export default function App() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => { if (user) setAuthOpen(false); }, [user]);

  const navItems = [
    { to: "/", label: "Edu Hub", Icon: Heart, end: true },
    { to: "/layanan", label: "Klinik & Homecare", Icon: CalendarCheck, end: false },
  ];

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#3F322F] flex flex-col justify-between selection:bg-[#FBC2A2] selection:text-[#291E1C] p-2 md:p-4">
      
      {/* 1. Header/Navigation Bar with responsive compact rounded styling */}
      <header className="sticky top-2 md:top-4 z-50 bg-white/95 backdrop-blur-md border border-[#EADCC9]/80 rounded-2xl md:rounded-3xl p-2.5 md:p-4 shrink-0 shadow-sm max-w-7xl mx-auto w-full mb-4 md:mb-6">
        {/* Row 1: brand + (desktop nav) + account */}
        <div className="flex items-center justify-between gap-3">

          {/* Brand Logo with elegant warm display serif typography */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 md:w-10 md:h-10 bg-[#FAF1E6] rounded-full flex items-center justify-center text-lg md:text-xl shadow-inner border border-[#EADCC9]">
              🌸
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-2xl font-display font-black tracking-tight leading-none text-[#3F322F]">
                Gayatri<span className="text-[#F2A07C]">.</span>
              </span>
              <span className="text-[8px] uppercase tracking-[0.25em] mt-0.5 font-bold text-[#937F73]">
                Pusat Laktasi
              </span>
            </div>
          </div>

          {/* Desktop inline nav (hidden on mobile) */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#FAF6F0] p-1 rounded-2xl border border-[#EADCC9]/55">
            {navItems.map(({ to, label, Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `px-4 py-2 rounded-xl text-xs font-sans font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  isActive ? "bg-[#3F322F] text-white shadow-sm font-bold" : "text-[#7A6A65] hover:text-[#3F322F] hover:bg-white/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Account chip */}
          <div className="relative shrink-0">
            {user ? (
              <div className="flex items-center gap-1.5">
                <span className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#3F322F] bg-[#FAF1E6] border border-[#EADCC9] rounded-full px-3 min-h-[40px]">
                  <UserCircle className="w-4 h-4 text-[#E06E43]" /> {user.nama.split(" ")[0]}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 rounded-full text-xs font-bold text-[#7A6A65] hover:text-[#3F322F] hover:bg-white/60 transition cursor-pointer"
                  aria-label="Keluar"
                >
                  <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAuthOpen((o) => !o)}
                className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 rounded-full text-sm font-bold bg-[#FAF1E6] border border-[#EADCC9] text-[#3F322F] hover:bg-[#FBC2A2]/40 transition cursor-pointer"
              >
                <UserCircle className="w-5 h-5 text-[#E06E43]" /> Masuk
              </button>
            )}

            {!user && authOpen && (
              <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white border border-[#EADCC9] rounded-2xl shadow-xl p-4 z-50 animate-fadeIn">
                <LoginForm heading="Masuk ke Akun Mama" />
              </div>
            )}
          </div>
        </div>

        {/* Row 2: full-width segmented nav (mobile only) */}
        <nav className="grid grid-cols-2 gap-2 mt-2.5 md:hidden">
          {navItems.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `min-h-[48px] px-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-center leading-tight cursor-pointer border ${
                isActive ? "bg-[#3F322F] text-white border-[#3F322F] shadow-sm font-bold" : "bg-[#FAF6F0] text-[#5C453C] border-[#EADCC9]/70 hover:bg-white"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </header>

      {/* 2. Main Content Container Area */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 md:py-8 flex-1 w-full">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/layanan" element={<ServicesLayout />}>
            <Route index element={<ServiceList />} />
            <Route path=":id" element={<ServiceDetail />} />
            <Route path=":id/booking" element={<ServiceBooking />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* 3. Soft Warm Pastel Brand Footer Section */}
      <footer className="bg-white text-[#3F322F] py-12 md:py-16 border border-[#EADCC9]/70 rounded-3xl shrink-0 mt-8 max-w-7xl mx-auto w-full">
        <div className="px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#FAF1E6] rounded-full flex items-center justify-center text-md border border-[#EADCC9]">
                🌸
              </div>
              <span className="text-2xl font-display font-black tracking-tight leading-none text-[#3F322F]">
                Gayatri<span className="text-[#F2A07C]">.</span>
              </span>
            </div>
            <p className="text-[#937F73] leading-relaxed text-[11px] font-mono tracking-wider uppercase">
              UNIT LAYANAN MAMA • BERDIRI 2026
            </p>
            <p className="text-[#7D6B65] text-xs leading-relaxed">
              Platform laktasi terpadu pendamping setia perjalanan menyusui Mama secara tulus, aman, dan berstandard medis IDAI & WHO.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-[#937F73]">Navigasi Halaman</h4>
            <div className="flex flex-col gap-2 text-xs font-semibold text-[#7A6A65]">
              <NavLink to="/" end className="text-left hover:text-[#F2A07C] transition">Edu Hub & Tantangan</NavLink>
              <NavLink to="/layanan" className="text-left hover:text-[#F2A07C] transition">Homecare & Kelas</NavLink>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-[#937F73]">Informasi & Kontak</h4>
            <div className="space-y-3.5 text-xs text-[#7A6A65]">
              <div>
                <span className="font-extrabold text-[#3F322F] block text-[9px] uppercase tracking-wider">Email Resmi</span>
                <span className="font-mono text-[11px]">hello@gayatri.co</span>
              </div>
              <div>
                <span className="font-extrabold text-[#3F322F] block text-[9px] uppercase tracking-wider">WhatsApp Care</span>
                <span className="font-mono text-[11px]">+62 812 3456 7890</span>
              </div>
              <div>
                <span className="font-extrabold text-[#3F322F] block text-[9px] uppercase tracking-wider">Alamat Klinik</span>
                <span>Jakarta Selatan, Indonesia</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-[#937F73]">Standard & Kepatuhan</h4>
            <p className="text-[#7D6B65] leading-relaxed text-xs">
              Tuntunan laktasi diadaptasi sesuai Standard Kompetensi Dokter Indonesia (SKDI) departemen IDAI, Kemenkes RI, serta protokol medis resmi WHO.
            </p>
            <div className="flex items-center gap-2.5 p-3 bg-[#FAF6F0] rounded-2xl border border-[#EADCC9]/60">
              <Lock className="w-4 h-4 text-[#3F322F] shrink-0" />
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#6B5A55]">Penyimpanan Data 100% Aman</span>
            </div>
          </div>
        </div>

        <div className="px-8 mt-12 pt-8 border-t border-[#EADCC9]/50 flex flex-col md:flex-row justify-between items-center text-[10px] tracking-wider font-bold text-[#937F73] gap-4 uppercase">
          <p>© 2026 Gayatri Lactation Care. Semua Hak Dilindungi.</p>
          <div className="flex gap-4">
            <div className="flex -space-x-1 items-center">
              <div className="w-7 h-7 rounded-full border border-[#EADCC9] flex items-center justify-center text-[9px] font-black bg-white text-[#3F322F]">G</div>
              <div className="w-7 h-7 rounded-full bg-[#FBC2A2] flex items-center justify-center text-[9px] font-black text-[#291E1C]">A</div>
              <div className="w-7 h-7 rounded-full bg-[#FAF1E6] border border-[#EADCC9] flex items-center justify-center text-[9px] font-black text-[#3F322F]">Y</div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
