# Điều tra: `docker build --target builder` FAIL "ngẫu nhiên" ở bước prerender (CR-031, trước phase 3)

- **Ngày:** 2026-10-15 · **Người điều tra:** change-request · **Loại:** điều tra READ-ONLY (chưa sửa code)
- **Kết luận:** lỗi **không ngẫu nhiên**. Root cause đã có bằng chứng: lệnh `docker build --target builder` chạy tay **không truyền
  build-arg `NEXT_PUBLIC_SITE_URL`**. Khi đó Dockerfile đặt biến môi trường này thành **chuỗi rỗng**, `BASE_URL` thành `""`, và
  `new URL("")` trong `generateMetadata` của layout ném `ERR_INVALID_URL` ở **mọi** trang dùng layout `[locale]`.
  Trang báo lỗi khác nhau giữa các lần chỉ vì Next prerender song song: worker nào lỗi trước thì trang đó được in ra trước khi build thoát.

## Triệu chứng
- `docker build --target builder .` (builder các task P1-T01, P2-T02 dùng làm bằng chứng build) → `Error occurred prerendering page …`,
  "An error occurred in the Server Components render", digest giống nhau (`4187285032`), **trang khác nhau mỗi lần**.
- Cùng lệnh trên HEAD sạch (`git archive e202ffc | docker build --target builder -`) cũng FAIL → không do diff CR-031.
- `docker compose build nta-web` và CI deploy (8084015, 8794f29, e202ffc, 7e6fdb3) **PASS** 61/61.

## Tái hiện (2026-10-15, máy dev Windows + Docker 29.8.1)

| Lần | Lệnh | build-arg `NEXT_PUBLIC_SITE_URL` | Kết quả | Trang báo lỗi đầu tiên |
|---|---|---|---|---|
| 1 | `docker build --target builder .` (working tree P2-T02) | không | **FAIL** | `/vi/solutions/ai/ai-operations-brain`, `/en/solutions/enterprise/crm` |
| 2 | `git archive HEAD \| docker build --target builder -` (clean e202ffc) | không | **FAIL** | `/en/case-studies/dental-clinic-operations`, `/en/products/music-app` |
| 3 | `docker compose -p nta-web-buildcheck build nta-web` (working tree) | có (compose mặc định `https://ntavietnam.tech`) | **PASS** 61/61 | — |
| 4 | `docker build --target builder --build-arg NEXT_PUBLIC_SITE_URL=https://ntavietnam.tech .` (working tree) | có | **PASS** (exit 0) | — |

Cộng thêm các lần FAIL builder ghi ở P1-T01 và P2-T02. **Tỉ lệ:** không có arg thì FAIL 100% (2/2 lần tôi tự chạy, cộng các lần của builder);
có arg thì PASS 100% (2/2). Những lần trước đó báo "docker build --target builder PASS" (P2-T01) nhiều khả năng đã truyền arg.
Điểm này chưa kiểm lại được vì log của builder không còn.

## Chuỗi nhân quả (file:line)
1. `Dockerfile:11-12`: `ARG NEXT_PUBLIC_SITE_URL` (không có giá trị mặc định) rồi `ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL`.
   Thiếu arg thì ENV được đặt thành **chuỗi rỗng `""`**, không phải không đặt.
2. `src/lib/seo.ts:4`: `BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ntavietnam.tech'`. `??` chỉ thay khi giá trị là `null`/`undefined`,
   nên `""` lọt qua và `BASE_URL = ""`.
3. `src/app/[locale]/layout.tsx:30`: `metadataBase: new URL(BASE_URL)` thành `new URL("")` và ném `TypeError ERR_INVALID_URL`
   (tái hiện: `node -e 'new URL("/vi/x","")'` → `ERR_INVALID_URL`). Mọi route dưới `[locale]` đều lỗi, build thoát ở lỗi đầu tiên.
4. Trên Windows, `npm run build` không có biến này nên giá trị là `undefined`, `??` trả fallback và không gặp lỗi này.

## Vì sao CI / compose không bị
`docker-compose.yml` truyền `args: NEXT_PUBLIC_SITE_URL: ${NEXT_PUBLIC_SITE_URL:-https://ntavietnam.tech}`, và `deploy.yml` đặt env này.
**Production không bị ảnh hưởng.** Lỗi chỉ xảy ra với lệnh build tay thiếu arg, tức đúng lệnh các builder dùng làm bằng chứng build.

## Lỗi `npm run build` trên Windows (swc)
Đây là lỗi khác, không liên quan. `@swc/core` không nạp được native binding vì quyền DACL trên `C:\Users\datda\AppData\Local\swc`
(đã ghi từ CR-028). Lỗi xảy ra trước bước prerender, chỉ ở môi trường Windows của máy dev. Không ảnh hưởng CI/VPS và không do code.

## Các hướng đã loại trừ
- **Diff CR-031:** HEAD sạch cũng FAIL; có arg thì working tree PASS.
- **Thiếu RAM/CPU, số worker, đọc file song song, gọi mạng lúc build:** cùng máy, cùng context. Chỉ đổi đúng 1 build-arg là chuyển FAIL thành PASS,
  và digest lỗi giống nhau ở mọi trang (một lỗi duy nhất, không phải lỗi tài nguyên rải rác).
- **`.dockerignore`/file thừa:** cách 2 dùng `git archive` (không có file thừa) vẫn FAIL; cách 4 dùng working tree vẫn PASS.

## Đề xuất fix (chưa làm, cần duyệt)
| # | Fix | Rủi ro | Ghi chú |
|---|---|---|---|
| A | `src/lib/seo.ts:4` đổi `??` thành `\|\|` (có thể kèm `.trim()`): giá trị rỗng cũng dùng fallback canonical | **Thấp**: chỉ đổi hành vi khi biến rỗng; prod luôn có giá trị | Sửa đúng gốc phía code. Hằng `BASE_URL` dùng ở metadata/sitemap/robots/JSON-LD; nên thêm test nhỏ |
| B | `Dockerfile:11` đặt mặc định `ARG NEXT_PUBLIC_SITE_URL=https://ntavietnam.tech` | Thấp | Phòng thủ thêm phía build; compose/CI vẫn ghi đè |
| C | Quy ước bằng chứng build cho builder/reviewer: dùng `docker compose build nta-web` (giống CI) hoặc `--build-arg NEXT_PUBLIC_SITE_URL=…`; ghi vào `.context/project-config.md` (nhóm verify) | Không có | Tránh kết luận "flaky" sai ở các task sau |

**Khuyến nghị:** làm A + B + C trong một task BUG nhỏ (1 commit, review NORMAL), **trước phase 3**. Lý do: từ phase 3 web bắt đầu
import `src/db` và đổi cách render; nếu bằng chứng build còn nhiễu thì sẽ không phân biệt được lỗi thật với lỗi môi trường. Fix nhỏ, không đụng DB/prod data.
Tôi chưa sửa vì user yêu cầu chỉ điều tra.
