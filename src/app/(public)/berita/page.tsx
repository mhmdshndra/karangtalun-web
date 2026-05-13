"use client";

import { useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { NewsCard, SectionHeader, EmptyState } from "@/components/ui/index";
import { useCms } from "@/core/cms/useCmsStore";


const ITEMS_PER_PAGE = 6;

export default function BeritaPage() {
  const { cms } = useCms();

  // CMS berita (Terbit only)
  const cmsBerita = cms.berita.filter((b) => b.status === "Terbit");
  const allBerita = cmsBerita;

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeKategori, setActiveKategori] = useState("Semua");

  const kategoriList = ["Semua", ...Array.from(new Set(allBerita.map((b) => b.kategori)))];

  const filtered = allBerita.filter((b) => {
    const matchSearch =
      b.judul.toLowerCase().includes(search.toLowerCase()) ||
      b.konten.toLowerCase().includes(search.toLowerCase());
    const matchKategori = activeKategori === "Semua" || b.kategori === activeKategori;
    return matchSearch && matchKategori;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh" }}>
      <Breadcrumb items={[{ label: "Beranda", href: "/" }, { label: "Berita & Pengumuman" }]} />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-12">
        <SectionHeader
          title="Berita Karangtalun"
          subtitle={`${filtered.length} artikel tersedia`}
        />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" style={{ color: "var(--foreground)" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Cari berita..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-sm border focus:outline-none"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {kategoriList.map((k) => (
              <button
                key={k}
                onClick={() => { setActiveKategori(k); setPage(1); }}
                className="px-3 py-2 text-xs font-bold rounded-sm border transition-all"
                style={{
                  background: activeKategori === k ? "var(--primary)" : "var(--surface)",
                  color: activeKategori === k ? "white" : "var(--foreground)",
                  borderColor: activeKategori === k ? "var(--primary)" : "var(--border)",
                }}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {paginated.length === 0 ? (
          <EmptyState title="Berita tidak ditemukan" description="Coba ubah kata kunci pencarian atau filter kategori." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {paginated.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-9 h-9 rounded-sm border flex items-center justify-center disabled:opacity-30 transition-colors hover:border-primary"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="w-9 h-9 rounded-sm border text-xs font-bold transition-all"
                style={{
                  background: p === page ? "var(--primary)" : "var(--surface)",
                  color: p === page ? "white" : "var(--foreground)",
                  borderColor: p === page ? "var(--primary)" : "var(--border)",
                }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-9 h-9 rounded-sm border flex items-center justify-center disabled:opacity-30 transition-colors hover:border-primary"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
