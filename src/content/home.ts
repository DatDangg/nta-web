import type { ListingIconName } from '@/components/listing/icons';
import type { Locale } from './types';

/** Thẻ khối "Giải pháp" trang chủ (CR-016): icon vuông + tiêu đề + mô tả + 3 gạch đầu dòng + link "Tìm hiểu …". */
export interface HomeSolutionCard {
  title: string;
  description: string;
  icon: ListingIconName;
  bullets: { icon: ListingIconName; label: string }[];
  linkLabel: string;
  href: string;
  image: string;
  alt: string;
}

export interface HomeContent {
  solutionCards: HomeSolutionCard[];
  featuredProducts: { slug: string; title: string; description: string; image: string; alt: string }[];
  /**
   * 5 panel kính nổi trên ảnh hero (so với ảnh mẫu ảnh 2) + wordmark NTA trên đế robot.
   * Chỉ hiển thị từ breakpoint `lg` trở lên — mobile giữ ảnh full cột, không overlay.
   */
  heroPanels: {
    wordmark: string;
    ai: { title: string; items: string[] };
    chart: { title: string; subtitle: string };
    management: { title: string; items: string[] };
    performance: { label: string; value: string };
    apps: { title: string; items: string[] };
  };
}

const homeContent: Record<Locale, HomeContent> = {
  vi: {
    solutionCards: [
      {
        title: 'Giải pháp Doanh nghiệp',
        description: 'Chuẩn hóa vận hành, nhân sự, đào tạo và nghiệp vụ.',
        icon: 'building',
        bullets: [
          { icon: 'users', label: 'Khách hàng & bán hàng — CRM' },
          { icon: 'idcard', label: 'Nhân sự & tổ chức — HRM' },
          { icon: 'graduation', label: 'Trường học, phòng khám — LMS, DentGo' },
        ],
        linkLabel: 'Tìm hiểu giải pháp doanh nghiệp',
        href: '/solutions/enterprise', image: '/images/illustrations/home-enterprise.png', alt: 'Minh hoạ điện thoại với biểu đồ tăng trưởng, hồ sơ nhân sự, cài đặt và lưới ứng dụng',
      },
      {
        title: 'Giải pháp AI',
        description: 'Đưa AI vào vận hành và trải nghiệm khách hàng.',
        icon: 'cpu',
        bullets: [
          { icon: 'camera', label: 'Camera AI xử lý tại biên — BoxAI' },
          { icon: 'drone', label: 'Flycam tuần tra tự động' },
          { icon: 'chat', label: 'Trợ lý AI & AI API Gateway — FridayAI' },
        ],
        linkLabel: 'Tìm hiểu giải pháp AI',
        href: '/solutions/ai', image: '/images/illustrations/home-ai.png', alt: 'Minh hoạ khối AI với các biểu tượng tạo sinh, hội thoại, tài liệu và mã nguồn',
      },
      {
        title: 'Ứng dụng AI',
        description: 'Ứng dụng di động AI phục vụ nhu cầu hằng ngày.',
        icon: 'box',
        bullets: [
          { icon: 'music', label: 'Tạo nhạc từ ý tưởng — AI Music' },
          { icon: 'face', label: 'Thử kiểu tóc theo dáng mặt — HairStyle AI' },
          { icon: 'phone', label: 'Ứng dụng di động cho người dùng cuối' },
        ],
        linkLabel: 'Tìm hiểu các ứng dụng AI',
        href: '/products', image: '/images/illustrations/home-apps.png', alt: 'Minh hoạ cửa sổ ứng dụng với bảng điều khiển biểu đồ tăng trưởng và nhóm người dùng',
      },
    ],
    featuredProducts: [
      { slug: 'music-app', title: 'Ứng dụng nhạc AI', description: 'Tạo và khám phá âm nhạc có hỗ trợ AI.', image: '/images/products/ai-music-app.png', alt: 'Giao diện minh hoạ — AI Music Generator: gợi ý sáng tác nhạc với AI' },
      { slug: 'hair-style-ai', title: 'Kiểu tóc AI', description: 'Xem trước các phong cách tóc khác nhau.', image: '/images/products/hair-style-ai.jpg', alt: 'Giao diện minh hoạ — HairStyle AI: thử nhiều kiểu tóc bằng AI' },
    ],
    heroPanels: {
      wordmark: 'NTA',
      ai: { title: 'Trí tuệ nhân tạo', items: ['LLM & GenAI', 'Tự động hoá quy trình', 'Phân tích dữ liệu', 'Trợ lý AI doanh nghiệp'] },
      chart: { title: 'AI', subtitle: 'Từ dữ liệu đến giá trị thực' },
      management: { title: 'Quản trị doanh nghiệp', items: ['ERP / CRM', 'Quản lý nhân sự', 'Quản lý vận hành', 'Báo cáo thông minh'] },
      performance: { label: 'Hiệu suất', value: '+86%' },
      apps: { title: 'Giải pháp & ứng dụng', items: ['App doanh nghiệp', 'Camera giám sát', 'Tích hợp hệ thống', 'Trải nghiệm hiện đại'] },
    },
  },
  en: {
    solutionCards: [
      {
        title: 'Enterprise Solutions',
        description: 'Standardize operations, HR, training and workflows.',
        icon: 'building',
        bullets: [
          { icon: 'users', label: 'Customers & sales — CRM' },
          { icon: 'idcard', label: 'People & organization — HRM' },
          { icon: 'graduation', label: 'Schools, clinics — LMS, DentGo' },
        ],
        linkLabel: 'Explore enterprise solutions',
        href: '/en/solutions/enterprise', image: '/images/illustrations/home-enterprise.png', alt: 'Illustration of a phone with a growth chart, staff profile, settings and app grid',
      },
      {
        title: 'AI Solutions',
        description: 'Apply AI to operations and customer experience.',
        icon: 'cpu',
        bullets: [
          { icon: 'camera', label: 'Edge AI cameras — BoxAI' },
          { icon: 'drone', label: 'Automated drone patrols' },
          { icon: 'chat', label: 'AI assistant & AI API Gateway — FridayAI' },
        ],
        linkLabel: 'Explore AI solutions',
        href: '/en/solutions/ai', image: '/images/illustrations/home-ai.png', alt: 'Illustration of an AI block with generative, chat, document and code icons',
      },
      {
        title: 'AI Apps',
        description: 'Mobile AI apps for everyday needs.',
        icon: 'box',
        bullets: [
          { icon: 'music', label: 'Turn ideas into music — AI Music' },
          { icon: 'face', label: 'Try hairstyles for your face shape — HairStyle AI' },
          { icon: 'phone', label: 'Mobile apps for everyday users' },
        ],
        linkLabel: 'Explore AI apps',
        href: '/en/products', image: '/images/illustrations/home-apps.png', alt: 'Illustration of an app window with a growth-chart dashboard and a group of users',
      },
    ],
    featuredProducts: [
      { slug: 'music-app', title: 'AI music app', description: 'Create and explore AI-assisted music.', image: '/images/products/ai-music-app.png', alt: 'Illustrative interface — AI Music Generator: AI-assisted music ideas' },
      { slug: 'hair-style-ai', title: 'Hair-style AI', description: 'Preview different hairstyle options.', image: '/images/products/hair-style-ai.jpg', alt: 'Illustrative interface — HairStyle AI: try different hairstyles with AI' },
    ],
    heroPanels: {
      wordmark: 'NTA',
      ai: { title: 'Artificial Intelligence', items: ['LLM & GenAI', 'Process automation', 'Data analytics', 'AI business assistant'] },
      chart: { title: 'AI', subtitle: 'From data to real value' },
      management: { title: 'Business management', items: ['ERP / CRM', 'HR management', 'Operations', 'Smart reporting'] },
      performance: { label: 'Performance', value: '+86%' },
      apps: { title: 'Solutions & apps', items: ['Business apps', 'Surveillance cameras', 'System integration', 'Modern experience'] },
    },
  },
};

export function getHomeContent(locale: Locale): HomeContent {
  return homeContent[locale];
}
