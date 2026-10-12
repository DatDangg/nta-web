/**
 * Màu "sân khấu" riêng cho từng app ở trang /products (showcase zig-zag).
 * Lấy theo tông ảnh poster của app (nhạc: tím→hồng, tóc: hồng phấn) để nền không đá màu với ảnh.
 * Slug không có trong map → dùng theme trung tính.
 */
export interface ProductTheme {
  stage: string;
  glowA: string;
  glowB: string;
  check: string;
}

const neutralTheme: ProductTheme = {
  stage: 'bg-[linear-gradient(140deg,#f5f5f7_0%,#e6f8f3_100%)]',
  glowA: 'bg-[#21d9ad]',
  glowB: 'bg-[#009e87]',
  check: 'bg-primary-light text-primary',
};

const themes: Record<string, ProductTheme> = {
  'music-app': {
    stage: 'bg-[linear-gradient(140deg,#f5ecff_0%,#fde8f4_100%)]',
    glowA: 'bg-[#a855f7]',
    glowB: 'bg-[#ec4899]',
    check: 'bg-[#f3e8ff] text-[#7e22ce]',
  },
  'hair-style-ai': {
    stage: 'bg-[linear-gradient(140deg,#fff5f6_0%,#fde4ea_100%)]',
    glowA: 'bg-[#fb7185]',
    glowB: 'bg-[#f9a8d4]',
    check: 'bg-[#ffe4e6] text-[#be123c]',
  },
};

export function getProductTheme(slug: string): ProductTheme {
  return themes[slug] ?? neutralTheme;
}
