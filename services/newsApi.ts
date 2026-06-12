import { RedditPost } from '../types/news';

/** CDATA 剥离 + HTML 移除 + 空白压缩 */
function strip(html: string): string {
  return html
    .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── RSS 源 ─────────────────────────────────────────
const RSS_SOURCES = [
  'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
];

function parseRSS(xml: string, srcUrl: string): RedditPost[] {
  const itemRegex = /<entry>([\s\S]*?)<\/entry>|<item>([\s\S]*?)<\/item>/g;
  const items: RedditPost[] = [];
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1] || match[2];
    const title = strip(block.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] ?? '');
    const link0 = block.match(/<link[^>]*href="([^"]*)"[^>]*\/?>/);
    const link1 = block.match(/<link>([\s\S]*?)<\/link>/);
    const link = strip(link0?.[1] ?? link1?.[1] ?? '');
    const desc = strip(
      block.match(/<description>([\s\S]*?)<\/description>/)?.[1] ??
      block.match(/<content[^>]*>([\s\S]*?)<\/content>/)?.[1] ?? ''
    );
    const pubDate = (
      block.match(/<published>([\s\S]*?)<\/published>/)?.[1] ??
      block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ??
      ''
    ).trim();

    if (title && link) {
      items.push({
        id: link,
        title,
        body: desc,
        url: link,
        author: 'The Verge',
        score: 0,
        comments: 0,
        created: pubDate || new Date().toISOString(),
        permalink: link,
      });
    }
  }
  return items;
}

// ── HN JSON API (fallback) ─────────────────────────
interface HNResult {
  objectID: string;
  title: string;
  url: string | null;
  author: string;
  points: number;
  num_comments: number;
  created_at: string;
  story_text: string | null;
}

interface HNResponse { hits: HNResult[]; }

function toHNPost(hit: HNResult): RedditPost {
  return {
    id: hit.objectID,
    title: hit.title,
    body: hit.story_text || hit.url || '',
    url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
    author: hit.author,
    score: hit.points || 0,
    comments: hit.num_comments || 0,
    created: hit.created_at,
    permalink: `https://news.ycombinator.com/item?id=${hit.objectID}`,
  };
}

// ── 主入口 ─────────────────────────────────────────
export async function fetchAINews(): Promise<RedditPost[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    // 1) The Verge RSS
    for (const url of RSS_SOURCES) {
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) continue;
        const xml = await res.text();
        const items = parseRSS(xml, url);
        if (items.length > 0) { clearTimeout(timeout); return items; }
      } catch { continue; }
    }

    // 2) HN fallback
    const hnRes = await fetch(
      'https://hn.algolia.com/api/v1/search_by_date?query=AI&tags=story&hitsPerPage=20',
      { signal: controller.signal }
    );
    if (hnRes.ok) {
      const json = (await hnRes.json()) as HNResponse;
      if (json.hits?.length) {
        clearTimeout(timeout);
        return json.hits.filter(h => h.title).map(toHNPost)
          .sort((a, b) => b.score - a.score);
      }
    }

    throw new Error('所有新闻源不可用');
  } finally {
    clearTimeout(timeout);
  }
}
