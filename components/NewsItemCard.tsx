import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RedditPost } from '../types/news';
import { formatDate } from '../services/arxivApi';
import { useTheme } from '../contexts/ThemeContext';
import { useBookmarks } from '../contexts/BookmarkContext';

interface NewsItemCardProps {
  post: RedditPost;
  onPress: (post: RedditPost) => void;
}

export default function NewsItemCard({ post, onPress }: NewsItemCardProps) {
  const { colors } = useTheme();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  // Hermes 兼容：不用 new URL()，用正则提取 hostname
  const hostname = (() => {
    try {
      const m = post.url.match(/https?:\/\/([^/:]+)/);
      return m ? m[1].replace(/^www\./, '') : '';
    } catch {
      return '';
    }
  })();
  const source = post.url.includes('reddit.com') ? 'Reddit' : hostname;

  const saved = isBookmarked(post.id);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.card, shadowColor: colors.shadowColor },
      ]}
      onPress={() => onPress(post)}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <Text style={[styles.title, { color: colors.title }]} numberOfLines={2}>
          {post.title}
        </Text>
        <TouchableOpacity
          onPress={() => toggleBookmark({ type: 'news', data: post })}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          style={styles.star}
        >
          <Text style={styles.starIcon}>{saved ? '★' : '☆'}</Text>
        </TouchableOpacity>
      </View>

      {post.body !== '[链接]' && (
        <Text style={[styles.body, { color: colors.summary }]} numberOfLines={2}>
          {post.body}
        </Text>
      )}

      <Text style={[styles.meta, { color: colors.meta }]}>
        {source} · ▲{post.score} · 💬{post.comments} · {formatDate(post.created)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
  },
  star: {
    marginLeft: 8,
    paddingTop: 1,
  },
  starIcon: {
    fontSize: 18,
    color: '#f5a623',
  },
  body: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 8,
  },
  meta: {
    fontSize: 11,
  },
});
