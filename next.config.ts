import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
const nextConfig: NextConfig = {
  output: 'standalone',
  // Trang vi render theo request (CR-031 P3-T02) → tắt streaming metadata cho MỌI client: title/canonical/hreflang/og luôn nằm trong <head>
  // như bản SSG cũ (bot không chạy JS như coccocbot/Zalo/TelegramBot vẫn đọc được). Metadata dùng cùng dữ liệu đã cache với page.
  htmlLimitedBots: /.*/,
  images: {
    // Chỉ WebP: AVIF encode chậm hơn nhiều lần → lần đầu mỗi ảnh/kích thước (sau mỗi lần deploy,
    // cache rỗng) phải chờ server nén lâu. WebP nén nhanh, dung lượng chênh không đáng kể.
    formats: ['image/webp'],
    // Ảnh trong /public không đổi giữa 2 lần deploy (cache bị xoá khi build container mới)
    // → giữ bản đã tối ưu 31 ngày thay vì mặc định 60s.
    minimumCacheTTL: 2678400,
  },
  // Slug case study cũ đã được index/chia sẻ → 301 sang slug mới (CR-025).
  // Dùng `statusCode: 301` vì `permanent: true` của Next trả 308. Nguồn `/vi/...` trỏ thẳng về
  // URL không prefix (localePrefix 'as-needed') để tránh redirect 2 bước qua middleware next-intl.
  async redirects() {
    return [
      { source: '/case-studies/oc-eo-learning', destination: '/case-studies/heritage-site-ai-camera', statusCode: 301 },
      { source: '/vi/case-studies/oc-eo-learning', destination: '/case-studies/heritage-site-ai-camera', statusCode: 301 },
      { source: '/en/case-studies/oc-eo-learning', destination: '/en/case-studies/heritage-site-ai-camera', statusCode: 301 },
    ];
  },
};

export default withNextIntl(nextConfig);
