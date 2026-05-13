"use client";

import { useState, useRef } from "react";
import {
  Upload, X, FileText, Download, Eye, Loader2,
} from "lucide-react";
import { upload as apiUpload } from "@/core/api/client";

interface FileUploadProps {
  files: string[];
  onUpload: (filename: string) => void;
  /** Called with actual File object — use this for FormData submit */
  onFileSelect?: (file: File) => void;
  onRemove?: (filename: string) => void;
  onDownload?: (filename: string) => void;
  onPreview?: (filename: string) => void;
  /** Backend endpoint to upload to — optional */
  uploadEndpoint?: string;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
  label?: string;
}

export default function FileUpload({
  files,
  onUpload,
  onFileSelect,
  onRemove,
  onDownload,
  onPreview,
  uploadEndpoint,
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSizeMB = 5,
  disabled = false,
  label = "Upload Berkas",
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (disabled || uploading) return;
    setError("");

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Ukuran file melebihi batas ${maxSizeMB}MB.`);
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    const allowed = accept.split(",").map((a) => a.trim().replace(".", "").toLowerCase());
    if (ext && !allowed.includes(ext)) {
      setError(`Format file .${ext} tidak diizinkan. Gunakan: ${accept}`);
      return;
    }

    setUploading(true);

    // Always provide the File object to onFileSelect if available
    if (onFileSelect) {
      onFileSelect(file);
      onUpload(file.name);
    } else if (uploadEndpoint) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await apiUpload<{ success: boolean; data?: { filename: string }; message?: string }>(uploadEndpoint, fd);
        if (res.success && res.data?.filename) {
          onUpload(res.data.filename);
        } else {
          setError(res.message || "Upload gagal.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload gagal.");
      }
    } else {
      // No endpoint and no onFileSelect — just track filename for display
      onUpload(file.name);
    }

    setUploading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDownload = (filename: string) => {
    if (onDownload) { onDownload(filename); return; }
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api$/, "") || "http://localhost:8000";
    window.open(`${apiBase}/storage/${filename}`, "_blank");
  };

  return (
    <div className="space-y-3">
      <input ref={inputRef} type="file" accept={accept} onChange={handleInputChange} className="hidden" />

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${dragOver ? "scale-[1.01]" : ""}`}
        style={{
          borderColor: dragOver ? "var(--primary)" : "var(--border)",
          background: dragOver ? "var(--accent-light)" : "transparent",
          opacity: disabled ? 0.5 : 1,
        }}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={24} className="animate-spin" style={{ color: "var(--primary)" }} />
            <p className="text-xs font-bold" style={{ color: "var(--foreground)" }}>Mengunggah file...</p>
          </div>
        ) : (
          <>
            <Upload size={24} className="mx-auto mb-2 opacity-30" style={{ color: "var(--primary)" }} />
            <p className="text-xs font-bold mb-1" style={{ color: "var(--foreground)" }}>{label}</p>
            <p className="text-[10px] opacity-40">PDF, JPG, PNG — Maks {maxSizeMB}MB</p>
          </>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => {
            const isPdf = f.toLowerCase().endsWith(".pdf");
            const isImg = /\.(jpg|jpeg|png)$/i.test(f);
            const ext = f.split(".").pop()?.toUpperCase() || "FILE";
            return (
              <div key={i} className="flex items-center gap-3 p-3 rounded border transition-colors"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                <div className="w-9 h-9 rounded flex items-center justify-center shrink-0"
                  style={{
                    background: isPdf ? "#fee2e2" : isImg ? "#dbeafe" : "var(--surface-hover)",
                    color: isPdf ? "#dc2626" : isImg ? "#2563eb" : "var(--foreground)",
                  }}>
                  <FileText size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate" style={{ color: "var(--foreground)" }}>{f}</p>
                  <p className="text-[10px] opacity-40">{ext}</p>
                </div>
                <div className="flex items-center gap-1">
                  {onPreview && (
                    <button onClick={() => onPreview(f)} className="p-1.5 rounded hover:bg-surface-hover transition-colors" title="Preview">
                      <Eye size={13} className="opacity-40 hover:opacity-100" />
                    </button>
                  )}
                  <button onClick={() => handleDownload(f)} className="p-1.5 rounded hover:bg-surface-hover transition-colors" title="Download">
                    <Download size={13} className="opacity-40 hover:opacity-100" style={{ color: "var(--primary)" }} />
                  </button>
                  {onRemove && (
                    <button onClick={() => onRemove(f)} className="p-1.5 rounded hover:bg-surface-hover transition-colors" title="Hapus">
                      <X size={13} className="opacity-40 hover:opacity-100" style={{ color: "#dc2626" }} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
