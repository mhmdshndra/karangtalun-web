"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, FileText, ClipboardList, BookOpen, Users,
  LogOut, Menu, X, Bell, ChevronLeft, Moon, Settings, UserCog,
  Globe, Building2, Newspaper, Camera, ShoppingBag,
  UserCheck, ScrollText, Briefcase, FolderOpen, MapPin, BarChart3, Layout,
  ChevronDown, Database, Sprout, Landmark,
} from "lucide-react";
import { useAuth } from "@/core/context/AuthContext";
import { useServiceData } from "@/core/context/ServiceDataContext";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Pengajuan Surat", href: "/admin/pengajuan-surat", icon: FileText },
  { label: "Laporan / Aduan", href: "/admin/laporan-aduan", icon: ClipboardList },
  { label: "Permohonan PPID", href: "/admin/permohonan-ppid", icon: BookOpen },
  { label: "Database Warga", href: "/admin/database-warga", icon: Database },
  { label: "Kelola Pengguna", href: "/admin/pengguna", icon: Users },
  { label: "Akun Saya", href: "/admin/akun", icon: UserCog },
  { label: "Pengaturan", href: "/admin/pengaturan", icon: Settings },
];

const CMS_NAV_ITEMS = [
  { label: "Identitas Desa", href: "/admin/website/identitas-desa", icon: Building2 },

  { label: "Berita", href: "/admin/website/berita", icon: Newspaper },
  { label: "Galeri", href: "/admin/website/galeri", icon: Camera },
  { label: "UMKM", href: "/admin/website/umkm", icon: ShoppingBag },
  { label: "Aparatur", href: "/admin/website/aparatur", icon: UserCheck },
  { label: "Profil Desa", href: "/admin/website/profil-desa", icon: ScrollText },
  { label: "Potensi Desa", href: "/admin/website/potensi-desa", icon: Sprout },
  { label: "Fasilitas & Infra", href: "/admin/website/fasilitas", icon: Landmark },
  { label: "Layanan Publik", href: "/admin/website/layanan-publik", icon: Briefcase },
  { label: "PPID Dokumen", href: "/admin/website/ppid-dokumen", icon: FolderOpen },
  { label: "Peta Desa", href: "/admin/website/peta-desa", icon: MapPin },
  { label: "Infografis", href: "/admin/website/infografis", icon: BarChart3 },
  { label: "Header & Footer", href: "/admin/website/header-footer", icon: Layout },
];

const ALL_NAV = [...NAV_ITEMS, ...CMS_NAV_ITEMS];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const { getUnreadCountForUser } = useServiceData();
  const unreadCount = getUnreadCountForUser(user?.role || "admin_desa", user?.nik, user?.id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // FIX: useState must be BEFORE any conditional return
  const [cmsExpanded, setCmsExpanded] = useState(pathname.startsWith("/admin/website"));

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) document.documentElement.setAttribute("data-theme", saved);
  }, []);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin_desa")) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  useEffect(() => {
    if (pathname.startsWith("/admin/website")) setCmsExpanded(true);
  }, [pathname]);

  const handleLogout = () => { logout(); router.push("/"); };
  const toggleTheme = () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    document.documentElement.setAttribute("data-theme", isDark ? "light" : "dark");
    localStorage.setItem("theme", isDark ? "light" : "dark");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="animate-pulse text-center">
          <div className="w-12 h-12 rounded-full mx-auto mb-3" style={{ background: "#dc2626" }} />
          <p className="text-xs font-bold" style={{ color: "var(--foreground)" }}>Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin_desa") return null;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const activeTitle = ALL_NAV.find((n) => isActive(n.href))?.label || "Admin Desa";
  const isCmsOpen = pathname.startsWith("/admin/website");

  return (
    <div className="min-h-screen flex" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r fixed top-0 left-0 h-screen z-30"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="p-5 border-b" style={{ borderColor: "var(--border)" }}>
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded flex items-center justify-center font-bold text-sm" style={{ background: "#dc2626", color: "#fff" }}>KT</div>
            <div>
              <p className="text-xs font-bold" style={{ color: "#dc2626" }}>DESA KARANGTALUN</p>
              <p className="text-[10px] opacity-50">Panel Admin Desa</p>
            </div>
          </Link>
        </div>
        <div className="p-5 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden" style={{ background: "#dc2626", color: "#fff" }}>
              {user.foto ? (
                <img src={user.foto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                user.nama_lengkap.charAt(0)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user.nama_lengkap}</p>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 inline-block" style={{ background: "#dc2626", color: "#fff" }}>Admin Desa</span>
            </div>
          </div>
          {user.id_petugas && <p className="text-[10px] font-mono opacity-40 mt-2">ID: {user.id_petugas}</p>}
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all"
              style={{ color: isActive(item.href) ? "#dc2626" : "var(--foreground)", background: isActive(item.href) ? "rgba(220,38,38,0.1)" : "transparent", borderLeft: isActive(item.href) ? "3px solid #dc2626" : "3px solid transparent" }}>
              <item.icon size={18} />{item.label}
            </Link>
          ))}
          <div className="pt-3 mt-3" style={{ borderTop: "1px solid var(--border)" }}>
            <button onClick={() => setCmsExpanded(!cmsExpanded)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-bold transition-all"
              style={{ color: isCmsOpen ? "#dc2626" : "var(--foreground)", background: isCmsOpen ? "rgba(220,38,38,0.05)" : "transparent" }}>
              <Globe size={18} />
              <span className="flex-1 text-left">CMS Website</span>
              <ChevronDown size={14} style={{ transform: cmsExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
            </button>
            {cmsExpanded && (
              <div className="mt-1 ml-3 space-y-0.5">
                {CMS_NAV_ITEMS.map((item) => (
                  <Link key={item.href} href={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-all"
                    style={{ color: isActive(item.href) ? "#dc2626" : "var(--foreground)", background: isActive(item.href) ? "rgba(220,38,38,0.1)" : "transparent", borderLeft: isActive(item.href) ? "2px solid #dc2626" : "2px solid transparent" }}>
                    <item.icon size={14} />{item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>
        <div className="p-3 border-t space-y-1" style={{ borderColor: "var(--border)" }}>
          <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium" style={{ color: "var(--foreground)" }}><Moon size={18} /> Ganti Tema</button>
          <Link href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium" style={{ color: "var(--foreground)" }}><ChevronLeft size={18} /> Ke Beranda</Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium" style={{ color: "#dc2626" }}><LogOut size={18} /> Keluar</button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 flex items-center justify-between px-4 border-b" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <button onClick={() => setSidebarOpen(true)} className="p-1.5" style={{ color: "var(--foreground)" }}><Menu size={20} /></button>
        <p className="text-sm font-bold" style={{ color: "#dc2626" }}>{activeTitle}</p>
        <div className="relative p-1.5" style={{ color: "var(--foreground)" }}>
          <Bell size={18} />
          {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: "#dc2626", color: "#fff" }}>{unreadCount > 9 ? "9+" : unreadCount}</span>}
        </div>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          <div className="lg:hidden fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setSidebarOpen(false)} />
          <div className="lg:hidden fixed top-0 left-0 h-full w-72 z-50 flex flex-col border-r" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden" style={{ background: "#dc2626", color: "#fff" }}>
                  {user.foto ? (
                    <img src={user.foto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    user.nama_lengkap.charAt(0)
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold">{user.nama_lengkap.split(",")[0]}</p>
                  <span className="text-[9px] font-bold px-1 py-0.5 rounded" style={{ background: "#dc2626", color: "#fff" }}>Admin Desa</span>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} style={{ color: "var(--foreground)" }}><X size={20} /></button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-3 px-3 py-3 rounded text-sm font-medium"
                  style={{ color: isActive(item.href) ? "#dc2626" : "var(--foreground)", background: isActive(item.href) ? "rgba(220,38,38,0.1)" : "transparent" }}>
                  <item.icon size={18} />{item.label}
                </Link>
              ))}
              <div className="pt-3 mt-3" style={{ borderTop: "1px solid var(--border)" }}>
                <button onClick={() => setCmsExpanded(!cmsExpanded)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded text-sm font-bold"
                  style={{ color: isCmsOpen ? "#dc2626" : "var(--foreground)" }}>
                  <Globe size={18} />
                  <span className="flex-1 text-left">CMS Website</span>
                  <ChevronDown size={14} style={{ transform: cmsExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                </button>
                {cmsExpanded && (
                  <div className="mt-1 ml-3 space-y-0.5">
                    {CMS_NAV_ITEMS.map((item) => (
                      <Link key={item.href} href={item.href}
                        className="flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium"
                        style={{ color: isActive(item.href) ? "#dc2626" : "var(--foreground)", background: isActive(item.href) ? "rgba(220,38,38,0.1)" : "transparent" }}>
                        <item.icon size={14} />{item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>
            <div className="p-3 border-t space-y-1" style={{ borderColor: "var(--border)" }}>
              <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded text-sm" style={{ color: "var(--foreground)" }}><ChevronLeft size={18} /> Ke Beranda</Link>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm" style={{ color: "#dc2626" }}><LogOut size={18} /> Keluar</button>
            </div>
          </div>
        </>
      )}

      <main className="flex-1 lg:ml-64 min-h-screen pt-14 lg:pt-0 pb-20 lg:pb-0">{children}</main>

      {/* Mobile Bottom Nav (first 4) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t flex items-stretch" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        {NAV_ITEMS.slice(0, 5).map((item) => (
          <Link key={item.href} href={item.href}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5"
            style={{ color: isActive(item.href) ? "#dc2626" : "var(--foreground)", opacity: isActive(item.href) ? 1 : 0.5 }}>
            <item.icon size={18} /><span className="text-[10px] font-bold">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
