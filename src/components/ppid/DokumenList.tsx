"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useCms } from "@/core/cms/useCmsStore";

import DokumenCard from "@/components/ppid/DokumenCard";
import type { PpidDocument } from "@/core/types";

interface DokumenListProps {
  category: string;
  emptyMessage?: string;
}

export default function DokumenList({ category, emptyMessage }: DokumenListProps) {
  const { cms } = useCms();
  const [search, setSearch] = useState("");

  // CMS data → convert to PpidDocument shape for DokumenCard compatibility
  const cmsDocs: PpidDocument[] = cms.ppidDokumen
    .filter((d) => d.aktif)
    .sort((a, b) => a.urutan - b.urutan)
    .map((d, i) => ({
      id: i + 1,
      title: d.judul,
      category: d.kategori,
      date: d.tanggal,
      downloads: 0,
      fileUrl: d.fileUrl || "#",
    }));

  // Use CMS documents
  const allDocs = cmsDocs;

  const docs = allDocs.filter((d) => {
    const matchCategory = d.category === category;
    const matchSearch =
      !search ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.date.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div>
      {/* Search */}
      <div className="mb-5">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40"
            style={{ color: "var(--foreground)" }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari dokumen..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-sm border focus:outline-none"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          />
        </div>
        <p
          className="text-[11px] mt-2 opacity-50"
          style={{ color: "var(--foreground)" }}
        >
          {docs.length} dokumen ditemukan
        </p>
      </div>

      {/* Document List */}
      {docs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm opacity-50" style={{ color: "var(--foreground)" }}>
            {emptyMessage || "Tidak ada dokumen yang sesuai dengan pencarian."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {docs.map((doc) => (
            <DokumenCard key={doc.id} doc={doc} />
          ))}
        </div>
      )}
    </div>
  );
}
