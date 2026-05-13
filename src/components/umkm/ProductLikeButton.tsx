"use client";

import { useState, useCallback } from "react";
import { ThumbsUp } from "lucide-react";
import { publicPost } from "@/core/api/client";

interface ProductLikeButtonProps {
  productId: string | number;
  baseLikes: number;
  variant?: "card" | "detail";
}

export default function ProductLikeButton({
  productId,
  baseLikes,
  variant = "card",
}: ProductLikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(baseLikes);
  const [animating, setAnimating] = useState(false);

  const handleLike = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (liked) return;

      try {
        const res = await publicPost<{ success: boolean; data?: { likes: number } }>(
          `/cms/umkm/${productId}/like`
        );
        if (res.success && res.data) {
          setLiked(true);
          setLikeCount(res.data.likes);
          setAnimating(true);
          setTimeout(() => setAnimating(false), 400);
        }
      } catch {
        // Like gagal — tidak update UI
      }
    },
    [liked, productId],
  );

  if (variant === "card") {
    return (
      <button
        onClick={handleLike}
        className="flex items-center gap-1 text-[11px] transition-all duration-200"
        style={{
          color: liked ? "#fff" : "var(--primary)",
          background: liked ? "var(--primary)" : "transparent",
          border: liked ? "1px solid var(--primary)" : "1px solid transparent",
          borderRadius: 4,
          padding: liked ? "1px 6px" : "1px 2px",
          cursor: liked ? "default" : "pointer",
          transform: animating ? "scale(1.15)" : "scale(1)",
        }}
        title={liked ? "Sudah disukai" : "Suka produk ini"}
        aria-label={liked ? "Sudah disukai" : "Suka produk ini"}
      >
        <ThumbsUp size={11} fill={liked ? "currentColor" : "none"} strokeWidth={liked ? 0 : 2} />
        {likeCount} {liked ? "disukai" : "suka"}
      </button>
    );
  }

  return (
    <button
      onClick={handleLike}
      className="inline-flex items-center gap-2 transition-all duration-200"
      style={{
        color: liked ? "#fff" : "var(--primary)",
        background: liked ? "var(--primary)" : "rgba(var(--primary-rgb, 158,117,9), 0.08)",
        border: `1.5px solid ${liked ? "var(--primary)" : "rgba(var(--primary-rgb, 158,117,9), 0.25)"}`,
        borderRadius: 6,
        padding: "6px 14px",
        fontSize: "0.8125rem",
        fontWeight: 700,
        cursor: liked ? "default" : "pointer",
        transform: animating ? "scale(1.08)" : "scale(1)",
      }}
      title={liked ? "Sudah disukai" : "Suka produk ini"}
      aria-label={liked ? "Sudah disukai" : "Suka produk ini"}
    >
      <ThumbsUp size={16} fill={liked ? "currentColor" : "none"} strokeWidth={liked ? 0 : 2} />
      {likeCount} {liked ? "disukai" : "suka"}
    </button>
  );
}
