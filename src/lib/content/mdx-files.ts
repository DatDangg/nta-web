// Đọc file MDX trong src/content — dùng chung cho loader web (qua load-mdx.ts, có guard server-only)
// và script tools/db (import seed / parity chạy bằng tsx ngoài Next, không import được `server-only`).
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import type { Locale } from '@/content/types';

export interface MdxFile {
  fileName: string;
  frontmatter: Record<string, unknown>;
  body: string;
}

export async function readMdxFiles(directory: string, locale: Locale): Promise<MdxFile[]> {
  const contentDirectory = path.join(process.cwd(), 'src/content', directory, locale);
  const fileNames = (await readdir(contentDirectory)).filter((name) => name.endsWith('.mdx'));
  const files: MdxFile[] = [];

  for (const fileName of fileNames) {
    const source = await readFile(path.join(contentDirectory, fileName), 'utf8');
    const { data, content } = matter(source);
    files.push({ fileName, frontmatter: data, body: content.trim() });
  }

  return files;
}

export async function loadMdxDirectory<T>(directory: string, locale: Locale): Promise<T[]> {
  const files = await readMdxFiles(directory, locale);
  return files.map((file) => ({ ...file.frontmatter, body: file.body }) as T);
}

export function assertRequiredFields<T extends object>(
  record: T,
  requiredFields: (keyof T)[],
  filePath: string,
): T {
  const missing = requiredFields.filter((field) => record[field] === undefined || record[field] === null);
  if (missing.length > 0) {
    throw new Error(`Invalid content file ${filePath}: missing ${missing.join(', ')}`);
  }
  return record;
}
