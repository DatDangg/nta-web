/**
 * Bảng màu thẻ ở trang danh sách (ảnh mẫu "Ứng dụng AI"): mỗi thẻ có nền gradient nhạt,
 * ô icon gradient đậm, chip cùng tông. Lớp Tailwind viết đầy đủ (không ghép chuỗi) để JIT quét được.
 */
export type ListingTheme = 'violet' | 'rose' | 'sky' | 'teal' | 'amber' | 'emerald' | 'indigo';

export interface ListingThemeClasses {
  /** Nền thẻ. */
  card: string;
  /** Ô icon (gradient đậm + bóng màu). */
  tile: string;
  /** Chip nhãn. */
  chip: string;
  /** Quầng sáng sau ảnh. */
  glow: string;
  /** Màu chữ nhấn (nhãn trạng thái). */
  ink: string;
}

export const listingThemes: Record<ListingTheme, ListingThemeClasses> = {
  violet: {
    card: 'bg-[linear-gradient(120deg,#ffffff_0%,#f8f2ff_45%,#efe2ff_100%)]',
    tile: 'bg-[linear-gradient(140deg,#c084fc_0%,#8b5cf6_55%,#6d28d9_100%)] shadow-[0_10px_24px_-6px_rgb(139_92_246/0.55)]',
    chip: 'bg-[#f1e8ff] text-[#6d28d9]',
    glow: 'bg-[#c084fc]',
    ink: 'text-[#6d28d9]',
  },
  rose: {
    card: 'bg-[linear-gradient(120deg,#ffffff_0%,#fff4f5_45%,#ffe4e8_100%)]',
    tile: 'bg-[linear-gradient(140deg,#fda4af_0%,#fb7185_50%,#e11d48_100%)] shadow-[0_10px_24px_-6px_rgb(244_63_94/0.5)]',
    chip: 'bg-[#ffe4e8] text-[#be123c]',
    glow: 'bg-[#fda4af]',
    ink: 'text-[#be123c]',
  },
  sky: {
    card: 'bg-[linear-gradient(120deg,#ffffff_0%,#f1f8ff_45%,#dfefff_100%)]',
    tile: 'bg-[linear-gradient(140deg,#7dd3fc_0%,#3b82f6_55%,#2563eb_100%)] shadow-[0_10px_24px_-6px_rgb(59_130_246/0.5)]',
    chip: 'bg-[#e0efff] text-[#1d4ed8]',
    glow: 'bg-[#93c5fd]',
    ink: 'text-[#1d4ed8]',
  },
  teal: {
    card: 'bg-[linear-gradient(120deg,#ffffff_0%,#effbf8_45%,#d9f5ee_100%)]',
    tile: 'bg-[linear-gradient(140deg,#5eead4_0%,#14b8a6_50%,#00806e_100%)] shadow-[0_10px_24px_-6px_rgb(0_158_135/0.5)]',
    chip: 'bg-[#d9f5ee] text-[#00695a]',
    glow: 'bg-[#5eead4]',
    ink: 'text-[#00695a]',
  },
  amber: {
    card: 'bg-[linear-gradient(120deg,#ffffff_0%,#fff9ef_45%,#ffefd6_100%)]',
    tile: 'bg-[linear-gradient(140deg,#fcd34d_0%,#f59e0b_50%,#ea580c_100%)] shadow-[0_10px_24px_-6px_rgb(245_158_11/0.5)]',
    chip: 'bg-[#ffefd6] text-[#a85c00]',
    glow: 'bg-[#fcd34d]',
    ink: 'text-[#a85c00]',
  },
  emerald: {
    card: 'bg-[linear-gradient(120deg,#ffffff_0%,#f0fbf3_45%,#dcf5e3_100%)]',
    tile: 'bg-[linear-gradient(140deg,#86efac_0%,#22c55e_50%,#15803d_100%)] shadow-[0_10px_24px_-6px_rgb(34_197_94/0.5)]',
    chip: 'bg-[#dcf5e3] text-[#15803d]',
    glow: 'bg-[#86efac]',
    ink: 'text-[#15803d]',
  },
  indigo: {
    card: 'bg-[linear-gradient(120deg,#ffffff_0%,#f3f4ff_45%,#e3e6ff_100%)]',
    tile: 'bg-[linear-gradient(140deg,#a5b4fc_0%,#6366f1_55%,#4338ca_100%)] shadow-[0_10px_24px_-6px_rgb(99_102_241/0.5)]',
    chip: 'bg-[#e3e6ff] text-[#4338ca]',
    glow: 'bg-[#a5b4fc]',
    ink: 'text-[#4338ca]',
  },
};
