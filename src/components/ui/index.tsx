"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, Eye, Play, Tag, ArrowRight, Loader2, Inbox, AlertCircle, FileText, X } from "lucide-react";
import type { BeritaItem, UmkmProduct } from "@/core/types";
import type { CmsBerita, CmsUmkm } from "@/core/cms/cmsTypes";
import ProductLikeButton from "@/components/umkm/ProductLikeButton";

// ─── STATUS BADGE ────────────────────────────────────────────
type StatusVariant = "success" | "warning" | "danger" | "info" | "default";

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  size?: "sm" | "md";
}

const variantStyles: Record<StatusVariant, { bg: string; color: string }> = {
  success: { bg: "#dcfce7", color: "#166534" },
  warning: { bg: "#fef3c7", color: "#92400e" },
  danger: { bg: "#fee2e2", color: "#991b1b" },
  info: { bg: "#dbeafe", color: "#1e40af" },
  default: { bg: "var(--surface-hover)", color: "var(--foreground)" },
};

export function StatusBadge({ label, variant = "default", size = "sm" }: StatusBadgeProps) {
  const s = variantStyles[variant];
  return (
    <span
      className={`inline-flex items-center font-bold rounded uppercase tracking-wider ${size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"}`}
      style={{ background: s.bg, color: s.color }}
    >
      {label}
    </span>
  );
}

// ─── NEWS CARD ───────────────────────────────────────────────
interface NewsCardProps {
  item: BeritaItem | CmsBerita;
  variant?: "default" | "featured" | "compact";
}

export function NewsCard({ item, variant = "default" }: NewsCardProps) {
  const isVideo = item.tipe === "Video";

  if (variant === "compact") {
    return (
      <Link
        href={`/berita/${item.slug}`}
        className="flex gap-3 p-3 rounded transition-colors hover:bg-surface-hover group"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="relative w-16 h-16 shrink-0 rounded overflow-hidden bg-surface-hover">
          {item.thumbnail && (
            <Image src={item.thumbnail} alt={item.judul} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="64px" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold leading-snug line-clamp-2" style={{ color: "var(--foreground)" }}>{item.judul}</p>
          <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>{item.tanggal}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/berita/${item.slug}`}
      className="group govt-card overflow-hidden flex flex-col h-full"
    >
      <div className="relative h-48 overflow-hidden bg-surface-hover">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt={item.judul}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <AlertCircle size={40} style={{ color: "var(--foreground)" }} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border border-white/30">
              <Play size={16} className="text-white ml-0.5" />
            </div>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <StatusBadge label={item.kategori} variant="info" />
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-bold leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors" style={{ color: "var(--foreground)" }}>
          {item.judul}
        </h3>
        <p className="text-xs line-clamp-2 mb-3 flex-1" style={{ color: "var(--text-muted)" }}>{item.konten}</p>
        <div className="flex items-center justify-between text-[11px]" style={{ color: "var(--text-subtle)" }}>
          <span className="flex items-center gap-1"><Clock size={11} /> {item.tanggal}</span>
          <span className="flex items-center gap-1"><Eye size={11} /> {item.views.toLocaleString("id")}</span>
        </div>
      </div>
    </Link>
  );
}

// ─── PRODUCT CARD ────────────────────────────────────────────
interface ProductCardProps {
  product: UmkmProduct | CmsUmkm;
}

export function ProductCard({ product }: ProductCardProps) {
  // Normalize CMS vs legacy fields
  const isCms = "nama" in product && "namaPenjual" in product;
  const name = isCms ? (product as CmsUmkm).nama : (product as UmkmProduct).name;
  const seller = isCms ? (product as CmsUmkm).namaPenjual : (product as UmkmProduct).seller;
  const category = isCms ? (product as CmsUmkm).kategori : (product as UmkmProduct).category;
  const slug = product.slug;
  const price = isCms ? (product as CmsUmkm).harga : (product as UmkmProduct).price;
  const likes = isCms ? (product as CmsUmkm).likes : (product as UmkmProduct).likes;
  const rtRw = isCms ? (product as CmsUmkm).rtRw : (product as UmkmProduct).rt_rw;
  const image = isCms ? (product as CmsUmkm).foto : (product as UmkmProduct).images[0];
  const productId = product.id;

  return (
    <Link href={`/umkm/${slug}`} className="group govt-card overflow-hidden flex flex-col h-full">
      <div className="relative h-52 overflow-hidden bg-surface-hover">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 25vw"
        />
        <div className="absolute top-2 left-2">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded"
            style={{ background: "var(--accent-light)", color: "var(--accent)" }}
          >
            {category}
          </span>
        </div>
        {likes > 100 && (
          <div className="absolute top-2 right-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: "#dc2626", color: "white" }}>
              Favorit
            </span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-bold leading-snug mb-1 line-clamp-2 group-hover:text-primary transition-colors" style={{ color: "var(--foreground)" }}>
          {name}
        </h3>
        <p className="text-[11px] mb-3" style={{ color: "var(--text-muted)" }}>{seller}</p>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-base font-black" style={{ color: "var(--primary)" }}>
            Rp {price.toLocaleString("id")}
          </span>
          <ProductLikeButton productId={productId} baseLikes={likes} variant="card" />
        </div>
        <div className="mt-2 text-[11px]" style={{ color: "var(--text-subtle)" }}>
          {rtRw}
        </div>
      </div>
    </Link>
  );
}

// ─── EMPTY STATE ─────────────────────────────────────────────
interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = "Tidak ada data",
  description = "Belum ada konten yang tersedia.",
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 opacity-20" style={{ color: "var(--foreground)" }}>
        {icon || <Inbox size={48} />}
      </div>
      <h4 className="text-sm font-bold mb-1" style={{ color: "var(--foreground)" }}>{title}</h4>
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{description}</p>
    </div>
  );
}

// ─── LOADING STATE ───────────────────────────────────────────
interface LoadingStateProps {
  message?: string;
  rows?: number;
}

export function LoadingState({ message = "Memuat data...", rows = 3 }: LoadingStateProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-4 rounded mb-2" style={{ background: "var(--surface-hover)", width: `${70 + (i % 3) * 10}%` }} />
          <div className="h-3 rounded" style={{ background: "var(--surface-hover)", width: "50%" }} />
        </div>
      ))}
      <div className="flex items-center justify-center gap-2 py-4 opacity-50" style={{ color: "var(--foreground)" }}>
        <Loader2 size={16} className="animate-spin" />
        <span className="text-xs">{message}</span>
      </div>
    </div>
  );
}

// ─── FORM FIELD ──────────────────────────────────────────────
interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "tel" | "number" | "textarea" | "select" | "file";
  value?: string;
  placeholder?: string;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  hint?: string;
  options?: { value: string; label: string }[];
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  /** For type="file": receives the File object (or null on remove) */
  onFileSelect?: (file: File | null) => void;
  /** For type="file": the currently selected File (used to show name/size) */
  selectedFile?: File | null;
  disabled?: boolean;
  rows?: number;
  accept?: string;
}

export function FormField({
  label,
  name,
  type = "text",
  value,
  placeholder,
  required,
  error,
  errorMessage,
  hint,
  options,
  onChange,
  onFileSelect,
  selectedFile,
  disabled,
  rows = 4,
  accept,
}: FormFieldProps) {
  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: error ? "#fff5f5" : "var(--surface)",
    border: `1px solid ${error ? "#dc2626" : "var(--border)"}`,
    borderRadius: "2px",
    padding: "10px 12px",
    fontSize: "14px",
    color: "var(--foreground)",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileSelect?.(file);
  };

  const handleFileRemove = () => {
    onFileSelect?.(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--foreground)" }}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {type === "textarea" ? (
        <textarea
          name={name}
          value={value}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          onChange={onChange}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      ) : type === "select" ? (
        <select name={name} value={value} required={required} disabled={disabled} onChange={onChange} style={inputStyle}>
          <option value="">-- {placeholder || `Pilih ${label}`} --</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : type === "file" ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            name={name}
            disabled={disabled}
            accept={accept || ".pdf,.jpg,.jpeg,.png"}
            onChange={handleFileChange}
            style={{ display: selectedFile ? "none" : "block", ...inputStyle, padding: "8px 12px" }}
          />
          {selectedFile && (
            <div
              className="flex items-center gap-3 p-3 rounded"
              style={{
                border: `1px solid ${error ? "#dc2626" : "#16a34a"}`,
                background: error ? "#fff5f5" : "#f0fdf4",
              }}
            >
              <div
                className="w-8 h-8 rounded flex items-center justify-center shrink-0"
                style={{
                  background: selectedFile.type === "application/pdf" ? "#fee2e2" : "#dbeafe",
                  color: selectedFile.type === "application/pdf" ? "#dc2626" : "#2563eb",
                }}
              >
                <FileText size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate" style={{ color: "var(--foreground)" }}>
                  {selectedFile.name}
                </p>
                <p className="text-[10px] opacity-50">{formatFileSize(selectedFile.size)}</p>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={handleFileRemove}
                  className="p-1.5 rounded transition-colors"
                  style={{ color: "#dc2626" }}
                  title="Hapus file"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          onChange={onChange}
          style={inputStyle}
        />
      )}

      {error && errorMessage && (
        <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
          <AlertCircle size={11} /> {errorMessage}
        </p>
      )}
      {hint && !error && (
        <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>{hint}</p>
      )}
    </div>
  );
}

// ─── SECTION HEADER ──────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  border?: boolean;
}

export function SectionHeader({ title, subtitle, action, border = true }: SectionHeaderProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8 ${border ? "pb-4" : ""}`}
      style={border ? { borderBottom: "1px solid var(--border)" } : {}}
    >
      <div>
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight" style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}>
          {title}
        </h2>
        {subtitle && <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
