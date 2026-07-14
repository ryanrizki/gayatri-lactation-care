"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Scroll ke atas setiap kali route berubah. */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
}
