import Link from "next/link";
import { Lock } from "lucide-react";

/** Soft Warm Pastel Brand Footer Section */
export default function SiteFooter() {
  return (
    <footer className="bg-white text-[#3E2A38] py-12 md:py-16 border border-[#F3D6E2]/70 rounded-3xl shrink-0 mt-8 max-w-7xl mx-auto w-full">
      <div className="px-8 grid grid-cols-1 md:grid-cols-4 gap-10">

        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#FCE9F1] rounded-full flex items-center justify-center text-md border border-[#F3D6E2]">
              🌸
            </div>
            <span className="text-2xl font-display font-black tracking-tight leading-none text-[#3E2A38]">
              Gayatri<span className="text-[#E97FB1]">.</span>
            </span>
          </div>
          <p className="text-[#9C8593] leading-relaxed text-[11px] font-mono tracking-wider uppercase">
            UNIT LAYANAN MAMA • BERDIRI 2026
          </p>
          <p className="text-[#806471] text-xs leading-relaxed">
            Platform laktasi terpadu pendamping setia perjalanan menyusui Mama secara tulus, aman, dan berstandard medis IDAI & WHO.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-[#9C8593]">Navigasi Halaman</h4>
          <div className="flex flex-col gap-2 text-xs font-semibold text-[#836E7A]">
            <Link href="/" className="text-left hover:text-[#E97FB1] transition">Edu Hub & Tantangan</Link>
            <Link href="/layanan" className="text-left hover:text-[#E97FB1] transition">Homecare & Kelas</Link>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-[#9C8593]">Informasi & Kontak</h4>
          <div className="space-y-3.5 text-xs text-[#836E7A]">
            <div>
              <span className="font-extrabold text-[#3E2A38] block text-[9px] uppercase tracking-wider">Email Resmi</span>
              <span className="font-mono text-[11px]">hello@gayatri.co</span>
            </div>
            <div>
              <span className="font-extrabold text-[#3E2A38] block text-[9px] uppercase tracking-wider">WhatsApp Care</span>
              <span className="font-mono text-[11px]">+62 812 3456 7890</span>
            </div>
            <div>
              <span className="font-extrabold text-[#3E2A38] block text-[9px] uppercase tracking-wider">Alamat Klinik</span>
              <span>Jakarta Selatan, Indonesia</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-[#9C8593]">Standard & Kepatuhan</h4>
          <p className="text-[#806471] leading-relaxed text-xs">
            Tuntunan laktasi diadaptasi sesuai Standard Kompetensi Dokter Indonesia (SKDI) departemen IDAI, Kemenkes RI, serta protokol medis resmi WHO.
          </p>
          <div className="flex items-center gap-2.5 p-3 bg-[#FFF6FA] rounded-2xl border border-[#F3D6E2]/60">
            <Lock className="w-4 h-4 text-[#3E2A38] shrink-0" />
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#6E5563]">Penyimpanan Data 100% Aman</span>
          </div>
        </div>
      </div>

      <div className="px-8 mt-12 pt-8 border-t border-[#F3D6E2]/50 flex flex-col md:flex-row justify-between items-center text-[10px] tracking-wider font-bold text-[#9C8593] gap-4 uppercase">
        <p>© 2026 Gayatri Lactation Care. Semua Hak Dilindungi.</p>
        <div className="flex gap-4">
          <div className="flex -space-x-1 items-center">
            <div className="w-7 h-7 rounded-full border border-[#F3D6E2] flex items-center justify-center text-[9px] font-black bg-white text-[#3E2A38]">G</div>
            <div className="w-7 h-7 rounded-full bg-[#F8B6D2] flex items-center justify-center text-[9px] font-black text-[#2A1C26]">A</div>
            <div className="w-7 h-7 rounded-full bg-[#FCE9F1] border border-[#F3D6E2] flex items-center justify-center text-[9px] font-black text-[#3E2A38]">Y</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
