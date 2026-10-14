import 'server-only';

// Phần đọc file nằm ở mdx-files.ts (không server-only) để tools/db dùng lại đúng logic này.
export { assertRequiredFields, loadMdxDirectory } from './mdx-files';
