/**
 * Trang xem thử component — **CHỈ chạy ở dev, không có trong production**.
 *
 * Mục đích: review 7 component mới (T2) với dữ liệu và ảnh THẬT trước khi gắn vào
 * 4 trang thật (T3–T5). Có đủ các trường hợp biên:
 *   - feature KHÔNG có ảnh
 *   - ảnh DỌC HRM `08` (ratio 0.735) → nhánh B: khung `max-h` + fade đáy
 *   - ảnh NGANG DentGo `05` (ratio 1.60) → nhánh A: co vừa, không cắt, không fade
 *   - section nền tối (`ink`)
 *   - hero gần vuông HRM (1.06) → `max-w-[960px]`
 *
 * Chặn production: `notFound()` khi `NODE_ENV !== 'development'`.
 * Xem `verify-prod.mjs` trong cùng thư mục — script kiểm tra trang này KHÔNG xuất
 * hiện trong build (route count + HTTP 404).
 */
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { SolutionHero } from '@/components/solutions/SolutionHero';
import { FeatureZigZag } from '@/components/solutions/FeatureZigZag';
import { BentoCompliance } from '@/components/solutions/BentoCompliance';
import { AudienceCards } from '@/components/solutions/AudienceCards';
import { AiSection } from '@/components/solutions/AiSection';
import { FaqAccordion } from '@/components/solutions/FaqAccordion';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import type { Feature } from '@/content/types';

// Tỉ lệ đo thật từ file ảnh (đã verify bằng System.Drawing), xem docs/screenshots-mapping.md
const RATIO = {
  crmHero: 1.355,
  hrmHero: 1.06,
  dentgoWide: 1.6,
  hrmPortrait: 0.735,
  hrmNearSquare: 0.996,
  lmsHero: 1.355,
  lmsGrid: 0.817,
  lmsAssess: 1.009,
  lmsTimetable: 0.886,
  lmsRecords: 0.836,
  lmsLesson: 1.104,
} as const;

/** Ảnh hero dùng chung cho 4 sản phẩm — `01-tong-quan` của từng sản phẩm (spec §3). */
const heroSamples = [
  {
    key: 'CRM',
    title: 'Quản trị khách hàng (CRM)',
    description:
      'Một hệ thống cho toàn bộ vận hành khách hàng: hồ sơ 360 độ, đặt bàn, đơn hàng và điểm thưởng tích luỹ.',
    src: '/images/solutions/v2/crm/01-tong-quan.png',
    alt: 'Màn hình hôm nay: số khách đến, đơn hàng, doanh thu và số phiếu chờ xử lý',
    ratio: RATIO.crmHero,
    maxW: 'max-w-full',
  },
  {
    key: 'HRM',
    title: 'Nhân sự (HRM)',
    description:
      'Hồ sơ nhân viên, chấm công, tính lương, nghỉ phép và quy trình đề xuất trong một hệ thống duy nhất.',
    src: '/images/solutions/v2/hrm/01-tong-quan.png',
    alt: 'Giao diện minh hoạ — bảng tổng quan nhân sự với thẻ chỉ số và biểu đồ biến động',
    ratio: RATIO.hrmHero,
    // Ảnh gần vuông ở 1280 sẽ cao ~1200px → giới hạn bề rộng riêng (spec §3)
    maxW: 'max-w-[960px]',
  },
];

/** Zig-zag: 4 feature — ngang / dọc / không ảnh / ảnh phụ. */
const zigZagSamples: Feature[] = [
  {
    title: 'Quản trị bảng điều khiển',
    description: 'Số liệu tổng hợp của toàn trường, đi sâu vào từng cơ sở chỉ với một cú bấm.',
    image: '/images/solutions/v2/lms/02-quan-tri-bang-dieu-khien.png',
    imageAlt: 'Bảng điều khiển trường với thẻ học sinh, người dùng hoạt động và tiến độ công việc',
    ratio: 1.137,
  },
  {
    // ẢNH DỌC — HRM 08, ratio 0.735 → nhánh B: khung max-h + fade đáy
    title: 'Quy trình đề xuất và phê duyệt',
    description: 'Đề xuất đi qua các bước duyệt rõ ràng, mọi thay đổi đều có dấu vết thời gian.',
    image: '/images/solutions/v2/hrm/08-quy-trinh-de-xuat.png',
    imageAlt: 'Giao diện minh hoạ — quy trình đề xuất và phê duyệt',
    ratio: RATIO.hrmPortrait,
  },
  {
    // KHÔNG CÓ ẢNH — phải trọn bề rộng, không để khung ảnh rỗng
    title: 'Kết nối với hệ thống đang vận hành',
    description:
      'Đồng bộ hai chiều với phần mềm kế toán, thiết bị chấm công và cổng dịch vụ công.',
  },
  {
    // ẢNH NGANG RỘNG NHẤT — DentGo 05, ratio 1.60 → nhánh A: không cắt, không fade
    title: 'Danh mục vật tư và hàng hoá',
    description: 'Thuốc, vật liệu và mã thuốc quốc gia trong một danh mục duy nhất.',
    image: '/images/solutions/v2/dentgo/05-kho-vat-tu.png',
    imageAlt: 'Danh mục vật tư và hàng hóa gồm thuốc, vật liệu và mã thuốc quốc gia',
    ratio: RATIO.dentgoWide,
  },
];

/** Zig-zag có ảnh phụ (LMS feature 4). */
const zigZagWithExtras: Feature[] = [
  {
    title: 'Thời khoá biểu · giáo án điện tử · học bạ số',
    description:
      'Thời khoá biểu kéo–thả. Giáo án soạn–duyệt trực tuyến. Học bạ số ký và phát hành ngay trong hệ thống.',
    image: '/images/solutions/v2/lms/05-thoi-khoa-bieu.png',
    imageAlt: 'Màn hình xếp thời khoá biểu toàn trường bằng kéo và thả',
    ratio: RATIO.lmsTimetable,
    extraImages: [
      {
        src: '/images/solutions/v2/lms/06-giao-an-dien-tu.png',
        alt: 'Danh sách giáo án điện tử theo môn và vòng đời soạn duyệt',
        ratio: RATIO.lmsLesson,
      },
      {
        src: '/images/solutions/v2/lms/07-hoc-ba-so.png',
        alt: 'Danh sách học bạ số kèm trạng thái ký và phát hành',
        ratio: RATIO.lmsRecords,
      },
    ],
  },
];

function PreviewNote({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b-4 border-warning bg-background-alt py-2 text-center text-xs text-text-secondary">
      <strong className="text-text-primary">{title}</strong> — {children}
    </div>
  );
}

function CaseHeading({ children }: { children: string }) {
  return (
    <p className="bg-warning/10 py-2 text-center text-sm font-semibold text-text-primary">
      {children}
    </p>
  );
}

export function generateStaticParams() {
  return [{ locale: 'vi' }];
}

export default async function ComponentPreviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // KHÔNG build ra production. `NODE_ENV` được Next thay thế lúc build.
  if (process.env.NODE_ENV !== 'development') notFound();

  setRequestLocale(locale);

  return (
    <>
      <PreviewNote title="PREVIEW T2">
        Trang xem thử component — chỉ có ở <code>npm run dev</code>. Production trả 404.
      </PreviewNote>

      {/* --- 1. SolutionHero: ảnh ngang vs ảnh gần vuông --- */}
      {heroSamples.map((hero) => (
        <section key={hero.key}>
          <CaseHeading>{`SolutionHero · ${hero.key} · ratio ${hero.ratio} · ${hero.maxW}`}</CaseHeading>
          <SolutionHero
            breadcrumbs={[{ label: 'Giải pháp', href: '/vi/solutions' }, { label: hero.title }]}
            description={hero.description}
            image={hero.src}
            imageAlt={hero.alt}
            imageMaxW={hero.maxW}
            imageRatio={hero.ratio}
            primaryCta={{ label: 'Đăng ký demo', href: '/vi/contact' }}
            secondaryCta={{
              label: 'Xem tính năng ›',
              href: '#features',
              ariaLabel: 'Xem tính năng, cuộn xuống phần tính năng',
            }}
            title={hero.title}
          />
        </section>
      ))}

      {/* --- 2. SolutionHero KHÔNG có ảnh: phải bỏ hẳn khối ảnh, không để khung rỗng --- */}
      <CaseHeading>SolutionHero · KHÔNG có ảnh (bỏ hẳn khối ảnh)</CaseHeading>
      <SolutionHero
        breadcrumbs={[{ label: 'Giải pháp', href: '/vi/solutions' }, { label: 'Không ảnh' }]}
        description="Trang không có ảnh sản phẩm chỉ còn text và CTA."
        primaryCta={{ label: 'Đăng ký demo', href: '/vi/contact' }}
        secondaryCta={{ label: 'Xem tính năng ›', href: '#features' }}
        title="Hero không có ảnh"
      />

      {/* --- 3. FeatureZigZag: 4 trường hợp biên --- */}
      <CaseHeading>FeatureZigZag · ảnh ngang / ảnh DỌC (0.735) / KHÔNG ảnh / ảnh ngang 1.60</CaseHeading>
      <Section>
        <FeatureZigZag features={zigZagSamples} />
      </Section>

      {/* --- 4. FeatureZigZag có ảnh phụ --- */}
      <CaseHeading>FeatureZigZag · ảnh phụ (3 ảnh ngang hàng)</CaseHeading>
      <Section>
        <FeatureZigZag features={zigZagWithExtras} showExtraImages />
      </Section>

      {/* --- 5. Bento pháp quy --- */}
      <CaseHeading>BentoCompliance · ô lớn 2×2 + 2 ô nhỏ</CaseHeading>
      <Section variant="alt">
        <BentoCompliance
          items={[
            {
              large: true,
              title: 'Thông tư 27/2020 — Đánh giá học sinh',
              description:
                'Màn hình đánh giá chia theo đúng bốn bước nghiệp vụ: nhận xét thường xuyên, đánh giá định kỳ, năng lực và phẩm chất, tổng hợp và chốt.',
            },
            {
              title: 'Thông tư 70/2026 — Học bạ số',
              description:
                'Hạn tạo lập, ký giáo viên chủ nhiệm và ban giám hiệu, phát hành, xác thực.',
            },
            {
              title: 'Liên thông CSDL ngành',
              description: 'Mục quản trị riêng để đẩy dữ liệu trường lên cơ sở dữ liệu ngành.',
            },
          ]}
          title="Bám sát văn bản pháp quy"
        />
      </Section>

      {/* --- 6. Section AI — NỀN TỐI --- */}
      <CaseHeading>AiSection · variant=&quot;ink&quot; · accent-ink #64b5ff (primary chỉ 3.4:1)</CaseHeading>
      <AiSection
        description="AI chạy trong nghiệp vụ, không phải một màn hình riêng. Mỗi lần dùng AI đều được ghi nhật ký để tra lại."
        image="/images/solutions/v2/lms/04-danh-gia-ai-crop.png"
        imageAlt="Khung trợ lý AI gợi ý câu nhận xét học sinh"
        suggestions={[
          'Gợi ý câu nhận xét học sinh ngay trong màn hình đánh giá',
          'Tóm tắt biên bản họp',
          'Soạn thông báo',
        ]}
        title="Trợ lý AI trong công việc hằng ngày"
      />

      {/* --- 7. Ba thẻ "Dành cho ai" --- */}
      <CaseHeading>AudienceCards · 3 thẻ, kẻ trên không bo góc</CaseHeading>
      <Section>
        <AudienceCards
          cards={[
            {
              title: 'Trường tiểu học',
              description: 'Muốn số hoá toàn bộ vận hành trong một hệ thống thay cho nhiều phần mềm rời.',
            },
            {
              title: 'Đơn vị quản lý nhiều trường',
              description: 'Cần một tài khoản xem tổng hợp liên trường rồi đi vào từng cơ sở.',
            },
            {
              title: 'Ban giám hiệu',
              description: 'Cần báo cáo điều hành nhanh thay cho việc gom số liệu thủ công.',
            },
          ]}
        />
      </Section>

      {/* --- 8. FAQ accordion --- */}
      <CaseHeading>FaqAccordion · details/summary native, mặc định đóng hết</CaseHeading>
      <Section variant="alt">
        <FaqAccordion
          items={[
            {
              question: 'Khác gì LMS học trực tuyến?',
              answer:
                'Đây là hệ thống quản trị trường học: chương trình, thời khoá biểu, đánh giá, học bạ, hành chính và báo cáo. Không phải nơi làm bài tập hay thi online.',
            },
            {
              question: 'Dùng được cho nhiều trường không?',
              answer:
                'Có. Một tài khoản quản trị có thể quản lý nhiều trường và xem tổng hợp liên trường.',
            },
            {
              question: 'Đánh giá và học bạ có bám quy định không?',
              answer:
                'Có. Đánh giá học sinh theo Thông tư 27/2020; học bạ số theo Thông tư 70/2026.',
            },
            {
              question: 'Trợ lý AI làm được gì?',
              answer:
                'Gợi ý câu nhận xét trong màn hình đánh giá, tóm tắt biên bản và soạn thông báo. Có nhật ký để tra lại lịch sử sử dụng.',
            },
          ]}
        />
      </Section>

      {/* --- 9. CTA cuối full-width, padding co giãn (spacing="large") --- */}
      <CaseHeading>CTA cuối · spacing=&quot;large&quot; (--space-section)</CaseHeading>
      <Section spacing="large">
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className="text-h2 font-bold">Xem LMS vận hành cho trường bạn</h2>
          <p className="max-w-[52ch] text-body-lg text-text-secondary">
            Chúng tôi dựng bản demo với chương trình và lịch học mẫu để bạn xem đúng giao diện sẽ
            dùng hằng ngày.
          </p>
          <Button size="lg" variant="primary">
            Đăng ký demo
          </Button>
        </div>
      </Section>
    </>
  );
}