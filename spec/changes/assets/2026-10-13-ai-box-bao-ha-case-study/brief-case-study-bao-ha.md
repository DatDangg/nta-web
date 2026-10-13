# Case study: AI Box tại đền Bảo Hà

Oct 13, 2026 · @orbitextech

## Hero

Nội dung dưới đây bám theo bố cục trang case study Óc Eo – Ba Thê (Hero → Thách thức → Giải pháp → Kết quả → Công nghệ → Tầm nhìn → CTA), viết bằng tiếng Việt cho bản VI của trang. Chỗ đánh dấu **\[cần xác nhận\]** là thông tin mình chưa có.

**Nhãn:** Triển khai · 2026 **\[cần xác nhận: Triển khai / Thí điểm / Đề xuất\]**

**Tiêu đề:** Giữ gìn chốn linh thiêng bằng AI tại biên

**Phụ đề:** Giải pháp AI Box cho Di tích lịch sử – văn hóa quốc gia đền Bảo Hà (Lào Cai)

**Mô tả:** AI Box phân tích trực tiếp video từ hệ thống camera của đền ngay tại chỗ. Hệ thống phát hiện sớm cháy, khói, ẩu đả, tụ tập quá đông và xâm nhập ngoài giờ, rồi gửi cảnh báo kèm ảnh khoanh vùng về dashboard trung tâm trong vài giây.

**Nút:** Khám phá giải pháp

**Ba chỉ số nổi bật:**

| Chỉ số | Nhãn |
| --- | --- |
| 136.000+ lượt khách | Tuần Văn hóa du lịch – Lễ hội đền Bảo Hà 2026 ([Báo Lào Cai](https://baolaocai.vn/bao-ha-don-hon-136000-luot-du-khach-dip-le-hoi-post907375.html)) |
| \[N\] AI Box | Xử lý AI tại biên, không cần đẩy toàn bộ video về trung tâm **\[cần xác nhận số box\]** |
| 24/7 | Giám sát và cảnh báo tự động liên tục |

**Ảnh Hero** (`/images/cases/bao-ha/hero.jpg`, 16:9, tối thiểu 3840 px ngang)

- **Alt:** Minh họa đền Bảo Hà bên sông Hồng với camera AI gắn cột, khung nhận diện người và vùng giám sát phát sáng trên sân đền
- **Prompt tạo ảnh:** Semi-realistic digital illustration of a traditional northern Vietnamese temple on a riverbank with a forested hill behind it, curved tiled roofs, red wooden pillars, wide stone courtyard with incense burners. A pole-mounted security camera in the foreground, translucent blue detection boxes around small anonymous visitor silhouettes, a glowing outlined zone on the courtyard, soft dawn light, clean tech overlay, no text, no logos, no deity statues.

&#91;embedded content: ảnh minh họa Hero · vẽ vector\]

Bản phác họa bố cục ảnh Hero: camera AI bên trái, đền ở giữa, vùng giám sát và khung nhận diện trên sân, thẻ cảnh báo góc phải.

## Thách thức

Đền Bảo Hà vừa là di tích quốc gia vừa là điểm tâm linh đông khách, nên rủi ro dồn vào vài thời điểm cao điểm trong năm.

- **Lượng khách tăng đột biến theo mùa lễ.** Riêng dịp đầu xuân 2026, xã Bảo Hà đón khoảng 300.000 lượt khách trong chưa đầy một tháng ([Báo Lào Cai](https://baolaocai.vn/den-bao-ha-tag4414.html)); lễ hội tháng 7 âm lịch cũng thu hút hơn 136.000 lượt.
- **Nguy cơ cháy cao.** Hương, nến, vàng mã được đốt liên tục trong không gian có nhiều kết cấu gỗ; các hộ kinh doanh đồ lễ quanh di tích cũng được yêu cầu tự trang bị bình chữa cháy ([Báo Lào Cai](https://baolaocai.vn/chu-dong-giu-vung-an-ninh-trat-tu-an-toan-phong-chay-tai-le-hoi-den-bao-ha-post907002.html)).
- **Giữ an ninh trật tự giữa đám đông.** Chen lấn, ẩu đả, móc túi và tranh chấp dễ xảy ra ở sân đền, cổng và khu dâng hương khi mật độ người cao.
- **Khung giờ đêm và ngoài giờ mở cửa.** Khu vực hậu cung, hòm công đức và kho đồ lễ cần được bảo vệ khi ít người trực.
- **Nhân lực trực camera có hạn.** Một người không thể theo dõi đồng thời hàng chục màn hình trong suốt nhiều ngày lễ liên tiếp.
- **Đặc thù môi trường tâm linh.** Khói hương và ánh nến khiến camera AI thông thường dễ báo cháy giả, cần cấu hình riêng cho từng vùng.

## Giải pháp

NTA lắp AI Box ngay tại đền, đọc trực tiếp luồng RTSP từ camera IP sẵn có, nên không phải thay camera hay đẩy toàn bộ video lên cloud.

- **AI Box xử lý tại biên** trên chip AI chuyên dụng (Sophgo BM1684, nhân TPU tăng tốc mạng nơ-ron), mỗi box phân tích nhiều luồng camera cùng lúc.
- **Bộ thuật toán theo từng vùng:** báo cháy và khói ở khu hóa vàng, chống xâm nhập ở hậu cung, đếm người ở cổng và sân đền, phát hiện ẩu đả ở khu đông người.
- **Cảnh báo tức thì qua webhook** về dashboard trung tâm, kèm loại sự kiện, camera, thời điểm và ảnh chụp có khung khoanh vùng.
- **Truy cập từ xa an toàn** qua HTTPS cho đội vận hành NTA để cập nhật cấu hình, vùng giám sát và mô hình.

Hệ thống tận dụng hạ tầng camera hiện có, chỉ bổ sung AI Box và phần mềm. **\[cần xác nhận: số camera đang được phân tích, vị trí lắp\]**

**Ảnh khối Công nghệ** (carousel 3–5 ảnh, giống phần "AI cameras and drones" của trang Óc Eo)

| File | Alt | Prompt tạo ảnh |
| --- | --- | --- |
| `aibox.jpg` | AI Box đặt trong tủ kỹ thuật cạnh switch mạng | Compact fanless edge AI box mounted in a network cabinet beside a PoE switch, blue status LEDs, neat cabling, product-photo lighting, no brand logos |
| `fire-zone.jpg` | Camera giám sát khu hóa vàng, khung đỏ khoanh vùng ngọn lửa | Temple paper-offering burner area at dusk viewed from a CCTV angle, a red bounding box around a growing flame, a dashed grey exclusion zone around incense pots, no text |
| `crowd.jpg` | Sân đền ngày lễ với lưới mật độ người | Top-down CCTV view of a crowded temple courtyard during a festival, anonymous figures, a translucent heatmap overlay from green to red, a counting line at the gate, no faces |
| `night.jpg` | Hàng rào ảo quanh hậu cung ban đêm | Night infrared CCTV view of a temple rear hall, a glowing polygon virtual fence on the ground, one silhouette crossing it highlighted in amber, grayscale with blue tint |

&#91;embedded content: ảnh minh họa khối Công nghệ · 3 góc camera\]

Ba khung hình mô phỏng góc nhìn camera: báo cháy có vùng loại trừ lư hương, bản đồ mật độ kèm tuyến đếm, và hàng rào ảo hồng ngoại ban đêm.

*Ghi chú dưới carousel:* Ảnh minh họa — sẽ thay bằng ảnh thực tế tại đền.

## Kết quả kỳ vọng

- Phát hiện cháy, khói và sự cố an ninh sớm hơn, trước khi lan rộng.
- Ban quản lý nắm mật độ khách theo thời gian thực để điều tiết luồng người dịp lễ.
- Giảm tải cho người trực camera: chỉ cần xử lý cảnh báo thay vì nhìn liên tục hàng chục màn hình.
- Giữ sự trang nghiêm của di tích mà không cần tăng thêm nhiều lực lượng tại chỗ.

**Ghi chú dưới phần kết quả (giữ giọng minh bạch như trang Óc Eo):** Các kết quả trên là mục tiêu của hệ thống, chưa phải số liệu đo được sau triển khai. Độ chính xác và số lượng cảnh báo phụ thuộc vị trí camera, ánh sáng và cấu hình tại từng khu vực. **\[Nếu đã có số liệu thật, ví dụ số cảnh báo/tháng hoặc tỷ lệ báo giả, thay đoạn này bằng số liệu đó.\]**

## Công nghệ: các thuật toán AI được sử dụng

**Tiêu đề khối:** Một AI Box, nhiều lớp thuật toán cho từng khu vực của đền

Mọi chức năng đều dựa trên hai lớp nền: **phát hiện đối tượng** và **theo dõi đối tượng**. Các chức năng phía trên chỉ là luật nghiệp vụ áp lên kết quả của hai lớp này.

### Lớp nền

1. **Phát hiện đối tượng (Object Detection).** Mạng nơ-ron tích chập một giai đoạn (one-stage CNN, họ YOLO) nhận diện người, phương tiện, ngọn lửa và cột khói trong từng khung hình, trả về khung bao và độ tin cậy. Mô hình được lượng tử hóa INT8 để chạy thời gian thực trên TPU của AI Box.
2. **Theo dõi đa đối tượng (Multi-Object Tracking).** Bộ lọc Kalman dự đoán vị trí kế tiếp, thuật toán ghép cặp Hungarian nối khung bao giữa các khung hình (kiểu SORT/ByteTrack). Mỗi người được gán một ID ổn định, làm cơ sở để đếm, đo thời gian lưu lại và xét hướng di chuyển.

### Các thuật toán chức năng

| Chức năng | Thuật toán | Cách hoạt động | Áp dụng tại đền |
| --- | --- | --- | --- |
| Báo cháy | Phát hiện lửa + xác nhận theo thời gian | Vùng lửa phải xuất hiện liên tục qua nhiều khung hình và có xu hướng lan rộng mới phát cảnh báo | Khu hóa vàng, kho đồ lễ, gian thờ có kết cấu gỗ |
| Báo khói | Phát hiện khói + phân tích chuyển động | Phân biệt cột khói lan rộng với làn khói hương mảnh, ổn định; vùng lư hương được loại trừ bằng mặt nạ ROI | Mái đền, kho, khu ngoài giờ |
| Xâm nhập vùng cấm | Hàng rào ảo (virtual fence) | Kiểm tra điểm chân của khung bao người có nằm trong đa giác vùng cấm (point-in-polygon), chỉ bật theo lịch giờ | Hậu cung, khu hòm công đức sau giờ đóng cửa |
| Vượt tuyến | Tripwire có hướng | Phát hiện quỹ đạo của một ID cắt qua đường kẻ ảo theo chiều định trước | Tường rào, lối vào phụ |
| Lảng vảng | Đo thời gian lưu trú | Cảnh báo khi một ID ở trong vùng quá ngưỡng thời gian cấu hình | Quanh hòm công đức, bãi xe ban đêm |
| Đếm người và mật độ | Đếm qua tuyến + ước lượng mật độ | Đếm ID đi qua cổng theo hai chiều; tính số người trong vùng và cảnh báo khi vượt ngưỡng an toàn | Cổng đền, sân chính, khu dâng hương |
| Ẩu đả | Nhận dạng hành vi (action recognition) | Ước lượng khung xương (pose keypoints) và phân tích chuỗi chuyển động qua một cửa sổ khung hình để nhận ra động tác xô xát | Sân đền, khu vực đông người dịp lễ |
| Phá hoại camera | Phát hiện che, xoay, mất nét | So khung hình hiện tại với ảnh nền tham chiếu (độ nét, phân bố màu); lệch lớn kéo dài là cảnh báo | Tất cả camera |

**\[cần xác nhận: chức năng nào đang thực sự bật trên box tại đền; bỏ các dòng chưa dùng\]**

### Giảm báo giả trong môi trường tâm linh

- **Mặt nạ vùng loại trừ:** lư hương, chân nến, đèn dầu được khoanh vùng để không kích hoạt báo cháy.
- **Ngưỡng độ tin cậy và số khung liên tiếp** riêng cho từng camera, tinh chỉnh theo ánh sáng ngày và đêm.
- **Gộp sự kiện:** AI Box gửi cảnh báo liên tục chừng nào sự kiện còn diễn ra; tầng xử lý phía dashboard gộp các cảnh báo cùng loại, cùng camera trong một khoảng thời gian thành một sự cố duy nhất, tránh dội thông báo cho người trực.

## Kiến trúc và luồng xử lý sự kiện

&#91;embedded content: luồng xử lý · camera → AI Box → dashboard\]

Toàn bộ phân tích chạy trong AI Box tại đền; ra khỏi mạng nội bộ chỉ có bản tin cảnh báo JSON (loại sự kiện, camera, tọa độ khung bao) kèm một ảnh chụp có khoanh vùng.

## Cảnh báo minh họa trên dashboard

Thay cho khối "VMS interface" của trang Óc Eo:

| Cảnh báo | Vị trí · giờ |
| --- | --- |
| Phát hiện khói bất thường | Khu hóa vàng · 21:47 |
| Mật độ người vượt ngưỡng | Sân chính · 10:15 |
| Xô xát giữa đám đông | Cổng đền · 09:32 |
| Xâm nhập ngoài giờ | Hậu cung · 02:08 |

*Giao diện minh họa — dữ liệu cảnh báo là giả lập.*

**Ảnh nền khối cảnh báo** (`dashboard.jpg`): ảnh chụp màn hình dashboard thật tại apibaoha, đã che IP, tên miền và thông tin nội bộ. Nếu chưa có, dùng prompt: Dark-theme monitoring dashboard on a wide monitor, a 3×3 grid of temple CCTV feeds, an alert list on the right with red and amber badges, one feed enlarged with a red bounding box, no readable text, no logos.

## Thư viện ảnh

**Tiêu đề khối:** Không gian di tích đền Bảo Hà

| File | Alt / chú thích |
| --- | --- |
| `bao-ha/overview.jpg` | Minh họa — toàn cảnh đền Bảo Hà tựa núi, nhìn ra sông Hồng |
| `bao-ha/gate.jpg` | Minh họa — cổng đền và lối lên sân chính |
| `bao-ha/courtyard.jpg` | Minh họa — sân đền rộng với lư hương lớn |
| `bao-ha/festival.jpg` | Minh họa — dòng người dâng hương dịp lễ hội tháng 7 âm lịch |
| `bao-ha/river.jpg` | Minh họa — sông Hồng và núi rừng phía trước đền |

*Ghi chú dưới thư viện:* Hình minh họa được dựng từ phối cảnh đề xuất — sẽ thay bằng ảnh thực tế của di tích.

Lưu ý khi chọn ảnh:

- Không lấy ảnh từ báo chí hay mạng xã hội để đăng lên web công ty khi chưa có giấy phép; dùng ảnh tự chụp, ảnh do ban quản lý cung cấp, hoặc ảnh minh họa tự tạo.
- Không chụp cận tượng thờ trong cung cấm và không để lộ mặt du khách nhận diện được; làm mờ nếu cần.
- Ảnh khối Tầm nhìn có thể dùng lại `overview.jpg`, giống cách trang Óc Eo dùng lại `site-aerial.jpg`.

## Tầm nhìn và lời kêu gọi

**Nhãn:** Hướng tới tương lai

**Tiêu đề:** Công nghệ phục vụ sự an toàn của chốn tâm linh

**Đoạn văn:** AI không thay thế người trông coi đền, mà giúp họ nhìn được nhiều hơn và phản ứng nhanh hơn. Cùng một AI Box, đền Bảo Hà có thể mở rộng sang cụm di tích lân cận như đền Cô Tân An, đền Làng Lúc, hướng tới một mạng lưới bảo vệ di tích thống nhất của địa phương.

**Trích dẫn:** "Mỗi mùa lễ hội an toàn là một mùa lễ hội trọn vẹn. AI giúp ban quản lý giữ được sự trang nghiêm của di tích ngay cả khi hàng chục nghìn người cùng đổ về." — *Tầm nhìn của NTA cho dự án*

**CTA tiêu đề:** Bạn muốn ứng dụng AI để bảo vệ đền, chùa, di tích của mình?

**CTA mô tả:** Liên hệ NTA để được khảo sát và tư vấn giải pháp AI Box phù hợp với đền chùa, di tích và điểm du lịch tâm linh.

**Nút:** Liên hệ với chúng tôi

## Cần xác nhận trước khi đăng

- [ ] Trạng thái dự án: đã triển khai, thí điểm hay đề xuất (quyết định nhãn Hero và đoạn ghi chú minh bạch)
- [ ] Số AI Box và số camera đang được phân tích
- [ ] Danh sách chức năng đang bật thực tế (lọc bảng thuật toán)
- [ ] Đơn vị đối tác hoặc chủ đầu tư có được nêu tên công khai không
- [ ] Số liệu vận hành thật nếu có (số cảnh báo, sự cố đã phát hiện, tỷ lệ báo giả)
- [ ] Ảnh thực tế tại đền cho phần thư viện ảnh, có sự đồng ý của ban quản lý

## Nguồn

- [Case study Óc Eo – Ba Thê, NTA](https://ntasolution.vn/en/case-studies/oc-eo-learning)
- [Bảo Hà đón hơn 136.000 lượt du khách dịp lễ hội — Báo Lào Cai](https://baolaocai.vn/bao-ha-don-hon-136000-luot-du-khach-dip-le-hoi-post907375.html)
- [Chủ động giữ vững an ninh, trật tự, an toàn phòng cháy tại lễ hội đền Bảo Hà — Báo Lào Cai](https://baolaocai.vn/chu-dong-giu-vung-an-ninh-trat-tu-an-toan-phong-chay-tai-le-hoi-den-bao-ha-post907002.html)
- [Đền Bảo Hà — Báo Lào Cai](https://baolaocai.vn/den-bao-ha-tag4414.html)
