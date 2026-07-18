import { ServicesProvider } from "@/services/ServicesContext";
import ServicesStepper from "@/components/ServicesStepper";

export default function LayananLayout({ children }: { children: React.ReactNode }) {
  return (
    <ServicesProvider>
      <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 mb-16">
        <div className="text-center max-w-3xl mx-auto space-y-4 pb-2">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#D85C99] bg-[#FDEAF2] px-5 py-2 rounded-full shadow-sm">
            🌸 Layanan Spesialis Laktasi Gayatri
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-[#3E2A38]">
            Pendampingan Laktasi <span className="text-[#E97FB1]">Terpadu</span>
          </h1>
          <p className="text-[#5E4455] text-base leading-relaxed max-w-lg mx-auto">
            Mendampingi setiap momen menyusui dengan pendekatan medis yang suportif, minim trauma, dan terstandarisasi untuk Mama dan si Kecil.
          </p>
        </div>

        <ServicesStepper />

        {children}
      </div>
    </ServicesProvider>
  );
}
