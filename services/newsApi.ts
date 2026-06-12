import { RedditPost } from '../types/news';

interface RedditChild {
  data: {
    id: string;
    title: string;
    selftext: string;
    url: string;
    author: string;
    score: number;
    num_comments: number;
    created_utc: number;
    permalink: string;
  };
}

interface RedditResponse {
  data: {
    children: RedditChild[];
  };
}

// Reddit 国内可能被墙，改为用 rss2json 转换 Google News AI 源
// 或直接从 Hacker News 取（部分可用）
const SOURCES = [
  // Hacker News 搜索 AI → JSON API
  'https://hn.algolia.com/api/v1/search_by_date?query=AI&tags=story&hitsPerPage=20',
];

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

interface HNResponse {
  hits: HNResult[];
}

function toPost(hit: HNResult): RedditPost {
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

export async function fetchAINews(): Promise<RedditPost[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(SOURCES[0], {
      headers: { 'User-Agent': 'AI_News_Aggregator/1.0' },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const json = (await response.json()) as HNResponse;

    if (!json.hits?.length) {
      throw new Error('无新闻数据');
    }

    return json.hits
      .filter(h => h.title)
      .map(toPost)
      .sort((a, b) => b.score - a.score);
  } finally {
    clearTimeout(timeout);
  }
}
