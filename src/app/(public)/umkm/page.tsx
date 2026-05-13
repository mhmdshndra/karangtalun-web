"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { ProductCard, SectionHeader, EmptyState } from "@/components/ui/index";
import { useCms } from "@/core/cms/useCmsStore";

import type { CmsUmkm } from "@/core/cms/cmsTypes";
import type { UmkmProduct } from "@/core/types";

export default function UmkmPage() {
  const { cms } = useCms();
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("Semua");
  const [sortBy, setSortBy] = useState("terbaru");

  // CMS umkm (aktif only)
  const cmsUmkm = cms.umkm.filter((u) => u.aktif);

  // Build category list from active data
  const categories = ["Semua", ...Array.from(new Set(cmsUmkm.map((u) => u.kategori)))];

  // Filter & sort
  const filtered = cmsUmkm.filter((p) => {
        const matchSearch =
          p.nama.toLowerCase().includes(search.toLowerCase()) ||
          p.namaPenjual.toLowerCase().includes(search.toLowerCase()) ||
          p.kategori.toLowerCase().includes(search.toLowerCase());
        const matchKat = kategori === "Semua" || p.kategori === kategori;
        return matchSearch && matchKat;
      }).sort((a, b) => {
        if (sortBy === "harga-asc") return a.harga - b.harga;
        if (sortBy === "harga-desc") return b.harga - a.harga;
        if (sortBy === "terlaris") return b.likes - a.likes;
        return 0; // terbaru — keep CMS order
      });

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh" }}>
      <Breadcrumb items={[{ label: "Beranda", href: "/" }, { label: "UMKM Karangtalun" }]} />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-12">
        <SectionHeader
          title="Pasar UMKM Karangtalun"
          subtitle="Produk lokal berkualitas dari warga desa"
        />

        {/* Filter Bar */}
        <div
          className="flex flex-col md:flex-row gap-4 mb-8 p-4 rounded-sm"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" style={{ color: "var(--foreground)" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk atau penjual..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-sm border focus:outline-none"
              style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2.5 text-sm rounded-sm border focus:outline-none"
            style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            <option value="terbaru">Terbaru</option>
            <option value="terlaris">Terpopuler</option>
            <option value="harga-asc">Harga: Rendah ke Tinggi</option>
            <option value="harga-desc">Harga: Tinggi ke Rendah</option>
          </select>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 flex-wrap mb-8">
          {categories.map((k) => (
            <button
              key={k}
              onClick={() => setKategori(k)}
              className="px-4 py-2 text-xs font-bold rounded-sm border transition-all"
              style={{
                background: kategori === k ? "var(--primary)" : "var(--surface)",
                color: kategori === k ? "white" : "var(--foreground)",
                borderColor: kategori === k ? "var(--primary)" : "var(--border)",
              }}
            >
              {k}
            </button>
          ))}
        </div>

        {/* Results */}
        <p className="text-xs mb-6 opacity-50" style={{ color: "var(--foreground)" }}>
          Menampilkan {filtered.length} produk
        </p>

        {filtered.length === 0 ? (
          <EmptyState title="Produk tidak ditemukan" description="Coba ubah kata kunci atau kategori." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
