export type Locale = 'vi' | 'en';

/**
 * Một tính năng trong `Solution.features`.
 *
 * `image`/`imageAlt`/`ratio` không bắt buộc: feature không có ảnh vẫn hiển thị được
 * (full-width, chữ căn trái) — xem `FeatureZigZag`.
 */
export interface Feature {
  title: string;
  description?: string;
  image?: string;
  /** Alt RIÊNG từng ảnh — lấy từ `docs/screenshots-mapping.md`. Bắt buộc nếu có `image`. */
  imageAlt?: string;
  /**
   * Tỉ lệ rộng/cao của ảnh (đo sẵn, không phải lúc render).
   *
   * Quyết định cơ chế hiển thị (spec §3.1): ≥ 1.0 → thu nhỏ giữ tỉ lệ, không cắt, không fade.
   * < 1.0 → ảnh dọc, khung `max-height` + `overflow-hidden` + fade đáy.
   * KHÔNG hardcode theo tên ảnh — lấy từ cột đã đo trong `docs/screenshots-mapping.md`.
   */
  ratio?: number;
  /** Ảnh phụ hiển thị cùng hàng (LMS feature 4: giáo án + học bạ số). */
  extraImages?: { src: string; alt: string; ratio?: number }[];
}

/** Dữ liệu cũ chưa migrate: `features` là `string[]`. */
export type LegacyFeature = string;

export interface Solution {
  slug: string;
  title: string;
  description: string;
  /**
   * Chấp nhận cả `Feature[]` (đã migrate) lẫn `string[]` (dữ liệu cũ). Component gọi
   * `normalizeFeatures()` để đổi về `Feature[]` — không ép migrate toàn bộ cùng lúc.
   */
  features: Feature[] | LegacyFeature[];
  benefits: string[];
  category: 'enterprise' | 'ai';
  useCases?: string[];
  sections?: { title: string; intro?: string; items?: string[] }[];
  highlights?: { value: string; label: string }[];
  faq?: { question: string; answer: string }[];
  image?: string;
  screenshots?: string[];
  relatedCases?: string[];
  // Opt-in for the enterprise detail page: renders sections, useCases and faq.
  // AI solution pages always render them, so they ignore this flag.
  renderExtendedContent?: boolean;
}

export interface Product {
  slug: string;
  title: string;
  description: string;
  screenshots: string[];
  downloadUrl?: string | null;
  features?: string[];
}

export interface CaseStudy {
  slug: string;
  title: string;
  category: 'enterprise' | 'ai' | 'app-ai';
  sector?: string;
  client?: string;
  year: number;
  challenge: string;
  solution: string;
  result: string;
  metrics?: { value: string; label: string }[];
  gallery: { src: string; alt: string }[];
  related: string[];
}

export interface Post {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  cover: string;
  body: string;
}

export interface MdxDocument {
  frontmatter: Omit<Post, 'body'>;
  source: string;
}

export interface AboutData {
  mission: string;
  capabilities: string[];
  team: { name: string; role: string; image: string }[];
  milestones: { year: number; description: string }[];
  partners: { name: string; logo: string | null }[];
}

// ContactSubmission is transient and belongs to the API layer; see Layer 3.
