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

/**
 * Ảnh dùng ở **thẻ giải pháp** (danh sách / trang chủ) — khác `image` (SVG placeholder).
 *
 * `image` chỉ phục vụ thẻ; OG/Twitter dùng `/images/og-default.png` cố định, nên thêm field
 * này không đụng metadata. Thẻ nào không khai `cardImage` thì giữ placeholder `image`.
 */
export interface CardShot {
  src: string;
  /** Alt mô tả giao diện (rule §7); HRM phải có tiền tố "Giao diện minh hoạ —". */
  alt: string;
  /** Tỉ lệ đo sẵn — dùng cho `next/image` tính kích thước nội tại (chống layout shift). */
  ratio?: number;
}

/**
 * Ảnh hero của trang chi tiết giải pháp (khác `image` — `image` là SVG đại diện cho OG/JSON-LD).
 *
 * `maxWidth` chỉ ghi khi ảnh gần vuông cần giới hạn bề rộng riêng (spec §3: HRM 1.06 →
 * `max-w-[960px]`). Ảnh ngang hơn bỏ trống → `max-w-full`.
 */
export interface HeroShot {
  src: string;
  /** Alt mô tả giao diện đang làm gì — KHÔNG phải tên sản phẩm (spec §7). */
  alt: string;
  /** Tỉ lệ đo sẵn từ `docs/screenshots-mapping.md`. */
  ratio?: number;
  maxWidth?: string;
}

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
  /**
   * Bố cục trang chi tiết: `default` (zig-zag chung) · `lms` (layout riêng 8 block, spec §5).
   * Thiếu cờ → `default`. Chỉ T5 mới đọc cờ này.
   */
  layout?: 'default' | 'lms';
  useCases?: string[];
  sections?: { title: string; intro?: string; items?: string[] }[];
  highlights?: { value: string; label: string }[];
  faq?: { question: string; answer: string }[];
  image?: string;
  /**
   * Ảnh thật cho thẻ giải pháp. Thiếu → thẻ dùng `image` (placeholder SVG) như cũ.
   * `image` không phục vụ OG (Twitter/OG dùng `/images/og-default.png` cố định) nên field
   * này không ảnh hưởng metadata. Xem change `2026-10-12-solution-card-real-images`.
   */
  cardImage?: CardShot;
  /**
   * Ảnh hero (khung macOS) — khác `image` (SVG cho OG). Thiếu → hero chỉ có text + CTA,
   * KHÔNG render khung ảnh rỗng (spec §3).
   */
  heroShot?: HeroShot;
  /**
   * Chú thích `<figcaption>` dưới **mọi ảnh** trang này (spec §7 — chỉ HRM dùng:
   * ảnh HRM là mock vẽ tay nên phải nói rõ). Thiếu → không caption.
   */
  imageCaption?: string;
  /**
   * Ảnh chụp màn hình còn lại (chưa gắn vào hero/features). Hỗ trợ `string` (alt chung
   * `imageAlt`) hoặc `{src, alt}` (alt riêng theo bảng §7).
   */
  screenshots?: (string | { src: string; alt: string; ratio?: number })[];
  /**
   * 4 block riêng của layout LMS (spec §5.2–§5.6, copy §11) — CHỈ trang có
   * `layout: 'lms'` đọc các field này; trang khác bỏ qua.
   */
  compliance?: {
    title: string;
    items: { large?: boolean; title: string; description: string; image?: { src: string; alt: string; ratio?: number } }[];
  };
  aiSection?: {
    title: string;
    description: string;
    suggestions: string[];
    panel: {
      label: string;
      student: string;
      meta?: string;
      action: string;
      description?: string;
      suggestions?: { label: string; text: string }[];
    };
  };
  audience?: { title: string; cards: { title: string; description: string }[] };
  cta?: { title: string; description: string; button: string };
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
  /** Ảnh thẻ ở danh sách case study. Thiếu → dùng `gallery[0]` như cũ. */
  cover?: string;
  related: string[];
  /**
   * Bố cục trang chi tiết: `default` (MetaBar + 3 block chữ + gallery) · `showcase` (landing
   * kiểu ảnh mẫu Óc Eo: hero ảnh lớn, thẻ số liệu, 3 cột, khối công nghệ, carousel ảnh, tầm nhìn).
   * Thiếu cờ → `default`. `showcase` bắt buộc có field `showcase`.
   */
  layout?: 'default' | 'showcase';
  showcase?: CaseStudyShowcase;
}

export type ShowcaseIcon = 'area' | 'camera' | 'calendar' | 'challenge' | 'solution' | 'result' | 'modules';

/** Icon cho nút sơ đồ ở khối công nghệ (thiếu → theo thứ tự camera · drone · vms như Óc Eo). */
export type ShowcaseNodeIcon = 'camera' | 'drone' | 'vms' | 'calendar' | 'records' | 'inventory';

export interface CaseStudyShowcase {
  hero: {
    /** Nhãn ngắn cho breadcrumb (thiếu → dùng `title`). */
    breadcrumbLabel?: string;
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    subtitle: string;
    description: string;
    /** `width`/`height` = kích thước gốc của ảnh (thiếu → 1590×989 như ảnh Óc Eo). */
    image: { src: string; alt: string; width?: number; height?: number };
    primaryCta: { label: string; href: string };
    /** Chỉ render nút "Xem video" khi có URL thật — không để nút chết. */
    video?: { label: string; href: string };
  };
  stats: { icon: ShowcaseIcon; value: string; label: string }[];
  pillars: { icon: ShowcaseIcon; title: string; items: string[] }[];
  technology: {
    id?: string;
    eyebrow: string;
    title: string;
    description: string;
    cta?: { label: string; href: string };
    nodes: (string | { label: string; icon: ShowcaseNodeIcon })[];
    /** Danh sách cảnh báo trên màn VMS minh hoạ — dữ liệu giả lập, có caption nói rõ. Bỏ qua khi có `screen`. */
    alerts?: { title: string; meta: string }[];
    /** Ảnh chụp giao diện phần mềm thay cho màn VMS dựng HTML (vd DentGo). Có `screen` → không render VmsMock. */
    screen?: { src: string; alt: string; width: number; height: number };
    caption: string;
  };
  photos: {
    eyebrow: string;
    title: string;
    prevLabel: string;
    nextLabel: string;
    /** Ghi chú nguồn ảnh (BR-004) — bắt buộc khi ảnh là minh hoạ, không phải ảnh chụp thực tế. */
    caption?: string;
    /** `screen` = ảnh chụp giao diện: viền + nền trắng + căn trên để không cắt mất phần đầu màn hình. */
    variant?: 'photo' | 'screen';
    items: { src: string; alt: string }[];
  };
  vision: { eyebrow: string; title: string; description: string; quote: string; quoteSource?: string; image?: { src: string; alt: string } };
  /** Dòng lưu ý dưới thẻ số liệu — nói rõ phương án đề xuất, chưa phải kết quả triển khai (BR-004). */
  note?: string;
  cta: { title: string; description: string; label: string; href: string; image?: string };
}

/** Key danh mục blog cố định (R-09a). Nhãn hiển thị lấy từ i18n `blog.categories.<key>`. */
export type BlogCategory = 'ai-tech' | 'practical' | 'customer-stories' | 'nta-news' | 'trends' | 'guides';

export interface Post {
  slug: string;
  title: string;
  /** ISO `YYYY-MM-DD`. */
  date: string;
  category: BlogCategory;
  excerpt: string;
  cover: string;
  body: string;
  /** Tính lúc load từ `body` — không khai báo trong frontmatter. */
  readingMinutes: number;
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
