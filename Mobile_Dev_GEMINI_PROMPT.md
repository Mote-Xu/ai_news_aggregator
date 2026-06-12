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

- ✅ Expo TypeScript 项目已创建
- ✅ AI News Aggregator V2 实现完成（arxiv API + FlatList + 深色模式 + 详情弹窗）
- ✅ TypeScript 零编译错误
- ✅ Metro Bundler 启动正常
- ❌ 手机 Expo Go 未装、未验证扫码调试
- ❌ Node 版本警告未消除

## 已实现功能（V2）

1. 从 `http://export.arxiv.org/api/query` 拉取 cs.AI 最新 20 篇论文
2. 手工 XML 解析（用正则提取 entry 块）
3. FlatList 卡片式列表（标题 / 作者 / 日期 / 摘要截断）
4. 下拉刷新（RefreshControl）
5. **详情弹窗**（Modal）展示完整摘要、全部作者、arXiv ID + "在 arXiv 中打开"按钮
6. **深色/浅色模式**：ThemeContext + useColorScheme 自动跟随系统
7. AsyncStorage 缓存上次数据（网络失败时展示缓存）
8. 加载中 / 错误 / 空数据三态 UI

## 项目结构

```
contexts/ThemeContext.tsx   # ThemeProvider + useTheme（深色/浅色调色板）
types/arxiv.ts              # ArxivEntry 接口
services/arxivApi.ts        # fetch + XML 解析 + 日期格式化
components/NewsCard.tsx     # 新闻卡片组件（主题感知）
components/PaperModal.tsx   # 论文详情弹窗
screens/HomeScreen.tsx      # 主页面（FlatList + useState/useEffect/Modal）
App.tsx                     # 入口 → ThemeProvider + StatusBar + HomeScreen
```

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

## 当前卡点 & 请 AI 给方向

1. **真机验证**：还没在 HarmonyOS 手机上通过 Expo Go 验证
2. **Node 升级**：npm 很多 EBADENGINE 警告——建议直接升 22.x LTS 还是 20.19.4？
3. **下一个迭代方向**：书签收藏 / 多数据源 / 搜索筛选，先做哪个？
4. **V2 新增技术**：ThemeContext (Context API) 深色模式、Modal 详情弹窗——这些模式是否合理？
