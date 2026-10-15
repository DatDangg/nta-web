# builder summary — feature-ai-news-item-images phase-1-task-02 (CR-035)
- Done: publish-post --images-dir (manifest-only, lstat no symlink, inspectImage, sha256 == name, ext khớp) → saveImage trước createEntry.
- publishPost trả { posts, images, warnings } (trước: mảng posts). CLI in "publish-post image <path> status=...".
- Files: tools/db/publish-post.ts, tools/db/content-cli.ts, tools/db/publish-post.test.ts, tools/db/content-cli.test.ts, docs/runbook/db.md §9, task file Verification summary.
- Verify: npm test (TEST_DATABASE_URL = postgres:16-alpine tạm 127.0.0.1:55433, đã stop) 146 pass/2 skip; typecheck PASS; lint PASS (1 warning có sẵn).
- Dở: docker nta-tools dry-run trên DB dev chưa chạy; symlink test skip trên Windows.
