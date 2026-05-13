/**
 * Shared public form validation utilities.
 * All validators return an error message string or empty string if valid.
 */

/** NIK must be exactly 16 digits */
export function validateNIK(value: string): string {
  const cleaned = value.replace(/\s/g, "");
  if (!cleaned) return "NIK wajib diisi.";
  if (!/^\d+$/.test(cleaned)) return "NIK hanya boleh berisi angka.";
  if (cleaned.length !== 16) return "NIK harus terdiri dari 16 digit.";
  return "";
}

/** Phone number: Indonesian format, 10-15 digits, starts with 08 or +62 */
export function validatePhone(value: string): string {
  const cleaned = value.replace(/[\s\-()]/g, "");
  if (!cleaned) return "Nomor telepon wajib diisi.";
  // Allow +62 or 08 prefix
  if (/^\+62\d{8,13}$/.test(cleaned)) return "";
  if (/^08\d{8,12}$/.test(cleaned)) return "";
  return "Nomor telepon tidak valid. Gunakan format 08xxxxxxxxxx atau +62xxxxxxxxxx.";
}

/** Email: basic RFC-like check, only used when field is non-empty (optional) */
export function validateEmail(value: string): string {
  if (!value.trim()) return ""; // empty = valid for optional fields
  const pattern = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  if (!pattern.test(value.trim())) return "Format email tidak valid.";
  return "";
}

/** Required email (must be non-empty AND valid) */
export function validateEmailRequired(value: string): string {
  if (!value.trim()) return "Email wajib diisi.";
  return validateEmail(value);
}

/** Required text with minimum length */
export function validateText(value: string, label: string, minLength = 1): string {
  const trimmed = (value || "").trim();
  if (!trimmed) return `${label} wajib diisi.`;
  if (minLength > 1 && trimmed.length < minLength) {
    return `${label} minimal ${minLength} karakter.`;
  }
  return "";
}

/** Required select field */
export function validateSelect(value: string, label: string): string {
  if (!value || value.trim() === "") return `${label} wajib dipilih.`;
  return "";
}

/** File validation: type and size */
export function validateFile(
  file: File | null | undefined,
  label: string,
  options: {
    required?: boolean;
    maxSizeMB?: number;
    allowedTypes?: string[];
  } = {}
): string {
  const { required = false, maxSizeMB = 5, allowedTypes = ["image/jpeg", "image/png", "application/pdf"] } = options;

  if (!file) {
    return required ? `${label} wajib diunggah.` : "";
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    const exts = allowedTypes.map((t) => {
      if (t === "image/jpeg") return "JPG";
      if (t === "image/png") return "PNG";
      if (t === "application/pdf") return "PDF";
      return t.split("/")[1]?.toUpperCase() || t;
    });
    return `Format file tidak didukung. Gunakan: ${exts.join(", ")}.`;
  }

  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > maxSizeMB) {
    return `Ukuran file maksimal ${maxSizeMB}MB. File Anda: ${sizeMB.toFixed(1)}MB.`;
  }

  return "";
}

/** Generic required check */
export function validateRequired(value: string, label: string): string {
  if (!value || value.trim() === "") return `${label} wajib diisi.`;
  return "";
}

/** Textarea with min length for description fields */
export function validateTextarea(value: string, label: string, minLength = 10): string {
  const trimmed = (value || "").trim();
  if (!trimmed) return `${label} wajib diisi.`;
  if (trimmed.length < minLength) {
    return `${label} minimal ${minLength} karakter.`;
  }
  return "";
}

// ─── Input Sanitization ─────────────────────────────────────

/**
 * Sanitize plain-text input: strip HTML tags and encode dangerous characters.
 * Use on all user-submitted text before storing or displaying.
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Strip all HTML tags entirely (for display contexts where entities aren't wanted).
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

/**
 * Sanitize a URL: only allow http/https/mailto/tel protocols.
 * Returns empty string for javascript:, data:, vbscript: etc.
 */
export function sanitizeUrl(url: string): string {
  const trimmed = (url || "").trim();
  if (!trimmed) return "";
  try {
    const parsed = new URL(trimmed, "https://placeholder.local");
    if (["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol)) return trimmed;
  } catch { /* invalid URL */ }
  return "";
}
