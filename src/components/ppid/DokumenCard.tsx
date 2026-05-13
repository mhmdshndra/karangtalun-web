"use client";

import { useState } from "react";
import { FileText, Download, Eye, Calendar, X, File, Hash, Tag } from "lucide-react";
import type { PpidDocument } from "@/core/types";

// ─── DOCUMENT PREVIEW MODAL ─────────────────────────────────
function DokumenPreviewModal({
  doc,
  onClose,
}: {
  doc: PpidDocument;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-[600px] max-h-[85vh] overflow-y-auto rounded-sm"
        style={{ background: "var(--background)", border: "1px solid var(--border)" }}
      >
        {/* Modal Header */}
        <div
          className="flex items-start justify-between gap-4 p-5"
          style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)" }}
        >
          <div className="flex-1 min-w-0">
            <p
              className="text-[10px] font-bold uppercase tracking-widest mb-1.5"
              style={{ color: "var(--primary)" }}
            >
              Preview Dokumen
            </p>
            <h3
              className="text-sm font-bold leading-snug"
              style={{ color: "var(--foreground)" }}
            >
              {doc.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-sm border transition-colors hover:border-red-400 shrink-0"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            aria-label="Tutup preview"
          >
            <X size={14} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Metadata */}
          <div
            className="grid grid-cols-2 gap-3 p-3.5 rounded-sm"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            {[
              { icon: Tag, label: "Kategori", value: doc.category },
              { icon: Calendar, label: "Tanggal", value: doc.date },
              { icon: Hash, label: "ID", value: `DOC-${String(doc.id).padStart(4, "0")}` },
              { icon: Download, label: "Diunduh", value: `${doc.downloads} kali` },
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-2 text-[11px]" style={{ color: "var(--foreground)" }}>
                <m.icon size={12} className="opacity-40 shrink-0" />
                <div>
                  <p className="opacity-40 text-[9px] uppercase tracking-wider">{m.label}</p>
                  <p className="font-semibold">{m.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Preview Placeholder */}
          <div
            className="rounded-sm p-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <File size={16} style={{ color: "var(--primary)" }} />
              <div>
                <p className="text-[11px] font-bold" style={{ color: "var(--foreground)" }}>
                  {doc.title.replace(/\s/g, "_")}.pdf
                </p>
                <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>
                  PDF Document • ~{Math.floor(Math.random() * 500 + 100)} KB
                </p>
              </div>
            </div>
            <div
              className="rounded-sm p-4 text-[11px] leading-relaxed"
              style={{
                background: "var(--background)",
                border: "1px dashed var(--border)",
                color: "var(--text-muted)",
              }}
            >
              <p className="mb-2">
                Dokumen <strong style={{ color: "var(--foreground)" }}>{doc.title}</strong> merupakan bagian dari informasi publik
                yang dikelola oleh PPID Desa Karangtalun sesuai dengan UU No. 14 Tahun 2008.
              </p>
              <p>
                Diterbitkan pada {doc.date}, diunduh {doc.downloads} kali.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <DownloadButton doc={doc} className="flex-1" />
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-[11px] font-bold rounded-sm border transition-colors hover:border-red-400"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DOWNLOAD BUTTON ─────────────────────────────────────────
function DownloadButton({
  doc,
  className = "",
}: {
  doc: PpidDocument;
  className?: string;
}) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    if (doc.fileUrl && doc.fileUrl !== "#") {
      // Open real file URL from backend
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api$/, "") || "http://localhost:8000";
      const url = doc.fileUrl.startsWith("http") ? doc.fileUrl : `${apiBase}/storage/${doc.fileUrl}`;
      window.open(url, "_blank");
    } else {
      alert("File dokumen belum tersedia.");
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className={`flex items-center justify-center gap-2 py-2.5 text-[11px] font-bold rounded-sm transition-colors disabled:opacity-50 ${className}`}
      style={{ background: "var(--primary)", color: "#fff" }}
    >
      <Download size={13} />
      {downloading ? "Mengunduh..." : `Unduh (${doc.downloads}×)`}
    </button>
  );
}

// ─── MAIN CARD COMPONENT ─────────────────────────────────────
export default function DokumenCard({ doc }: { doc: PpidDocument }) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 2,
          padding: "1rem 1.25rem",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "1rem",
          transition: "border-color 0.2s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
      >
        {/* Left: title + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            className="text-sm font-bold mb-1 leading-snug"
            style={{ color: "var(--foreground)" }}
          >
            {doc.title}
          </p>
          <div className="flex items-center gap-3 text-[10px]" style={{ color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1"><FileText size={10} /> {doc.category}</span>
            <span className="flex items-center gap-1"><Calendar size={10} /> {doc.date}</span>
          </div>
        </div>

        {/* Right: actions — compact row */}
        <div style={{ display: "flex", gap: "0.375rem", flexShrink: 0 }}>
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-semibold rounded-sm border transition-colors hover:border-primary"
            style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "transparent" }}
          >
            <Eye size={12} /> Lihat
          </button>
          <DownloadButton doc={doc} />
        </div>
      </div>

      {showPreview && (
        <DokumenPreviewModal doc={doc} onClose={() => setShowPreview(false)} />
      )}
    </>
  );
}
