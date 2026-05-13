"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts";
import { Award, Target, TrendingUp } from "lucide-react";
import { IDM_TABEL_INDIKATOR } from "@/core/constants/appConstants";
import { SectionHeader, StatusBadge } from "@/components/ui/index";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { useCms } from "@/core/cms/useCmsStore";
import { ASSETS } from "@/core/constants/assets";

export default function IdmPage() {
  const { cms } = useCms();
  const info = cms.infografis;

  // Use CMS skor/status
  const latest = {
    tahun: new Date().getFullYear(),
    skor: info.idmSkor || 0,
    status: info.idmStatus || "Belum Tersedia",
    sosial: 0,
    ekonomi: 0,
    ekologi: 0,
  };
  const delta = "0";

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh" }}>
      <Breadcrumb items={[{ label: "Beranda", href: "/" }, { label: "Indeks Desa Membangun" }]} />
      {/* Header */}
      <div style={{ background: "var(--primary)" }} className="py-10">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
            Data Pembangunan
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Indeks Desa Membangun
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
            IDM Desa Karangtalun — Capaian dan perkembangan indeks tahunan
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-12 space-y-12">

        {/* Status Cards */}
        <section id="status">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Skor Utama */}
            <div
              className="lg:col-span-2 p-8 rounded-sm flex flex-col sm:flex-row justify-between items-center gap-6"
              style={{ background: "var(--primary)/5", border: "1px solid var(--primary)", borderColor: "var(--primary)" }}
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--primary)" }}>
                  Skor IDM {latest.tahun}
                </p>
                <p className="text-5xl font-black" style={{ color: "var(--primary)", fontFamily: "var(--font-display)" }}>
                  {latest.skor.toFixed(4)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingUp size={14} style={{ color: "#166534" }} />
                  <span className="text-xs font-bold" style={{ color: "#166534" }}>+{delta} dari tahun lalu</span>
                </div>
              </div>
              <div
                className="px-8 py-4 rounded-sm flex items-center gap-4"
                style={{ background: "var(--primary)" }}
              >
                <Award size={32} style={{ color: "#f5d98a" }} />
                <div>
                  <p className="text-[10px] text-white/70 uppercase tracking-widest">Status Desa</p>
                  <p className="text-2xl font-black text-white uppercase">{latest.status}</p>
                </div>
              </div>
            </div>

            {/* Target */}
            <div className="govt-card p-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-4">
                <Target size={16} style={{ color: "var(--foreground)", opacity: 0.4 }} />
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50" style={{ color: "var(--foreground)" }}>
                  Target Capaian
                </p>
              </div>
              <div className="text-right mb-2">
                <span className="font-black text-sm" style={{ color: "var(--foreground)" }}>MANDIRI</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between pb-2" style={{ borderBottom: "1px solid var(--border)" }}>
                  <span className="opacity-50 text-xs" style={{ color: "var(--foreground)" }}>Ambang Batas</span>
                  <span className="font-bold text-xs" style={{ color: "var(--foreground)" }}>0.8156</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-50 text-xs" style={{ color: "var(--foreground)" }}>Defisit Poin</span>
                  <span className="font-bold text-xs" style={{ color: "#dc2626" }}>− 0.0004</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Pilar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {[
              { label: "Ketahanan Sosial", val: latest.sosial, iconSrc: ASSETS.icons.sosial, color: "#1e40af" },
              { label: "Ketahanan Ekonomi", val: latest.ekonomi, iconSrc: ASSETS.icons.ekonomi, color: "#92400e" },
              { label: "Ketahanan Ekologi", val: latest.ekologi, iconSrc: ASSETS.icons.ekologi, color: "#166534" },
            ].map((p) => (
              <div key={p.label} className="govt-card p-6 flex items-center gap-4">
                <div className="p-3 rounded-sm" style={{ background: `${p.color}15` }}>
                  <span style={{ display: "inline-block", width: 22, height: 22, backgroundColor: p.color, WebkitMaskImage: `url(${p.iconSrc})`, WebkitMaskSize: "contain", WebkitMaskRepeat: "no-repeat", WebkitMaskPosition: "center", maskImage: `url(${p.iconSrc})`, maskSize: "contain", maskRepeat: "no-repeat", maskPosition: "center" }} />
                </div>
                <div>
                  <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest" style={{ color: "var(--foreground)" }}>{p.label}</p>
                  <p className="text-2xl font-black" style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}>{p.val.toFixed(4)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Trend Chart */}
        <section id="grafik">
          <SectionHeader title="Tren Historis IDM" subtitle={`Data skor IDM Desa Karangtalun`} />
          <div className="govt-card p-6">
            {latest.skor > 0 ? (
              <p className="text-sm opacity-60 py-8 text-center" style={{ color: "var(--foreground)" }}>
                Data tren historis IDM tersedia setelah data multi-tahun diinput melalui CMS Admin.
              </p>
            ) : (
              <p className="text-sm opacity-60 py-8 text-center" style={{ color: "var(--foreground)" }}>
                Data IDM belum tersedia. Silakan input melalui CMS Admin.
              </p>
            )}
          </div>
        </section>

        {/* Tabel Indikator */}
        <section id="tabel">
          <SectionHeader title="Detail Indikator" subtitle="Capaian per indikator IDM terbaru" />
          <div className="overflow-x-auto rounded-sm" style={{ border: "1px solid var(--border)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--primary)", color: "white" }}>
                  <th className="text-left px-5 py-3 text-xs font-bold">Dimensi</th>
                  <th className="text-left px-5 py-3 text-xs font-bold">Indikator</th>
                  <th className="text-left px-5 py-3 text-xs font-bold">Kondisi</th>
                  <th className="text-center px-5 py-3 text-xs font-bold">Skor</th>
                  <th className="text-center px-5 py-3 text-xs font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {IDM_TABEL_INDIKATOR.map((row, i) => (
                  <tr
                    key={i}
                    style={{
                      background: i % 2 === 0 ? "var(--surface)" : "var(--surface-hover)",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <td className="px-5 py-3 font-bold text-xs" style={{ color: "var(--primary)" }}>{row.dimensi}</td>
                    <td className="px-5 py-3 text-xs" style={{ color: "var(--foreground)" }}>{row.indikator}</td>
                    <td className="px-5 py-3 text-xs opacity-70" style={{ color: "var(--foreground)" }}>{row.nilai}</td>
                    <td className="px-5 py-3 text-center font-bold text-xs" style={{ color: "var(--foreground)" }}>{row.skor}</td>
                    <td className="px-5 py-3 text-center">
                      <StatusBadge
                        label={row.status === "Tercapai" ? "Tercapai" : "Perlu Peningkatan"}
                        variant={row.status === "Tercapai" ? "success" : "warning"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
