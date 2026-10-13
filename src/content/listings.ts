import type { ListingHighlight } from '@/components/listing/ListingHero';
import type { GlassTile } from '@/components/listing/GlassVisual';
import type { ListingIconName } from '@/components/listing/icons';
import type { ListingTheme } from '@/components/listing/themes';
import type { ListingCategory, ListingLabels } from '@/components/listing/types';
import type { Locale } from './types';

/**
 * Nội dung hero + thanh lọc + metadata thẻ cho 4 trang danh sách (thiết kế "Ứng dụng AI").
 * Dữ liệu chính (tiêu đề, mô tả, ảnh) vẫn lấy từ mdx — file này chỉ thêm phần trình bày:
 * tagline, điểm nhấn, icon/màu thẻ, chip ngắn, danh mục lọc.
 *
 * Chip/điểm nhấn chỉ diễn đạt lại tính năng ĐÃ CÓ trong mdx — không thêm tuyên bố mới (BR-004).
 */

export interface ListingPageCopy {
  crumbs: string[];
  title: string;
  lead: string;
  accent: string;
  description: string;
  highlights: ListingHighlight[];
  tiles: GlassTile[];
  glassCard: { title: string; text: string };
  categories: ListingCategory[];
  searchPlaceholder: string;
  ariaLabel: string;
}

export interface ListingItemMeta {
  icon: ListingIconName;
  theme: ListingTheme;
  categories: string[];
  subtitle: string;
  chips: string[];
}

type PageKey = 'products' | 'caseStudies' | 'enterprise' | 'ai';

export const listingLabels: Record<Locale, Omit<ListingLabels, 'searchPlaceholder'>> = {
  vi: {
    all: 'Tất cả',
    groupLabel: 'Lọc theo danh mục',
    searchLabel: 'Tìm kiếm',
    empty: 'Không tìm thấy kết quả phù hợp.',
    clear: 'Xóa bộ lọc',
    resultCount: 'Có {count} kết quả',
  },
  en: {
    all: 'All',
    groupLabel: 'Filter by category',
    searchLabel: 'Search',
    empty: 'No matching results.',
    clear: 'Clear filters',
    resultCount: '{count} results',
  },
};

export const listingPages: Record<Locale, Record<PageKey, ListingPageCopy>> = {
  vi: {
    products: {
      crumbs: ['Sản phẩm', 'Ứng dụng AI'],
      title: 'Ứng dụng AI',
      lead: 'Cho những trải nghiệm',
      accent: 'gần gũi hơn',
      description: 'Các ứng dụng AI của NTA được phát triển để mang trí tuệ nhân tạo vào những trải nghiệm hằng ngày — sáng tạo hơn, tiện lợi hơn và cá nhân hóa hơn cho mọi người.',
      highlights: [
        { icon: 'bolt', title: 'Dễ sử dụng', text: 'Trải nghiệm đơn giản, thân thiện' },
        { icon: 'box', title: 'Ứng dụng đa dạng', text: 'Nhiều lĩnh vực trong cuộc sống' },
        { icon: 'users', title: 'Không ngừng phát triển', text: 'Liên tục cập nhật tính năng mới' },
      ],
      tiles: [{ icon: 'music', theme: 'violet' }, { icon: 'face', theme: 'rose' }, { icon: 'smile', theme: 'teal' }],
      glassCard: { title: 'AI', text: 'for a smarter everyday life' },
      categories: [
        { id: 'creative', label: 'Sáng tạo nội dung', icon: 'pen' },
        { id: 'entertainment', label: 'Giải trí', icon: 'smile' },
        { id: 'image', label: 'Hình ảnh', icon: 'image' },
        { id: 'lifestyle', label: 'Phong cách sống', icon: 'sparkles' },
      ],
      searchPlaceholder: 'Tìm kiếm ứng dụng...',
      ariaLabel: 'Danh sách ứng dụng',
    },
    caseStudies: {
      crumbs: ['Case Study'],
      title: 'Case Study',
      lead: 'Từ bài toán thực tế',
      accent: 'đến giải pháp số',
      description: 'Những dự án và phương án NTA xây dựng cùng doanh nghiệp, tổ chức — từ số hóa vận hành phòng khám đến camera AI và flycam hỗ trợ bảo vệ di sản.',
      highlights: [
        { icon: 'workflow', title: 'Bám sát bài toán', text: 'Thiết kế theo nhu cầu từng đơn vị' },
        { icon: 'layers', title: 'Đa lĩnh vực', text: 'Y tế, bảo tồn di sản, doanh nghiệp' },
        { icon: 'shield', title: 'Minh bạch', text: 'Phân biệt rõ phương án và kết quả' },
      ],
      tiles: [{ icon: 'landmark', theme: 'teal' }, { icon: 'tooth', theme: 'sky' }, { icon: 'chart', theme: 'amber' }],
      glassCard: { title: 'NTA', text: 'from challenge to impact' },
      categories: [
        { id: 'enterprise', label: 'Doanh nghiệp', icon: 'building' },
        { id: 'ai', label: 'AI', icon: 'cpu' },
        { id: 'app-ai', label: 'App AI', icon: 'phone' },
      ],
      searchPlaceholder: 'Tìm kiếm dự án...',
      ariaLabel: 'Danh sách case study',
    },
    enterprise: {
      crumbs: ['Giải pháp', 'Doanh nghiệp'],
      title: 'Giải pháp Doanh nghiệp',
      lead: 'Vận hành',
      accent: 'gọn gàng hơn mỗi ngày',
      description: 'Bộ giải pháp quản trị giúp doanh nghiệp chuẩn hóa vận hành, nhân sự, đào tạo và nghiệp vụ chuyên ngành — dữ liệu tập trung, mọi bộ phận cùng làm việc trên một nguồn.',
      highlights: [
        { icon: 'workflow', title: 'Chuẩn hóa quy trình', text: 'Một nguồn dữ liệu cho mọi bộ phận' },
        { icon: 'layers', title: 'Theo từng ngành', text: 'Bán lẻ, nhân sự, giáo dục, nha khoa' },
        { icon: 'chart', title: 'Nắm số liệu', text: 'Tổng quan vận hành theo thời gian thực' },
      ],
      tiles: [{ icon: 'users', theme: 'sky' }, { icon: 'graduation', theme: 'violet' }, { icon: 'tooth', theme: 'teal' }],
      glassCard: { title: 'NTA', text: 'for smoother operations' },
      categories: [
        { id: 'sales', label: 'Khách hàng & bán hàng', icon: 'users' },
        { id: 'hr', label: 'Nhân sự', icon: 'idcard' },
        { id: 'education', label: 'Giáo dục', icon: 'graduation' },
        { id: 'healthcare', label: 'Y tế', icon: 'tooth' },
      ],
      searchPlaceholder: 'Tìm kiếm giải pháp...',
      ariaLabel: 'Danh sách giải pháp doanh nghiệp',
    },
    ai: {
      crumbs: ['Giải pháp', 'AI'],
      title: 'Giải pháp AI',
      lead: 'Trí tuệ nhân tạo',
      accent: 'cho vận hành thực tế',
      description: 'Ứng dụng AI vào vận hành và trải nghiệm khách hàng — từ camera AI xử lý tại biên, flycam tuần tra tự động, trợ lý AI theo quy trình riêng của doanh nghiệp đến cổng API AI giá rẻ FridayAI.',
      highlights: [
        { icon: 'cpu', title: 'Xử lý tại biên', text: 'Phân tích video ngay tại hiện trường' },
        { icon: 'drone', title: 'Tuần tra tự động', text: 'Flycam theo lịch và theo cảnh báo' },
        { icon: 'chat', title: 'Trợ lý AI', text: 'Tùy chỉnh theo quy trình doanh nghiệp' },
      ],
      tiles: [{ icon: 'camera', theme: 'teal' }, { icon: 'drone', theme: 'sky' }, { icon: 'chat', theme: 'violet' }],
      glassCard: { title: 'AI', text: 'for real-world operations' },
      categories: [
        { id: 'vision', label: 'Thị giác máy tính', icon: 'camera' },
        { id: 'drone', label: 'Flycam', icon: 'drone' },
        { id: 'assistant', label: 'Trợ lý AI', icon: 'chat' },
        { id: 'gateway', label: 'Nền tảng API AI', icon: 'plug' },
      ],
      searchPlaceholder: 'Tìm kiếm giải pháp...',
      ariaLabel: 'Danh sách giải pháp AI',
    },
  },
  en: {
    products: {
      crumbs: ['Products', 'AI apps'],
      title: 'AI apps',
      lead: 'For experiences that feel',
      accent: 'closer to you',
      description: 'NTA builds AI apps that bring artificial intelligence into everyday moments — more creative, more convenient and more personal for everyone.',
      highlights: [
        { icon: 'bolt', title: 'Easy to use', text: 'Simple, friendly experiences' },
        { icon: 'box', title: 'Diverse apps', text: 'For many areas of everyday life' },
        { icon: 'users', title: 'Always improving', text: 'New features added continuously' },
      ],
      tiles: [{ icon: 'music', theme: 'violet' }, { icon: 'face', theme: 'rose' }, { icon: 'smile', theme: 'teal' }],
      glassCard: { title: 'AI', text: 'for a smarter everyday life' },
      categories: [
        { id: 'creative', label: 'Content creation', icon: 'pen' },
        { id: 'entertainment', label: 'Entertainment', icon: 'smile' },
        { id: 'image', label: 'Images', icon: 'image' },
        { id: 'lifestyle', label: 'Lifestyle', icon: 'sparkles' },
      ],
      searchPlaceholder: 'Search apps...',
      ariaLabel: 'App list',
    },
    caseStudies: {
      crumbs: ['Case studies'],
      title: 'Case studies',
      lead: 'From real-world challenges',
      accent: 'to digital solutions',
      description: 'Projects and proposals NTA has built with businesses and organizations — from digitizing clinic operations to AI cameras and drones that help protect heritage sites.',
      highlights: [
        { icon: 'workflow', title: 'Problem-first', text: 'Designed around each organization' },
        { icon: 'layers', title: 'Across sectors', text: 'Healthcare, heritage, enterprise' },
        { icon: 'shield', title: 'Transparent', text: 'Proposals and results kept distinct' },
      ],
      tiles: [{ icon: 'landmark', theme: 'teal' }, { icon: 'tooth', theme: 'sky' }, { icon: 'chart', theme: 'amber' }],
      glassCard: { title: 'NTA', text: 'from challenge to impact' },
      categories: [
        { id: 'enterprise', label: 'Enterprise', icon: 'building' },
        { id: 'ai', label: 'AI', icon: 'cpu' },
        { id: 'app-ai', label: 'AI apps', icon: 'phone' },
      ],
      searchPlaceholder: 'Search projects...',
      ariaLabel: 'Case study list',
    },
    enterprise: {
      crumbs: ['Solutions', 'Enterprise'],
      title: 'Enterprise Solutions',
      lead: 'Operations that run',
      accent: 'smoother every day',
      description: 'A management suite that standardizes operations, HR, training and industry workflows — centralized data, with every team working from the same source.',
      highlights: [
        { icon: 'workflow', title: 'Standard workflows', text: 'One data source for every team' },
        { icon: 'layers', title: 'Industry-specific', text: 'Retail, HR, education, dental' },
        { icon: 'chart', title: 'Clear numbers', text: 'Real-time operations overview' },
      ],
      tiles: [{ icon: 'users', theme: 'sky' }, { icon: 'graduation', theme: 'violet' }, { icon: 'tooth', theme: 'teal' }],
      glassCard: { title: 'NTA', text: 'for smoother operations' },
      categories: [
        { id: 'sales', label: 'Customers & sales', icon: 'users' },
        { id: 'hr', label: 'HR', icon: 'idcard' },
        { id: 'education', label: 'Education', icon: 'graduation' },
        { id: 'healthcare', label: 'Healthcare', icon: 'tooth' },
      ],
      searchPlaceholder: 'Search solutions...',
      ariaLabel: 'Enterprise solution list',
    },
    ai: {
      crumbs: ['Solutions', 'AI'],
      title: 'AI Solutions',
      lead: 'Artificial intelligence',
      accent: 'for real-world operations',
      description: 'AI applied to operations and customer experience — from edge AI cameras and automated drone patrols and AI assistants tailored to your own workflows to FridayAI, an affordable AI API gateway.',
      highlights: [
        { icon: 'cpu', title: 'Edge processing', text: 'Video analyzed right on site' },
        { icon: 'drone', title: 'Automated patrols', text: 'Drones on schedule or on alert' },
        { icon: 'chat', title: 'AI assistants', text: 'Tailored to business workflows' },
      ],
      tiles: [{ icon: 'camera', theme: 'teal' }, { icon: 'drone', theme: 'sky' }, { icon: 'chat', theme: 'violet' }],
      glassCard: { title: 'AI', text: 'for real-world operations' },
      categories: [
        { id: 'vision', label: 'Computer vision', icon: 'camera' },
        { id: 'drone', label: 'Drones', icon: 'drone' },
        { id: 'assistant', label: 'AI assistants', icon: 'chat' },
        { id: 'gateway', label: 'AI API platform', icon: 'plug' },
      ],
      searchPlaceholder: 'Search solutions...',
      ariaLabel: 'AI solution list',
    },
  },
};

/** Metadata thẻ theo slug (icon, màu, danh mục lọc, phụ đề, chip ngắn). */
export const listingItems: Record<Locale, Record<string, ListingItemMeta>> = {
  vi: {
    'music-app': { icon: 'music', theme: 'violet', categories: ['creative', 'entertainment'], subtitle: 'Tạo nhạc từ ý tưởng của bạn với AI', chips: ['Mô tả hoặc lời ca', 'Có lời / không lời', 'Nhận diện bài hát'] },
    'hair-style-ai': { icon: 'face', theme: 'rose', categories: ['image', 'lifestyle'], subtitle: 'Thử kiểu tóc mới với AI', chips: ['76 kiểu tóc', 'Gợi ý theo dáng mặt', 'Đổi màu tóc'] },
    'dental-clinic-operations': { icon: 'tooth', theme: 'sky', categories: ['enterprise'], subtitle: '', chips: [] },
    'oc-eo-learning': { icon: 'landmark', theme: 'teal', categories: ['ai'], subtitle: '', chips: [] },
    'ai-box-bao-ha': { icon: 'landmark', theme: 'teal', categories: ['ai'], subtitle: '', chips: [] },
    crm: { icon: 'users', theme: 'sky', categories: ['sales'], subtitle: 'Khách hàng 360° cho chuỗi nhà hàng', chips: ['Hồ sơ khách hàng', 'Đặt bàn', 'Đơn hàng'] },
    hrm: { icon: 'idcard', theme: 'amber', categories: ['hr'], subtitle: 'Hồ sơ, phê duyệt và cơ cấu tổ chức', chips: ['Hồ sơ nhân sự', 'Quy trình đề xuất', 'Tra cứu đội ngũ'] },
    lms: { icon: 'graduation', theme: 'violet', categories: ['education'], subtitle: 'Toàn bộ vận hành trường trên một hệ thống', chips: ['Đa trường', 'Thời khoá biểu', 'Học bạ số'] },
    dentgo: { icon: 'tooth', theme: 'teal', categories: ['healthcare'], subtitle: 'Hệ điều hành cho phòng khám đa chi nhánh', chips: ['Hồ sơ RHM/EMR', 'Lịch hẹn', 'Kho vật tư'] },
    boxai: { icon: 'camera', theme: 'teal', categories: ['vision'], subtitle: 'Camera AI xử lý ngay tại biên', chips: ['NVIDIA Jetson', '21 thuật toán AI', 'Kết nối VMS'] },
    flycam: { icon: 'drone', theme: 'sky', categories: ['drone'], subtitle: 'Tuần tra theo lịch, xác minh cảnh báo', chips: ['DJI Dock 2', 'Tuần tra waypoint', 'Quan sát nhiệt'] },
    'custom-ai': { icon: 'chat', theme: 'violet', categories: ['assistant'], subtitle: 'Trợ lý AI theo nhu cầu doanh nghiệp', chips: ['Tùy chỉnh quy trình', 'Đa kênh', 'Kiểm duyệt trước'] },
    fridayai: { icon: 'plug', theme: 'rose', categories: ['gateway'], subtitle: 'Dùng AI giá rẻ qua một endpoint', chips: ['Claude · GPT · Gemini', 'Tương thích OpenAI SDK', 'Trả theo mức dùng'] },
  },
  en: {
    'music-app': { icon: 'music', theme: 'violet', categories: ['creative', 'entertainment'], subtitle: 'Turn your ideas into music with AI', chips: ['Prompt or lyrics', 'Vocal / instrumental', 'Song recognition'] },
    'hair-style-ai': { icon: 'face', theme: 'rose', categories: ['image', 'lifestyle'], subtitle: 'Try a new hairstyle with AI', chips: ['76 styles', 'Face-shape picks', 'Hair colour'] },
    'dental-clinic-operations': { icon: 'tooth', theme: 'sky', categories: ['enterprise'], subtitle: '', chips: [] },
    'oc-eo-learning': { icon: 'landmark', theme: 'teal', categories: ['ai'], subtitle: '', chips: [] },
    'ai-box-bao-ha': { icon: 'landmark', theme: 'teal', categories: ['ai'], subtitle: '', chips: [] },
    crm: { icon: 'users', theme: 'sky', categories: ['sales'], subtitle: '360° customers for restaurant chains', chips: ['Customer profiles', 'Reservations', 'Orders'] },
    hrm: { icon: 'idcard', theme: 'amber', categories: ['hr'], subtitle: 'Records, approvals and org structure', chips: ['Employee records', 'Request workflows', 'Team lookup'] },
    lms: { icon: 'graduation', theme: 'violet', categories: ['education'], subtitle: 'All school operations in one system', chips: ['Multi-school', 'Timetables', 'Digital records'] },
    dentgo: { icon: 'tooth', theme: 'teal', categories: ['healthcare'], subtitle: 'An operating system for multi-branch clinics', chips: ['Dental/EMR records', 'Appointments', 'Inventory'] },
    boxai: { icon: 'camera', theme: 'teal', categories: ['vision'], subtitle: 'AI cameras processing at the edge', chips: ['NVIDIA Jetson', '21 AI algorithms', 'VMS integration'] },
    flycam: { icon: 'drone', theme: 'sky', categories: ['drone'], subtitle: 'Scheduled patrols and alert verification', chips: ['DJI Dock 2', 'Waypoint patrols', 'Thermal view'] },
    'custom-ai': { icon: 'chat', theme: 'violet', categories: ['assistant'], subtitle: 'AI assistants built around your needs', chips: ['Custom workflows', 'Multi-channel', 'Reviewed first'] },
    fridayai: { icon: 'plug', theme: 'rose', categories: ['gateway'], subtitle: 'Affordable AI through one endpoint', chips: ['Claude · GPT · Gemini', 'OpenAI SDK compatible', 'Pay as you go'] },
  },
};

/** CTA thẻ viền đứt cuối lưới. */
export const listingCtas: Record<Locale, Record<PageKey, { title: string; description: string; label: string }>> = {
  vi: {
    products: { title: 'Sắp có thêm ứng dụng mới', description: 'NTA liên tục phát triển thêm ứng dụng AI. Có ý tưởng? Hãy trao đổi với chúng tôi.', label: 'Liên hệ đội ngũ NTA' },
    caseStudies: { title: 'Dự án tiếp theo của bạn', description: 'Chia sẻ bài toán của tổ chức, NTA sẽ cùng bạn xây dựng phương án phù hợp.', label: 'Liên hệ tư vấn' },
    enterprise: { title: 'Khám phá Giải pháp AI', description: 'Camera AI tại biên, flycam tuần tra và trợ lý AI cho doanh nghiệp.', label: 'Xem giải pháp AI' },
    ai: { title: 'Câu chuyện triển khai', description: '', label: 'Xem case study' },
  },
  en: {
    products: { title: 'More apps coming soon', description: 'NTA keeps building new AI apps. Have an idea? Let’s talk.', label: 'Contact the NTA team' },
    caseStudies: { title: 'Your next project', description: 'Share your organization’s challenge and NTA will help you shape the right plan.', label: 'Talk to us' },
    enterprise: { title: 'Explore AI Solutions', description: 'Edge AI cameras, drone patrols and AI assistants for business.', label: 'See AI solutions' },
    ai: { title: 'Implementation story', description: '', label: 'View case study' },
  },
};

/** Kích thước nội tại cho next/image từ tỉ lệ đo sẵn. */
export function ratioToSize(ratio = 1.6, width = 1600) {
  return { width, height: Math.round(width / ratio) };
}

/** Ô icon quanh ảnh hero trang chi tiết: icon riêng của mục + 2 ô phụ khác màu. */
export function detailTiles(locale: Locale, slug: string): GlassTile[] {
  const meta = listingItems[locale][slug];
  const main: GlassTile = { icon: meta?.icon ?? 'sparkles', theme: meta?.theme ?? 'teal' };
  const extras: GlassTile[] = [
    { icon: 'chart', theme: 'sky' },
    { icon: 'shield', theme: 'violet' },
    { icon: 'sparkles', theme: 'teal' },
  ].filter((tile): tile is GlassTile => tile.theme !== main.theme) as GlassTile[];
  return [main, ...extras.slice(0, 2)];
}
