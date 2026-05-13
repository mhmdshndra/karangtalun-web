"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import AppHeader from "@/components/layouts/AppHeader";
import AppFooter from "@/components/layouts/AppFooter";
import FloatingButtons from "@/components/ui/FloatingButtons";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Intersection Observer for .reveal elements
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("active");
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  // Apply saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) document.documentElement.setAttribute("data-theme", saved);
  }, []);

  return (
    <div
      className="relative min-h-screen flex flex-col"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <AppHeader />
      {/* 
        NO pt-16 here. Each page's hero/breadcrumb handles its own top spacing.
        The homepage hero is full-viewport, other pages have breadcrumb-bar that
        starts behind the transparent navbar and visually fills the gap.
      */}
      <main className="flex-grow w-full">
        {children}
      </main>
      <AppFooter />
      <FloatingButtons />
    </div>
  );
}
