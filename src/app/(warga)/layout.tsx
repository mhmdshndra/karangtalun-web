"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, FileText, History, UserCircle, LogOut,
  Menu, X, Bell, ChevronLeft, Moon, Sun, Settings,
  ClipboardList, BookOpen, ChevronDown,
} from "lucide-react";
import { useAuth } from "@/core/context/AuthContext";
import { useServiceData } from "@/core/context/ServiceDataContext";
import FloatingButtons from "@/components/ui/FloatingButtons";
import type { UserRole } from "@/core/types";

const ROLE_LABELS: Record<UserRole, string> = {
  admin_desa: "Admin Desa",
  staf_layanan: "Staf Layanan",
  warga: "Warga",
  public: "Publik",
};

const ROLE_COLORS: Record<UserRole, string> = {
  admin_desa: "#dc2626",
  staf_layanan: "#2563eb",
  warga: "#b8860b",
  public: "#6b7280",
};

const NAV_ITEMS = [
  { label: "Dashboard", href: "/warga/dashboard", icon: LayoutDashboard },
  { label: "E-Surat", href: "/warga/e-surat", icon: FileText },
  { label: "Riwayat", href: "/warga/riwayat", icon: History },
  { label: "Laporan", href: "/warga/layanan/laporan-aduan", icon: ClipboardList },
  { label: "PPID", href: "/warga/layanan/permohonan-informasi", icon: BookOpen },
  { label: "Profil", href: "/warga/profil", icon: UserCircle },
  { label: "Pengaturan", href: "/warga/pengaturan-akun", icon: Settings },
];

export default function WargaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const { getUnreadCountForUser } = useServiceData();
  const unreadCount = getUnreadCountForUser(user?.role || "warga", user?.nik, user?.id);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Apply saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) document.documentElement.setAttribute("data-theme", saved);
  }, []);

  // Redirect if not logged in or wrong role
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    } else if (!isLoading && user) {
      if (user.role === "admin_desa") router.push("/admin/dashboard");
      else if (user.role === "staf_layanan") router.push("/staf/dashboard");
    }
  }, [isLoading, user, router]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const toggleTheme = () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    document.documentElement.setAttribute("data-theme", isDark ? "light" : "dark");
    localStorage.setItem("theme", isDark ? "light" : "dark");
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--background)" }}
      >
        <div className="animate-pulse text-center">
          <div className="w-12 h-12 rounded-full mx-auto mb-3" style={{ background: "var(--primary)" }} />
          <p className="text-xs font-bold" style={{ color: "var(--foreground)" }}>Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "warga") return null;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const activeItem = NAV_ITEMS.find((n) => isActive(n.href));
  const activeTitle = activeItem?.label || "Dashboard";

  return (
    <div className="min-h-screen flex" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      {/* ─── Desktop Sidebar ─── */}
      <aside
        className="hidden lg:flex flex-col w-64 shrink-0 border-r fixed top-0 left-0 h-screen z-30"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b" style={{ borderColor: "var(--border)" }}>
          <Link href="/" className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded flex items-center justify-center font-bold text-sm"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              KT
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: "var(--primary)" }}>DESA KARANGTALUN</p>
              <p className="text-[10px] opacity-50">Portal Warga</p>
            </div>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-5 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              {user.foto ? (
                <img src={user.foto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                user.nama_lengkap.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user.nama_lengkap}</p>
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 inline-block"
                style={{ background: ROLE_COLORS[user.role], color: "#fff" }}
              >
                {ROLE_LABELS[user.role]}
              </span>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all"
              style={{
                color: isActive(item.href) ? "var(--primary)" : "var(--foreground)",
                background: isActive(item.href) ? "var(--accent-light)" : "transparent",
                borderLeft: isActive(item.href) ? "3px solid var(--primary)" : "3px solid transparent",
              }}
            >
              <item.icon size={18} />
              {item.label}
              {item.href === "/warga/dashboard" && unreadCount > 0 && (
                <span
                  className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: "#dc2626", color: "#fff" }}
                >
                  {unreadCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t space-y-1" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors hover:bg-surface-hover"
            style={{ color: "var(--foreground)" }}
          >
            <Moon size={18} />
            Ganti Tema
          </button>
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors hover:bg-surface-hover"
            style={{ color: "var(--foreground)" }}
          >
            <ChevronLeft size={18} />
            Ke Beranda
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors hover:bg-surface-hover"
            style={{ color: "#dc2626" }}
          >
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>

      {/* ─── Mobile Top Bar ─── */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 flex items-center justify-between px-4 border-b"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <button onClick={() => setSidebarOpen(true)} className="p-1.5" style={{ color: "var(--foreground)" }}>
          <Menu size={20} />
        </button>
        <p className="text-sm font-bold" style={{ color: "var(--primary)" }}>{activeTitle}</p>
        <Link href="/warga/dashboard" className="relative p-1.5" style={{ color: "var(--foreground)" }}>
          <Bell size={18} />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
              style={{ background: "#dc2626", color: "#fff" }}
            >
              {unreadCount}
            </span>
          )}
        </Link>
      </div>

      {/* ─── Mobile Sidebar Overlay ─── */}
      {sidebarOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={() => setSidebarOpen(false)}
          />
          <div
            className="lg:hidden fixed top-0 left-0 h-full w-72 z-50 flex flex-col border-r"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden"
                  style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                >
                  {user.foto ? (
                    <img src={user.foto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    user.nama_lengkap.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold">{user.nama_lengkap.split(" ")[0]}</p>
                  <span
                    className="text-[9px] font-bold px-1 py-0.5 rounded"
                    style={{ background: ROLE_COLORS[user.role], color: "#fff" }}
                  >
                    {ROLE_LABELS[user.role]}
                  </span>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} style={{ color: "var(--foreground)" }}>
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-3 rounded text-sm font-medium transition-all"
                  style={{
                    color: isActive(item.href) ? "var(--primary)" : "var(--foreground)",
                    background: isActive(item.href) ? "var(--accent-light)" : "transparent",
                  }}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="p-3 border-t space-y-1" style={{ borderColor: "var(--border)" }}>
              <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded text-sm" style={{ color: "var(--foreground)" }}>
                <ChevronLeft size={18} /> Ke Beranda
              </Link>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm" style={{ color: "#dc2626" }}>
                <LogOut size={18} /> Keluar
              </button>
            </div>
          </div>
        </>
      )}

      {/* ─── Main Content ─── */}
      <main className="flex-1 lg:ml-64 min-h-screen pt-14 lg:pt-0 pb-20 lg:pb-0">
        {children}
      </main>

      {/* ─── Mobile Bottom Nav ─── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t flex items-stretch"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors"
            style={{
              color: isActive(item.href) ? "var(--primary)" : "var(--foreground)",
              opacity: isActive(item.href) ? 1 : 0.5,
            }}
          >
            <item.icon size={18} />
            <span className="text-[10px] font-bold">{item.label}</span>
          </Link>
        ))}
      </nav>

      <FloatingButtons />
    </div>
  );
}
