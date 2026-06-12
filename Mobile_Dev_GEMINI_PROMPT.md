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
- **额外依赖**: @react-native-async-storage/async-storage

## 当前状态

- ✅ AI News Aggregator V3：三 Tab + 分类切换
- ✅ TypeScript 零编译错误
- ✅ Expo Go 扫码调试 + EAS APK 真机验证均通过
- ✅ GitHub: Mote-Xu/ai_news_aggregator + GitHub Actions 手动构建
- ❌ Node 版本警告未消除
- ⚠️ 新闻源质量待优化（见下方卡点）

## 已实现功能（V3）

1. **三 Tab 聚合**：📄 论文 (arxiv) | 📰 新闻 (The Verge + HN) | 🇨🇳 中文 (36氪)
2. **论文分类切换**：AI / CV / NLP / ML / Robotics，动态切换 arxiv API
3. FlatList + 下拉刷新 + 三 Tab 独立 AsyncStorage 缓存
4. **详情弹窗**（Modal）完整摘要/作者/arXiv ID + "在 arXiv 中打开"
5. **深色模式**：ThemeContext + useColorScheme 自动跟随
6. XML/RSS 手写正则解析 + 15-20s fetch 超时

## 项目结构

```
.github/workflows/eas-build.yml
eas.json
contexts/ThemeContext.tsx          # 主题 Context
types/arxiv.ts, news.ts
services/arxivApi.ts               # arxiv + 分类参数
services/newsApi.ts                # The Verge RSS + HN JSON
services/chineseNewsApi.ts         # 36氪 RSS + AI 过滤
components/NewsCard.tsx, NewsItemCard.tsx, PaperModal.tsx
screens/HomeScreen.tsx             # 三 Tab 页面
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

## ⚠️ 当前卡点（请给方向）

1. **中文新闻源**：36氪 RSS 是通用科技媒体，AI 文章极少（过滤后只有 3 篇，且无浏览量）。试过 机器之心、量子位 RSS，国内不通或已废弃。**还有什么国内可用的 AI 新闻源？**
2. **英文新闻源**：目前只有 The Verge AI（Atom 格式，OK）+ HN（JSON fallback）。试过 Ars Technica、Engadget RSS 2.0，解析器报 Uncaught Error。**怎么稳定解析不同 RSS 格式？或者有其他国内能通的英文 AI 新闻 API？**
3. **Node 升级**：EBADENGINE 警告——直接升 22.x LTS？
