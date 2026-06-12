import { RedditPost } from '../types/news';

// 中文科技新闻源（RSS → XML 解析）
const SOURCES = [
  'https://36kr.com/feed',
  'https://www.ithome.com/rss/',
];

/** 去除 HTML 和多余空白 */
function strip(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function sourceName(url: string): string {
  if (url.includes('36kr')) return '36氪';
  if (url.includes('ithome')) return 'IT之家';
  return '中文科技';
}

/** 解析 RSS XML */
function parseRSS(xml: string, srcUrl: string): RedditPost[] {
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const items: RedditPost[] = [];
  let match: RegExpExecArray | null;
  const src = sourceName(srcUrl);

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = strip(block.match(/<title>(.*?)<\/title>/)?.[1] ?? '');
    const link = block.match(/<link>(.*?)<\/link>/)?.[1]?.trim() ?? '';
    const desc = strip(block.match(/<description>(.*?)<\/description>/)?.[1] ?? '');
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? '';

    if (title && link) {
      items.push({
        id: link,
        title,
        body: desc,
        url: link,
        author: src,
        score: 0,
        comments: 0,
        created: pubDate || new Date().toISOString(),
        permalink: link,
      });
    }
  }

  return items;
}

export async function fetchChineseNews(): Promise<RedditPost[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  // 依次尝试每个源
  for (const url of SOURCES) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'AI_News_Aggregator/1.0' },
        signal: controller.signal,
      });

      if (!response.ok) continue;

      const xml = await response.text();
      const items = parseRSS(xml, url);

      if (items.length > 0) {
        clearTimeout(timeout);
        return items;
      }
    } catch {
      continue;
    }
  }

  clearTimeout(timeout);
  throw new Error('中文新闻源均不可用');
}
