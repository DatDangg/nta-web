---
id: ja-case-studies-copy-polish
type: feature
status: done
created: 2026-11-09
---

# Biên tập lại văn bản tiếng Nhật trang Case Studies (danh sách + DentGo + AI Camera/Drone)

## Yêu cầu
User (2026-11-09) gửi bản đánh giá của người review tiếng Nhật: bản ja hiện tại hiểu được nhưng
diễn đạt sát tiếng Anh, chưa tự nhiên cho khách B2B Nhật. Sửa nội dung ja (chỉ ja — vi/en giữ nguyên).

Đã đối chiếu với trang live `https://ntavietnam.tech/ja/case-studies` (+ 2 trang chi tiết) ngày 2026-11-09:
**mọi câu reviewer trích đều khớp nguyên văn trên live**. Nội dung ja nằm trong **DB prod**
(seed tay ở CR-044, actor `dev:claude-cr044`), KHÔNG có trong repo → sửa bằng `content-cli update`
(`docs/content-bot/05-playbook.md`), không phải sửa file.

### 1. Danh sách `/ja/case-studies` (bản ghi `listing_page` / `listing_item` / `listing_cta`)
| Hiện tại | Sửa thành |
|---|---|
| 現場の課題から / デジタルソリューションへ | 現場の課題を、/ デジタルの力で解決 |
| NTAが企業・組織とともに手がけたプロジェクトと提案です。 | NTAが企業や団体と連携して取り組んだ導入事例や提案をご紹介します。 |
| 課題起点 / 組織ごとに合わせて設計 | 課題重視 / 各組織の課題に合わせた設計 |
| 多様な業種 / 医療、文化遺産、企業 | 多様な分野 / 医療・文化遺産保護・企業向け業務支援 |
| 透明性 / 提案と成果を明確に区別 | 透明性の確保 / 提案内容と導入実績を明確に区別 |
| メコンデルタの歯科クリニックにおけるDentGoクリニック管理 | メコンデルタの歯科クリニックにおけるDentGoを活用した業務管理 (cả listing_item lẫn case_study) |
| AIカメラとドローン巡回によるシステムを提案します。 | AIカメラとドローンによる巡回監視システムをご提案します。 (cả listing_item lẫn case_study) |
| 次のプロジェクトへ | 次のプロジェクトを、NTAとともに |
| 貴組織の課題をお聞かせください。NTAが最適な計画づくりをお手伝いします。 | 貴社・貴団体が抱える課題をお聞かせください。NTAが課題に合わせた最適な解決策をご提案します。 |

### 2. `/ja/case-studies/heritage-site-ai-camera` (case_study ja)
| Hiện tại | Sửa thành |
|---|---|
| AI技術で文化遺産を守る | AI技術を活用して文化遺産を守る |
| NVIDIA JetsonによるEdge AI処理 | NVIDIA Jetsonを活用したエッジAI処理 |
| 24時間365日の集中監視を行う中央VMS | 24時間365日の集中監視を実現する統合型VMS |
| AIによる侵入の早期アラートと異常検知 | AIによる侵入・異常の早期検知とアラート通知 |
| 侵入リスクをより早く検知し、インシデントを削減 | 不審な侵入を早期に検知し、被害のリスクを低減 |
| AIカメラとドローンで死角のない監視を | AIカメラとドローンで監視の死角を最小限に |
| 将来の世代へ守り継ぎ | 次世代へ継承し |
| 持続可能な保存に根ざした観光の発展を後押しします | 文化遺産の持続可能な保全と観光振興の両立を支援します |
| 不審人物を検知 (EN gốc: "Unknown person detected") | 人物を検知 (bám EN, không gán "khả nghi") |

### 3. `/ja/case-studies/dental-clinic-operations` (case_study ja)
| Hiện tại | Sửa thành |
|---|---|
| 患者およびクリニックの情報は機密を保つ必要があります。 | 患者情報やクリニックの運営情報を適切に保護する必要がありました。 |
| 日々の数値（来院数、回収済み売上、消耗品） | 日々の数値（来院数、入金額、消耗品の使用量） |
| 予約を電話とノートで管理していたため、リマインドや日程変更の把握が困難でした。 | 予約を電話やノートで管理していたため、リマインダーの送信や予約変更の管理が困難でした。 |
| 患者ごとに1つのカルテ：履歴、治療計画、処方、画像、残高を集約しました。 | 患者ごとの電子カルテに、診療履歴、治療計画、処方情報、画像、未収金残高を集約しました。 |
| 医薬品・消耗品を在庫上で治療セッションと連動させました。 | 医薬品・消耗品の在庫情報を各診療とひも付けて管理できるようにしました。 |
| 歯科医師は各治療セッションの前に、完全なカルテを開いて確認できます。 | 歯科医師は診療前に、患者の診療履歴や治療情報をまとめて確認できます。 |
| DentGoは診療・運営・財務／在庫の業務をひとつの基盤にまとめます。 | DentGoは診療、クリニック運営、財務・在庫管理を単一のプラットフォームに統合します。 |
| 予約は来院へ、来院はカルテへとつながり | 予約から来院、診療記録までの業務フローを一元管理し |
| デジタル受付から / つながるクリニックへ | 受付のデジタル化から、/ クリニック全体の連携へ |
| クリニックは同じDentGoの基盤の上に機能を拡張できます | クリニックはDentGoを基盤として、さまざまな機能を拡張できます |
| クリニックの同じ姿を共有できるようにすることです。 | クリニックの運営状況を共通認識として把握できるようにすることです。 |
| 単独院・複数院の歯科クリニック向けに | 1院から複数院を運営する歯科クリニックまで |

### 4. Nhất quán (áp cho cả 3 trang)
- `回収済み売上` → `入金額` ở MỌI chỗ (còn 1 chỗ reviewer không trích: bullet dashboard "…サービス金額、回収済み売上を確認できる日次ダッシュボード").
- `治療セッション` → `診療` ở mọi chỗ (còn câu "各治療セッションには消耗品、歯科医師の報酬、売上がひも付きます").
- `未収残高` / `残高` → `未収金残高` thống nhất (còn stat "…未収残高とともに一覧表示", câu "患者の残高を1か所で確認").
- `ひとつ` / `1つ`: chọn 1 cách (đề xuất `1つ` cho số đếm, bỏ `ひとつ` trong văn mô tả); `Edge AI` → `エッジAI` trong thân bài ja.
- Dấu `：` giữa câu dài → đổi `。` hoặc viết lại câu hoàn chỉnh (vd câu "…機能を拡張できます：Zalo OA/SMS…").

## Acceptance (bắt buộc)
- [ ] 3 trang `/ja/case-studies`, `/ja/case-studies/dental-clinic-operations`, `/ja/case-studies/heritage-site-ai-camera` hiển thị đúng các câu mới ở bảng 1–3 (kiểm bằng fetch live sau revalidate).
- [ ] Không còn `回収済み売上`, `治療セッション`, `機密を保つ`, `在庫上で`, `同じ姿`, `死角のない`, `不審人物` trên 3 trang ja.
- [ ] Bản vi/en không đổi; card listing ja và hero case_study ja dùng cùng câu (không lệch).
- [ ] Backup DB trước khi update (như CR-044), ghi actor rõ ràng, revalidate các path liên quan.

## Ghi chú
- Phân loại dự kiến: MODIFY nội dung (content-only, DB) — không đổi code/schema, không cần spec bump (chờ change-request xác nhận).
- Ngoài phạm vi review nhưng nên soát cùng lúc: trang giải pháp `/ja/solutions/dentgo` (cùng thuật ngữ 回収済み売上/治療セッション nếu có) — chỉ sửa nếu user đồng ý mở rộng scope.
- Nguồn đề xuất: bản đánh giá của người review tiếng Nhật do user dán vào chat 2026-11-09.

## Tiến độ xử lý
- 2026-11-09: change-request — MODIFY content-only (DB ja), risk MEDIUM, không bump spec. Task `tasks/feature-ja-case-studies-copy-polish/phase-1-task-01.md`.
  Chờ user: duyệt plan + quyền SSH `root@187.52.119.50` (đọc `show` rồi `update --confirm-prod`) — lần đọc thử bị chặn bởi permission.
- 2026-11-09: DONE — 4 bản ghi ja v1→v2 trên prod (backup ops-cr046-ja-copy-20261109T082252Z.dump), revalidate, verify live PASS. Không bump spec; test-scope v63. Ngoài scope chưa soát: `/ja/solutions/dentgo`.
