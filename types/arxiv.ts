export interface ArxivEntry {
  /** arxiv 论文唯一 ID（如 http://arxiv.org/abs/2506.xxxxx） */
  id: string;
  /** 论文标题 */
  title: string;
  /** 摘要（可能较长，展示时截断） */
  summary: string;
  /** 作者列表 */
  authors: string[];
  /** 提交日期字符串 */
  published: string;
  /** arxiv 论文页面链接 */
  link: string;
}
