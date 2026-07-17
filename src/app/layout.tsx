import type { Metadata } from "next";
import Providers from "@/components/Providers";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gayatri Lactation Care - Pendamping Menyusui & Klinik Laktasi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <Providers>
          <div className="min-h-screen bg-[#FFF6FA] text-[#3E2A38] flex flex-col justify-between selection:bg-[#F8B6D2] selection:text-[#2A1C26] p-2 md:p-4">
            <SiteHeader />
            <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 md:py-8 flex-1 w-full">
              {children}
            </main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
