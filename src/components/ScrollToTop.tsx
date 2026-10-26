"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const top = () => {
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

export default function ScrollToTop() {
  const pathname = usePathname();

  // iOS Safari ignores scrollTo while the body is scroll-locked (mobile menu) and
  // restores its own position after navigation, so reset again on the next frames.
  useEffect(() => {
    top();
    const raf = requestAnimationFrame(top);
    const t1 = window.setTimeout(top, 60);
    const t2 = window.setTimeout(top, 250);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [pathname]);

  return null;
}
