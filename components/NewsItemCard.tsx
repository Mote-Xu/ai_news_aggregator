import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { RedditPost } from '../types/news';
import { formatDate } from '../services/arxivApi';
import { useTheme } from '../contexts/ThemeContext';

interface NewsItemCardProps {
  post: RedditPost;
  onPress: (post: RedditPost) => void;
}

export default function NewsItemCard({ post, onPress }: NewsItemCardProps) {
  const { colors } = useTheme();

  const source = post.url.includes('reddit.com') ? 'Reddit' : new URL(post.url).hostname.replace('www.', '');

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}
      onPress={() => onPress(post)}
      activeOpacity={0.7}
    >
      <Text style={[styles.title, { color: colors.title }]} numberOfLines={2}>
        {post.title}
      </Text>

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
  title: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
    marginBottom: 6,
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
