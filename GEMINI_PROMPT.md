# Mobile_Dev — 项目总结

> 发送给外部 AI 的完整项目上下文

## 项目概况

我在搭建一个 React Native (Expo) 移动端开发环境，用 TypeScript 开发 Android App。**第一个功能已实现：AI News Aggregator——从 arxiv.org 拉取最新 AI 论文，卡片列表展示。**

## 技术栈

- **框架**: Expo SDK 56 + React Native 0.85 + React 19
- **语言**: TypeScript 6.0（严格模式）
- **IDE**: VS Code 1.123.0 (Windows)
- **运行时**: Node.js 20.15.1（**需要升级到 20.19.4+**，当前能跑但有 EBADENGINE 警告）
- **测试设备**: Huawei DCO-AL00 (HarmonyOS)，通过 Expo Go 扫码调试
- **包管理**: npm 10.7.0
- **额外依赖**: @react-native-async-storage/async-storage, fast-xml-parser

## 当前状态

- ✅ AI News Aggregator V4.1：书签收藏已实现
- ✅ TypeScript 零编译错误
- ✅ Expo Go 扫码调试 + EAS APK 真机验证均通过
- ✅ GitHub: Mote-Xu/ai_news_aggregator + GitHub Actions 手动构建
- ❌ Node 版本警告未消除
- ✅ 新闻源已大幅优化（中文 6 源 / 英文 4 源，见下方 V4 更新）

## 已实现功能（V4.1）

1. **四 Tab 聚合**：📄 论文 (arxiv) | 📰 新闻 (The Verge + Dev.to + HF + HN) | 🇨🇳 中文 (机器之心/掘金/量子位/新智元 + 36氪/IT之家) | 🔖 收藏
2. **论文分类切换**：AI / CV / NLP / ML / Robotics，动态切换 arxiv API
3. FlatList + 下拉刷新 + 三 Tab 独立 AsyncStorage 缓存
4. **详情弹窗**（Modal）完整摘要/作者/arXiv ID + "在 arXiv 中打开"
5. **深色模式**：ThemeContext + useColorScheme 自动跟随
6. **fast-xml-parser** 替代手写正则，稳健解析 RSS 2.0 + Atom
7. 多源并行抓取 (Promise.allSettled) + 去重合并
8. **书签收藏**：BookmarkContext + AsyncStorage 持久化，☆/★ 一键收藏，收藏 Tab 统一查看

## 项目结构

```
.github/workflows/eas-build.yml
eas.json
contexts/ThemeContext.tsx          # 主题 Context
contexts/BookmarkContext.tsx      # 书签收藏 Context
types/arxiv.ts, news.ts, bookmark.ts
services/arxivApi.ts               # arxiv + 分类参数
services/newsApi.ts                # The Verge + Dev.to + HF + HN
services/chineseNewsApi.ts         # RSSHub(机器之心/掘金/量子位/新智元) + 36氪/IT之家
components/NewsCard.tsx, NewsItemCard.tsx, PaperModal.tsx
screens/HomeScreen.tsx             # 四 Tab 页面（论文/新闻/中文/收藏）
App.tsx
```

## 部署说明

- **EAS 项目**: @mote-xu/Mobile_Dev（slug，projectId 连接）
- **app.json**: name="AI News Aggregator"（手机显示名），slug="Mobile_Dev"（EAS 内部 ID）
- **构建方式**: `npx eas build --platform android --profile preview` 或 GitHub Actions 手动触发
- **免费额度**: 每月 30 次构建

## 硬件约束

- CPU: i5-13500H (16 线程)
- RAM: 16GB DDR
- GPU: RTX 3050 4GB
- 不跑 Android 模拟器（内存不够），用真机调试

## 开发者背景

- 大三计算机专业（HIT Weihai）
- 有 Python / PowerShell / TypeScript 基础
- 无 Java / Kotlin / Android 原生开发经验
- 无 React 经验（边写边学）

## ⚠️ 当前卡点

1. **Node 升级**：EBADENGINE 警告——直接升 22.x LTS？
2. **搜索 / 按日期筛选**：待实现

## ✅ 已解决（V4 / V4.1 更新）

1. **中文新闻源** → 接入 RSSHub 公共镜像（rsshub.rssforever.com）：机器之心、掘金 AI 分类、量子位（知乎专栏）、新智元（知乎专栏）。保留 36氪 + IT之家 作为补充（AI 关键词过滤）。
2. **英文新闻源** → 引入 `fast-xml-parser` 替代手写正则，兼容 RSS 2.0 + Atom。新增 Dev.to API（`/api/articles?tag=ai`）和 Hugging Face Daily Papers（`/api/daily_papers`），两者均返回纯 JSON，零解析开销。
3. **抓取策略** → `Promise.allSettled` 多源并行抓取 + URL 去重合并，单一源失效不影响整体。
4. **书签收藏** → BookmarkContext + AsyncStorage 持久化，☆/★ 按钮在论文/新闻卡片右上角，🔖 收藏 Tab 统一查看已收藏条目。
