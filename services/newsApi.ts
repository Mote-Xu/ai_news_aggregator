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

const REDDIT_URL =
  'https://www.reddit.com/r/artificial+MachineLearning/hot.json?limit=30';

function toPost(child: RedditChild): RedditPost {
  const d = child.data;
  return {
    id: d.id,
    title: d.title,
    body: d.selftext.length > 0 ? d.selftext : '[链接]',
    url: d.url.startsWith('http') ? d.url : 'https://www.reddit.com' + d.permalink,
    author: d.author,
    score: d.score,
    comments: d.num_comments,
    created: new Date(d.created_utc * 1000).toISOString(),
    permalink: 'https://www.reddit.com' + d.permalink,
  };
}

export async function fetchAINews(): Promise<RedditPost[]> {
  const response = await fetch(REDDIT_URL, {
    headers: { 'User-Agent': 'AI_News_Aggregator/1.0' },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const json = (await response.json()) as RedditResponse;

  if (!json.data?.children?.length) {
    throw new Error('无新闻数据');
  }

  return json.data.children
    .filter(c => c.data && !c.data.title.startsWith('[removed'))
    .map(toPost)
    .sort((a, b) => b.score - a.score);
}
