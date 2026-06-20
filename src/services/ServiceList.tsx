import { useNavigate } from "react-router-dom";
import { SERVICE_PACKAGES } from "../data/challengesData";
import { CheckCircle, ArrowRight } from "lucide-react";

const formatIDR = (num: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

export default function ServiceList() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between gap-3 border-b border-[#EADCC9]/50 pb-3">
        <h2 className="text-base sm:text-lg font-display font-bold text-[#3F322F]">
          Pilih Layanan Terbaik Untuk Mama
        </h2>
        <span className="text-sm font-semibold text-[#7A6A65] shrink-0">
          {SERVICE_PACKAGES.length} Program
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        {SERVICE_PACKAGES.map((pkg) => {
          const catLabel = pkg.category === "consultation" ? "Konsultasi" : pkg.category === "class" ? "Kelas Privat" : "Webinar";
          const catClass = pkg.category === "consultation"
            ? "bg-white/90 text-[#7A6A65] border-[#EADCC9]"
            : pkg.category === "class"
            ? "bg-[#FFF2EB] text-[#E06E43] border-[#FFD3BE]"
            : "bg-blue-50 text-blue-700 border-blue-100";
          return (
            <div
              key={pkg.id}
              className="border border-[#EADCC9] p-3 sm:p-5 flex flex-col justify-between transition-all duration-300 rounded-3xl bg-white hover:-translate-y-0.5 hover:border-[#FBC2A2] hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="relative">
                  <img src={pkg.image} alt={pkg.name} loading="lazy" className="w-full h-28 sm:h-36 object-cover rounded-2xl" />
                  <span className={`absolute top-2 left-2 text-xs font-bold px-2.5 py-1 rounded-full border backdrop-blur ${catClass}`}>
                    {catLabel}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-display font-bold text-[#3F322F] leading-snug line-clamp-2">{pkg.name}</h3>
                  <p className="text-lg font-display font-black text-[#E06E43]">{formatIDR(pkg.price)}</p>
                  <p className="text-sm text-[#5C453C] leading-relaxed line-clamp-2">{pkg.description}</p>
                </div>
                <ul className="space-y-1.5 text-sm text-[#5C453C]">
                  {pkg.features.slice(0, 2).map((feat, idx) => (
                    <li key={idx} className="flex gap-2 items-start">
                      <CheckCircle className="w-4 h-4 text-[#7BA86F] shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{feat}</span>
                    </li>
                  ))}
                  {pkg.features.length > 2 && (
                    <li className="text-sm text-[#937F73] italic pl-6">+{pkg.features.length - 2} manfaat lainnya</li>
                  )}
                </ul>
              </div>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => navigate(`/layanan/${pkg.id}`)}
                  className="w-full min-h-[44px] py-3 bg-[#3F322F] hover:bg-[#F2A07C] text-white rounded-full text-sm font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Lihat Detail</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
