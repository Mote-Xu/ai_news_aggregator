import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArxivEntry } from '../types/arxiv';
import { formatDate } from '../services/arxivApi';
import { useTheme } from '../contexts/ThemeContext';
import { useBookmarks } from '../contexts/BookmarkContext';

interface NewsCardProps {
  entry: ArxivEntry;
  onPress: (entry: ArxivEntry) => void;
}

export default function NewsCard({ entry, onPress }: NewsCardProps) {
  const { colors } = useTheme();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const authorText =
    entry.authors.slice(0, 3).join(', ') +
    (entry.authors.length > 3 ? ' et al.' : '');

  const saved = isBookmarked(entry.id);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.card, shadowColor: colors.shadowColor },
      ]}
      onPress={() => onPress(entry)}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <Text style={[styles.title, { color: colors.title }]} numberOfLines={2}>
          {entry.title}
        </Text>
        <TouchableOpacity
          onPress={() => toggleBookmark({ type: 'paper', data: entry })}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          style={styles.star}
        >
          <Text style={styles.starIcon}>{saved ? '★' : '☆'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.meta, { color: colors.meta }]}>
        {authorText}  ·  {formatDate(entry.published)}
      </Text>

      <Text style={[styles.summary, { color: colors.summary }]} numberOfLines={3}>
        {entry.summary}
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
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  star: {
    marginLeft: 8,
    paddingTop: 1,
  },
  starIcon: {
    fontSize: 18,
    color: '#f5a623',
  },
  meta: {
    fontSize: 12,
    marginBottom: 8,
  },
  summary: {
    fontSize: 13,
    lineHeight: 19,
  },
});
