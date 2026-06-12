import { ArxivEntry } from './arxiv';
import { RedditPost } from './news';

/** 判别联合：收藏的条目可能是论文或新闻 */
export type BookmarkItem =
  | { type: 'paper'; data: ArxivEntry }
  | { type: 'news'; data: RedditPost };
