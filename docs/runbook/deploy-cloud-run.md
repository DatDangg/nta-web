# Deploy NTA Website lên Google Cloud Run

> Trạng thái: **chưa deploy**. Các file cấu hình chỉ được tạo; deploy thật cần được user approve ở `/start` bước 6.

## Prerequisites

- GCP project đã bật billing (Cloud Run free tier có quota, vượt quota sẽ phát sinh phí).
- Bật APIs: Cloud Run (`run.googleapis.com`), Artifact Registry (`artifactregistry.googleapis.com`) và Secret Manager (`secretmanager.googleapis.com`).
- Tạo Artifact Registry Docker repository tại `asia-southeast1`.
- Tạo Secret Manager secret `CONTACT_FORM_TARGET` và cấp quyền đọc secret cho Cloud Run runtime service account.
- Tạo GitHub Workload Identity Federation provider và deploy service account. Giới hạn trust theo repository/ref; cấp quyền tối thiểu cần thiết: Artifact Registry Writer, Cloud Run Admin (hoặc quyền deploy tương đương), Service Account User, và quyền truy cập secret phù hợp.
- Khi bật workflow, cấu hình GitHub Actions variables: `GCP_PROJECT_ID`, `GCP_ARTIFACT_REGISTRY_REPOSITORY`, `GCP_CLOUD_RUN_SERVICE`, `GCP_WORKLOAD_IDENTITY_PROVIDER` (resource name đầy đủ), `GCP_DEPLOY_SERVICE_ACCOUNT` (email).
- Không lưu service account key dài hạn hay giá trị secret trong GitHub variables/YAML. WIF dùng OIDC; runtime secret lấy từ Secret Manager.

## Build và push local

Chọn project/repo/service/image tag tương ứng rồi chạy:

```sh
gcloud auth login
gcloud config set project <PROJECT_ID>
gcloud auth configure-docker asia-southeast1-docker.pkg.dev
docker build -t asia-southeast1-docker.pkg.dev/<PROJECT_ID>/<AR_REPO>/<SERVICE>:<TAG> .
docker push asia-southeast1-docker.pkg.dev/<PROJECT_ID>/<AR_REPO>/<SERVICE>:<TAG>
```

## Deploy bằng gcloud

Tạo secret trước và thêm phiên bản giá trị thông qua giao diện/CLI bảo mật Secret Manager (không truyền secret trực tiếp vào shell history). Deploy image:

```sh
gcloud run deploy <SERVICE> \
  --image asia-southeast1-docker.pkg.dev/<PROJECT_ID>/<AR_REPO>/<SERVICE>:<TAG> \
  --project <PROJECT_ID> \
  --region asia-southeast1 \
  --max-instances 3 \
  --min-instances 0 \
  --allow-unauthenticated \
  --port 8080 \
  --set-secrets CONTACT_FORM_TARGET=CONTACT_FORM_TARGET:latest
```

Đây là public website; chỉ cấu hình env var server-side. Không cần DB/migration. Docker image tự chạy Next standalone server trên `0.0.0.0:8080` với non-root user. Dockerfile không có HEALTHCHECK; Cloud Run kiểm tra HTTP startup/liveness, và `/api/health` là endpoint ứng dụng.

## Verify

```sh
SERVICE_URL="$(gcloud run services describe <SERVICE> --project <PROJECT_ID> --region asia-southeast1 --format='value(status.url)')"
curl --fail --show-error "$SERVICE_URL/api/health"
```

Kỳ vọng HTTP thành công và JSON có `status: "ok"`. Nếu kết quả health hiện tại khác, kiểm tra contract tại `src/app/api/health/route.ts`.

## Rollback

Không có database nên rollback là deploy lại image tag trước đó bằng cùng lệnh `gcloud run deploy` và flags ở trên. Xác minh lại `/api/health` và trang public; lưu lại tag đang chạy trước khi rollback.

## Domain, HTTPS và DNS

Domain mục tiêu `ntasolution.vn` sẽ gắn sau khi DNS được cấu hình và user duyệt bước deploy. Có thể dùng Cloud Run domain mapping (nếu hỗ trợ trong region/project) hoặc external Application Load Balancer; cấu hình DNS theo hướng dẫn GCP cho phương án được chọn. Cloud Run Managed SSL cấp và gia hạn chứng chỉ sau khi DNS xác thực. Chỉ phục vụ HTTPS (R-19); dùng HTTPS URL/mapping, và không thêm redirect app-level vì TLS/HTTPS enforcement thuộc platform/load balancer.

## Scale và chi phí

`--min-instances 0` cho phép scale-to-zero; `--max-instances 3` giới hạn tối đa ba instances. Free tier phụ thuộc quota, vùng và mức sử dụng; billing vẫn cần bật và vượt quota có thể tính phí. Theo dõi chi phí và giới hạn concurrency/resources phù hợp khi vận hành.

## Troubleshooting

- **Workflow auth lỗi:** xác nhận issuer/provider, audience, repository/ref condition, service account binding `roles/iam.workloadIdentityUser`, và các GitHub variables.
- **Không pull/push image:** kiểm tra Artifact Registry API, repository ở `asia-southeast1`, image path và IAM Artifact Registry.
- **Deploy thiếu secret:** xác nhận secret có version enabled và runtime service account có quyền `roles/secretmanager.secretAccessor`.
- **Container không khởi động:** xem Cloud Run revision logs; xác nhận container lắng nghe `0.0.0.0:8080`, `server.js` có trong standalone output, và image build thành công.
- **Health check lỗi:** xem revision logs và gọi `/api/health` trên service URL; xác nhận revision đã ready trước khi kiểm tra.
