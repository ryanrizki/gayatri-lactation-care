"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { FileText, Video, ExternalLink, Download, BookOpen, X } from "lucide-react";

// react-pdf touches window → client-only, load on demand.
const PdfReader = dynamic(() => import("./PdfReader"), { ssr: false });

type Material = {
  id: string;
  title: string;
  type: "PDF" | "VIDEO" | "LINK";
  filePath: string | null;
};

const TYPE_BADGE: Record<Material["type"], { label: string; Icon: typeof FileText }> = {
  PDF: { label: "PDF", Icon: FileText },
  VIDEO: { label: "Video", Icon: Video },
  LINK: { label: "Tautan", Icon: ExternalLink },
};

export default function ModuleMaterials({ materials }: { materials: Material[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <ul className="space-y-2.5">
      {materials.map((mat) => {
        const badge = TYPE_BADGE[mat.type] ?? TYPE_BADGE.LINK;
        const isPdf = mat.type === "PDF";
        const isLink = mat.type === "LINK";
        const href = isLink ? (mat.filePath ?? "#") : `/api/material/${mat.id}`;
        const isOpen = openId === mat.id;

        return (
          <li key={mat.id}>
            <div className="flex items-center gap-3 min-h-[56px] px-4 py-3 rounded-2xl bg-[#FFF6FA] border border-[#F3D6E2]">
              <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-[#F3D6E2] text-[#D85C99]">
                <badge.Icon className="w-4 h-4" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-bold text-[#3E2A38] leading-snug truncate">
                  {mat.title}
                </span>
                <span className="text-xs font-semibold text-[#9C8593]">{badge.label}</span>
              </span>

              {isPdf ? (
                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : mat.id)}
                    aria-expanded={isOpen}
                    className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-full text-xs font-bold text-white bg-[#3E2A38] hover:bg-[#E97FB1] transition"
                  >
                    {isOpen ? <X className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                    <span className="hidden sm:inline">{isOpen ? "Tutup" : "Baca"}</span>
                  </button>
                  <a
                    href={href}
                    download
                    className="inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-full text-xs font-bold text-[#B85C8A] hover:text-[#D85C99] transition"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Unduh</span>
                  </a>
                </div>
              ) : (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1.5 min-h-[44px] px-3 text-xs font-bold text-[#B85C8A] hover:text-[#D85C99] transition"
                >
                  {isLink ? <ExternalLink className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                  <span className="hidden sm:inline">Buka</span>
                </a>
              )}
            </div>

            {isPdf && isOpen && <PdfReader url={href} title={mat.title} />}
          </li>
        );
      })}
    </ul>
  );
}
