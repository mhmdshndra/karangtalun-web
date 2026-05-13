"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileArchive, Zap, Clock, Scale, MessageSquareText, Home, ChevronRight } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";

const PPID_SIDEBAR_LINKS = [
  { href: "/ppid", label: "Ikhtisar", icon: Home },
  { href: "/ppid/informasi-berkala", label: "Informasi Berkala", icon: FileArchive },
  { href: "/ppid/informasi-serta-merta", label: "Serta Merta", icon: Zap },
  { href: "/ppid/informasi-setiap-saat", label: "Setiap Saat", icon: Clock },
  { href: "/ppid/dasar-hukum", label: "Dasar Hukum", icon: Scale },
  { href: "/ppid/permohonan", label: "Permohonan", icon: MessageSquareText },
];

interface PpidLayoutProps {
  children?: React.ReactNode;
  title: string;
  subtitle?: string;
  breadcrumbItems: { label: string; href?: string }[];
}

export default function PpidPageLayout({
  children,
  title,
  subtitle,
  breadcrumbItems,
}: PpidLayoutProps) {
  const pathname = usePathname();

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh" }}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Compact header — not a full hero */}
      <div
        style={{
          background: "linear-gradient(135deg, #1a3a6e 0%, #0f2347 100%)",
          padding: "1.75rem 1rem 1.5rem",
          color: "#fff",
        }}
      >
        <div className="max-w-[1100px] mx-auto">
          <p
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#b8860b",
              fontWeight: 600,
              marginBottom: "0.3rem",
            }}
          >
            PPID Desa Karangtalun
          </p>
          <h1
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "clamp(1.1rem, 3vw, 1.5rem)",
              fontWeight: 700,
              marginBottom: subtitle ? "0.3rem" : 0,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p style={{ opacity: 0.7, fontSize: "0.8rem", lineHeight: 1.5, maxWidth: 560 }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Content with sidebar nav */}
      <div className="max-w-[1100px] mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Compact sidebar */}
          <aside className="w-full lg:w-52 shrink-0">
            <nav
              className="rounded-sm overflow-hidden sticky top-24"
              style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
            >
              <div className="flex flex-col">
                {PPID_SIDEBAR_LINKS.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-2 px-3 py-2.5 text-[11px] font-semibold transition-colors"
                      style={{
                        color: isActive ? "var(--primary)" : "var(--foreground)",
                        background: isActive ? "rgba(26,58,110,0.06)" : "transparent",
                        opacity: isActive ? 1 : 0.65,
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <link.icon size={13} />
                      {link.label}
                      {isActive && (
                        <ChevronRight size={10} className="ml-auto opacity-50" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}

export { PPID_SIDEBAR_LINKS };
