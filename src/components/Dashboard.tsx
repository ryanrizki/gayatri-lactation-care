"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CHALLENGES_DATA, SERVICE_PACKAGES } from "../data/challengesData";
import { BreastfeedingChallenge } from "../types";
import { 
  Heart, 
  Baby, 
  ShieldAlert, 
  Activity, 
  Sparkles,
  ChevronRight, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  X,
  MessageSquare,
  ArrowRight
} from "lucide-react";
import { formatIDR } from "@/lib/format";

// Auto-rotating product banner carousel (no buttons — whole slide is clickable)
function PromoCarousel() {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % SERVICE_PACKAGES.length), 5000);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section
      className="relative h-56 sm:h-64 md:h-72 rounded-3xl overflow-hidden border border-[#F3D6E2] shadow-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {SERVICE_PACKAGES.map((p, i) => (
        <button
          key={p.id}
          type="button"
          onClick={() => router.push(`/layanan/${p.id}`)}
          aria-hidden={i !== idx}
          className={`absolute inset-0 w-full text-left transition-opacity duration-700 ease-out cursor-pointer ${i === idx ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <img src={p.image} alt={p.name} loading={i === 0 ? "eager" : "lazy"} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2A1C26]/80 via-[#2A1C26]/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center gap-2 p-6 sm:p-8 md:p-10 max-w-lg">
            <span className="self-start text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full bg-white/90 text-[#D85C99]">
              {p.category === "consultation" ? "Konsultasi" : "Kelas Digital"}
            </span>
            <h3 className="font-display font-black text-white text-xl sm:text-2xl md:text-3xl leading-tight drop-shadow">{p.name}</h3>
            <p className="font-display font-black text-white text-lg sm:text-xl drop-shadow">{formatIDR(p.price)}</p>
          </div>
        </button>
      ))}

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {SERVICE_PACKAGES.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setIdx(i)}
            aria-label={`Produk ${i + 1}`}
            className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${i === idx ? "w-7 bg-white" : "w-2.5 bg-white/55 hover:bg-white/80"}`}
          />
        ))}
      </div>
    </section>
  );
}

export default function Dashboard() {
  // Selected challenge for interactive diagnostic modal/accordion
  // Selected challenge for interactive diagnostic modal/accordion
  const LAKTASI_PROGRAMS = [
    {
      id: "induksi",
      title: "Induksi Laktasi",
      icon: Sparkles,
      description: "Panduan teknis dan dukungan emosional bagi ibu yang ingin merangsang produksi ASI tanpa proses kehamilan.",
      highlights: ["Konseling hormonal personal", "Jadwal pumping elektrik teratur", "Evaluasi produksi ASI rutin"],
      details: "Meliputi konseling hormonal, penggunaan pump elektrik secara teratur, serta evaluasi rutin untuk memastikan target produksi ASI tercapai secara aman."
    },
    {
      id: "persiapan",
      title: "Persiapan Menyusui Ibu Hamil",
      icon: Baby,
      description: "Edukasi fundamental untuk Mama di trimester akhir agar siap memulai menyusui dengan percaya diri.",
      highlights: ["Teknik perawatan payudara", "Manajemen kolostrum", "Checklist perlengkapan menyusui"],
      details: "Mencakup teknik perawatan payudara, pemahaman anatomi menyusui, manajemen kolostrum, dan pemilihan perlengkapan yang tepat sebelum melahirkan."
    },
    {
      id: "pendampingan2th",
      title: "Pendampingan Menyusui 2th",
      icon: Heart,
      description: "Dukungan berkelanjutan untuk Mama yang berkomitmen memberikan ASI eksklusif hingga 2 tahun.",
      highlights: ["Atasi teething & distraksi", "Panduan MPASI seimbang", "Penyapihan lembut (gentle weaning)"],
      details: "Solusi untuk tantangan masa balita seperti teething, distraksi saat menyusui, manajemen MPASI, hingga proses penyapihan lembut (gentle weaning)."
    },
    {
      id: "kembaliberkerja",
      title: "Pendampingan Ibu Kembali Bekerja",
      icon: Activity,
      description: "Strategi praktis untuk Mama yang akan kembali ke kantor tanpa harus berhenti menyusui.",
      highlights: ["Manajemen stok ASIP", "Jadwal pumping di kantor", "Tips jaga suplai ASI"],
      details: "Meliputi manajemen ASIP (penyimpanan & distribusi), pemilihan perangkat pompa yang efisien, jadwal pumping saat bekerja, dan tips menjaga suplai ASI."
    }
  ];

  const router = useRouter();

  const [activeProgram, setActiveProgram] = useState<string | null>(null);
  
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  
  // Quiz/Diagnostic progress state
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, { score: number; advice: string; critical?: boolean }>>({});
  const [diagnosticFinished, setDiagnosticFinished] = useState<boolean>(false);

  // Active challenge details
  const activeChallenge = CHALLENGES_DATA.find(c => c.id === activeChallengeId);

  // Restart symptoms diagnostic check
  const startDiagnostic = (challengeId: string) => {
    setActiveChallengeId(challengeId);
    setCurrentStepIdx(0);
    setAnswers({});
    setDiagnosticFinished(false);
    setTimeout(() => {
        document.getElementById("diagnostic-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Log diagnostic option selection and advance
  const handleDiagnosticAnswer = (questionId: string, answer: { score: number; advice: string; critical?: boolean }) => {
    const updatedAnswers = { ...answers, [questionId]: answer };
    setAnswers(updatedAnswers);

    if (activeChallenge && currentStepIdx < activeChallenge.interactiveDiagnostic.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    } else {
      setDiagnosticFinished(true);
    }
  };

  // Compile final warning guidelines based on diagnostic results
  const computeDiagnosticReport = () => {
    if (!activeChallenge) return { score: 0, critical: false, adviceList: [] };

    let totalScore = 0;
    let hasCritical = false;
    const adviceList: string[] = [];

    activeChallenge.interactiveDiagnostic.forEach((q) => {
      const selected = answers[q.id];
      if (selected) {
        totalScore += selected.score;
        if (selected.critical) {
          hasCritical = true;
        }
        adviceList.push(selected.advice);
      }
    });

    return {
      score: totalScore,
      critical: hasCritical,
      adviceList
    };
  };

  const report = computeDiagnosticReport();

  // Testimonials matching Gayatri real testimonies
  const TESTIMONIALS = [
    {
      name: "Mama Nadya & Baby Arka",
      city: "Jakarta Selatan",
      text: "Terima kasih banyak tim Gayatri! Bidan datang malam-malam saat payudaraku bengkak keras sampai demam 39°C. Lewat pijat drainase limfatik lembut dan dibetulkan posisinya, ASI langsung mancur dan bengkak hilang dalam semalam! Keramahan bidannya luar biasa.",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      pill: "Konsultasi Homecare"
    },
    {
      name: "Mama Claudia & Baby Kezia",
      city: "Surabaya",
      text: "Kelas Privat Persiapan Bekerja sangat menolong! Dulu mengira pumping itu menyakitkan, ternyata karena corongnya tidak pas. Sekarang tabungan ASIP beku lancar terisi di kulkas, stok aman untuk Kezia saat ditinggal kembali mengantor bulan depan. Alat hitung planner-nya sangat akurat!",
      image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80",
      pill: "Kelas Pompa Laktasi"
    },
    {
      name: "Mama Rian & Baby Sean",
      city: "Yogyakarta",
      text: "Panduan edukasi gejala mandiri Gayatri membantu sekali menenangkan kepanikan pertamaku di minggu awal melahirkan. Teknik pelekatan asimetris dijelaskan dengan petunjuk yang sangat jelas dan sabar. Sangat bersyukur ada program seefektif ini yang mendampingi Mama setiap saat.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      pill: "Edukasi Gejala Mandiri"
    }
  ];

  // Map icon strings to Lucide elements with warm soft aesthetic
  const renderChallengeIcon = (iconName: string) => {
    switch (iconName) {
      case "MilkyWay": return <Heart className="w-5 h-5 text-[#D85C99]" />;
      case "ShieldAlert": return <ShieldAlert className="w-5 h-5 text-[#D85C99]" />;
      case "Baby": return <Baby className="w-5 h-5 text-[#D85C99]" />;
      case "Activity": return <Activity className="w-5 h-5 text-[#D85C99]" />;
      default: return <Heart className="w-5 h-5 text-[#D85C99]" />;
    }
  };

  return (
    <div className="space-y-12 md:space-y-16">
      {/* 1. Hero — warm arch-framed introduction */}
      <section className="relative overflow-hidden animate-fadeIn">
        {/* Soft ambient glow */}
        <div aria-hidden className="pointer-events-none absolute -top-24 -left-20 w-72 h-72 bg-[#F8B6D2]/30 rounded-full blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-28 right-0 w-80 h-80 bg-[#E97FB1]/15 rounded-full blur-3xl" />

        <div className="relative max-w-2xl mx-auto text-center space-y-6">
          <span className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-[#F3D6E2] text-[#836E7A] text-[10px] font-bold uppercase tracking-[0.18em] px-3.5 py-1.5 rounded-full shadow-sm">
            Didampingi Konsultan Laktasi Tersertifikasi
          </span>

          <h1 className="font-display font-black text-[#3E2A38] leading-[1.05] tracking-tight text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem]">
            Perjalanan menyusui Mama,
            <span className="block">
              tak pernah <span className="italic text-[#E97FB1] relative whitespace-nowrap">
                sendiri
                <svg aria-hidden viewBox="0 0 200 12" className="absolute left-0 -bottom-1.5 w-full h-2.5 text-[#F8B6D2]" preserveAspectRatio="none">
                  <path d="M2 8 Q 50 2 100 7 T 198 5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>.
            </span>
          </h1>

          <p className="text-[#836E7A] text-sm md:text-base leading-relaxed max-w-md mx-auto">
            Edu Hub mandiri, konsultan laktasi tersertifikasi, dan layanan Homecare profesional — semua dalam satu pendamping hangat untuk setiap tetes ASI Mama.
          </p>

          {/* Trust row */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 justify-center pt-1">
            {["Konsultan tersertifikasi", "Standard IDAI & WHO", "Pendampingan 24/7"].map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#6E5563]">
                <CheckCircle className="w-3.5 h-3.5 text-[#7BA86F] shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 1b. Auto-rotating promo banner — hidden for now */}
      {/* <PromoCarousel /> */}

      {/* 2. Interactive Programs Directory */}
      <section id="program-laktasi" className="space-y-7 md:space-y-9">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#9C8593]">
            🌸 Program Laktasi Gayatri
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-[#3E2A38]">
            Layanan Spesialis Kami
          </h2>
          <p className="text-[#5E4455] text-base leading-relaxed">
            Pilih program yang paling sesuai dengan kebutuhan perjalanan laktasi Mama.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {LAKTASI_PROGRAMS.map((program) => {
            const open = activeProgram === program.id;
            const ProgramIcon = program.icon;
            return (
              <div
                key={program.id}
                className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all duration-300 cursor-pointer hover:-translate-y-0.5 ${
                  open
                    ? "border-[#E97FB1] shadow-md ring-2 ring-[#E97FB1]/20"
                    : "border-[#F3D6E2] hover:border-[#F8B6D2] hover:shadow-md"
                }`}
                onClick={() => setActiveProgram(open ? null : program.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Eye-catching gradient icon badge */}
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-[#F8B6D2] to-[#E97FB1] flex items-center justify-center shadow-sm">
                    <ProgramIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-lg text-[#3E2A38] tracking-tight leading-snug">{program.title}</h3>
                    <p className="text-[#5E4455] text-base font-sans leading-relaxed mt-1.5">{program.description}</p>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 text-[#E97FB1] shrink-0 mt-1 transition-transform duration-300 ${open ? "rotate-90" : ""}`}
                  />
                </div>

                {/* Always-visible highlight points */}
                <ul className="mt-4 grid gap-2.5">
                  {program.highlights.map((point) => (
                    <li key={point} className="flex items-center gap-2.5 text-sm font-semibold text-[#5E4455]">
                      <span className="w-5 h-5 shrink-0 rounded-full bg-[#7BA86F]/15 flex items-center justify-center">
                        <CheckCircle className="w-3.5 h-3.5 text-[#7BA86F]" />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>

                {open && (
                  <div className="pt-4 mt-4 border-t border-[#FCE9F1] animate-fadeIn space-y-4">
                    <p className="text-[#5E4455] text-base font-sans leading-relaxed">
                      {program.details}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push("/layanan");
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 min-h-[48px] py-3 bg-[#3E2A38] hover:bg-[#E97FB1] text-white font-bold rounded-full text-sm transition-colors cursor-pointer"
                    >
                      Daftar Program Sekarang
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
      
      {/* ... [Diagnostic and other sections remain] ... */}

      {/* 3. Diagnostic steps modal if active */}
      {activeChallenge && (
        <section id="diagnostic-section" className="bg-white border text-[#3E2A38] border-[#F3D6E2] rounded-3xl p-4 sm:p-6 md:p-8 space-y-6 animate-fadeIn shadow-md">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <span className="text-[9px] font-semibold text-white bg-[#3E2A38] px-3.5 py-0.5 uppercase tracking-widest rounded-full inline-block">Protokol Pemeriksaan Digital</span>
              <h3 className="text-lg md:text-2xl font-display font-bold text-[#3E2A38] uppercase tracking-tight mt-1">{activeChallenge.title}</h3>
            </div>
            
            <button 
              onClick={() => setActiveChallengeId(null)}
              className="px-2.5 py-1 border border-[#F3D6E2]/80 bg-white hover:bg-[#FFF6FA] text-[#7C6573] font-semibold text-[10px] rounded-full transition cursor-pointer shrink-0"
              title="Tutup Panduan"
            >
              tutup ×
            </button>
          </div>

          <hr className="border-[#F3D6E2]/55" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
            {/* Step form or results - Left */}
            <div className="lg:col-span-7 bg-white p-4 sm:p-6 rounded-2xl border border-[#F3D6E2]/50 space-y-6">
              {!diagnosticFinished ? (
                /* Diagnostic Step */
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-semibold text-[#9C8593] uppercase tracking-wider">
                    <span>Pertanyaan Gejala {currentStepIdx + 1} DARI {activeChallenge.interactiveDiagnostic.length}</span>
                    <span>Progres Pengisian</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-[#FCE9F1] rounded-full overflow-hidden">
                    <div 
                      className="bg-[#E97FB1] h-full rounded-full transition-all duration-300"
                      style={{ width: `${((currentStepIdx + 1) / activeChallenge.interactiveDiagnostic.length) * 100}%` }}
                    />
                  </div>

                  <h4 className="text-sm font-bold text-[#3E2A38] w-full pt-1">
                    {activeChallenge.interactiveDiagnostic[currentStepIdx].question}
                  </h4>

                  <div className="space-y-2">
                    {activeChallenge.interactiveDiagnostic[currentStepIdx].options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleDiagnosticAnswer(
                          activeChallenge.interactiveDiagnostic[currentStepIdx].id, 
                          opt
                        )}
                        className="w-full text-left p-3.5 border border-[#F3D6E2]/65 hover:border-[#F8B6D2] hover:bg-[#FFFCFD] text-xs font-semibold text-[#806471] hover:text-[#3E2A38] rounded-2xl transition-all flex justify-between items-center cursor-pointer bg-white"
                      >
                        <span>{opt.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#D85C99]/40 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Diagnostic Completed results report */
                <div className="space-y-5">
                  <div className="flex items-center gap-2 text-[#3E2A38] uppercase font-bold text-xs pl-1.5 border-l-2 border-[#E97FB1]">
                    <CheckCircle className="w-4 h-4 text-[#E97FB1] shrink-0" />
                    <span>Laporan Analisis Mandiri Selesai!</span>
                  </div>

                  {report.critical ? (
                    <div className="bg-[#FFFBFA] border border-[#FFD9D4] p-4 rounded-2xl flex items-start gap-4 animate-fadeIn">
                      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-bold text-red-800 text-[10px] tracking-wider uppercase block">Tanda Keluhan Butuh Tindakan Medis</span>
                        <p className="text-[11px] text-red-700 leading-relaxed font-sans">
                          Mama melaporkan satu atau lebih fungsional indikator sensitif. Pijat biasa atau mempompa saja tidak meredakan keluhan dan butuh bimbingan laktasi klinis. Kami menyarankan berbicara dengan Bidan/Dokter Konsultan Gayatri.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#F6F8F5] border border-[#D1E1CE] p-4 rounded-2xl flex items-start gap-4 animate-fadeIn">
                      <Info className="w-5 h-5 text-[#4D6B4E] shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-bold text-[#4D6B4E] text-[10px] tracking-wider uppercase block">Kondisi Saat Ini Aman</span>
                        <p className="text-[11px] text-[#556F56] leading-relaxed font-sans">
                          Hasil laktasi secara umum tidak mengindikasikan keluhan berat. Mama dapat meredakan bengkak atau menstimulasi hisapan pompa dengan tips mandiri di panel samping secara teratur.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <span className="text-[9px] font-bold text-[#9C8593] uppercase tracking-widest block">Rekomendasi Penanganan Mandiri:</span>
                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-2">
                       {report.adviceList.map((adv, aIdx) => (
                        <div key={aIdx} className="p-3 bg-[#FEF7FB] border border-[#F3D6E2]/40 rounded-2xl text-xs text-[#836E7A] leading-relaxed flex gap-2">
                          <CheckCircle className="w-4 h-4 text-[#E97FB1] shrink-0 mt-0.5" />
                          <span>{adv}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => router.push("/layanan")}
                      className="w-full text-center py-2.5 sm:py-3 bg-[#3E2A38] hover:bg-[#E97FB1] text-white font-bold rounded-full text-xs transition cursor-pointer"
                    >
                      Hubungi Bidan / Dokter
                    </button>
                    <button
                      type="button"
                      onClick={() => startDiagnostic(activeChallenge.id)}
                      className="w-full text-center py-2.5 sm:py-3 bg-[#FCE9F1] hover:bg-[#F3D6E2]/50 text-[#3E2A38] border border-[#F3D6E2]/80 font-bold rounded-full text-xs transition cursor-pointer"
                    >
                      Ulangi Cek Gejala
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Immediate Steps - Right */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#FDEAF2] border border-[#F8C9DD] p-5 sm:p-6 rounded-2xl space-y-4 shadow-sm">
                <h4 className="text-[10px] font-sans font-bold text-[#D85C99] uppercase tracking-widest border-b border-[#F8B6D2]/30 pb-2">
                  4 Langkah Cepat Gayatri Card
                </h4>
                
                <div className="space-y-3.5">
                  {activeChallenge.immediateSteps.map((step, idx) => (
                    <div key={idx} className="flex gap-2.5 text-xs text-[#5E4455] leading-relaxed">
                      <span className="w-5 h-5 bg-[#FCE9F1] border border-[#F8C9DD] text-[#D85C99] rounded-full font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-[#FFF6FA] rounded-2xl border border-[#F3D6E2]/55 text-[11px] text-[#9C8593] flex gap-2">
                <AlertTriangle className="w-4 h-4 text-[#D85C99] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Sumber medis: Standard WHO dan Protokol Akademi Laktasi Kedokteran Menyusui (ABM).
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Testimonials Section (Cerita Mama bersama Gayatri) */}
      <section id="testimonies" className="space-y-6 md:space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9C8593] block">🌸 GALERI TESTIMONI</span>
          <h2 className="text-xl md:text-3xl font-display font-bold tracking-tight text-[#3E2A38] uppercase">
            Cerita Sukses Bersama Kami
          </h2>
          <p className="text-[#836E7A] text-xs">
            Pendampingan profesional secara berkala menolong ribuan Mama menuntaskan keluhan laktasi dengan tulus gembira.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {TESTIMONIALS.map((test, index) => (
            <div key={index} className="bg-white rounded-3xl p-5 md:p-6 border border-[#F3D6E2]/70 hover:border-[#F8B6D2] hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4">
              <p className="text-[#5E4455] text-xs font-sans leading-relaxed italic">
                "{test.text}"
              </p>

              <div className="flex items-center gap-3 pt-3 border-t border-[#FCE9F1] select-none">
                <img 
                  src={test.image} 
                  alt={test.name}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#F3D6E2]" 
                />
                <div>
                  <h4 className="text-xs font-display font-bold text-[#3E2A38] uppercase tracking-tight">{test.name}</h4>
                  <span className="text-[10px] text-[#9C8593] block font-semibold">{test.city}</span>
                  <span className="inline-block text-[9px] bg-[#FCE9F1] text-[#D85C99] border border-[#F8C9DD] font-semibold px-2 py-0.5 rounded-full mt-1">
                    {test.pill}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Quick Support Contact widget */}
      <section className="bg-gradient-to-br from-[#3E2A38] to-[#4E3A47] text-white rounded-3xl p-5 sm:p-8 md:p-12 text-center space-y-6 relative overflow-hidden shadow-md">
        <div className="absolute top-0 left-0 w-32 h-32 bg-[#E97FB1]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-lg mx-auto space-y-4">
          <h2 className="text-xl md:text-3xl font-display font-black tracking-tight uppercase">Butuh Solusi Lebih Cepat?</h2>
          <p className="text-[#EBC9D5] text-xs leading-relaxed max-w-md mx-auto">
            Tim profesional laktasi kami siap membantu langsung di rumah Mama atau melalui konsultasi klinik intensif.
          </p>
          <div className="flex justify-center pt-1 select-none">
            <button
              onClick={() => router.push("/layanan")}
              className="py-2.5 px-6 bg-[#E97FB1] hover:bg-white text-white hover:text-[#3E2A38] font-bold text-xs rounded-full shadow transition-all cursor-pointer flex items-center gap-1.5"
            >
              Layanan Homecare & Klinik
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
