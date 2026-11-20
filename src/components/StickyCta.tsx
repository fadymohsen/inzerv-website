"use client";

import { useEffect, useState } from "react";
import { ArrowIcon } from "./Icons";

export function StickyCta({ href, label, heroSelector }: { href: string; label: string; heroSelector?: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = heroSelector ? document.querySelector(heroSelector) : null;

    if (hero) {
      const observer = new IntersectionObserver(
        ([entry]) => setVisible(!entry.isIntersecting),
        { threshold: 0 },
      );
      observer.observe(hero);
      return () => observer.disconnect();
    }

    const onScroll = () => setVisible(window.scrollY > 320);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [heroSelector]);

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 top-16 z-40 transition-transform duration-300 ease-in-out lg:hidden ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <a
        href={href}
        tabIndex={visible ? 0 : -1}
        className="flex items-center justify-center gap-3 bg-turquoise px-6 py-3 text-base font-semibold text-navy shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
      >
        {label}
        <ArrowIcon size={20} />
      </a>
    </div>
  );
}
