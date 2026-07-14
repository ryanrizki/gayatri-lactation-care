import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto text-center space-y-5 py-16">
      <div className="w-16 h-16 bg-[#FCE9F1] border border-[#F3D6E2] rounded-full flex items-center justify-center mx-auto text-2xl">
        🌸
      </div>
      <h1 className="text-2xl font-display font-black text-[#3E2A38]">
        Halaman tidak ditemukan
      </h1>
      <p className="text-[#5E4455] text-base leading-relaxed">
        Maaf ya Ma, halaman yang Mama cari tidak ada. Yuk kembali ke beranda.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center min-h-[48px] px-6 bg-[#3E2A38] hover:bg-[#E97FB1] text-white font-bold text-sm rounded-full transition-colors"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
