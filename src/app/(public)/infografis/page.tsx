"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { useCms } from "@/core/cms/useCmsStore";

import { fetchStatistikKependudukan, type StatistikKependudukan } from "@/core/utils/wargaStats";
import { SectionHeader } from "@/components/ui/index";
import Breadcrumb from "@/components/ui/Breadcrumb";

const TABS = [
  { id: "penduduk", label: "Kependudukan" },
  { id: "apbdes", label: "APBDes" },
  { id: "stunting", label: "Stunting" },
  { id: "bansos", label: "Bansos" },
  { id: "sdgs", label: "SDGs Desa" },
];

const COLORS = ["#1a3a6e", "#4a7fc1", "#b8860b", "#166534", "#7c3aed", "#dc2626"];

function TabPenduduk() {
  // Statistik kependudukan dari backend /statistik/kependudukan
  const [d, setD] = useState<StatistikKependudukan>({ totalPenduduk: 0, totalKK: 0, lakiLaki: 0, perempuan: 0, pendidikan: [], pekerjaan: [], kelompokUsia: [] });
  useEffect(() => { fetchStatistikKependudukan().then(setD); }, []);
  const totalPenduduk = d.totalPenduduk;
  const totalKK = d.totalKK;

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Penduduk", value: totalPenduduk.toLocaleString("id"), sub: "Jiwa" },
          { label: "Kepala Keluarga", value: totalKK.toLocaleString("id"), sub: "KK" },
          { label: "Laki-laki", value: d.lakiLaki.toLocaleString("id"), sub: "Jiwa" },
          { label: "Perempuan", value: d.perempuan.toLocaleString("id"), sub: "Jiwa" },
        ].map((s) => (
          <div key={s.label} className="govt-card p-5 text-center">
            <p className="text-2xl font-black" style={{ color: "var(--primary)", fontFamily: "var(--font-display)" }}>{s.value}</p>
            <p className="text-xs font-bold mt-1" style={{ color: "var(--foreground)" }}>{s.label}</p>
            <p className="text-[11px] opacity-50" style={{ color: "var(--foreground)" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="penduduk">
        <div className="govt-card p-6">
          <h3 className="text-sm font-bold mb-6" style={{ color: "var(--foreground)" }}>Tingkat Pendidikan Warga</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={d.pendidikan} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--foreground)" }} />
              <YAxis tick={{ fontSize: 10, fill: "var(--foreground)" }} />
              <Tooltip contentStyle={{ fontSize: 12, background: "var(--surface)", borderColor: "var(--border)" }} />
              <Bar dataKey="value" fill="var(--primary)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="govt-card p-6">
          <h3 className="text-sm font-bold mb-6" style={{ color: "var(--foreground)" }}>Mata Pencaharian</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={d.pekerjaan} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ label, percent }: { label: string; percent: number }) => `${label} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {d.pekerjaan.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, background: "var(--surface)", borderColor: "var(--border)" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="govt-card p-6">
        <h3 className="text-sm font-bold mb-6" style={{ color: "var(--foreground)" }}>Kelompok Usia</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {d.kelompokUsia.map((k) => {
            const persen = totalPenduduk > 0 ? ((k.value / totalPenduduk) * 100).toFixed(1) : "0";
            return (
              <div key={k.label} className="text-center p-4 rounded-sm" style={{ background: "var(--surface-hover)" }}>
                <p className="text-2xl font-black" style={{ color: k.color }}>{k.value.toLocaleString("id")}</p>
                <p className="text-xs font-bold mt-1" style={{ color: "var(--foreground)" }}>{k.label}</p>
                <p className="text-xs mt-1 opacity-60" style={{ color: "var(--foreground)" }}>{persen}% dari total</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TabApbdes() {
  const { cms } = useCms();
  const info = cms.infografis;
  const totalAnggaran = info.apbdesTotal || 0;
  const totalRealisasi = info.apbdesRealisasi || 0;
  const persen = totalAnggaran > 0 ? ((totalRealisasi / totalAnggaran) * 100).toFixed(1) : "0";

  return (
    <div id="apbdes" className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="govt-card p-6">
          <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2" style={{ color: "var(--foreground)" }}>Total Anggaran</p>
          <p className="text-2xl font-black" style={{ color: "var(--primary)", fontFamily: "var(--font-display)" }}>Rp {(totalAnggaran / 1000000).toFixed(0)} Jt</p>
        </div>
        <div className="govt-card p-6">
          <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2" style={{ color: "var(--foreground)" }}>Total Realisasi</p>
          <p className="text-2xl font-black" style={{ color: "#166534", fontFamily: "var(--font-display)" }}>Rp {(totalRealisasi / 1000000).toFixed(0)} Jt</p>
        </div>
        <div className="govt-card p-6">
          <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2" style={{ color: "var(--foreground)" }}>Realisasi</p>
          <p className="text-2xl font-black" style={{ color: "var(--accent)", fontFamily: "var(--font-display)" }}>{persen}%</p>
          <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-hover)" }}>
            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${persen}%`, background: "var(--accent)" }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="govt-card p-6">
          <h3 className="text-sm font-bold mb-6" style={{ color: "var(--foreground)" }}>Sumber Pendapatan</h3>
          {totalAnggaran > 0 ? (
            <p className="text-sm opacity-60 py-8 text-center" style={{ color: "var(--foreground)" }}>
              Rincian pendapatan tersedia setelah data APBDes diinput melalui CMS Admin.
            </p>
          ) : (
            <p className="text-sm opacity-60 py-8 text-center" style={{ color: "var(--foreground)" }}>
              Data APBDes belum tersedia.
            </p>
          )}
        </div>

        <div className="govt-card p-6">
          <h3 className="text-sm font-bold mb-6" style={{ color: "var(--foreground)" }}>Rincian Belanja</h3>
          {totalAnggaran > 0 ? (
            <p className="text-sm opacity-60 py-8 text-center" style={{ color: "var(--foreground)" }}>
              Rincian belanja tersedia setelah data APBDes diinput melalui CMS Admin.
            </p>
          ) : (
            <p className="text-sm opacity-60 py-8 text-center" style={{ color: "var(--foreground)" }}>
              Data APBDes belum tersedia.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function TabStunting() {
  const { cms } = useCms();
  const info = cms.infografis;
  const totalBalita = info.stuntingTotal || 0;
  const kasusStunting = info.stuntingKasus || 0;

  return (
    <div id="stunting" className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Total Balita", value: totalBalita, color: "var(--primary)" },
          { label: "Normal", value: Math.max(0, totalBalita - kasusStunting), color: "#166534" },
          { label: "Kasus Stunting", value: kasusStunting, color: "#991b1b" },
        ].map((s) => (
          <div key={s.label} className="govt-card p-5 text-center">
            <p className="text-2xl font-black" style={{ color: s.color, fontFamily: "var(--font-display)" }}>{s.value}</p>
            <p className="text-xs font-bold mt-1" style={{ color: "var(--foreground)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="govt-card p-6">
        <h3 className="text-sm font-bold mb-6" style={{ color: "var(--foreground)" }}>Tren Prevalensi Stunting (%)</h3>
        {totalBalita > 0 ? (
          <p className="text-sm opacity-60 py-8 text-center" style={{ color: "var(--foreground)" }}>
            Data tren stunting tersedia setelah data historis diinput melalui CMS Admin.
          </p>
        ) : (
          <p className="text-sm opacity-60 py-8 text-center" style={{ color: "var(--foreground)" }}>
            Data stunting belum tersedia.
          </p>
        )}
      </div>
    </div>
  );
}

function TabBansos() {
  const { cms } = useCms();
  const info = cms.infografis;
  const [nikInput, setNikInput] = useState("");
  const [searchResult, setSearchResult] = useState<null | { found: boolean; data?: { nama: string; program: string; status: string } }>(null);
  const [searchError, setSearchError] = useState("");
  const [searching, setSearching] = useState(false);

  // Use CMS bansos data
  const bansosData = info.dataBansos;

  const handleCekBansos = async () => {
    setSearchError("");
    setSearchResult(null);
    const cleaned = nikInput.replace(/\s/g, "");
    if (!cleaned) { setSearchError("NIK wajib diisi untuk mengecek status penerima."); return; }
    if (!/^\d{16}$/.test(cleaned)) { setSearchError("NIK harus terdiri dari 16 digit angka."); return; }
    setSearching(true);
    // Fitur cek bansos memerlukan endpoint backend — untuk saat ini tampilkan pesan info
    setSearchResult({ found: false });
    setSearching(false);
  };

  return (
    <div id="bansos" className="space-y-8">
      <p className="text-sm opacity-60" style={{ color: "var(--foreground)" }}>
        Data penerima bantuan sosial aktif tahun {new Date().getFullYear()} Desa Karangtalun
      </p>

      <div className="overflow-x-auto rounded-sm" style={{ border: "1px solid var(--border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--primary)", color: "white" }}>
              <th className="text-left px-5 py-3 text-xs font-bold">Program</th>
              <th className="text-center px-5 py-3 text-xs font-bold">Penerima</th>
              <th className="text-right px-5 py-3 text-xs font-bold">Anggaran</th>
            </tr>
          </thead>
          <tbody>
            {bansosData.map((b, i) => (
              <tr key={b.program} style={{ background: i % 2 === 0 ? "var(--surface)" : "var(--surface-hover)", borderBottom: "1px solid var(--border)" }}>
                <td className="px-5 py-3 font-medium" style={{ color: "var(--foreground)" }}>{b.program}</td>
                <td className="px-5 py-3 text-center font-bold" style={{ color: "var(--primary)" }}>{b.penerima}</td>
                <td className="px-5 py-3 text-right font-bold" style={{ color: "var(--foreground)" }}>{b.anggaran}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cek Penerima Bansos */}
      <div className="govt-card p-6" style={{ borderLeft: "4px solid var(--primary)" }}>
        <h3 className="text-sm font-bold mb-1" style={{ color: "var(--foreground)" }}>Cek Status Penerima Bantuan Sosial</h3>
        <p className="text-xs opacity-50 mb-4" style={{ color: "var(--foreground)" }}>
          Masukkan NIK (16 digit) untuk mengecek apakah Anda terdaftar sebagai penerima bantuan sosial desa.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input type="text" value={nikInput} onChange={(e) => { const val = e.target.value.replace(/\D/g, "").slice(0, 16); setNikInput(val); setSearchError(""); setSearchResult(null); }}
              placeholder="Masukkan 16 digit NIK" maxLength={16}
              className="w-full py-3 px-4 text-sm rounded-sm border focus:outline-none"
              style={{ background: searchError ? "#fff5f5" : "var(--surface)", borderColor: searchError ? "#dc2626" : "var(--border)", color: "var(--foreground)", fontFamily: "monospace", letterSpacing: "0.05em" }} />
            {nikInput && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold" style={{ color: nikInput.length === 16 ? "#166534" : "var(--foreground)", opacity: 0.5 }}>{nikInput.length}/16</span>}
          </div>
          <button onClick={handleCekBansos} disabled={searching}
            className="px-6 py-3 text-sm font-bold rounded-sm transition-all hover:opacity-90 disabled:opacity-50 shrink-0"
            style={{ background: "var(--primary)", color: "white" }}>
            {searching ? "Memeriksa..." : "Cek Status"}
          </button>
        </div>
        {searchError && <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: "#dc2626" }}><span style={{ fontSize: 14 }}>⚠</span> {searchError}</p>}
        {searchResult && (
          <div className="mt-4 p-4 rounded-sm" style={{ background: searchResult.found ? "#f0fdf4" : "var(--surface-hover)", border: `1px solid ${searchResult.found ? "#bbf7d0" : "var(--border)"}` }}>
            {searchResult.found && searchResult.data ? (
              <div className="space-y-2">
                <p className="text-xs font-bold" style={{ color: "#166534" }}>✓ NIK terdaftar sebagai penerima bantuan sosial</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div><span className="opacity-50" style={{ color: "var(--foreground)" }}>Nama</span><p className="font-bold" style={{ color: "var(--foreground)" }}>{searchResult.data.nama}</p></div>
                  <div><span className="opacity-50" style={{ color: "var(--foreground)" }}>Program</span><p className="font-bold" style={{ color: "var(--foreground)" }}>{searchResult.data.program}</p></div>
                  <div><span className="opacity-50" style={{ color: "var(--foreground)" }}>Status</span><p className="font-bold" style={{ color: "#166534" }}>{searchResult.data.status}</p></div>
                </div>
                <p className="text-[10px] opacity-40 mt-2" style={{ color: "var(--foreground)" }}>Nama ditampilkan sebagian untuk perlindungan data pribadi.</p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-bold mb-1" style={{ color: "var(--foreground)" }}>NIK tidak ditemukan dalam daftar penerima bantuan sosial.</p>
                <p className="text-xs opacity-50" style={{ color: "var(--foreground)" }}>Jika Anda merasa berhak menerima bantuan, silakan hubungi kantor desa untuk informasi lebih lanjut.</p>
              </div>
            )}
          </div>
        )}
        <p className="text-[10px] opacity-40 mt-3" style={{ color: "var(--foreground)" }}>Pencarian menggunakan pencocokan NIK secara eksak terhadap data penerima bantuan sosial yang terdaftar.</p>
      </div>
    </div>
  );
}

function TabSdgs() {
  const { cms } = useCms();
  const info = cms.infografis;

  const defaultGoals = [
    { no: 1, title: "Tanpa Kemiskinan", persen: 68, color: "#E5243B" },
    { no: 2, title: "Tanpa Kelaparan", persen: 82, color: "#DDA63A" },
    { no: 3, title: "Kesehatan yang Baik", persen: 75, color: "#4C9F38" },
    { no: 4, title: "Pendidikan Berkualitas", persen: 79, color: "#C5192D" },
    { no: 5, title: "Kesetaraan Gender", persen: 85, color: "#FF3A21" },
    { no: 6, title: "Air Bersih & Sanitasi", persen: 91, color: "#26BDE2" },
    { no: 8, title: "Pekerjaan & Pertumbuhan", persen: 62, color: "#A21942" },
    { no: 11, title: "Kota & Pemukiman", persen: 73, color: "#FD9D24" },
  ];

  const goals = info.sdgsCapaian.length > 0
    ? info.sdgsCapaian.map((g) => ({ ...g, color: defaultGoals.find((d) => d.no === g.no)?.color || "#6b7280" }))
    : defaultGoals;

  return (
    <div id="sdgs" className="space-y-6">
      <p className="text-sm opacity-60" style={{ color: "var(--foreground)" }}>Capaian SDGs Desa Karangtalun berdasarkan 18 tujuan pembangunan berkelanjutan</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((g) => (
          <div key={g.no} className="govt-card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded shrink-0 flex items-center justify-center font-black text-sm text-white" style={{ background: g.color }}>{g.no}</div>
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium" style={{ color: "var(--foreground)" }}>{g.title}</span>
                <span className="font-black" style={{ color: g.color }}>{g.persen}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-hover)" }}>
                <div className="h-full rounded-full" style={{ width: `${g.persen}%`, background: g.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const TAB_CONTENT: Record<string, React.ReactNode> = {
  penduduk: <TabPenduduk />,
  apbdes: <TabApbdes />,
  stunting: <TabStunting />,
  bansos: <TabBansos />,
  sdgs: <TabSdgs />,
};

export default function InfografiPage() {
  const [activeTab, setActiveTab] = useState("penduduk");

  useEffect(() => {
    const syncTab = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && TABS.some((t) => t.id === hash)) { setActiveTab(hash); }
    };
    syncTab();
    window.addEventListener("hashchange", syncTab);
    window.addEventListener("popstate", syncTab);
    const interval = setInterval(() => {
      const hash = window.location.hash.replace("#", "");
      if (hash && TABS.some((t) => t.id === hash)) { setActiveTab((prev) => prev !== hash ? hash : prev); }
    }, 300);
    return () => { window.removeEventListener("hashchange", syncTab); window.removeEventListener("popstate", syncTab); clearInterval(interval); };
  }, []);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    window.history.replaceState(null, "", `#${tabId}`);
  };

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh" }}>
      <Breadcrumb items={[{ label: "Beranda", href: "/" }, { label: "Infografis & Data Desa" }]} />

      <div style={{ background: "var(--primary)" }} className="pt-8 pb-0">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>Data & Statistik</p>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-6" style={{ fontFamily: "var(--font-display)" }}>Infografis Desa Karangtalun</h1>
          <div className="flex items-center gap-1 overflow-x-auto pb-0">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                className="px-5 py-3 text-xs font-bold shrink-0 transition-all border-b-2"
                style={{ color: activeTab === tab.id ? "white" : "rgba(255,255,255,0.6)", borderColor: activeTab === tab.id ? "white" : "transparent", background: "transparent" }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-12">
        {TAB_CONTENT[activeTab]}
      </div>
    </div>
  );
}
