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

/** fast-xml-parser 对含子元素的节点会用 { '#text': '...' } 包裹文本 */
function extractText(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value['#text']) return String(value['#text']);
  return String(value);
}

/** 兼容 RSS <link>text</link> 和 Atom <link href="..." /> */
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

// ── AI 关键词过滤 ──

const AI_PATTERN =
  /AI\b|人工智能|大模型|大语言模型|机器学习|深度学习|OpenAI|ChatGPT|GPT-|Claude|Gemini|DeepSeek|Copilot|Midjourney|Stable\s*Diffusion|算力|英伟达|NVIDIA|GPU|生成式|多模态|Agent|智能体|强化学习|LLM|Transformer|Diffusion|神经网络|自然语言|计算机视觉|预训练|微调|推理|开源模型|文生[图视]|文生视频|Sora|具身智能|人形机器人|提示词|[Pp]rompt|RAG|知识图谱|token|上下文|通义千问|文心一言|智谱|ChatGLM|百川|月之暗面|Kimi|豆包|混元|Llama|Qwen|MCP\b|语音合成|TTS|语音识别|ASR|AIGC|自动驾驶|端到端/i;

function isAIArticle(title: string, _desc: string): boolean {
  // 只看标题 — 正文顺带提一嘴 "AI" 不算 AI 资讯
  return AI_PATTERN.test(title);
}

/** 判断文章是否在最近 N 天内 */
function isRecent(dateStr: string, days = 7): boolean {
  if (!dateStr) return true; // 无日期不过滤
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return true;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return d.getTime() > cutoff;
}

// ── RSS/Atom 解析 ──

function parseFeed(xml: string): any[] {
  try {
    const doc = xmlParser.parse(xml);
    // RSS 2.0
    const items = doc.rss?.channel?.item;
    if (items) return Array.isArray(items) ? items : [items];
    // Atom
    const entries = doc.feed?.entry;
    if (entries) return Array.isArray(entries) ? entries : [entries];
    return [];
  } catch {
    return [];
  }
}

// ── 新闻源配置 ──

interface NewsSource {
  url: string;
  name: string;
  /** 为 true 表示通用科技源，需要 AI 关键词过滤 */
  filterAI: boolean;
}

const SOURCES: NewsSource[] = [
  // ═══ RSSHub 镜像源 ═══
  {
    url: 'https://rsshub.rssforever.com/jiqizhixin/daily',
    name: '机器之心',
    filterAI: true,
  },
  {
    url: 'https://rsshub.rssforever.com/juejin/category/ai',
    name: '掘金',
    filterAI: true,
  },
  {
    url: 'https://rsshub.rssforever.com/zhihu/people/liang-zi-wei-48/posts',
    name: '量子位',
    filterAI: true, // 知乎专栏含非 AI 内容，需过滤
  },
  {
    url: 'https://rsshub.rssforever.com/zhihu/people/xin-zhi-yuan-42/posts',
    name: '新智元',
    filterAI: true, // 知乎专栏含非 AI 内容，需过滤
  },
  // ═══ 通用科技源 — 需要 AI 关键词过滤以保证相关性 ═══
  {
    url: 'https://36kr.com/feed',
    name: '36氪',
    filterAI: true,
  },
  {
    url: 'https://www.ithome.com/rss/',
    name: 'IT之家',
    filterAI: true,
  },
];

// ── 单源抓取 ──

async function fetchOneSource(
  src: NewsSource,
  signal: AbortSignal
): Promise<RedditPost[]> {
  try {
    const res = await fetch(src.url, {
      headers: { 'User-Agent': 'AI_News_Aggregator/1.0' },
      signal,
    });
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
        if (!isRecent(pubDate)) return null;
        if (src.filterAI && !isAIArticle(title, desc)) return null;

        return {
          id: link,
          title,
          body: desc,
          url: link,
          author: src.name,
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

// ── 主入口 ──

export async function fetchChineseNews(): Promise<RedditPost[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    // 并行抓取所有源，任一失败不影响其他
    const results = await Promise.allSettled(
      SOURCES.map((src) => fetchOneSource(src, controller.signal))
    );

    // 合并去重（按 URL）
    const seen = new Set<string>();
    const all: RedditPost[] = [];
    for (const r of results) {
      if (r.status === 'fulfilled') {
        for (const post of r.value) {
          if (!seen.has(post.url)) {
            seen.add(post.url);
            all.push(post);
          }
        }
      }
    }

    if (all.length === 0) throw new Error('所有中文新闻源均不可用');

    // 按时间倒序
    return all.sort(
      (a, b) =>
        new Date(b.created).getTime() - new Date(a.created).getTime()
    );
  } finally {
    clearTimeout(timeout);
  }
}
