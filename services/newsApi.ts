import { XMLParser } from 'fast-xml-parser';
import { RedditPost } from '../types/news';

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

// ── 工具函数 ──

function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractText(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value['#text']) return String(value['#text']);
  return String(value);
}

function extractLink(item: any): string {
  if (!item.link) return '';
  if (typeof item.link === 'string') return item.link;
  if (Array.isArray(item.link)) {
    const alt = item.link.find(
      (l: any) => l['@_rel'] === 'alternate' || !l['@_rel']
    );
    return alt?.['@_href'] ?? item.link[0]?.['@_href'] ?? '';
  }
  return item.link['@_href'] ?? item.link.href ?? '';
}

// ── RSS/Atom 解析 ──

function parseFeed(xml: string): any[] {
  try {
    const doc = xmlParser.parse(xml);
    const items = doc.rss?.channel?.item;
    if (items) return Array.isArray(items) ? items : [items];
    const entries = doc.feed?.entry;
    if (entries) return Array.isArray(entries) ? entries : [entries];
    return [];
  } catch {
    return [];
  }
}

// ── 1. The Verge AI (RSS) ──

async function fetchVerge(signal: AbortSignal): Promise<RedditPost[]> {
  try {
    const res = await fetch(
      'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
      { signal }
    );
    if (!res.ok) return [];
    const xml = await res.text();
    const rawItems = parseFeed(xml);

    return rawItems
      .map((item: any): RedditPost | null => {
        const title = stripHtml(extractText(item.title));
        const link = extractLink(item);
        const desc = stripHtml(
          extractText(item.description ?? item.summary ?? item.content ?? '')
        );
        const pubDate =
          item.pubDate ?? item.published ?? item.updated ?? '';

        if (!title || !link) return null;

        return {
          id: link,
          title,
          body: desc,
          url: link,
          author: 'The Verge',
          score: 0,
          comments: 0,
          created: pubDate || new Date().toISOString(),
          permalink: link,
        };
      })
      .filter((p): p is RedditPost => p !== null);
  } catch {
    return [];
  }
}

// ── 2. Dev.to AI (JSON API，国内通常可直连) ──

async function fetchDevTo(signal: AbortSignal): Promise<RedditPost[]> {
  try {
    const res = await fetch('https://dev.to/api/articles?tag=ai&top=15', {
      signal,
    });
    if (!res.ok) return [];
    const articles: any[] = await res.json();

    return articles.map(
      (a: any): RedditPost => ({
        id: String(a.id),
        title: a.title,
        body: a.description || '',
        url: a.url,
        author: a.user?.name ?? 'Dev.to',
        score: a.positive_reactions_count ?? 0,
        comments: a.comments_count ?? 0,
        created: a.published_at || new Date().toISOString(),
        permalink: a.url,
      })
    );
  } catch {
    return [];
  }
}

// ── 3. Hugging Face Daily Papers (JSON) ──

async function fetchHFDaily(signal: AbortSignal): Promise<RedditPost[]> {
  try {
    const res = await fetch('https://huggingface.co/api/daily_papers', {
      signal,
    });
    if (!res.ok) return [];
    const papers: any[] = await res.json();

    return papers
      .map((p: any): RedditPost | null => {
        const paper = p.paper ?? p;
        const id = paper.id ?? '';
        const title = paper.title ?? '';
        if (!id || !title) return null;

        return {
          id,
          title,
          body: paper.summary ?? '',
          url: paper.url ?? `https://huggingface.co/papers/${id}`,
          author: 'Hugging Face',
          score: paper.upvotes ?? 0,
          comments: 0,
          created: paper.publishedAt ?? paper.published_at ?? new Date().toISOString(),
          permalink: paper.url ?? '',
        };
      })
      .filter((p): p is RedditPost => p !== null);
  } catch {
    return [];
  }
}

// ── 4. Hacker News (JSON fallback) ──

async function fetchHN(signal: AbortSignal): Promise<RedditPost[]> {
  try {
    const res = await fetch(
      'https://hn.algolia.com/api/v1/search_by_date?query=AI&tags=story&hitsPerPage=20',
      { signal }
    );
    if (!res.ok) return [];
    const json = await res.json();
    if (!json.hits?.length) return [];

    return json.hits
      .filter((h: any) => h.title)
      .map(
        (h: any): RedditPost => ({
          id: h.objectID,
          title: h.title,
          body: h.story_text || h.url || '',
          url:
            h.url ||
            `https://news.ycombinator.com/item?id=${h.objectID}`,
          author: h.author,
          score: h.points || 0,
          comments: h.num_comments || 0,
          created: h.created_at,
          permalink: `https://news.ycombinator.com/item?id=${h.objectID}`,
        })
      )
      .sort((a: RedditPost, b: RedditPost) => b.score - a.score);
  } catch {
    return [];
  }
}

// ── 主入口 ──

export async function fetchAINews(): Promise<RedditPost[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    // 四源并行抓取，任一失败不影响其他
    const [verge, devto, hf, hn] = await Promise.allSettled([
      fetchVerge(controller.signal),
      fetchDevTo(controller.signal),
      fetchHFDaily(controller.signal),
      fetchHN(controller.signal),
    ]);

    // 合并去重（按 URL）
    const seen = new Set<string>();
    const all: RedditPost[] = [];
    for (const r of [verge, devto, hf, hn]) {
      if (r.status === 'fulfilled') {
        for (const post of r.value) {
          if (!seen.has(post.url)) {
            seen.add(post.url);
            all.push(post);
          }
        }
      }
    }

    if (all.length === 0) throw new Error('所有英文新闻源不可用');

    return all.sort(
      (a, b) =>
        new Date(b.created).getTime() - new Date(a.created).getTime()
    );
  } finally {
    clearTimeout(timeout);
  }
}
