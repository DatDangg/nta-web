import { Container } from '@/components/ui/Container';
import type { Feature } from '@/content/types';
import { normalizeFeatures } from './features';
import { ShotImage } from './ShotImage';

type FeatureZigZagProps = {
  features: Feature[] | string[];
  /** Ảnh phụ (LMS feature 4: giáo án + học bạ số). Hiển thị 3 ảnh ngang hàng dưới mô tả. */
  showExtraImages?: boolean;
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
 * Padding dọc của section do `<Section>` bên ngoài lo — component này KHÔNG tự thêm `py-*`,
 * kẻ thêm sẽ cộng dồn thành khoảng trắng kép.
 */
export function FeatureZigZag({ features, showExtraImages = false }: FeatureZigZagProps) {
  const list = normalizeFeatures(features);

  return (
    <Container>
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

              {showExtraImages && feature.extraImages?.length ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {feature.extraImages.map((extra) => (
                    <FeatureImage
                      alt={extra.alt}
                      key={extra.src}
                      ratio={extra.ratio}
                      src={extra.src}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </Container>
  );
}