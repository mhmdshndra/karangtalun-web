"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { useCms } from "@/core/cms/useCmsStore";

import { SITE_CONFIG } from "@/core/constants/siteConfig";
import Breadcrumb from "@/components/ui/Breadcrumb";

const ICON_COLORS: Record<string, string> = {
  fasilitas: "#1a3a6e",
  pendidikan: "#166534",
  ibadah: "#b8860b",
  ekonomi: "#dc2626",
};

const ICON_LABELS: Record<string, string> = {
  fasilitas: "Fasilitas",
  pendidikan: "Pendidikan",
  ibadah: "Ibadah",
  ekonomi: "Ekonomi",
};

// Normalize CMS peta to same shape as PETA_FEATURES
interface PetaFeature {
  type: string;
  nama: string;
  koordinat: [number, number];
  keterangan: string;
}

function LegendItem({ type, color }: { type: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full" style={{ background: color }} />
      <span className="text-xs" style={{ color: "var(--foreground)" }}>{type}</span>
    </div>
  );
}

function loadLeafletCss(): Promise<void> {
  return new Promise((resolve) => {
    if (document.getElementById("leaflet-css")) {
      resolve();
      return;
    }

    const link = document.createElement("link");
    link.id = "leaflet-css";
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.onload = () => resolve();
    document.head.appendChild(link);
  });
}

export default function PetaPage() {
  const { cms } = useCms();
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<unknown>(null);
  const markersRef = useRef<unknown[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // CMS peta → normalize
  const cmsPeta = cms.petaDesa.filter((p) => p.aktif);
  const features: PetaFeature[] = cmsPeta.map((p) => ({
        type: p.kategori.toLowerCase(),
        nama: p.nama,
        koordinat: [p.lat, p.lng] as [number, number],
        keterangan: p.deskripsi || p.alamat,
      }));

  // Center coordinates from CMS or fallback
  const centerLat = cms.identitasDesa.koordinat?.lat || SITE_CONFIG.koordinat.lat;
  const centerLng = cms.identitasDesa.koordinat?.lng || SITE_CONFIG.koordinat.lng;

  // Build legend from features
  const legendTypes = Array.from(new Set(features.map((f) => f.type)));
  const allColors: Record<string, string> = { ...ICON_COLORS };
  cmsPeta.forEach((p) => {
    if (p.warna) allColors[p.kategori.toLowerCase()] = p.warna;
  });

  const [selected, setSelected] = useState<PetaFeature | null>(null);
  const [filter, setFilter] = useState("Semua");

  const types = ["Semua", ...legendTypes];
  const filtered = features.filter((f) => filter === "Semua" || f.type === filter);

  useEffect(() => {
  if (typeof window === "undefined") return;

  let cancelled = false;

  async function initMap() {
    await loadLeafletCss();

    if (cancelled) return;

    const L = await import("leaflet");

    if (!mapRef.current || leafletMap.current) return;

    const map = L.map(mapRef.current, {
      center: [centerLat, centerLng],
      zoom: 14,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    }).addTo(map);

    leafletMap.current = map;
    setMapLoaded(true);

    requestAnimationFrame(() => {
      map.invalidateSize();
    });

    setTimeout(() => {
      map.invalidateSize();
    }, 300);

    setTimeout(() => {
      map.invalidateSize();
    }, 800);

    features.forEach((feature) => {
      const color = allColors[feature.type] || "#1a3a6e";
      const iconHtml = `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:${color};border:2px solid white;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`;
      const icon = L.divIcon({ html: iconHtml, className: "", iconAnchor: [14, 28] });
      const marker = L.marker(feature.koordinat, { icon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:sans-serif;min-width:160px;">
            <p style="font-weight:bold;font-size:13px;margin:0 0 4px">${feature.nama}</p>
            <p style="font-size:11px;color:#666;margin:0">${feature.keterangan}</p>
          </div>`
        );
      markersRef.current.push(marker);
    });
  }

  initMap();

  return () => {
    cancelled = true;

    if (leafletMap.current) {
      (leafletMap.current as { remove: () => void }).remove();
      leafletMap.current = null;
    }
  };
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  useEffect(() => {
    if (!leafletMap.current) return;

    setTimeout(() => {
      (leafletMap.current as { invalidateSize: () => void }).invalidateSize();
    }, 100);
  }, [mapLoaded]);

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh" }}>
      <Breadcrumb items={[{ label: "Beranda", href: "/" }, { label: "Peta Desa" }]} />
      <div style={{ background: "var(--primary)" }} className="py-8">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>Geospasial</p>
          <h1 className="text-3xl md:text-4xl font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
            Peta Desa {cms.identitasDesa.namaDesa || "Karangtalun"}
          </h1>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-72 shrink-0 space-y-4">
            <div className="govt-card p-4">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--foreground)" }}>Filter Titik</p>
              <div className="space-y-1">
                {types.map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilter(t)}
                    className="w-full text-left px-3 py-2 text-xs font-medium rounded-sm transition-all"
                    style={{
                      background: filter === t ? "var(--primary)" : "transparent",
                      color: filter === t ? "white" : "var(--foreground)",
                    }}
                  >
                    {t === "Semua" ? "Semua Titik" : (ICON_LABELS[t] || t)}
                  </button>
                ))}
              </div>
            </div>

            <div className="govt-card p-4">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--foreground)" }}>Legenda</p>
              <div className="space-y-2">
                {legendTypes.map((t) => <LegendItem key={t} type={ICON_LABELS[t] || t} color={allColors[t] || "#1a3a6e"} />)}
              </div>
            </div>

            <div className="govt-card p-4">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--foreground)" }}>
                Titik Lokasi ({filtered.length})
              </p>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {filtered.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => setSelected(f)}
                    className="w-full text-left px-3 py-2 rounded-sm text-xs transition-all"
                    style={{
                      background: selected?.nama === f.nama ? "var(--accent-light)" : "var(--surface-hover)",
                      color: "var(--foreground)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: allColors[f.type] || "#1a3a6e" }} />
                      <span className="font-medium truncate">{f.nama}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selected && (
              <div className="p-4 rounded-sm" style={{ background: "var(--primary)", color: "white" }}>
                <p className="text-xs opacity-60 mb-1">{ICON_LABELS[selected.type] || selected.type}</p>
                <p className="font-bold text-sm mb-1">{selected.nama}</p>
                <p className="text-xs opacity-70">{selected.keterangan}</p>
                <p className="text-[10px] mt-2 opacity-50">
                  {selected.koordinat[0].toFixed(4)}, {selected.koordinat[1].toFixed(4)}
                </p>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="flex-1">
            <div
              ref={mapRef}
              className="w-full rounded-sm overflow-hidden"
              style={{ height: "600px", width: "100%", border: "1px solid var(--border)", background: "var(--surface-hover)" }}
            >
              {!mapLoaded && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <MapPin size={40} style={{ color: "var(--primary)", opacity: 0.3, margin: "0 auto 1rem" }} />
                    <p className="text-sm opacity-50" style={{ color: "var(--foreground)" }}>Memuat peta interaktif...</p>
                  </div>
                </div>
              )}
            </div>
            <p className="text-[11px] mt-2 opacity-40 text-right" style={{ color: "var(--foreground)" }}>
              Peta © OpenStreetMap contributors · Koordinat sekitar Desa Karangtalun, Tanon, Sragen
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}