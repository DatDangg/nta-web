import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    // Chỉ WebP: AVIF encode chậm hơn nhiều lần → lần đầu mỗi ảnh/kích thước (sau mỗi lần deploy,
    // cache rỗng) phải chờ server nén lâu. WebP nén nhanh, dung lượng chênh không đáng kể.
    formats: ['image/webp'],
    // Ảnh trong /public không đổi giữa 2 lần deploy (cache bị xoá khi build container mới)
    // → giữ bản đã tối ưu 31 ngày thay vì mặc định 60s.
    minimumCacheTTL: 2678400,
  },
};

export default withNextIntl(nextConfig);
