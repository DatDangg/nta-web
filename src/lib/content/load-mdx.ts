import 'server-only';

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import type { Locale } from '@/content/types';

export async function loadMdxDirectory<T>(directory: string, locale: Locale): Promise<T[]> {
  const contentDirectory = path.join(process.cwd(), 'src/content', directory, locale);
  const fileNames = (await readdir(contentDirectory)).filter((name) => name.endsWith('.mdx'));
  const records: T[] = [];

  for (const fileName of fileNames) {
    const filePath = path.join(contentDirectory, fileName);
    const source = await readFile(filePath, 'utf8');
    const { data, content } = matter(source);
    records.push({ ...data, body: content.trim() } as T);
  }

  return records;
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
