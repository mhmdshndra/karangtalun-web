"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag, Phone, MapPin, ArrowLeft, Share2, Tag, ChevronRight
} from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { ProductCard, EmptyState } from "@/components/ui/index";
import ProductLikeButton from "@/components/umkm/ProductLikeButton";
import { useCms } from "@/core/cms/useCmsStore";


export default function UmkmDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { cms } = useCms();
  const [activeImg, setActiveImg] = useState(0);

  // CMS umkm only
  const cmsUmkm = cms.umkm.filter((u) => u.aktif);
  const cmsProduct = cmsUmkm.find((u) => u.slug === slug);

  if (!cmsProduct) {
    return (
      <div style={{ background: "var(--background)", minHeight: "100vh" }}>
        <Breadcrumb items={[{ label: "UMKM", href: "/umkm" }, { label: "Tidak Ditemukan" }]} />
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-20">
          <EmptyState title="Produk tidak ditemukan" />
          <div className="text-center mt-6">
            <Link href="/umkm" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-sm" style={{ background: "var(--primary)", color: "white" }}>
              <ArrowLeft size={16} /> Kembali ke UMKM
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // CMS fields
  const name = cmsProduct.nama;
  const seller = cmsProduct.namaPenjual;
  const category = cmsProduct.kategori;
  const price = cmsProduct.harga;
  const likes = cmsProduct.likes;
  const rtRw = cmsProduct.rtRw;
  const whatsapp = cmsProduct.whatsapp;
  const description = cmsProduct.deskripsi;
  const images = [cmsProduct.foto];
  const productId = cmsProduct.id;

  // Related products
  const relatedItems = cmsUmkm.filter((p) => p.kategori === category && p.slug !== slug).slice(0, 4);

  const handleOrder = () => {
    const msg = encodeURIComponent(
      `Halo, saya tertarik memesan: *${name}*\nHarga: Rp ${price.toLocaleString("id")}\n\nApakah masih tersedia?`
    );
    window.open(`https://wa.me/${whatsapp}?text=${msg}`, "_blank");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      const btn = document.activeElement as HTMLButtonElement;
      if (btn) { const orig = btn.textContent; btn.textContent = "✓ Tersalin!"; setTimeout(() => { btn.textContent = orig; }, 2000); }
    }
  };

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh" }}>
      <Breadcrumb
        items={[
          { label: "UMKM", href: "/umkm" },
          { label: category, href: "/umkm" },
          { label: name },
        ]}
      />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div>
            <div className="relative w-full rounded-sm overflow-hidden mb-3" style={{ aspectRatio: "1/1", border: "1px solid var(--border)" }}>
              <Image
                src={images[activeImg]}
                alt={name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className="relative w-16 h-16 rounded-sm overflow-hidden border-2 transition-all"
                    style={{ borderColor: activeImg === i ? "var(--primary)" : "var(--border)" }}
                  >
                    <Image src={img} alt={`Foto ${i + 1}`} fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                {category}
              </span>
              {likes > 100 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: "#fee2e2", color: "#991b1b" }}>
                  Favorit
                </span>
              )}
            </div>

            <h1
              className="text-2xl md:text-3xl font-black mb-3 leading-tight"
              style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}
            >
              {name}
            </h1>

            <div className="flex items-center gap-4 mb-4">
              <ProductLikeButton productId={productId} baseLikes={likes} variant="detail" />
            </div>

            <p
              className="text-3xl font-black mb-6"
              style={{ color: "var(--primary)" }}
            >
              Rp {price.toLocaleString("id")}
            </p>

            {/* Seller Info */}
            <div
              className="p-4 rounded-sm mb-6"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <p className="text-xs font-bold uppercase tracking-widest mb-3 opacity-50" style={{ color: "var(--foreground)" }}>Informasi Penjual</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={14} style={{ color: "var(--primary)" }} />
                  <span className="font-bold" style={{ color: "var(--foreground)" }}>{seller}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} style={{ color: "var(--primary)" }} />
                  <span className="opacity-70" style={{ color: "var(--foreground)" }}>{rtRw}, Desa Karangtalun</span>
                </div>
              </div>
            </div>

            <p className="text-sm leading-relaxed mb-8 opacity-70" style={{ color: "var(--foreground)" }}>
              {description}
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleOrder}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 font-bold text-sm rounded-sm transition-all hover:opacity-90"
                style={{ background: "#25d366", color: "white" }}
              >
                <Phone size={16} /> Pesan via WhatsApp
              </button>
              <button
                onClick={handleShare}
                className="w-12 flex items-center justify-center rounded-sm border transition-colors hover:border-primary"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Related */}
        {relatedItems.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <h2 className="text-xl font-black uppercase" style={{ color: "var(--foreground)" }}>Produk Serupa</h2>
              <Link href="/umkm" className="text-xs font-bold flex items-center gap-1" style={{ color: "var(--primary)" }}>
                Lihat Semua <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedItems.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
