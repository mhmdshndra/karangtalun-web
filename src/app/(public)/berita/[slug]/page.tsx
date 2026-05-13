"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, Eye, User, Tag, ArrowLeft, Share2, Printer, Play } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { NewsCard, EmptyState, StatusBadge } from "@/components/ui/index";
import { useCms } from "@/core/cms/useCmsStore";
import { publicPost } from "@/core/api/client";


export default function BeritaDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { cms } = useCms();

  // CMS berita only
  const cmsBeritaTerbit = cms.berita.filter((b) => b.status === "Terbit");
  const berita = cmsBeritaTerbit.find((b) => b.slug === slug);
  const allTerbit = cmsBeritaTerbit;
  const related = allTerbit.filter((b) => b.slug !== slug).slice(0, 3);

  // Increment view count once
  const viewedRef = useRef(false);
  useEffect(() => {
    if (slug && !viewedRef.current) {
      viewedRef.current = true;
      publicPost(`/cms/berita/${slug}/view`, {}).catch(() => {});
    }
  }, [slug]);

  if (!berita) {
    return (
      <div style={{ background: "var(--background)", minHeight: "100vh" }}>
        <Breadcrumb items={[{ label: "Berita", href: "/berita" }, { label: "Tidak Ditemukan" }]} />
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-20">
          <EmptyState title="Artikel tidak ditemukan" description="Mungkin artikel telah dihapus atau URL tidak valid." />
          <div className="text-center mt-6">
            <Link
              href="/berita"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-sm"
              style={{ background: "var(--primary)", color: "white" }}
            >
              <ArrowLeft size={16} /> Kembali ke Berita
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isVideo = berita.tipe === "Video";

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: berita.judul, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      const btn = document.activeElement as HTMLButtonElement;
      if (btn) { const orig = btn.textContent; btn.textContent = "✓ Tersalin!"; setTimeout(() => { btn.textContent = orig; }, 2000); }
    }
  };

  const handlePrint = () => window.print();

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh" }}>
      <Breadcrumb
        items={[
          { label: "Berita", href: "/berita" },
          { label: berita.judul },
        ]}
      />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Article */}
          <article className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <StatusBadge label={berita.kategori} variant="info" size="md" />
              {isVideo && <StatusBadge label="Video" variant="warning" size="md" />}
            </div>

            <h1
              className="text-2xl md:text-4xl font-black leading-tight mb-6"
              style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}
            >
              {berita.judul}
            </h1>

            <div
              className="flex flex-wrap items-center gap-4 text-xs pb-6 mb-6"
              style={{ borderBottom: "1px solid var(--border)", color: "var(--foreground)", opacity: 0.6 }}
            >
              <span className="flex items-center gap-1.5"><User size={13} /> {berita.penulis}</span>
              <span className="flex items-center gap-1.5"><Clock size={13} /> {berita.tanggal}, {berita.waktu}</span>
              <span className="flex items-center gap-1.5"><Eye size={13} /> {berita.views.toLocaleString("id")} views</span>
            </div>

            {isVideo && berita.linkVideo ? (
              <div className="relative w-full mb-8 rounded-sm overflow-hidden" style={{ aspectRatio: "16/9" }}>
                <iframe
                  src={berita.linkVideo.replace("watch?v=", "embed/")}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                  title={berita.judul}
                />
              </div>
            ) : berita.thumbnail ? (
              <div className="relative w-full h-72 md:h-96 mb-8 rounded-sm overflow-hidden">
                <Image src={berita.thumbnail} alt={berita.judul} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 70vw" />
              </div>
            ) : null}

            <div
              className="prose max-w-none text-sm leading-relaxed mb-10"
              style={{ color: "var(--foreground)" }}
            >
              {berita.konten.split(". ").map((sentence, i) => (
                <p key={i} className="mb-4">{sentence}{sentence.endsWith(".") ? "" : "."}</p>
              ))}
            </div>

            <div
              className="flex items-center gap-3 pt-6"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-sm border transition-colors hover:border-primary"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                <Share2 size={14} /> Bagikan
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-sm border transition-colors hover:border-primary"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                <Printer size={14} /> Cetak
              </button>
              <Link
                href="/berita"
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-sm border transition-colors hover:border-primary ml-auto"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                <ArrowLeft size={14} /> Kembali
              </Link>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:w-80 xl:w-96 shrink-0">
            <div
              className="sticky top-24 rounded-sm p-6"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <h3
                className="text-xs font-bold uppercase tracking-widest mb-4 pb-3"
                style={{ color: "var(--foreground)", borderBottom: "1px solid var(--border)" }}
              >
                Berita Terkait
              </h3>
              <div className="space-y-0">
                {related.map((item) => (
                  <NewsCard key={item.id} item={item} variant="compact" />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
