import type { Locale } from '../types';

export const solutionOverview = {
  vi: {
    enterprise: {
      title: 'Giải pháp cho doanh nghiệp',
      description: 'Bộ giải pháp quản trị giúp doanh nghiệp chuẩn hóa vận hành, nhân sự, đào tạo và nghiệp vụ.',
    },
    ai: {
      title: 'Giải pháp AI',
      description: 'Ứng dụng AI vào vận hành và trải nghiệm khách hàng, từ trợ lý nội bộ đến thị giác máy tính theo yêu cầu.',
    },
  },
  en: {
    enterprise: {
      title: 'Enterprise Solutions',
      description: 'A management suite that standardizes operations, HR, training and business workflows.',
    },
    ai: {
      title: 'AI Solutions',
      description: 'AI applied to operations and customer experience, from internal assistants to custom computer vision.',
    },
  },
} satisfies Record<Locale, Record<'enterprise' | 'ai', { title: string; description: string }>>;
