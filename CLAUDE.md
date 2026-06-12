# AI News Aggregator — 移动端 AI 论文速递

> React Native (Expo) + TypeScript
> 创建：2026-06-13 | GitHub: [Mote-Xu/ai_news_aggregator](https://github.com/Mote-Xu/ai_news_aggregator)
> EAS: @mote-xu/Mobile_Dev | 构建状态: 排队中

## 架构

```
Mobile_Dev/
├── .github/workflows/
│   └── eas-build.yml        # GitHub Actions 手动触发 EAS 构建
├── App.tsx                  # 应用入口 → ThemeProvider + BookmarkProvider + HomeScreen
├── index.ts                 # 注册根组件
├── app.json                 # Expo 配置（name: AI News Aggregator, slug: Mobile_Dev）
├── eas.json                 # EAS 构建配置（preview = APK）
├── package.json             # 依赖 & scripts
├── tsconfig.json            # TypeScript 配置（严格模式）
├── assets/                  # 图标等静态资源
├── contexts/
│   ├── ThemeContext.tsx     # 深色/浅色主题 Context + useTheme
│   └── BookmarkContext.tsx  # 书签收藏 Context + AsyncStorage 持久化
├── types/
│   ├── arxiv.ts            # ArxivEntry 类型定义
│   ├── news.ts             # RedditPost（复用为通用新闻条目）
│   └── bookmark.ts         # BookmarkItem 判别联合类型（paper | news）
├── services/
│   ├── arxivApi.ts         # arxiv API + XML 解析 + 分类切换
│   ├── newsApi.ts          # 英文新闻（The Verge + Dev.to + HF + HN）
│   └── chineseNewsApi.ts   # 中文新闻（机器之心/掘金/量子位/新智元 + 36氪/IT之家）
├── components/
│   ├── NewsCard.tsx        # 论文卡片（主题感知 + ☆ 收藏）
│   ├── NewsItemCard.tsx    # 新闻卡片（通用 + ☆ 收藏）
│   └── PaperModal.tsx      # 论文详情弹窗（Modal）
├── screens/
│   └── HomeScreen.tsx      # 四 Tab 主页面（论文/新闻/中文/收藏）
├── CLAUDE.md                # 本文件
├── REQUIREMENTS.md          # 需求文档
└── Mobile_Dev_GEMINI_PROMPT.md  # 给外部 AI 的总结
```

## 技术栈

| 工具 | 版本 | 用途 |
|------|------|------|
| Node.js | 20.15.1 ⚠️ | 运行时（需升级到 20.19.4+） |
| Expo | ~56.0.11 | 跨平台框架 & 工具链 |
| React Native | 0.85.3 | UI 框架 |
| React | 19.2.3 | 组件模型 |
| TypeScript | ~6.0.3 | 类型检查 |
| VS Code | 1.123.0 | IDE |

## 运行命令

```bash
npx expo start           # 启动开发服务器（Expo Go 扫码调试）
npx expo start --android # Android 模式
npx expo start --web     # Web 模式
```

## 构建部署

```bash
# 手动触发 EAS 云构建（生成 APK）
npx eas build --platform android --profile preview

# 或通过 GitHub Actions 手动触发
# https://github.com/Mote-Xu/ai_news_aggregator/actions → EAS Build → Run workflow
```

- **EAS 项目**: @mote-xu/Mobile_Dev（slug 不变，projectId 连接）
- **构建配置**: eas.json → preview profile → APK
- **自动构建**: GitHub Actions workflow_dispatch（手动触发，不浪费月度额度）
- **额度**: 免费每月 30 次构建

## 当前功能

- **四 Tab 聚合**：📄 论文 (arxiv) | 📰 新闻 (The Verge + Dev.to + HF + HN) | 🇨🇳 中文 (机器之心/掘金/量子位/新智元 + 36氪/IT之家) | 🔖 收藏
- **论文分类切换**：AI / CV / NLP / ML / Robotics 五分类
- FlatList 列表展示、下拉刷新
- **详情弹窗**（Modal）展示完整摘要、作者、arXiv ID，点击打开原文
- **深色模式**：ThemeContext + useColorScheme 自动跟随系统
- AsyncStorage 本地缓存（三 Tab 独立缓存 + 书签持久化）
- **书签收藏**：☆/★ 一键收藏论文/新闻，收藏 Tab 统一查看
- TypeScript 严格模式，零编译错误

## 调试方式

- **真机**：手机装 Expo Go（Google Play / 应用商店），扫码 Metro 二维码
- **模拟器**：未配置（16GB RAM 不建议运行 Android 模拟器）

## ⚠️ 已知问题

### Node.js 版本过低

- Node 20.15.1 不满足 Expo 56 的要求（^20.19.4）
- npm install 有大量 `EBADENGINE` 警告
- **建议**：升级 Node.js 到 20.19.4+ 或 22.x LTS
- 目前 `npm install` 能通过，运行时可能出问题

### ADB 驱动未连通（来自旧项目遗留）

- 华为 DCO-AL00 手机 ADB 驱动 GUID 缺失
- 不影响 Expo Go 扫码调试（走网络，不走 USB ADB）
- 只有本地 APK 编译/安装才需要 ADB

## 设备

| 项目 | 信息 |
|------|------|
| 测试手机 | 华为 DCO-AL00 (HarmonyOS) |
| 连接方式 | 优先 Expo Go (Wi-Fi)，备选 USB ADB |

## 待办

- [x] 手机安装 Expo Go，验证扫码调试 ✅（已跑通）
- [x] 确定第一个 App 项目方向 → AI News Aggregator
- [x] 迁移旧 Mobile_Development 目录中的 PhoneCleanup 残留（无残留，跳过）
- [x] 实现 AI 新闻列表（arxiv API + FlatList + AsyncStorage 缓存）
- [x] 深色模式（ThemeContext + useColorScheme 自动跟随系统）
- [x] 详情弹窗（Modal 替代浏览器跳转）
- [x] EAS 云构建配置（eas.json + APK 构建）
- [x] GitHub Actions 自动构建 workflow（手动触发）
- [x] 下载 APK 安装到手机
- [x] 丰富中文新闻源 ✅（RSSHub：机器之心/掘金AI/量子位/新智元，本地 AI 关键词过滤 36氪/IT之家）
- [x] 丰富英文新闻源 ✅（新增 Dev.to API + Hugging Face Daily Papers，fast-xml-parser 替代手写正则）
- [x] 书签收藏 ✅（BookmarkContext + ☆/★ 按钮 + 🔖 收藏 Tab）
- [ ] 升级 Node.js 到 22.x LTS（当前 20.15.1 能跑但有 EBADENGINE 警告）
- [ ] 后续：搜索 / 按日期筛选
