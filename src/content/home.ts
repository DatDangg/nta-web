import type { Locale } from './types';

export interface HomeContent {
  solutionCards: { title: string; description: string; href: string; image: string; alt: string; shot?: boolean }[];
  featuredProducts: { slug: string; title: string; description: string; image: string; alt: string }[];
  featuredCase: { title: string; description: string; href: string; image: string; alt: string };
}

const homeContent: Record<Locale, HomeContent> = {
  vi: {
    solutionCards: [
      { title: 'Giải pháp Doanh nghiệp', description: 'Chuẩn hóa vận hành, nhân sự, đào tạo và nghiệp vụ.', href: '/solutions/enterprise', image: '/images/illustrations/home-enterprise.jpg', alt: 'Minh hoạ điện thoại với biểu đồ tăng trưởng, hồ sơ nhân sự, cài đặt và lưới ứng dụng' },
      { title: 'Giải pháp AI', description: 'Đưa AI vào vận hành và trải nghiệm khách hàng.', href: '/solutions/ai', image: '/images/illustrations/home-ai.jpg', alt: 'Minh hoạ khối AI với các biểu tượng tạo sinh, hội thoại, tài liệu và mã nguồn' },
      { title: 'Ứng dụng AI', description: 'Ứng dụng di động AI phục vụ nhu cầu hằng ngày.', href: '/products', image: '/images/illustrations/home-apps.jpg', alt: 'Minh hoạ cửa sổ ứng dụng với bảng điều khiển biểu đồ tăng trưởng và nhóm người dùng' },
    ],
    featuredProducts: [
      { slug: 'music-app', title: 'Ứng dụng nhạc AI', description: 'Tạo và khám phá âm nhạc có hỗ trợ AI.', image: '/images/products/ai-music-app.png', alt: 'Giao diện minh hoạ — AI Music Generator: gợi ý sáng tác nhạc với AI' },
      { slug: 'hair-style-ai', title: 'Kiểu tóc AI', description: 'Xem trước các phong cách tóc khác nhau.', image: '/images/products/hair-style-ai.jpg', alt: 'Giao diện minh hoạ — HairStyle AI: thử nhiều kiểu tóc bằng AI' },
    ],
    featuredCase: { title: 'Phương án AI camera và flycam tại Óc Eo – Ba Thê', description: 'Đề xuất kết hợp camera AI tại biên và flycam tuần tra để hỗ trợ bảo vệ khu di tích.', href: '/case-studies/oc-eo-learning', image: '/images/illustrations/oc-eo-architecture.svg', alt: 'Minh họa sơ đồ kiến trúc ba tầng cho phương án Óc Eo – Ba Thê' },
  },
  en: {
    solutionCards: [
      { title: 'Enterprise Solutions', description: 'Standardize operations, HR, training and workflows.', href: '/en/solutions/enterprise', image: '/images/illustrations/home-enterprise.jpg', alt: 'Illustration of a phone with a growth chart, staff profile, settings and app grid' },
      { title: 'AI Solutions', description: 'Apply AI to operations and customer experience.', href: '/en/solutions/ai', image: '/images/illustrations/home-ai.jpg', alt: 'Illustration of an AI block with generative, chat, document and code icons' },
      { title: 'AI Apps', description: 'Mobile AI apps for everyday needs.', href: '/en/products', image: '/images/illustrations/home-apps.jpg', alt: 'Illustration of an app window with a growth-chart dashboard and a group of users' },
    ],
    featuredProducts: [
      { slug: 'music-app', title: 'AI music app', description: 'Create and explore AI-assisted music.', image: '/images/products/ai-music-app.png', alt: 'Illustrative interface — AI Music Generator: AI-assisted music ideas' },
      { slug: 'hair-style-ai', title: 'Hair-style AI', description: 'Preview different hairstyle options.', image: '/images/products/hair-style-ai.jpg', alt: 'Illustrative interface — HairStyle AI: try different hairstyles with AI' },
    ],
    featuredCase: { title: 'Proposed AI camera and drone plan for Óc Eo – Ba Thê', description: 'A proposal combining edge AI cameras and drone patrols to support heritage-site protection.', href: '/en/case-studies/oc-eo-learning', image: '/images/illustrations/oc-eo-architecture.svg', alt: 'Illustration of the three-layer architecture for the Óc Eo – Ba Thê proposal' },
  },
};

export function getHomeContent(locale: Locale): HomeContent {
  return homeContent[locale];
}
