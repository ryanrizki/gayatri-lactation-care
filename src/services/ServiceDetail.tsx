import { useParams, useNavigate, Navigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ClipboardCheck, Sparkles, MapPin, CheckCircle, ShieldCheck, CalendarClock } from "lucide-react";
import { findPackage, getKind, KIND_META, WEBINAR_EVENT } from "./serviceConfig";
import { useEstimate } from "./useEstimate";
import { useServices } from "./ServicesLayout";

const formatIDR = (num: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pkg = findPackage(id);
  const { setIsHomecare, distanceKm, setDistanceKm, classMode, setClassMode } = useServices();

  if (!pkg) return <Navigate to="/layanan" replace />;

  const kind = getKind(pkg);
  const meta = KIND_META[kind];
  // Homecare flag only meaningful for homecare kind; force true so estimate includes transport.
  const homecareForEstimate = kind === "homecare";
  const { estimate } = useEstimate(pkg.id, homecareForEstimate, distanceKm);

  return (
    <div className="space-y-6 animate-fadeIn">
      <button
        onClick={() => navigate("/layanan")}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A6A65] hover:text-[#3F322F] transition cursor-pointer select-none"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Layanan
      </button>

      <div className="bg-white rounded-[28px] border border-[#EADCC9] overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-sm">
        {/* Left: package info */}
        <div className="lg:col-span-7 p-5 sm:p-6 md:p-8 space-y-6 border-b lg:border-b-0 lg:border-r border-[#EADCC9]/50">
          <img src={pkg.image} alt={pkg.name} className="w-full h-56 sm:h-64 object-cover rounded-2xl" />
          <div className="space-y-2">
            <span className="inline-block text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full border bg-[#FFF2EB] text-[#E06E43] border-[#FFD3BE]">
              {meta.methodLabel}
            </span>
            <h2 className="text-xl md:text-2xl font-display font-black text-[#3F322F]">{pkg.name}</h2>
            <p className="text-base text-[#5C453C] leading-relaxed">{pkg.description}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-[#3F322F]">
              Fasilitas &amp; Keuntungan Untuk Mama
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pkg.features.map((feat, idx) => (
                <div key={idx} className="p-3.5 bg-[#FAF8F5] border border-[#EADCC9]/50 rounded-2xl flex items-start gap-2.5">
                  <CheckCircle className="w-5 h-5 text-[#7BA86F] shrink-0 mt-0.5" />
                  <span className="text-sm text-[#3F322F] leading-snug">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex gap-3 text-emerald-800">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-sm block">Jaminan Standardisasi Gayatri</span>
              <p className="text-sm leading-relaxed text-emerald-700">
                Bidan dan Dokter Konselor laktasi kami bersertifikat resmi, ramah bayi, dan mengedepankan pendekatan medis yang minim trauma bagi Mama dan buah hati.
              </p>
            </div>
          </div>
        </div>

        {/* Right: category-tailored config */}
        <div className="lg:col-span-5 p-5 sm:p-6 md:p-8 space-y-6 bg-[#FAF8F5]/50 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#3F322F] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#E06E43]" /> Konfigurasi Layanan
              </h3>
              <p className="text-sm text-[#5C453C] leading-relaxed">
                Sesuaikan pelaksanaan layanan yang paling pas untuk Mama.
              </p>
            </div>

            <div className="p-5 bg-white border border-[#EADCC9] rounded-2xl space-y-4 shadow-sm">
              {/* HOMECARE: distance slider */}
              {kind === "homecare" && (
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#3F322F]">
                    <MapPin className="w-4 h-4 text-[#E06E43]" /> Estimasi Jarak ke Rumah Mama
                  </div>
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-[#5C453C]">Jarak</span>
                    <span className="text-[#E06E43] font-bold bg-[#FFF2EB] px-2.5 py-0.5 rounded-full border border-[#FFD3BE]">{distanceKm} KM</span>
                  </div>
                  <input
                    type="range" min={1} max={35} step={1} value={distanceKm}
                    onChange={(e) => setDistanceKm(parseInt(e.target.value))}
                    className="w-full h-2 bg-[#FAF1E6] accent-[#F2A07C] rounded-full appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-[#937F73]">
                    <span>&lt;5 km (bebas akomodasi)</span>
                    <span>35 km (tarif tambahan)</span>
                  </div>
                </div>
              )}

              {/* KLINIK: fixed location info */}
              {kind === "klinik" && (
                <div className="flex items-start gap-2.5 text-sm text-[#3F322F]">
                  <MapPin className="w-5 h-5 text-[#E06E43] shrink-0 mt-0.5" />
                  <span>Sesi berlangsung tatap muka di Klinik Gayatri, Jakarta Selatan. Tidak ada biaya transport tambahan.</span>
                </div>
              )}

              {/* CLASS: online/offline toggle */}
              {kind === "class" && (
                <div className="space-y-2">
                  <span className="text-sm font-bold text-[#5C453C] block">Metode Kelas</span>
                  <div className="flex bg-[#FAF1E6] p-1.5 rounded-full border border-[#EADCC9]/40">
                    {(["online", "offline"] as const).map((m) => (
                      <button
                        key={m} type="button" onClick={() => setClassMode(m)}
                        className={`flex-1 text-center min-h-[44px] py-2 text-sm font-bold rounded-full transition cursor-pointer select-none ${
                          classMode === m ? "bg-[#3F322F] text-white shadow-sm" : "text-[#7A6A65] hover:text-[#3F322F]"
                        }`}
                      >
                        {m === "online" ? "Online (Zoom)" : "Offline (Tatap Muka)"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* WEBINAR: fixed event date */}
              {kind === "webinar" && (
                <div className="flex items-start gap-2.5 text-sm text-[#3F322F]">
                  <CalendarClock className="w-5 h-5 text-[#E06E43] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Jadwal Webinar</span>
                    <span>{WEBINAR_EVENT.dateLabel} · {WEBINAR_EVENT.timeLabel}. Tautan Zoom dikirim ke email &amp; WhatsApp Mama setelah daftar.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Fee breakdown */}
            <div className="bg-[#FFF2EB] border border-[#FFD3BE] p-5 rounded-2xl space-y-3.5 shadow-sm">
              <span className="text-sm font-semibold uppercase tracking-wide text-[#E06E43] block border-b border-[#FBC2A2]/40 pb-1">
                Kalkulator Tarif Transparan
              </span>
              <div className="space-y-2 text-sm text-[#3F322F]">
                <div className="flex justify-between">
                  <span className="text-[#5C453C]">Tarif dasar layanan</span>
                  <span className="font-bold">{formatIDR(estimate?.basePrice ?? pkg.price)}</span>
                </div>
                {kind === "homecare" && (
                  <div className="flex justify-between">
                    <span className="text-[#5C453C]">Transport &amp; akomodasi</span>
                    <span className="font-bold">{formatIDR(estimate?.transportFee ?? 0)}</span>
                  </div>
                )}
                <hr className="border-[#FBC2A2]/40 border-dashed" />
                <div className="flex justify-between text-base font-black pt-1">
                  <span>Total rencana bayar</span>
                  <span className="text-[#E06E43]">{formatIDR(estimate?.total ?? pkg.price)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 space-y-3">
            <button
              type="button"
              onClick={() => { setIsHomecare(kind === "homecare"); navigate(`/layanan/${pkg.id}/booking`); }}
              className="w-full bg-[#3F322F] hover:bg-[#F2A07C] text-white min-h-[48px] py-3.5 rounded-full font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <ClipboardCheck className="w-5 h-5" />
              {kind === "webinar" ? "Daftar Webinar Sekarang" : "Lanjut ke Reservasi"}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/layanan")}
              className="w-full text-center min-h-[44px] py-2 text-sm text-[#937F73] hover:text-[#3F322F] transition font-bold"
            >
              Lihat Layanan Lain
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
