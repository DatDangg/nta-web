import type { Locale } from './types';

export interface HomeContent {
  solutionCards: { title: string; description: string; href: string; image: string; alt: string }[];
  featuredProducts: { slug: string; title: string; description: string; image: string; alt: string }[];
  featuredCase: { title: string; description: string; href: string; image: string; alt: string };
}

const homeContent: Record<Locale, HomeContent> = {
  vi: {
    solutionCards: [
      { title: 'Giải pháp Doanh nghiệp', description: 'Chuẩn hóa vận hành, nhân sự, đào tạo và nghiệp vụ.', href: '/solutions/enterprise', image: '/images/solutions/enterprise.svg', alt: 'Minh họa các quy trình doanh nghiệp được kết nối' },
      { title: 'Giải pháp AI', description: 'Đưa AI vào vận hành và trải nghiệm khách hàng.', href: '/solutions/ai', image: '/images/solutions/ai.svg', alt: 'Minh họa dữ liệu được phân tích bằng AI' },
      { title: 'Ứng dụng AI', description: 'Ứng dụng di động AI phục vụ nhu cầu hằng ngày.', href: '/products', image: '/images/solutions/apps.svg', alt: 'Minh họa ứng dụng AI trên điện thoại' },
    ],
    featuredProducts: [
      { slug: 'music-app', title: 'Ứng dụng nhạc AI', description: 'Tạo và khám phá âm nhạc có hỗ trợ AI.', image: '/images/products/music-app-preview.svg', alt: 'Màn hình minh họa ứng dụng nhạc AI' },
      { slug: 'hair-style-ai', title: 'Kiểu tóc AI', description: 'Xem trước các phong cách tóc khác nhau.', image: '/images/products/hair-style-ai-preview.svg', alt: 'Màn hình minh họa ứng dụng thử kiểu tóc AI' },
    ],
    featuredCase: { title: 'Phương án AI camera và flycam tại Óc Eo – Ba Thê', description: 'Đề xuất kết hợp camera AI tại biên và flycam tuần tra để hỗ trợ bảo vệ khu di tích.', href: '/case-studies/oc-eo-learning', image: '/images/cases/oc-eo-learning-overview.svg', alt: 'Minh họa phương án camera AI và flycam tuần tra tại khu di tích Óc Eo – Ba Thê' },
  },
  en: {
    solutionCards: [
      { title: 'Enterprise Solutions', description: 'Standardize operations, HR, training and workflows.', href: '/en/solutions/enterprise', image: '/images/solutions/enterprise.svg', alt: 'Illustration of connected enterprise workflows' },
      { title: 'AI Solutions', description: 'Apply AI to operations and customer experience.', href: '/en/solutions/ai', image: '/images/solutions/ai.svg', alt: 'Illustration of data analyzed with AI' },
      { title: 'AI Apps', description: 'Mobile AI apps for everyday needs.', href: '/en/products', image: '/images/solutions/apps.svg', alt: 'Illustration of an AI mobile app' },
    ],
    featuredProducts: [
      { slug: 'music-app', title: 'AI music app', description: 'Create and explore AI-assisted music.', image: '/images/products/music-app-preview.svg', alt: 'Preview screen for the AI music app' },
      { slug: 'hair-style-ai', title: 'Hair-style AI', description: 'Preview different hairstyle options.', image: '/images/products/hair-style-ai-preview.svg', alt: 'Preview screen for the Hair-style AI app' },
    ],
    featuredCase: { title: 'Proposed AI camera and drone plan for Óc Eo – Ba Thê', description: 'A proposal combining edge AI cameras and drone patrols to support heritage-site protection.', href: '/en/case-studies/oc-eo-learning', image: '/images/cases/oc-eo-learning-overview.svg', alt: 'Illustration of the proposed AI camera and drone patrol plan at Óc Eo – Ba Thê' },
  },
};

export function getHomeContent(locale: Locale): HomeContent {
  return homeContent[locale];
}
