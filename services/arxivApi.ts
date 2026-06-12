import { ArxivEntry } from '../types/arxiv';

const BASE = 'https://export.arxiv.org/api/query?sortBy=submittedDate&sortOrder=descending&max_results=20';
export const CATEGORIES = [
  { key: 'cs.AI', label: 'AI' },
  { key: 'cs.CV', label: 'CV' },
  { key: 'cs.CL', label: 'NLP' },
  { key: 'cs.LG', label: 'ML' },
  { key: 'cs.RO', label: 'Robotics' },
];

/** 去除 HTML 标签和多余空白 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

/** 从 ATOM XML 中提取所有 <entry> 块 */
function parseEntries(xml: string): ArxivEntry[] {
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  const entries: ArxivEntry[] = [];
  let match: RegExpExecArray | null;

  while ((match = entryRegex.exec(xml)) !== null) {
    const block = match[1];

    const id = block.match(/<id>(.*?)<\/id>/)?.[1] ?? '';
    const title = stripHtml(block.match(/<title>(.*?)<\/title>/)?.[1] ?? '');
    const summary = stripHtml(block.match(/<summary>(.*?)<\/summary>/)?.[1] ?? '');

    const authorMatches = block.matchAll(/<name>(.*?)<\/name>/g);
    const authors = Array.from(authorMatches).map(m => m[1]);

    const published = block.match(/<published>(.*?)<\/published>/)?.[1] ?? '';

    // arxiv API 返回的 link 有多种 rel，优先取 alternate
    const linkMatch = block.match(/<link[^>]*href="([^"]*)"[^>]*\/?>/);
    const link = linkMatch?.[1] ?? id;

    if (title) {
      entries.push({ id, title, summary, authors, published, link });
    }
  }

  return entries;
}

/** 格式化日期：2026-06-13T12:00:00Z → 2026-06-13 */
export function formatDate(iso: string): string {
  return iso.slice(0, 10);
}

/** 获取最新 AI 论文 */
export async function fetchLatestPapers(category = 'cs.AI'): Promise<ArxivEntry[]> {
  const url = `${BASE}&search_query=cat:${category}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const xml = await response.text();
    const entries = parseEntries(xml);

    if (entries.length === 0) {
      throw new Error('未找到论文数据');
    }

    return entries;
  } finally {
    clearTimeout(timeout);
  }
}
