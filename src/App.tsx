/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route, Navigate, NavLink, useNavigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import ServicesLayout from "./services/ServicesLayout";
import ServiceList from "./services/ServiceList";
import ServiceDetail from "./services/ServiceDetail";
import ServiceBooking from "./services/ServiceBooking";
import { Heart, CalendarCheck, Lock } from "lucide-react";

export default function App() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#3F322F] flex flex-col justify-between selection:bg-[#FBC2A2] selection:text-[#291E1C] p-2 md:p-4">
      
      {/* 1. Header/Navigation Bar with responsive compact rounded styling */}
      <header className="sticky top-2 md:top-4 z-50 bg-white/95 backdrop-blur-md border border-[#EADCC9]/80 rounded-2xl md:rounded-3xl p-2.5 md:p-4 shrink-0 shadow-sm max-w-7xl mx-auto w-full mb-4 md:mb-6">
        <div className="flex items-center justify-between gap-2">
          
          {/* Brand Logo with elegant warm display serif typography */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 md:gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 bg-[#FAF1E6] rounded-full flex items-center justify-center text-base md:text-xl shadow-inner border border-[#EADCC9]">
              🌸
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-2xl font-display font-black tracking-tight leading-none text-[#3F322F]">
                Gayatri<span className="text-[#F2A07C]">.</span>
              </span>
              <span className="hidden sm:inline text-[8px] uppercase tracking-[0.25em] mt-1 font-bold text-[#937F73]">
                Layanan Laktasi
              </span>
            </div>
          </div>

          {/* Tab Menu styled with responsive soft interactive pills */}
          <nav className="flex items-center gap-1 sm:gap-1.5 bg-[#FAF6F0] p-1 rounded-xl sm:rounded-2xl border border-[#EADCC9]/55">
            {[
              { to: "/", label: "Edu Hub", icon: <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /> },
              { to: "/layanan", label: "Klinik & Homecare", icon: <CalendarCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /> }
            ].map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.to === "/"}
                className={({ isActive }) => `px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10.5px] sm:text-xs font-sans font-semibold transition-all duration-200 flex items-center gap-1 sm:gap-1.5 cursor-pointer ${
                  isActive ? "bg-[#3F322F] text-white shadow-sm font-bold" : "text-[#7A6A65] hover:text-[#3F322F] hover:bg-white/60"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
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
