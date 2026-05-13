"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell, BellOff, X, CheckCircle, XCircle, Loader2, FileText, AlertCircle,
  MessageSquare, Info, Megaphone, ClipboardList, Search as SearchIcon,
} from "lucide-react";
import { useAuth } from "@/core/context/AuthContext";
import { useServiceData } from "@/core/context/ServiceDataContext";
import type { NotifikasiTipe } from "@/core/types";

const NOTIF_ICON_MAP: Record<string, { icon: typeof Bell; color: string }> = {
  surat_masuk: { icon: FileText, color: "#b8860b" },
  surat_diproses: { icon: Loader2, color: "#2563eb" },
  surat_selesai: { icon: CheckCircle, color: "#16a34a" },
  surat_ditolak: { icon: XCircle, color: "#dc2626" },
  info: { icon: AlertCircle, color: "#2563eb" },
  pengumuman: { icon: Megaphone, color: "#b8860b" },
  laporan_masuk: { icon: ClipboardList, color: "#b8860b" },
  laporan_diproses: { icon: Loader2, color: "#2563eb" },
  laporan_selesai: { icon: CheckCircle, color: "#16a34a" },
  permohonan_masuk: { icon: SearchIcon, color: "#b8860b" },
  permohonan_diproses: { icon: Loader2, color: "#2563eb" },
  permohonan_selesai: { icon: CheckCircle, color: "#16a34a" },
};

interface NotificationListProps {
  open: boolean;
  onClose: () => void;
  mode?: "sidebar" | "modal";
}

export default function NotificationList({ open, onClose, mode = "modal" }: NotificationListProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { getNotifikasiForUser, getUnreadCountForUser, markAsRead, markAllRead } = useServiceData();
  const notifikasi = getNotifikasiForUser(user?.role || "warga", user?.nik, user?.id);
  const unreadCount = getUnreadCountForUser(user?.role || "warga", user?.nik, user?.id);
  const [tab, setTab] = useState<"semua" | "belum">("semua");

  if (!open) return null;

  const filtered = tab === "belum" ? notifikasi.filter((n) => !n.dibaca) : notifikasi;

  const handleClick = (id: string, link?: string) => {
    markAsRead(id);
    if (link) {
      router.push(link);
      onClose();
    }
  };

  const content = (
    <div className="flex flex-col h-full max-h-[80vh]">
      {/* Header */}
      <div className="px-5 py-3.5 border-b flex items-center justify-between shrink-0" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2">
          <Bell size={16} style={{ color: "var(--primary)" }} />
          <h3 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
            Notifikasi
          </h3>
          {unreadCount > 0 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#dc2626", color: "#fff" }}>
              {unreadCount}
            </span>
          )}
        </div>
        <button onClick={onClose} className="p-1" style={{ color: "var(--foreground)", opacity: 0.4 }}>
          <X size={18} />
        </button>
      </div>

      {/* Tabs + Mark All */}
      <div className="px-5 py-2 border-b flex items-center justify-between shrink-0" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab("semua")}
            className="text-[11px] font-bold px-2 py-1 rounded transition-colors"
            style={{
              color: tab === "semua" ? "var(--primary)" : "var(--foreground)",
              background: tab === "semua" ? "var(--accent-light)" : "transparent",
              opacity: tab === "semua" ? 1 : 0.5,
            }}
          >
            Semua
          </button>
          <button
            onClick={() => setTab("belum")}
            className="text-[11px] font-bold px-2 py-1 rounded transition-colors"
            style={{
              color: tab === "belum" ? "var(--primary)" : "var(--foreground)",
              background: tab === "belum" ? "var(--accent-light)" : "transparent",
              opacity: tab === "belum" ? 1 : 0.5,
            }}
          >
            Belum Dibaca
          </button>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead(user?.role, user?.nik, user?.id)}
            className="text-[11px] font-medium flex items-center gap-1"
            style={{ color: "var(--primary)" }}
          >
            <BellOff size={11} /> Tandai semua
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <Bell size={32} className="mx-auto mb-2 opacity-15" />
            <p className="text-xs opacity-40">
              {tab === "belum" ? "Semua notifikasi sudah dibaca." : "Belum ada notifikasi."}
            </p>
          </div>
        ) : (
          filtered.map((n) => {
            const ni = NOTIF_ICON_MAP[n.tipe] || NOTIF_ICON_MAP.info;
            return (
              <button
                key={n.id}
                className="w-full text-left px-5 py-3.5 border-b flex items-start gap-3 transition-colors hover:bg-surface-hover"
                style={{
                  borderColor: "var(--border)",
                  background: n.dibaca ? "transparent" : "var(--accent-light)",
                }}
                onClick={() => handleClick(n.id, n.link)}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: `${ni.color}15`, color: ni.color }}
                >
                  <ni.icon size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold" style={{ color: "var(--foreground)" }}>
                    {n.judul}
                    {!n.dibaca && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full ml-1.5 align-middle" style={{ background: "#dc2626" }} />
                    )}
                  </p>
                  <p className="text-[11px] opacity-60 line-clamp-2 mt-0.5">{n.pesan}</p>
                  <p className="text-[10px] opacity-30 mt-1">
                    {new Date(n.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  if (mode === "sidebar") {
    return (
      <>
        <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose} />
        <div
          className="fixed top-0 right-0 h-full w-full sm:w-96 z-50 shadow-2xl"
          style={{ background: "var(--surface)" }}
        >
          {content}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose} />
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md rounded-lg shadow-2xl overflow-hidden"
        style={{ background: "var(--surface)" }}
      >
        {content}
      </div>
    </>
  );
}
