"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu, X, LogIn, ChevronDown, User, LogOut, Moon, Sun,
  Bell, LayoutDashboard, FileText, History, UserCircle, Shield, Headphones,
  ClipboardList, BookOpen, Settings, Users as UsersIcon,
} from "lucide-react";
import { useAuth } from "@/core/context/AuthContext";
import { useServiceData } from "@/core/context/ServiceDataContext";
import { useCms } from "@/core/cms/useCmsStore";
import DesaLogo from "@/components/ui/DesaLogo";
import type { UserRole } from "@/core/types";

const ROLE_LABELS: Record<UserRole, string> = {
  admin_desa: "Admin Desa", staf_layanan: "Staf Layanan", warga: "Warga", public: "Publik",
};
const ROLE_COLORS: Record<UserRole, { bg: string; fg: string }> = {
  admin_desa: { bg: "#dc2626", fg: "#fff" }, staf_layanan: { bg: "#2563eb", fg: "#fff" },
  warga: { bg: "#b8860b", fg: "#fff" }, public: { bg: "#6b7280", fg: "#fff" },
};

const STATIC_NAV_LINKS = [
  { name: "Beranda", path: "/" },
  { name: "Profil Desa", path: "/profil" },
  { name: "Infografis", path: "/infografis" },
  { name: "Peta Desa", path: "/peta" },
  { name: "IDM", path: "/idm" },
  { name: "Berita", path: "/berita" },
  { name: "UMKM", path: "/umkm" },
  { name: "Layanan", path: "/layanan" },
  { name: "PPID", path: "/ppid" },
];

function getDashboardPath(role?: UserRole): string {
  if (role === "admin_desa") return "/admin/dashboard";
  if (role === "staf_layanan") return "/staf/dashboard";
  return "/warga/dashboard";
}

function getUserMenuItems(role?: UserRole) {
  if (role === "admin_desa") return [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Pengajuan Surat", href: "/admin/pengajuan-surat", icon: FileText },
    { label: "Laporan / Aduan", href: "/admin/laporan-aduan", icon: ClipboardList },
    { label: "Permohonan PPID", href: "/admin/permohonan-ppid", icon: BookOpen },
    { label: "Kelola Pengguna", href: "/admin/pengguna", icon: UsersIcon },
  ];
  if (role === "staf_layanan") return [
    { label: "Dashboard", href: "/staf/dashboard", icon: LayoutDashboard },
    { label: "Pengajuan Surat", href: "/staf/pengajuan-surat", icon: FileText },
    { label: "Laporan / Aduan", href: "/staf/laporan-aduan", icon: ClipboardList },
    { label: "Permohonan PPID", href: "/staf/permohonan-ppid", icon: BookOpen },
  ];
  return [
    { label: "Dashboard", href: "/warga/dashboard", icon: LayoutDashboard },
    { label: "E-Surat", href: "/warga/e-surat", icon: FileText },
    { label: "Riwayat Pengajuan", href: "/warga/riwayat", icon: History },
    { label: "Profil & KK", href: "/warga/profil", icon: UserCircle },
  ];
}

function ThemeToggle({ scrolled }: { scrolled: boolean }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") { setDark(true); document.documentElement.setAttribute("data-theme", "dark"); }
  }, []);
  const toggle = () => {
    const next = !dark; setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("theme", next ? "dark" : "light");
  };
  return (
    <button onClick={toggle} aria-label="Toggle tema"
      className="p-2 rounded transition-colors"
      style={{
        color: scrolled ? "var(--foreground)" : "rgba(255,255,255,0.9)",
        background: scrolled ? "var(--surface-hover)" : "rgba(255,255,255,0.1)",
      }}>
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { getNotifikasiForUser, getUnreadCountForUser, markAsRead } = useServiceData();
  const notifikasi = getNotifikasiForUser(user?.role || "warga", user?.nik, user?.id);
  const unreadCount = getUnreadCountForUser(user?.role || "warga", user?.nik, user?.id);
  const { cms } = useCms();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Build nav links from CMS menuNavigasi, fallback to static
  const cmsNavLinks =
    Array.isArray(cms.headerFooter.menuNavigasi) && cms.headerFooter.menuNavigasi.length > 0
      ? cms.headerFooter.menuNavigasi
          .slice()
          .sort((a, b) => a.urutan - b.urutan)
          .map((m) => ({ name: m.label, path: m.href }))
      : STATIC_NAV_LINKS;

  // CMS identity data with fallbacks
  const namaDesa = cms.identitasDesa.namaDesa || "Karangtalun";
  const kecamatan = cms.identitasDesa.kecamatan || "Tanon";
  const kabupaten = cms.identitasDesa.kabupaten || "Sragen";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false); setActiveDropdown(null); setMobileDropdown(null);
    setUserMenuOpen(false); setNotifOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (headerRef.current && !headerRef.current.contains(target)) {
        setActiveDropdown(null); setUserMenuOpen(false); setNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(target)) setUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(target)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path: string) => pathname === path || (path !== "/" && pathname.startsWith(path));
  const handleLogout = () => { logout(); router.push("/"); };

  const dashPath = getDashboardPath(user?.role);
  const menuItems = getUserMenuItems(user?.role);
  const recentNotif = notifikasi.slice(0, 5);

  const forceSolidHeader = pathname !== "/";
  const solidHeader = scrolled || forceSolidHeader;
  const navTextColor = solidHeader ? "var(--foreground)" : "rgba(255,255,255,0.9)";
  const navActiveColor = solidHeader ? "var(--primary)" : "#f5d98a";

  return (
    <header ref={headerRef} className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
      style={{
        background: solidHeader ? "var(--navbar-bg)" : "transparent",
        borderBottom: solidHeader ? "1px solid var(--navbar-border)" : "none",
        boxShadow: solidHeader ? "var(--navbar-shadow)" : "none",
        backdropFilter: solidHeader ? "blur(12px)" : "none",
      }}>
      <div className="max-w-[1440px] mx-auto px-4 lg:px-10 h-16 flex items-center justify-between gap-4">
        {/* Logo + village identity from CMS */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <DesaLogo size={36} variant={solidHeader ? "default" : "white"} />
          <div className="leading-tight">
            <p className="text-[11px] sm:text-xs font-bold leading-none tracking-wide"
              style={{ color: solidHeader ? "var(--primary)" : "white" }}>
              DESA {namaDesa.toUpperCase()}
            </p>
            <p className="text-[9px] sm:text-[10px] leading-none mt-0.5"
              style={{ color: solidHeader ? "var(--text-muted)" : "rgba(255,255,255,0.6)" }}>
              {kecamatan}, {kabupaten}
            </p>
          </div>
        </Link>

        {/* Desktop Nav — from CMS menuNavigasi */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {cmsNavLinks.map((link) => (
            <Link key={link.path} href={link.path}
              className="flex items-center px-3 py-2 text-xs font-semibold rounded transition-colors"
              style={{
                color: isActive(link.path) ? navActiveColor : navTextColor,
                background: isActive(link.path) && solidHeader ? "var(--accent-light)" : "transparent",
              }}>
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle scrolled={solidHeader} />

          {user ? (
            <>
              {/* Notification Bell */}
              <div ref={notifRef} className="relative">
                <button onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); setActiveDropdown(null); }}
                  className="relative p-2 rounded transition-colors"
                  style={{
                    color: navTextColor,
                    background: solidHeader ? "var(--surface-hover)" : "rgba(255,255,255,0.1)",
                  }} aria-label="Notifikasi">
                  <Bell size={16} />
                  {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: "#dc2626", color: "#fff" }}>{unreadCount > 9 ? "9+" : unreadCount}</span>}
                </button>
                {notifOpen && (
                  <div className="absolute top-full right-0 mt-2 w-80 rounded overflow-hidden z-50"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}>
                    <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                      <span className="text-xs font-bold" style={{ color: "var(--foreground)" }}>Notifikasi</span>
                      {unreadCount > 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: "#dc2626", color: "#fff" }}>{unreadCount} baru</span>}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {recentNotif.length === 0 ? (
                        <div className="p-6 text-center text-xs opacity-50">Tidak ada notifikasi</div>
                      ) : recentNotif.map((n) => (
                        <button key={n.id} className="w-full text-left px-4 py-3 border-b transition-colors hover:bg-surface-hover"
                          style={{ borderColor: "var(--border)", background: n.dibaca ? "transparent" : "var(--accent-light)" }}
                          onClick={() => { markAsRead(n.id); if (n.link) router.push(n.link); setNotifOpen(false); }}>
                          <p className="text-xs font-bold mb-0.5" style={{ color: "var(--foreground)" }}>{n.judul}</p>
                          <p className="text-[11px] line-clamp-2" style={{ color: "var(--text-muted)" }}>{n.pesan}</p>
                          <p className="text-[10px] mt-1" style={{ color: "var(--text-subtle)" }}>{new Date(n.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</p>
                        </button>
                      ))}
                    </div>
                    <Link href={dashPath} className="block text-center py-2.5 text-xs font-bold border-t transition-colors hover:bg-surface-hover"
                      style={{ borderColor: "var(--border)", color: "var(--primary)" }} onClick={() => setNotifOpen(false)}>
                      Lihat Semua
                    </Link>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div ref={userRef} className="relative">
                <button onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); setActiveDropdown(null); }}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded transition-colors"
                  style={{
                    color: navTextColor,
                    background: solidHeader ? "var(--surface-hover)" : "rgba(255,255,255,0.1)",
                  }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{ background: ROLE_COLORS[user.role].bg, color: ROLE_COLORS[user.role].fg }}>
                    {user.nama_lengkap.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-xs font-bold leading-none">{user.nama_lengkap.split(" ")[0].split(",")[0]}</p>
                    <span className="text-[9px] font-bold px-1 py-0.5 rounded mt-0.5 inline-block"
                      style={{ background: ROLE_COLORS[user.role].bg, color: ROLE_COLORS[user.role].fg }}>
                      {ROLE_LABELS[user.role]}
                    </span>
                  </div>
                  <ChevronDown size={12} className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 rounded overflow-hidden z-50"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}>
                    <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
                      <p className="text-xs font-bold">{user.nama_lengkap}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{user.id_petugas ? `ID: ${user.id_petugas}` : `NIK: ${user.nik}`}</p>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block"
                        style={{ background: ROLE_COLORS[user.role].bg, color: ROLE_COLORS[user.role].fg }}>
                        {ROLE_LABELS[user.role]}
                      </span>
                    </div>
                    {menuItems.map((item) => (
                      <Link key={item.href} href={item.href}
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium transition-colors hover:bg-surface-hover"
                        style={{ color: isActive(item.href) ? "var(--primary)" : "var(--foreground)", background: isActive(item.href) ? "var(--accent-light)" : "transparent" }}
                        onClick={() => setUserMenuOpen(false)}>
                        <item.icon size={14} />{item.label}
                      </Link>
                    ))}
                    <div className="border-t" style={{ borderColor: "var(--border)" }}>
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium transition-colors hover:bg-surface-hover" style={{ color: "#dc2626" }}>
                        <LogOut size={14} /> Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link href="/login" className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-bold rounded transition-colors"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
              <LogIn size={14} /> Masuk
            </Link>
          )}

          <button className="lg:hidden p-2 rounded transition-colors"
            style={{
              color: solidHeader ? "var(--foreground)" : "white",
              background: solidHeader ? "var(--surface-hover)" : "rgba(255,255,255,0.1)",
            }}
            onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu — from CMS */}
      {mobileOpen && (
        <div className="lg:hidden border-t" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="max-w-[1440px] mx-auto px-4 py-3 flex flex-col gap-1">
            {cmsNavLinks.map((link) => (
              <Link key={link.path} href={link.path}
                className="block px-3 py-2.5 text-sm font-semibold rounded transition-colors"
                style={{ color: isActive(link.path) ? "var(--primary)" : "var(--foreground)", background: isActive(link.path) ? "var(--accent-light)" : "transparent" }}
                onClick={() => setMobileOpen(false)}>
                {link.name}
              </Link>
            ))}
            <div className="pt-2 border-t mt-1" style={{ borderColor: "var(--border)" }}>
              {user ? (
                <>
                  <div className="px-3 py-2 flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{ background: ROLE_COLORS[user.role].bg, color: ROLE_COLORS[user.role].fg }}>
                      {user.nama_lengkap.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{user.nama_lengkap}</p>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: ROLE_COLORS[user.role].bg, color: ROLE_COLORS[user.role].fg }}>
                        {ROLE_LABELS[user.role]}
                      </span>
                    </div>
                  </div>
                  {menuItems.map((item) => (
                    <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded" style={{ color: "var(--foreground)" }}
                      onClick={() => setMobileOpen(false)}>
                      <item.icon size={16} style={{ color: "var(--primary)" }} />{item.label}
                    </Link>
                  ))}
                  <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded w-full mt-1" style={{ color: "#dc2626" }}>
                    <LogOut size={16} /> Keluar
                  </button>
                </>
              ) : (
                <Link href="/login" className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-bold rounded"
                  style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                  onClick={() => setMobileOpen(false)}>
                  <LogIn size={16} /> Masuk ke Akun
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}