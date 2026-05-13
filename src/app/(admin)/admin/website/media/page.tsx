"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Media & Aset page has been removed.
 * Logo, favicon, and default images are now static assets in public/assets/.
 * Foto Kepala Desa is managed in Profil Desa → Sambutan.
 */
export default function MediaPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/website/profil-desa");
  }, [router]);
  return null;
}
