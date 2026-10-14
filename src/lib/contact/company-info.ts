/**
 * Thông tin liên hệ chính thức của NTA — 1 nguồn cho trang Liên hệ, Footer và JSON-LD (R-10 §2, R-11).
 * Chế độ `CONTENT_SOURCE=file` web đọc hằng này; chế độ `db` đọc collection `company_info` (seed từ chính hằng này)
 * qua getter server-only `getCompanyContact` (./company-contact.ts). File này còn được client import (CONTACT_NEEDS…) nên không đọc DB ở đây.
 */
const MAP_QUERY = 'Tòa nhà Kim Hoàn, Ngõ 19 Duy Tân, Cầu Giấy, Hà Nội';

export interface CompanyContact {
  phone: { display: string; href: string; e164: string };
  email: { display: string; href: string };
  address: {
    full: string;
    line1: string;
    line2: string;
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
  map: { embedUrl: string; openUrl: string };
}

export const COMPANY_CONTACT: CompanyContact = {
  phone: { display: '0335546831', href: 'tel:+84335546831', e164: '+84335546831' },
  email: { display: 'admin@ntasolution.vn', href: 'mailto:admin@ntasolution.vn' },
  address: {
    full: 'Tầng 2, tòa nhà Kim Hoàn, ngõ 19 Duy Tân, Cầu Giấy, Hà Nội, Việt Nam',
    line1: 'Tầng 2, tòa nhà Kim Hoàn',
    line2: 'Ngõ 19 Duy Tân, Cầu Giấy, Hà Nội, Việt Nam',
    streetAddress: 'Tầng 2, tòa nhà Kim Hoàn, ngõ 19 Duy Tân',
    addressLocality: 'Cầu Giấy',
    addressRegion: 'Hà Nội',
    addressCountry: 'VN',
  },
  map: {
    embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&z=17&output=embed`,
    openUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAP_QUERY)}`,
  },
};

/** Key cố định của ô "Nhu cầu của bạn" (nhãn hiển thị ở i18n `contact.needs.<key>`). */
export const CONTACT_NEEDS = ['crm', 'dentgo', 'lms', 'hrm', 'boxai', 'custom-ai', 'flycam', 'custom-software', 'other'] as const;
export type ContactNeed = (typeof CONTACT_NEEDS)[number];

export function isContactNeed(value: string): value is ContactNeed {
  return (CONTACT_NEEDS as readonly string[]).includes(value);
}

export const COMPANY_MAX_LENGTH = 150;
