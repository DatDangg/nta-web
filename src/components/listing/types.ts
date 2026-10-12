import type { ListingIconName } from './icons';
import type { ListingTheme } from './themes';

/** Ảnh trong thẻ: `phone` (poster app dọc) · `window` (ảnh giao diện) · `photo` (ảnh minh hoạ). */
export interface ListingMedia {
  kind: 'phone' | 'window' | 'photo';
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ListingItem {
  id: string;
  /** Đường dẫn tương đối (không tiền tố locale) hoặc neo `#id` trong trang. */
  href: string;
  title: string;
  subtitle?: string;
  description: string;
  chips: string[];
  icon: ListingIconName;
  theme: ListingTheme;
  /** Mã danh mục để lọc (khớp `ListingCategory.id`). */
  categories: string[];
  /** Nhãn trạng thái nhỏ (vd "Sắp ra mắt", "Phương án đề xuất · 2026"). */
  status?: string;
  media?: ListingMedia;
  /** Chữ bổ sung cho ô tìm kiếm (không hiển thị). */
  keywords?: string;
  /** Nhãn đọc cho trình đọc màn hình, vd "Xem chi tiết Kiểu tóc AI". */
  linkLabel: string;
}

export interface ListingCategory {
  id: string;
  label: string;
  icon: ListingIconName;
}

export interface ListingCta {
  title: string;
  description: string;
  label: string;
  href: string;
  icon: ListingIconName;
}

export interface ListingLabels {
  all: string;
  groupLabel: string;
  searchLabel: string;
  searchPlaceholder: string;
  empty: string;
  clear: string;
  /** Mẫu đếm kết quả, `{count}` được thay số. */
  resultCount: string;
}
