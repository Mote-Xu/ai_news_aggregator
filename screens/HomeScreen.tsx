import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NewsCard from '../components/NewsCard';
import NewsItemCard from '../components/NewsItemCard';
import PaperModal from '../components/PaperModal';
import { fetchLatestPapers, CATEGORIES } from '../services/arxivApi';
import { fetchAINews } from '../services/newsApi';
import { fetchChineseNews } from '../services/chineseNewsApi';
import { ArxivEntry } from '../types/arxiv';
import { RedditPost } from '../types/news';
import { useTheme } from '../contexts/ThemeContext';

const CACHE_PAPERS = '@cache_papers';
const CACHE_NEWS = '@cache_news';
const CACHE_CHINESE = '@cache_chinese';

type Tab = 'papers' | 'news' | 'chinese';

export default function HomeScreen() {
  const { colors } = useTheme();
  const [tab, setTab] = useState<Tab>('papers');

  // Papers
  const [papers, setPapers] = useState<ArxivEntry[]>([]);
  const [papersLoading, setPapersLoading] = useState(true);
  const [papersError, setPapersError] = useState<string | null>(null);
  const [paperCategory, setPaperCategory] = useState('cs.AI');
  const [selectedEntry, setSelectedEntry] = useState<ArxivEntry | null>(null);

  // News
  const [news, setNews] = useState<RedditPost[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);

  // ── Papers ──────────────────────────────────────
  const loadPapers = useCallback(async (category: string) => {
    try {
      setPapersError(null);
      setPapersLoading(true);
      const data = await fetchLatestPapers(category);
      setPapers(data);
      await AsyncStorage.setItem(CACHE_PAPERS, JSON.stringify(data));
    } catch (e) {
      const msg = e instanceof Error ? e.message : '未知错误';
      setPapersError(msg);
      const cached = await AsyncStorage.getItem(CACHE_PAPERS);
      if (cached) setPapers(JSON.parse(cached));
    } finally {
      setPapersLoading(false);
    }
  }, []);

  useEffect(() => { loadPapers(paperCategory); }, [paperCategory, loadPapers]);

  // ── News ────────────────────────────────────────
  const loadNews = useCallback(async () => {
    try {
      setNewsError(null);
      setNewsLoading(true);
      const data = await fetchAINews();
      setNews(data);
      await AsyncStorage.setItem(CACHE_NEWS, JSON.stringify(data));
    } catch (e) {
      const msg = e instanceof Error ? e.message : '未知错误';
      setNewsError(msg);
      const cached = await AsyncStorage.getItem(CACHE_NEWS);
      if (cached) setNews(JSON.parse(cached));
    } finally {
      setNewsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'news' && news.length === 0 && !newsLoading && !newsError) {
      loadNews();
    }
  }, [tab, news.length, newsLoading, newsError, loadNews]);

  // ── Chinese News ────────────────────────────────
  const [chinese, setChinese] = useState<RedditPost[]>([]);
  const [chineseLoading, setChineseLoading] = useState(false);
  const [chineseError, setChineseError] = useState<string | null>(null);

  const loadChinese = useCallback(async () => {
    try {
      setChineseError(null);
      setChineseLoading(true);
      const data = await fetchChineseNews();
      setChinese(data);
      await AsyncStorage.setItem(CACHE_CHINESE, JSON.stringify(data));
    } catch (e) {
      const msg = e instanceof Error ? e.message : '未知错误';
      setChineseError(msg);
      const cached = await AsyncStorage.getItem(CACHE_CHINESE);
      if (cached) setChinese(JSON.parse(cached));
    } finally {
      setChineseLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'chinese' && chinese.length === 0 && !chineseLoading && !chineseError) {
      loadChinese();
    }
  }, [tab, chinese.length, chineseLoading, chineseError, loadChinese]);

  // ── Handlers ────────────────────────────────────
  const handlePaperPress = useCallback((entry: ArxivEntry) => {
    setSelectedEntry(entry);
  }, []);

  const handleNewsPress = useCallback((post: RedditPost) => {
    Linking.openURL(post.url).catch(() => {});
  }, []);

  // ── Tab bar ─────────────────────────────────────
  const TABS: { key: Tab; label: string }[] = [
    { key: 'papers', label: '📄 论文' },
    { key: 'news', label: '📰 新闻' },
    { key: 'chinese', label: '🇨🇳 中文' },
  ];

  const tabBar = (
    <View style={[styles.tabBar, { backgroundColor: colors.headerBg, borderBottomColor: colors.headerBorder }]}>
      {TABS.map(t => (
        <Pressable
          key={t.key}
          onPress={() => setTab(t.key)}
          style={[
            styles.tab,
            tab === t.key && { borderBottomColor: colors.accent, borderBottomWidth: 2 },
          ]}
        >
          <Text style={[
            styles.tabText,
            { color: tab === t.key ? colors.accent : colors.meta },
          ]}>{t.label}</Text>
        </Pressable>
      ))}
    </View>
  );

  // ── Loading ─────────────────────────────────────
  const loadingView = (message: string) => (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {header()}
      {tabBar}
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.meta }]}>{message}</Text>
      </View>
    </View>
  );

  const isLoading = (tab === 'papers' && papersLoading) ||
    (tab === 'news' && newsLoading && news.length === 0) ||
    (tab === 'chinese' && chineseLoading && chinese.length === 0);
  if (isLoading) return loadingView(tab === 'papers' ? '正在获取最新 AI 论文...' : tab === 'news' ? '正在获取 AI 新闻...' : '正在获取中文 AI 动态...');

  // ── Error ───────────────────────────────────────
  function header() {
    return (
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.headerBorder }]}>
        <Text style={[styles.headerTitle, { color: colors.title }]}>AI News Aggregator</Text>
        <Text style={[styles.headerSub, { color: colors.subtitle }]}>
          {tab === 'papers' ? `arxiv.org · ${paperCategory}` : tab === 'news' ? 'The Verge · Ars · Engadget' : '36氪 · IT之家'}
        </Text>
      </View>
    );
  }

  const errorView = (msg: string) => (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {header()}
      {tabBar}
      <View style={styles.center}>
        <Text style={styles.errorIcon}>😵</Text>
        <Text style={[styles.errorText, { color: colors.errorTitle }]}>加载失败</Text>
        <Text style={[styles.errorDetail, { color: colors.errorDetail }]}>{msg}</Text>
        <Text style={[styles.retryHint, { color: colors.accent }]}>下拉刷新重试</Text>
      </View>
    </View>
  );

  // ── Category chips (papers only) ────────────────
  const categoryBar = tab === 'papers' && (
    <View style={[styles.catBar, { backgroundColor: colors.headerBg }]}>
      {CATEGORIES.map(c => (
        <Pressable
          key={c.key}
          onPress={() => setPaperCategory(c.key)}
          style={[
            styles.catChip,
            { borderColor: paperCategory === c.key ? colors.accent : colors.headerBorder },
            paperCategory === c.key && { backgroundColor: colors.accent },
          ]}
        >
          <Text style={[
            styles.catText,
            { color: paperCategory === c.key ? '#fff' : colors.meta },
          ]}>{c.label}</Text>
        </Pressable>
      ))}
    </View>
  );

  // ── Render ──────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {header()}
      {tabBar}
      {categoryBar}

      {tab === 'papers' ? (
        papersError && papers.length === 0 ? errorView(papersError) : (
          <FlatList
            data={papers}
            renderItem={({ item }) => <NewsCard entry={item} onPress={handlePaperPress} />}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={papersLoading} onRefresh={() => loadPapers(paperCategory)} colors={[colors.accent]} tintColor={colors.accent} />
            }
          />
        )
      ) : tab === 'news' ? (
        newsError && news.length === 0 ? errorView(newsError) : (
          <FlatList
            data={news}
            renderItem={({ item }) => <NewsItemCard post={item} onPress={handleNewsPress} />}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={newsLoading} onRefresh={() => loadNews()} colors={[colors.accent]} tintColor={colors.accent} />
            }
          />
        )
      ) : (
        chineseError && chinese.length === 0 ? errorView(chineseError) : (
          <FlatList
            data={chinese}
            renderItem={({ item }) => <NewsItemCard post={item} onPress={handleNewsPress} />}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={chineseLoading} onRefresh={() => loadChinese()} colors={[colors.accent]} tintColor={colors.accent} />
            }
          />
        )
      )}

      <PaperModal visible={selectedEntry !== null} entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  header: {
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  headerSub: { fontSize: 12, marginTop: 2 },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: { fontSize: 14, fontWeight: '500' },
  catBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  catText: { fontSize: 13, fontWeight: '500' },
  list: { paddingVertical: 8, paddingBottom: 24 },
  loadingText: { marginTop: 12, fontSize: 14 },
  errorIcon: { fontSize: 48, marginBottom: 12 },
  errorText: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  errorDetail: { fontSize: 13, textAlign: 'center', marginBottom: 16 },
  retryHint: { fontSize: 13 },
});
