"use client";

import { useState } from "react";
import Image from "next/image";
import { ASSETS, getLogoFallbackInitials } from "@/core/constants/assets";

interface DesaLogoProps {
  size?: number;
  variant?: "default" | "white";
  className?: string;
}

/**
 * Reusable village logo component.
 * No frame/border — logo displays in its natural shape.
 */
export default function DesaLogo({ size = 36, variant = "default", className = "" }: DesaLogoProps) {
  const [imgError, setImgError] = useState(false);

  const src = variant === "white" ? ASSETS.logos.desaWhite : ASSETS.logos.desa;

  if (imgError) {
    return (
      <div
        className={`flex items-center justify-center font-bold shrink-0 ${className}`}
        style={{
          width: size,
          height: size,
          color: variant === "white" ? "rgba(255,255,255,0.7)" : "var(--primary)",
          fontSize: size * 0.33,
          letterSpacing: "0.05em",
        }}
      >
        {getLogoFallbackInitials()}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt="Logo Desa Karangtalun"
      width={size}
      height={size}
      className={`object-contain shrink-0 ${className}`}
      style={{
        /* No background, no border, no frame — pure logo shape */
        background: "transparent",
        border: "none",
        borderRadius: 0,
      }}
      onError={() => setImgError(true)}
      priority
    />
  );
}
