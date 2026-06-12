import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NewsCard from '../components/NewsCard';
import PaperModal from '../components/PaperModal';
import { fetchLatestPapers } from '../services/arxivApi';
import { ArxivEntry } from '../types/arxiv';
import { useTheme } from '../contexts/ThemeContext';

const CACHE_KEY = '@ai_news_cache';

export default function HomeScreen() {
  const { colors } = useTheme();

  const [entries, setEntries] = useState<ArxivEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 详情弹窗状态
  const [selectedEntry, setSelectedEntry] = useState<ArxivEntry | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      setError(null);
      if (isRefresh) setRefreshing(true);

      const papers = await fetchLatestPapers();
      setEntries(papers);

      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(papers));
    } catch (e) {
      const message = e instanceof Error ? e.message : '未知错误';
      setError(message);

      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          setEntries(JSON.parse(cached) as ArxivEntry[]);
        }
      } catch {
        // 缓存不可用则忽略
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePress = useCallback((entry: ArxivEntry) => {
    setSelectedEntry(entry);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: ArxivEntry }) => (
      <NewsCard entry={item} onPress={handlePress} />
    ),
    [handlePress],
  );

  const keyExtractor = useCallback((item: ArxivEntry) => item.id, []);

  // 首次加载中
  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.meta }]}>
          正在获取最新 AI 论文...
        </Text>
      </View>
    );
  }

  // 出错且无缓存
  if (error && entries.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <Text style={styles.errorIcon}>😵</Text>
        <Text style={[styles.errorText, { color: colors.errorTitle }]}>加载失败</Text>
        <Text style={[styles.errorDetail, { color: colors.errorDetail }]}>{error}</Text>
        <Text style={[styles.retryHint, { color: colors.accent }]}>下拉刷新重试</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* header */}
      <View style={[styles.header, {
        backgroundColor: colors.headerBg,
        borderBottomColor: colors.headerBorder,
      }]}>
        <Text style={[styles.headerTitle, { color: colors.title }]}>AI News Aggregator</Text>
        <Text style={[styles.headerSub, { color: colors.subtitle }]}>
          arxiv.org · cs.AI 最新提交
        </Text>
      </View>

      {/* list */}
      <FlatList
        data={entries}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={[styles.emptyText, { color: colors.meta }]}>暂无数据</Text>
          </View>
        }
      />

      {/* detail modal */}
      <PaperModal
        visible={selectedEntry !== null}
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  list: {
    paddingVertical: 8,
    paddingBottom: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  errorDetail: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryHint: {
    fontSize: 13,
  },
  emptyText: {
    fontSize: 15,
    marginTop: 80,
  },
});
