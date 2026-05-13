"use client";

import { useState, useRef } from "react";
import { X, Save, CheckCircle, Trash2, Plus, AlertTriangle, Image as ImageIcon, Upload } from "lucide-react";

// ── Save Button ──
export function SaveButton({ onClick, saving }: { onClick: () => void | Promise<void>; saving: boolean }) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const handleClick = async () => {
    setStatus("saving");
    try {
      await onClick();
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (e) {
      setStatus("error");
      alert(e instanceof Error ? e.message : "Gagal menyimpan data.");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };
  const isBusy = saving || status === "saving";
  return (
    <button onClick={handleClick} disabled={isBusy}
      className="flex items-center gap-2 px-4 py-2.5 rounded text-xs font-bold transition-all"
      style={{ background: status === "saved" ? "#16a34a" : status === "error" ? "#dc2626" : "#dc2626", color: "#fff" }}>
      {status === "saved" ? <CheckCircle size={14} /> : isBusy ? <Save size={14} className="animate-spin" /> : <Save size={14} />}
      {status === "saved" ? "Tersimpan!" : isBusy ? "Menyimpan..." : status === "error" ? "Gagal!" : "Simpan"}
    </button>
  );
}

// ── Page Header ──
export function CmsPageHeader({ title, subtitle, children }: { title: string; subtitle: string; children?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 className="text-xl font-black" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{title}</h1>
        <p className="text-sm opacity-50 mt-1">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

// ── Form Field ──
export function FormField({ label, children, span2 }: { label: string; children?: React.ReactNode; span2?: boolean }) {
  return (
    <div className={span2 ? "sm:col-span-2" : ""}>
      <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1.5 block" style={{ color: "var(--foreground)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// ── Text Input ──
export function TextInput({ value, onChange, placeholder, type = "text", readOnly }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; readOnly?: boolean;
}) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} readOnly={readOnly}
      className="w-full px-3 py-2 rounded border text-xs outline-none"
      style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }} />
  );
}

// ── Textarea ──
export function TextArea({ value, onChange, placeholder, rows = 4 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      className="w-full px-3 py-2 rounded border text-xs outline-none resize-y"
      style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }} />
  );
}

// ── Select ──
export function SelectInput({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded border text-xs outline-none"
      style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ── Toggle ──
export function Toggle({ value, onChange, labelOn = "Aktif", labelOff = "Nonaktif" }: {
  value: boolean; onChange: (v: boolean) => void; labelOn?: string; labelOff?: string;
}) {
  return (
    <button onClick={() => onChange(!value)} className="flex items-center gap-2 text-xs font-bold">
      <div className="w-9 h-5 rounded-full relative transition-colors" style={{ background: value ? "#16a34a" : "var(--border)" }}>
        <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm" style={{ left: value ? 18 : 2 }} />
      </div>
      <span style={{ color: value ? "#16a34a" : "var(--foreground)", opacity: value ? 1 : 0.5 }}>{value ? labelOn : labelOff}</span>
    </button>
  );
}

// ── Confirm Delete Modal ──
export function ConfirmDeleteModal({ open, onClose, onConfirm, itemName }: {
  open: boolean; onClose: () => void; onConfirm: () => void; itemName: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="w-full max-w-sm rounded-lg p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#fef2f2", color: "#dc2626" }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Hapus Data?</p>
            <p className="text-xs opacity-50">Apakah Anda yakin ingin menghapus &quot;{itemName}&quot;?</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded text-xs font-bold border" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>Batal</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="px-4 py-2 rounded text-xs font-bold" style={{ background: "#dc2626", color: "#fff" }}>
            <Trash2 size={12} className="inline mr-1" /> Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Empty State ──
export function CmsEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="govt-card p-12 text-center">
      <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: "var(--surface-hover)" }}>
        <Plus size={20} style={{ color: "var(--foreground)", opacity: 0.3 }} />
      </div>
      <p className="text-sm font-bold opacity-50">{title}</p>
      <p className="text-xs opacity-30 mt-1">{description}</p>
    </div>
  );
}

// ── Image Preview Upload — stores File object for real upload ──
// Global file registry: CMS store reads from here when building FormData.
// Key = field name set by each admin page, Value = File object.
export const __pendingFiles: Map<string, File> = new Map();

export function ImageUploadPreview({ value, onChange, label, fileField }: {
  value: string; onChange: (v: string) => void; label: string;
  /** Backend field name for this image (e.g. "thumbnail", "foto", "gambar", "foto_kades"). Defaults to label-derived key. */
  fileField?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const safeValue = value || "";
  const fieldKey = fileField || label.toLowerCase().replace(/\s+/g, "_");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      alert("Format file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.");
      if (ref.current) ref.current.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5 MB.");
      if (ref.current) ref.current.value = "";
      return;
    }
    // Store File object in registry for FormData upload
    __pendingFiles.set(fieldKey, file);
    // Generate preview for UI
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onChange(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    __pendingFiles.delete(fieldKey);
    onChange("");
    if (ref.current) ref.current.value = "";
  };

  // Determine preview src: base64 (new upload) or URL from backend
  const isDataUri = safeValue.startsWith("data:");
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api$/, "") || "";
  const previewSrc = safeValue && !isDataUri && !safeValue.startsWith("http")
    ? `${apiBase}/storage/${safeValue}`
    : safeValue;

  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1.5 block">{label}</label>
      <div className="flex items-center gap-3">
        {previewSrc ? (
          <div className="w-16 h-16 rounded border overflow-hidden shrink-0 relative" style={{ borderColor: "var(--border)" }}>
            <img src={previewSrc} alt={label} className="w-full h-full object-cover" />
            <button onClick={handleClear} className="absolute top-0 right-0 p-0.5 rounded-bl" style={{ background: "#dc2626", color: "#fff" }}><X size={10} /></button>
          </div>
        ) : (
          <div className="w-16 h-16 rounded border flex items-center justify-center shrink-0" style={{ borderColor: "var(--border)", background: "var(--surface-hover)" }}>
            <ImageIcon size={16} style={{ color: "var(--foreground)", opacity: 0.3 }} />
          </div>
        )}
        <div className="flex-1">
          <input type="text" value={isDataUri ? "(file dipilih)" : safeValue} onChange={(e) => { __pendingFiles.delete(fieldKey); onChange(e.target.value); }} placeholder="URL gambar atau upload file"
            className="w-full px-3 py-2 rounded border text-xs outline-none mb-1"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }} />
          <button onClick={() => ref.current?.click()} className="flex items-center gap-1 text-[10px] font-bold" style={{ color: "#dc2626" }}>
            <Upload size={10} /> Upload File
          </button>
          <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
      </div>
    </div>
  );
}

// ── Add Button ──
export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 px-4 py-2.5 rounded text-xs font-bold"
      style={{ background: "#dc2626", color: "#fff" }}>
      <Plus size={14} /> {label}
    </button>
  );
}

// ── Section Card ──
export function SectionCard({ title, icon, children }: { title: string; icon?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="govt-card overflow-hidden">
      <div className="px-5 py-3 flex items-center gap-3" style={{ background: "var(--surface-hover)", borderBottom: "1px solid var(--border)" }}>
        {icon}
        <h2 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
