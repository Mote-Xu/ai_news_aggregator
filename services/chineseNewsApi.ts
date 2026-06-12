import { RedditPost } from '../types/news';

// 多个中文 AI 新闻源，哪个通就用哪个
const SOURCES = [
  'https://www.jiqizhixin.com/rss',
  'https://www.qbitai.com/feed',
];

/** 去除 HTML 和多余空白 */
function strip(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

/** 解析 RSS XML */
function parseRSS(xml: string): RedditPost[] {
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const items: RedditPost[] = [];
  let match: RegExpExecArray | null;

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
        author: '机器之心',
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
      const items = parseRSS(xml);

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
