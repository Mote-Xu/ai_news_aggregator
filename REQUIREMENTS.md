# Mobile_Dev — 需求文档

> React Native (Expo) + TypeScript 移动端开发
> 创建：2026-06-13 | 状态：V4.1 书签收藏已实现

## 当前阶段：书签完成，后续搜索/筛选

### F0: 开发环境

- [x] Node.js 20.15.1（需升级到 20.19.4+，当前能跑）
- [x] Expo 56 + React Native 0.85 + React 19 + TypeScript 6
- [x] VS Code 1.123.0
- [ ] Node.js 升级到 22.x LTS
- [x] 手机安装 Expo Go 验证真机调试
- [x] Git 仓库初始化 → GitHub: Mote-Xu/ai_news_aggregator
- [x] EAS 云构建配置（eas.json + preview APK）
- [x] GitHub Actions 自动构建 workflow（手动触发）

### F1: AI News Aggregator ✅

- [x] 从 arxiv.org (cs.AI) 拉取最新论文
- [x] FlatList 卡片列表 + 下拉刷新
- [x] 点击打开原文链接（Linking.openURL）
- [x] 详情弹窗（Modal）展示完整摘要/作者/arXiv ID
- [x] 深色模式（ThemeContext + useColorScheme 自动跟随系统）
- [x] AsyncStorage 本地缓存（离线降级）
- [x] TypeScript 零错误编译
- [x] APK 真机验证通过（论文 + 新闻 + 中文）
- [x] 论文分类切换（AI/CV/NLP/ML/Robotics）
- [x] ⚠️ 中文新闻源质量差（36氪 AI 文章极少）→ ✅ 已接入 RSSHub（机器之心/掘金AI/量子位/新智元）
- [x] ⚠️ 英文新闻源少（仅 The Verge + HN）→ ✅ 已新增 Dev.to + Hugging Face Daily Papers

### F2: 后续迭代

- [x] 丰富新闻源（中文 + 英文）✅
- [x] 书签 / 收藏 ✅（BookmarkContext + AsyncStorage 持久化 + ☆/★ 按钮 + 🔖 Tab）
- [ ] 搜索 / 按日期筛选

## 非功能约束

- **平台优先**：Android (HarmonyOS 真机)，后续可扩展 iOS/Web
- **调试**：Expo Go 扫码优先，不走 USB ADB
- **语言**：TypeScript 严格模式
- **RAM 限制**：16GB，不跑 Android 模拟器
- **存储**：项目放 E:\Desktop\Mobile_Dev\（E 盘 200G）

## 环境约束

| 项目 | 值 |
|------|-----|
| 操作系统 | Windows 11 Pro build 26200 |
| Node.js | 20.15.1 ⚠️ → 需 20.19.4+ |
| 包管理 | npm 10.7.0 |
| 测试设备 | Huawei DCO-AL00 (HarmonyOS) |
| Git | 2.45.2 (Mote-Xu / 1624010188@qq.com) |
