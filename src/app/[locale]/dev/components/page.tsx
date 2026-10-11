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
import { FeatureZigZag, FeatureImageRow } from '@/components/solutions/FeatureZigZag';
import { BentoCompliance } from '@/components/solutions/BentoCompliance';
import { AudienceCards } from '@/components/solutions/AudienceCards';
import { AiSection } from '@/components/solutions/AiSection';
import { FaqAccordion } from '@/components/solutions/FaqAccordion';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import type { Feature } from '@/content/types';

// Tỉ lệ đo thật từ file ảnh, xem docs/screenshots-mapping.md (đo lại sau khi bỏ padding)
const RATIO = {
  crmHero: 1.396,
  hrmHero: 1.065,
  dentgoWide: 1.476,
  hrmPortrait: 0.719,
  lmsTimetable: 0.877,
  lmsRecords: 0.824,
  lmsLesson: 1.114,
  lmsTt27Crop: 1.157,
} as const;

/** Ảnh hero dùng chung cho 4 sản phẩm — `01-tong-quan` của từng sản phẩm (spec §3). */
const heroSamples = [
  {
    key: 'CRM',
    src: '/images/solutions/v2/crm/01-tong-quan.png',
    ratio: RATIO.crmHero,
    maxW: 'max-w-full',
    vi: {
      title: 'Quản trị khách hàng (CRM)',
      description:
        'Một hệ thống cho toàn bộ vận hành khách hàng: hồ sơ 360 độ, đặt bàn, đơn hàng và điểm thưởng tích luỹ.',
      alt: 'Màn hình hôm nay: số khách đến, đơn hàng, doanh thu và số phiếu chờ xử lý',
    },
    en: {
      title: 'Customer Relationship Management (CRM)',
      description:
        'One system for the whole customer operation: 360-degree profiles, reservations, orders and loyalty points.',
      alt: 'Today dashboard: arrivals, orders, revenue and open tickets',
    },
  },
  {
    key: 'HRM',
    src: '/images/solutions/v2/hrm/01-tong-quan.png',
    ratio: RATIO.hrmHero,
    // Ảnh gần vuông ở 1280 sẽ cao ~1200px → giới hạn bề rộng riêng (spec §3)
    maxW: 'max-w-[960px]',
    vi: {
      title: 'Nhân sự (HRM)',
      description:
        'Hồ sơ nhân viên, chấm công, tính lương, nghỉ phép và quy trình đề xuất trong một hệ thống duy nhất.',
      alt: 'Giao diện minh hoạ — bảng tổng quan nhân sự với thẻ chỉ số và biểu đồ biến động',
    },
    en: {
      title: 'Human Resources (HRM)',
      description:
        'Employee records, attendance, payroll, leave and approval workflows in a single system.',
      alt: 'Illustrative interface — staff overview with metric cards and a trend chart',
    },
  },
];

/** Zig-zag: 4 feature — ngang / dọc / không ảnh / ảnh phụ. */
const zigZagSamples = [
  {
    image: '/images/solutions/v2/lms/02-quan-tri-bang-dieu-khien.png',
    ratio: 1.151,
    vi: {
      title: 'Quản trị bảng điều khiển',
      description: 'Số liệu tổng hợp của toàn trường, đi sâu vào từng cơ sở chỉ với một cú bấm.',
      imageAlt: 'Bảng điều khiển trường với thẻ học sinh, người dùng hoạt động và tiến độ công việc',
    },
    en: {
      title: 'School dashboard',
      description: 'Roll-up figures for the whole network, then drill into a single campus in one click.',
      imageAlt: 'School dashboard with student, active user and work progress cards',
    },
  },
  {
    // ẢNH DỌC — HRM 08, ratio 0.719 → nhánh B: khung max-h + fade đáy
    image: '/images/solutions/v2/hrm/08-quy-trinh-de-xuat.png',
    ratio: RATIO.hrmPortrait,
    vi: {
      title: 'Quy trình đề xuất và phê duyệt',
      description: 'Đề xuất đi qua các bước duyệt rõ ràng, mọi thay đổi đều có dấu vết thời gian.',
      imageAlt: 'Giao diện minh hoạ — quy trình đề xuất và phê duyệt',
    },
    en: {
      title: 'Proposal and approval workflow',
      description: 'Proposals move through clear approval steps, and every change keeps a time stamp.',
      imageAlt: 'Illustrative interface — proposal and approval workflow',
    },
  },
  {
    // KHÔNG CÓ ẢNH — phải trọn bề rộng, không để khung ảnh rỗng
    vi: {
      title: 'Kết nối với hệ thống đang vận hành',
      description:
        'Đồng bộ hai chiều với phần mềm kế toán, thiết bị chấm công và cổng dịch vụ công.',
    },
    en: {
      title: 'Connected to the systems you run',
      description:
        'Two-way sync with accounting software, attendance devices and public service portals.',
    },
  },
  {
    // ẢNH NGANG RỘNG NHẤT — DentGo 05, ratio 1.476 → nhánh A: không cắt, không fade
    image: '/images/solutions/v2/dentgo/05-kho-vat-tu.png',
    ratio: RATIO.dentgoWide,
    vi: {
      title: 'Danh mục vật tư và hàng hoá',
      description: 'Thuốc, vật liệu và mã thuốc quốc gia trong một danh mục duy nhất.',
      imageAlt: 'Danh mục vật tư và hàng hóa gồm thuốc, vật liệu và mã thuốc quốc gia',
    },
    en: {
      title: 'Inventory and supplies',
      description: 'Medicines, materials and national drug codes in one catalogue.',
      imageAlt: 'Inventory and supplies list with medicines, materials and national drug codes',
    },
  },
];

/** Feature 3 ảnh (LMS feature 4) — text trọn bề rộng, 3 ảnh cùng size một hàng. */
const imageRowSample = [
  {
    image: '/images/solutions/v2/lms/05-thoi-khoa-bieu.png',
    ratio: RATIO.lmsTimetable,
    extraImages: [
      {
        src: '/images/solutions/v2/lms/06-giao-an-dien-tu.png',
        ratio: RATIO.lmsLesson,
        vi: 'Danh sách giáo án điện tử theo môn và vòng đời soạn duyệt',
        en: 'Digital lesson plans by subject with draft and approval status',
      },
      {
        src: '/images/solutions/v2/lms/07-hoc-ba-so.png',
        ratio: RATIO.lmsRecords,
        vi: 'Danh sách học bạ số kèm trạng thái ký và phát hành',
        en: 'Digital student records with signing and issuance status',
      },
    ],
    vi: {
      title: 'Thời khoá biểu · giáo án điện tử · học bạ số',
      description:
        'Thời khoá biểu kéo–thả. Giáo án soạn–duyệt trực tuyến. Học bạ số ký và phát hành ngay trong hệ thống.',
      imageAlt: 'Màn hình xếp thời khoá biểu toàn trường bằng kéo và thả',
    },
    en: {
      title: 'Timetables, lesson plans and digital records',
      description:
        'Drag-and-drop timetables. Lesson plans drafted and approved online. Digital records signed and issued inside the system.',
      imageAlt: 'Whole-school timetable built by drag and drop',
    },
  },
];

/** Dựng `Feature[]` từ mẫu song ngữ — dữ liệu mẫu giữ vi/en cạnh nhau, chỉ chọn 1 ngôn ngữ. */
function toFeatures(samples: typeof zigZagSamples, lang: 'vi' | 'en'): Feature[] {
  return samples.map((sample) => {
    const t = sample[lang];
    return {
      title: t.title,
      ...(t.description ? { description: t.description } : {}),
      ...(sample.image ? { image: sample.image, imageAlt: t.imageAlt ?? '', ratio: sample.ratio } : {}),
    };
  });
}

/** Dựng feature 3 ảnh từ mẫu song ngữ. */
function toImageRowFeature(
  sample: (typeof imageRowSample)[number],
  lang: 'vi' | 'en'
): Feature {
  const t = sample[lang];
  return {
    title: t.title,
    description: t.description,
    image: sample.image,
    imageAlt: t.imageAlt,
    ratio: sample.ratio,
    extraImages: sample.extraImages.map((extra) => ({
      src: extra.src,
      alt: extra[lang],
      ratio: extra.ratio,
    })),
  };
}

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
  return [{ locale: 'vi' }, { locale: 'en' }];
}

/**
 * Copy song ngữ cho trang preview.
 *
 * ⚠ Trang này render ở **cả** `/dev/components` và `/en/dev/components`, nên mọi chữ
 * hiển thị phải theo locale. Trước đây hardtext tiếng Việt → bản EN lẫn "Giải pháp".
 * Copy bên dưới lấy từ `.context/design-spec-solution-detail.md` §11 (đã duyệt).
 */
const COPY = {
  vi: {
    solutionsCrumb: 'Giải pháp',
    noImageTitle: 'Hero không có ảnh',
    noImageDesc: 'Trang không có ảnh sản phẩm chỉ còn text và CTA.',
    demoCta: 'Đăng ký demo',
    featuresCta: 'Xem tính năng ›',
    featuresCtaLabel: 'Xem tính năng, cuộn xuống phần tính năng',
    bentoTitle: 'Bám sát văn bản pháp quy',
    bentoTt27: 'Thông tư 27/2020: Đánh giá học sinh',
    bentoTt27Desc:
      'Màn hình đánh giá chia theo đúng bốn bước nghiệp vụ: nhận xét thường xuyên, đánh giá địết kỳ, năng lực và phẩm chất, tổng hợp và chốt.',
    bentoTt70: 'Thông tư 70/2026: Học bạ số',
    bentoTt70Desc: 'Hạn tạo lập, ký giáo viên chủ nhiệm và ban giám hiệu, phát hành, xác thực.',
    bentoCSDL: 'Liên thông CSDL ngành',
    bentoCSDLDesc: 'Mục quản trị riêng để đẩy dữ liệu trường lên cơ sở dữ liệu ngành.',
    aiTitle: 'Trợ lý AI trong công việc hằng ngày',
    aiDesc:
      'AI chạy trong nghiệp vụ, không phải một màn hình riêng. Mỗi lần dùng AI đều được ghi nhật ký để tra lại.',
    aiSuggestions: [
      'Gợi ý câu nhận xét học sinh ngay trong màn hình đánh giá',
      'Tóm tắt biên bản họp',
      'Soạn thông báo',
    ],
    panelLabel: 'Trợ lý nhận xét',
    panelStudent: 'Gợi ý cho Nguyễn Bảo Châu',
    panelMeta: 'Tạo cho 12 em còn trống',
    panelAction: 'Tạo 3 gợi ý',
    panelDesc:
      'Dựa trên điểm KTĐK, nhận xét kỳ trước và mức năng lực đã ghi. Có thể tạo hàng loạt cho những em còn trống rồi duyệt lại từng câu.',
    panelS1Label: 'Gợi ý 1',
    panelS1:
      'Em tích cực tham gia hoạt động, phát biểu đúng và đúng trình tự trong suốt kỳ đánh giá.',
    panelS2Label: 'Gợi ý 2',
    panelS2: 'Kết quả ổn định ở các môn chính, cần chú ý thêm phần tự học ngoài giờ.',
    audienceTitle: 'Dành cho ai',
    audienceCards: [
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
    ],
    faqTitle: 'Câu hỏi thường gặp',
    faq: [
      {
        q: 'Khác gì LMS học trực tuyến?',
        a: 'Đây là hệ thống quản trị trường học: chương trình, thời khoá biểu, đánh giá, học bạ, hành chính và báo cáo. Không phải nơi làm bài tập hay thi online.',
      },
      {
        q: 'Dùng được cho nhiều trường không?',
        a: 'Có. Một tài khoản quản trị có thể quản lý nhiều trường và xem tổng hợp liên trường.',
      },
      {
        q: 'Đánh giá và học bạ có bám quy định không?',
        a: 'Có. Đánh giá học sinh theo Thông tư 27/2020; học bạ số theo Thông tư 70/2026.',
      },
      {
        q: 'Trợ lý AI làm được gì?',
        a: 'Gợi ý câu nhận xét trong màn hình đánh giá, tóm tắt biên bản và soạn thông báo. Có nhật ký để tra lại lịch sử sử dụng.',
      },
    ],
    legacyF1: 'Quản lý khách hàng và cơ hội bán hàng tập trung',
    legacyF2: 'Báo cáo doanh thu theo chi nhánh',
    legacyF3: 'Tích hợp gọi thoại ngay trong màn hình',
    ctaTitle: 'Xem LMS vận hành cho trường bạn',
    ctaDesc:
      'Chúng tôi dựng bản demo với chương trình và lịch học mẫu để bạn xem đúng giao diện sẽ dùng hằng ngày.',
    noteText: (
      <>
        Trang xem thử component — chỉ có ở <code>npm run dev</code>. Production trả 404.
      </>
    ),
  },
  en: {
    solutionsCrumb: 'Solutions',
    noImageTitle: 'Hero without an image',
    noImageDesc: 'A page with no product image keeps only the text and CTAs.',
    demoCta: 'Request a demo',
    featuresCta: 'See features ›',
    featuresCtaLabel: 'See features, scroll down to the features section',
    bentoTitle: 'Built on the actual regulations',
    bentoTt27: 'Circular 27/2020: Student assessment',
    bentoTt27Desc:
      'The assessment screen is split into the four required stages: regular comments, periodic grading, competences and conduct, and final consolidation.',
    bentoTt70: 'Circular 70/2026: Digital records',
    bentoTt70Desc:
      'Creation deadlines, homeroom teacher and principal signatures, issuance and verification.',
    bentoCSDL: 'Sector data exchange',
    bentoCSDLDesc: 'A dedicated admin area pushes school data to the sector database.',
    aiTitle: 'AI in the daily workflow',
    aiDesc:
      'AI runs inside the workflow, not as a separate screen. Every use is logged for later review.',
    aiSuggestions: [
      'Suggests student comment wording inside the assessment screen',
      'Summarises meeting minutes',
      'Drafts announcements',
    ],
    panelLabel: 'Comment assistant',
    panelStudent: 'Suggestions for Nguyen Bao Chau',
    panelMeta: 'Generate for 12 students still blank',
    panelAction: 'Generate 3 suggestions',
    panelDesc:
      'Based on the recorded KTĐK score, the previous term’s comments and the logged competences. You can generate them in bulk, then review each one.',
    panelS1Label: 'Suggestion 1',
    panelS1:
      'Takes part in class activities, answers clearly and follows the expected order throughout the assessment period.',
    panelS2Label: 'Suggestion 2',
    panelS2: 'Steady results in the main subjects; more independent study time would help.',
    audienceTitle: "Who it's for",
    audienceCards: [
      {
        title: 'Primary schools',
        description: 'Want one system across operations instead of several disconnected tools.',
      },
      {
        title: 'Multi-school operators',
        description: 'Need one account to see a cross-school view and drill into each campus.',
      },
      {
        title: 'School leadership',
        description: 'Need executive reporting without compiling figures by hand.',
      },
    ],
    faqTitle: 'Frequently asked questions',
    faq: [
      {
        q: 'How is this different from an online course platform?',
        a: 'This is a school operations system: curriculum, timetables, assessment, student records, administration and reporting. It is not an online quiz or assignment tool.',
      },
      {
        q: 'Can it run multiple schools?',
        a: 'Yes. A single administrator account can manage several schools and view cross-school totals.',
      },
      {
        q: 'Do assessment and student records follow the regulations?',
        a: 'Yes. Student assessment follows Circular 27/2020; digital student records follow Circular 70/2026.',
      },
      {
        q: 'What does the AI assistant do?',
        a: 'Suggests comment wording in the assessment screen, summarises minutes and drafts announcements. Usage is logged for review.',
      },
    ],
    legacyF1: 'Centralised customer and sales pipeline management',
    legacyF2: 'Revenue reports by branch',
    legacyF3: 'Built-in calling from the record screen',
    ctaTitle: 'See how the LMS would run your school',
    ctaDesc:
      'We set up a demo with a sample curriculum and timetable so you can see the interface you will use daily.',
    noteText: (
      <>
        Component preview — dev only (<code>npm run dev</code>). Production returns 404.
      </>
    ),
  },
};

export default async function ComponentPreviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // KHÔNG build ra production. `NODE_ENV` được Next thay thế lúc build.
  if (process.env.NODE_ENV !== 'development') notFound();

  setRequestLocale(locale);

  const lang = locale === 'en' ? 'en' : 'vi';
  const c = COPY[lang];
  const prefix = locale === 'en' ? '/en' : '';

  return (
    <>
      <PreviewNote title="PREVIEW T2">{c.noteText}</PreviewNote>

      {/* --- 1. SolutionHero: ảnh ngang vs ảnh gần vuông --- */}
      {heroSamples.map((hero) => (
        <section key={hero.key}>
          <CaseHeading>{`SolutionHero · ${hero.key} · ratio ${hero.ratio} · ${hero.maxW}`}</CaseHeading>
          <SolutionHero
            breadcrumbs={[
              { label: c.solutionsCrumb, href: `${prefix}/solutions` },
              { label: hero[lang].title },
            ]}
            description={hero[lang].description}
            image={hero.src}
            imageAlt={hero[lang].alt}
            imageMaxW={hero.maxW}
            imageRatio={hero.ratio}
            primaryCta={{ label: c.demoCta, href: `${prefix}/contact` }}
            secondaryCta={{
              label: c.featuresCta,
              href: '#features',
              ariaLabel: c.featuresCtaLabel,
            }}
            title={hero[lang].title}
          />
        </section>
      ))}

      {/* --- 2. SolutionHero KHÔNG có ảnh: phải bỏ hẳn khối ảnh, không để khung rỗng --- */}
      <CaseHeading>SolutionHero · KHÔNG có ảnh (bỏ hẳn khối ảnh)</CaseHeading>
      <SolutionHero
        breadcrumbs={[
          { label: c.solutionsCrumb, href: `${prefix}/solutions` },
          { label: c.noImageTitle },
        ]}
        description={c.noImageDesc}
        primaryCta={{ label: c.demoCta, href: `${prefix}/contact` }}
        secondaryCta={{ label: c.featuresCta, href: '#features' }}
        title={c.noImageTitle}
      />

      {/* --- 3. FeatureZigZag: 4 trường hợp biên --- */}
      <CaseHeading>FeatureZigZag · ảnh ngang / ảnh DỌC (0.719) / KHÔNG ảnh / ảnh ngang 1.476</CaseHeading>
      <FeatureZigZag features={toFeatures(zigZagSamples, lang)} />

      {/* --- 3b. FeatureZigZag data CŨ (string[]) — normalizeFeatures phải render được --- */}
      <CaseHeading>FeatureZigZag · features dạng string[] (dữ liệu cũ chưa migrate)</CaseHeading>
      <FeatureZigZag features={[c.legacyF1, c.legacyF2, c.legacyF3]} />

      {/* --- 4. Feature 3 ảnh: text trọn bề rộng, 3 ảnh cùng size 1 hàng, căn đỉnh --- */}
      <CaseHeading>FeatureImageRow · text full-width + 3 ảnh CÙNG SIZE 1 hàng, căn đỉnh</CaseHeading>
      {imageRowSample.map((sample) => (
        <FeatureImageRow feature={toImageRowFeature(sample, lang)} key={sample.image} />
      ))}

      {/* --- 5. Bento pháp quy — PHƯƠNG ÁN A (ĐÃ CHỐT): ô lớn có ảnh --- */}
      <CaseHeading>
        BentoCompliance · PHƯƠNG ÁN A (đã chốt) — ô lớn có ảnh 04-danh-gia-ai-tt27-crop.png
      </CaseHeading>
      <BentoCompliance
        items={[
          {
            large: true,
            title: c.bentoTt27,
            description: c.bentoTt27Desc,
            image: {
              src: '/images/solutions/v2/lms/04-danh-gia-ai-tt27-crop.png',
              alt: c.bentoTt27,
              ratio: RATIO.lmsTt27Crop,
            },
          },
          { title: c.bentoTt70, description: c.bentoTt70Desc },
          { title: c.bentoCSDL, description: c.bentoCSDLDesc },
        ]}
        title={c.bentoTitle}
      />

      {/* --- 5b. Bento pháp quy — PHƯƠNG ÁN B (FALLBACK): ô lớn dùng CON SỐ cực lớn.
          Dùng lại khi ảnh crop ô lớn không tạo được nhịp thị giác tốt. --- */}
      <CaseHeading>
        BentoCompliance · PHƯƠNG ÁN B (fallback) — ô lớn dùng con số &quot;27&quot; cỡ cực lớn, không ảnh
      </CaseHeading>
      <BentoCompliance
        items={[
          {
            large: true,
            title: c.bentoTt27,
            description: c.bentoTt27Desc,
            figure: { value: '27', suffix: '/2020' },
          },
          { title: c.bentoTt70, description: c.bentoTt70Desc },
          { title: c.bentoCSDL, description: c.bentoCSDLDesc },
        ]}
        title={c.bentoTitle}
      />

      {/* --- 6. Section AI — NỀN TỐI, khung Trợ lý nhận xét dựng bằng HTML/CSS --- */}
      <CaseHeading>AiSection · variant=&quot;ink&quot; · khung AI dựng bằng DOM (không dùng ảnh)</CaseHeading>
      <AiSection
        description={c.aiDesc}
        panel={{
          label: c.panelLabel,
          student: c.panelStudent,
          meta: c.panelMeta,
          action: c.panelAction,
          description: c.panelDesc,
          suggestions: [
            { label: c.panelS1Label, text: c.panelS1 },
            { label: c.panelS2Label, text: c.panelS2 },
          ],
        }}
        suggestions={[...c.aiSuggestions]}
        title={c.aiTitle}
      />

      {/* --- 7. Ba thẻ "Dành cho ai" --- */}
      <CaseHeading>AudienceCards · có tiêu đề section + 3 thẻ, kẻ trên không bo góc</CaseHeading>
      <AudienceCards
        cards={c.audienceCards}
        title={c.audienceTitle}
      />

      {/* --- 8. FAQ accordion --- */}
      <CaseHeading>FaqAccordion · có tiêu đề section · details/summary native, mặc định đóng hết</CaseHeading>
      <FaqAccordion
        title={c.faqTitle}
        items={c.faq.map((item) => ({ question: item.q, answer: item.a }))}
      />

      {/* --- 9. CTA cuối full-width, padding co giãn (spacing="large") --- */}
      <CaseHeading>CTA cuối · spacing=&quot;large&quot; (--space-section)</CaseHeading>
      <Section spacing="large">
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className="text-h2 font-bold">{c.ctaTitle}</h2>
          <p className="max-w-[52ch] text-body-lg text-text-secondary">{c.ctaDesc}</p>
          <Button size="lg" variant="primary">
            {c.demoCta}
          </Button>
        </div>
      </Section>
    </>
  );
}