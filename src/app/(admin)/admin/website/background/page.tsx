"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Background CMS page has been removed.
 * Hero backgrounds are now served as static files from public/assets/backgrounds/.
 * This page redirects to the admin dashboard.
 */
export default function BackgroundPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/dashboard");
  }, [router]);

  return (
    <div className="p-8 text-center" style={{ color: "var(--text-muted)" }}>
      <p className="text-sm">Halaman ini sudah tidak tersedia. Background dikelola sebagai file statis.</p>
    </div>
  );
}
