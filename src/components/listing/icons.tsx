import type { SVGProps } from 'react';

/**
 * Bộ icon nét (stroke) dùng chung cho hero, thanh lọc và thẻ ở các trang danh sách
 * (sản phẩm · giải pháp · case study). Gọi theo tên để dữ liệu (`content/listings.ts`)
 * chỉ cần lưu chuỗi — truyền được từ server component sang client component.
 */
export type ListingIconName =
  | 'apps' | 'arrow' | 'bolt' | 'box' | 'building' | 'call' | 'camera' | 'chart' | 'chat' | 'check'
  | 'car' | 'cpu' | 'drone' | 'gear' | 'face' | 'graduation' | 'grid' | 'heart' | 'home' | 'idcard' | 'image'
  | 'headset' | 'landmark' | 'layers' | 'mail' | 'music' | 'pen' | 'phone' | 'plug' | 'plus' | 'search' | 'shield' | 'smile'
  | 'pin' | 'sparkles' | 'tooth' | 'train' | 'users' | 'workflow';

const paths: Record<ListingIconName, string> = {
  apps: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 17h6M17 14v6',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  bolt: 'M13 2 4.5 13.5H12L11 22l8.5-11.5H12L13 2Z',
  box: 'M12 2.5 3.5 7v10L12 21.5 20.5 17V7L12 2.5ZM3.5 7 12 11.5 20.5 7M12 11.5v10',
  building: 'M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 9h4a1 1 0 0 1 1 1v11M3 21h18M8 8h3M8 12h3M8 16h3',
  car: 'M5 17h14M5 17v2.5M19 17v2.5M3.5 13.5 5.6 7.9A2 2 0 0 1 7.5 6.5h9a2 2 0 0 1 1.9 1.4l2.1 5.6M3.5 13.5h17V17h-17zM7 15.2h.01M17 15.2h.01',
  call: 'M21.5 16.4v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 1.6 3.7 2 2 0 0 1 3.6 1.5h3a2 2 0 0 1 2 1.7c.1.9.4 1.9.7 2.8a2 2 0 0 1-.5 2.1L7.5 9.4a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2Z',
  camera: 'M3 8.5A1.5 1.5 0 0 1 4.5 7h2.2l1.5-2.5h7.6L17.3 7h2.2A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-9ZM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  chat: 'M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.7A8 8 0 1 1 21 12ZM8.5 12h.01M12 12h.01M15.5 12h.01',
  check: 'M20 6 9 17l-5-5',
  cpu: 'M7 7h10v10H7zM10 10h4v4h-4zM9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4',
  drone: 'M10 10.5h4v3h-4zM10 10.5 7.5 8M14 10.5 16.5 8M10 13.5 7.5 16M14 13.5l2.5 2.5M5.5 8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM18.5 8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM5.5 20.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM18.5 20.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  face: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM5 10c3 0 5.5-1.5 7-4 1.2 2.5 3.8 4 7 4M9.5 14.5c1.4 1.3 3.6 1.3 5 0',
  gear: 'M12.2 2h-.4a2 2 0 0 0-2 2v.2a2 2 0 0 1-1 1.7l-.4.3a2 2 0 0 1-2 0l-.2-.1a2 2 0 0 0-2.7.7l-.2.4a2 2 0 0 0 .7 2.7l.2.1a2 2 0 0 1 1 1.7v.5a2 2 0 0 1-1 1.7l-.2.1a2 2 0 0 0-.7 2.7l.2.4a2 2 0 0 0 2.7.7l.2-.1a2 2 0 0 1 2 0l.4.3a2 2 0 0 1 1 1.7v.2a2 2 0 0 0 2 2h.4a2 2 0 0 0 2-2v-.2a2 2 0 0 1 1-1.7l.4-.3a2 2 0 0 1 2 0l.2.1a2 2 0 0 0 2.7-.7l.2-.4a2 2 0 0 0-.7-2.7l-.2-.1a2 2 0 0 1-1-1.7v-.5a2 2 0 0 1 1-1.7l.2-.1a2 2 0 0 0 .7-2.7l-.2-.4a2 2 0 0 0-2.7-.7l-.2.1a2 2 0 0 1-2 0l-.4-.3a2 2 0 0 1-1-1.7V4a2 2 0 0 0-2-2ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  graduation: 'M2 9.5 12 5l10 4.5-10 4.5L2 9.5ZM6 11.5V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.5M22 9.5V15',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  headset: 'M4 14v-2a8 8 0 0 1 16 0v2M20 14a2 2 0 0 0-2-2h-1v6h1a2 2 0 0 0 2-2v-2ZM4 14a2 2 0 0 1 2-2h1v6H6a2 2 0 0 1-2-2v-2ZM18 18c0 1.7-1.8 3-4 3h-1.5',
  heart: 'M12 20s-7.5-4.4-9-9.5C2 7 4.5 4.5 7.5 4.5c2 0 3.5 1.2 4.5 2.7 1-1.5 2.5-2.7 4.5-2.7 3 0 5.5 2.5 4.5 6-1.5 5.1-9 9.5-9 9.5Z',
  home: 'M3.5 10.5 12 3.5l8.5 7M5.5 9v11h5v-6h3v6h5V9',
  idcard: 'M3 6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11ZM9 12.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM5.5 16c.6-1.5 2-2.3 3.5-2.3s2.9.8 3.5 2.3M15 10h3.5M15 13.5h3.5',
  image: 'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1ZM8.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM21 15.5l-5-5L5 19',
  landmark: 'M3 21h18M5 21v-9M9.5 21v-9M14.5 21v-9M19 21v-9M2.5 9 12 3.5 21.5 9h-19Z',
  layers: 'M12 3 2.5 8 12 13l9.5-5L12 3ZM2.5 12.5 12 17.5l9.5-5M2.5 16.5 12 21.5l9.5-5',
  mail: 'M4 5.5h16A1.5 1.5 0 0 1 21.5 7v10a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 17V7A1.5 1.5 0 0 1 4 5.5ZM3 7l9 6.5L21 7',
  music: 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  pen: 'M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4ZM13.5 6.5l4 4',
  phone: 'M8 2.5h8A1.5 1.5 0 0 1 17.5 4v16a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 20V4A1.5 1.5 0 0 1 8 2.5ZM11 18.5h2',
  pin: 'M12 21.5s-7-6.1-7-11.5a7 7 0 0 1 14 0c0 5.4-7 11.5-7 11.5ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  plug: 'M12 22v-5M9 8V2M15 8V2M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8h12Z',
  plus: 'M12 5v14M5 12h14',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20.5 20.5 16 16',
  shield: 'M12 3 4.5 6v5.5c0 4.6 3.2 8.3 7.5 9.5 4.3-1.2 7.5-4.9 7.5-9.5V6L12 3ZM8.8 12l2.2 2.2 4.4-4.4',
  smile: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8.5 14.5c1.9 2 5.1 2 7 0M9 9.5h.01M15 9.5h.01',
  sparkles: 'M11 3.5 12.6 8a3 3 0 0 0 1.9 1.9L19 11.5l-4.5 1.6a3 3 0 0 0-1.9 1.9L11 19.5l-1.6-4.5a3 3 0 0 0-1.9-1.9L3 11.5l4.5-1.6A3 3 0 0 0 9.4 8L11 3.5ZM18.5 2.5v4M16.5 4.5h4',
  tooth: 'M7.5 3.5c1.6 0 2.8.8 4.5.8s2.9-.8 4.5-.8C19 3.5 20.5 5.6 20 8.5c-.4 2.3-1.4 3.6-1.8 6-.4 2.7-.8 6-2.5 6-1.8 0-1.7-5-3.7-5s-1.9 5-3.7 5c-1.7 0-2.1-3.3-2.5-6-.4-2.4-1.4-3.7-1.8-6-.5-2.9 1-5 3.5-5Z',
  train: 'M7 3.5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-10a2 2 0 0 1 2-2ZM5 11h14M9 14.5h.01M15 14.5h.01M8 21l1.5-3.5M16 21l-1.5-3.5M10 7h4',
  users: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21c.5-3.8 3.4-6 7-6s6.5 2.2 7 6M16 3.5a4 4 0 0 1 0 7.2M18.5 15.3c2 .9 3.2 2.8 3.5 5.7',
  workflow: 'M4 4h6v5H4zM14 15h6v5h-6zM7 9v3.5a2.5 2.5 0 0 0 2.5 2.5H14M14 6.5h3.5A2.5 2.5 0 0 1 20 9v1',
};

type IconProps = SVGProps<SVGSVGElement> & { name: ListingIconName; strokeWidth?: number };

export function ListingIcon({ name, strokeWidth = 1.8, className = 'size-5', ...rest }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      {...rest}
    >
      <path d={paths[name]} />
    </svg>
  );
}
