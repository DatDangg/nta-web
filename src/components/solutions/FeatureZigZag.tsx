import type { SectionVariant } from '@/components/ui/Section';
import { Section } from '@/components/ui/Section';
import type { Feature } from '@/content/types';
import { normalizeFeatures } from './features';
import { ShotImage } from './ShotImage';

type FeatureZigZagProps = {
  features: Feature[] | string[];
  /** Nền section — theo bảng §5 (mặc định `background`). Component tự gọi `<Section>`. */
  variant?: SectionVariant;
};

/**
 * Chiều cao tối đa của ảnh ở zig-zag — gõ trong `maxH` để component dùng làm nguồn
 * duy nhất. KHÔNG thêm `max-h-*` ở nơi khác: Tailwind quyết định thứ tự theo thứ tự
 * trong stylesheet, KHÔNG theo thứ tự class trong attribute — nên `max-h-[420px]` và
 * `max-h-[320px]` cùng tồn tại thì kẻ nào thắng là không đoán được.
 */
const MAX_H = 'max-h-[320px] lg:max-h-[420px]';

const IMAGE_SKIN = 'rounded-lg border border-border shadow-md';

function FeatureImage({ src, alt, ratio }: { src: string; alt: string; ratio?: number }) {
  return <ShotImage alt={alt} maxH={MAX_H} ratio={ratio} skin={IMAGE_SKIN} src={src} />;
}

/**
 * Danh sách tính năng dạng zig-zag (CRM · HRM · DentGo).
 *
 * Mỗi feature là 1 hàng 2 cột, xen kẽ: chẵn = text trái / ảnh phải, lẻ = đảo.
 * Feature **không có ảnh** chiếm trọn bề rộng, chữ căn trái — không render khung ảnh rỗng.
 *
 * Container **default 1280**, KHÔNG `prose` 720: 720px bóp mỗi feature thành một dải chữ +
 * ảnh hẹp. Giới hạn độ rộng chỉ áp cho **cột chữ** (`max-w-[38rem]`).
 *
 * Padding dọc do `<Section>` bên trong lo — component KHÔNG tự thêm `py-*`,
 * kẻ thêm sẽ cộng dồn thành khoảng trắng kép.
 *
 * ⚠ Component **tự gọi `<Section>`** (đúng pattern spec §1 L2: "mỗi component đó gọi
 * `<Section>`"). KHÔNG bọc thêm `<Section>` hay `<Container>` ở ngoài — `Section` đã có
 * `Container` bên trong, lồng thêm sẽ **cộng padding ngang 2 lần**.
 */
export function FeatureZigZag({ features, variant = 'default' }: FeatureZigZagProps) {
  const list = normalizeFeatures(features);

  return (
    <Section variant={variant}>
      {list.map((feature, index) => {
        const reverse = index % 2 === 1;

        // Feature không ảnh: trọn bề rộng, chữ căn trái.
        if (!feature.image) {
          return (
            <article className="border-b border-border py-10 last:border-b-0" key={`${feature.title}-${index}`}>
              <h3 className="text-h3 font-semibold">{feature.title}</h3>
              {feature.description ? (
                <p className="mt-3 max-w-[65ch] text-body text-text-secondary">
                  {feature.description}
                </p>
              ) : null}
            </article>
          );
        }

        return (
          <div
            className="grid items-center gap-8 border-b border-border py-10 last:border-b-0 lg:grid-cols-2 lg:gap-16 xl:gap-24 lg:py-14"
            key={`${feature.title}-${index}`}
          >
            <div className={reverse ? 'lg:order-2' : undefined}>
              <h3 className="text-h3 font-semibold">{feature.title}</h3>
              {feature.description ? (
                <p className="mt-3 max-w-[38rem] text-body text-text-secondary">
                  {feature.description}
                </p>
              ) : null}
            </div>

            <div className={reverse ? 'lg:order-1' : undefined}>
              <FeatureImage alt={feature.imageAlt ?? ''} ratio={feature.ratio} src={feature.image} />
            </div>
          </div>
        );
      })}
    </Section>
  );
}

/**
 * Feature **3 ảnh** (LMS feature 4 — thời khoá biểu · giáo án · học bạ số).
 *
 * Layout: text **trọn bề rộng** ở trên, 3 ảnh **cùng kích thước** một hàng bên dưới,
 * **căn đỉnh** (`items-start`).
 *
 * ⚠ KHÔNG dùng "1 lớn + 2 nhỏ so le": 3 ảnh có tỉ lệ rất khác nhau
 * (0.877 · 1.114 · 0.824) nên khi ép cùng một chiều cao, ảnh ngang bị thu nhỏ thành dải
 * mảnh còn ảnh dọc bị ép — hàng lệch tầng, nhìn rối. Ở đây cả 3 cùng `max-h` và cùng
 * `items-start`, nên mép trên thẳng hàng và chiều cao tự do theo tỉ lệ gốc.
 */
export function FeatureImageRow({
  feature,
  variant = 'default',
}: {
  feature: Feature;
  variant?: SectionVariant;
}) {
  const images = [
    { src: feature.image, alt: feature.imageAlt ?? '', ratio: feature.ratio },
    ...(feature.extraImages ?? []),
  ].filter((image): image is { src: string; alt: string; ratio?: number } => Boolean(image.src));

  if (!feature.image) {
    return (
      <Section size="prose" variant={variant}>
        <article className="py-10">
          <h3 className="text-h3 font-semibold">{feature.title}</h3>
          {feature.description ? (
            <p className="mt-3 max-w-[65ch] text-body text-text-secondary">{feature.description}</p>
          ) : null}
        </article>
      </Section>
    );
  }

  return (
    <Section variant={variant}>
      <div className="border-b border-border py-10 lg:py-14">
        <h3 className="text-h3 font-semibold">{feature.title}</h3>
        {feature.description ? (
          <p className="mt-3 max-w-[65ch] text-body text-text-secondary">{feature.description}</p>
        ) : null}

        <div className="mt-8 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <FeatureImage
              alt={image.alt}
              key={image.src}
              ratio={image.ratio}
              src={image.src}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}