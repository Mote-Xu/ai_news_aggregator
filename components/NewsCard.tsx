import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ArxivEntry } from '../types/arxiv';
import { formatDate } from '../services/arxivApi';
import { useTheme } from '../contexts/ThemeContext';

interface NewsCardProps {
  entry: ArxivEntry;
  onPress: (entry: ArxivEntry) => void;
}

export default function NewsCard({ entry, onPress }: NewsCardProps) {
  const { colors } = useTheme();

  const authorText = entry.authors.slice(0, 3).join(', ')
    + (entry.authors.length > 3 ? ` et al.` : '');

  return (
    <TouchableOpacity
      style={[styles.card, {
        backgroundColor: colors.card,
        shadowColor: colors.shadowColor,
      }]}
      onPress={() => onPress(entry)}
      activeOpacity={0.7}
    >
      <Text style={[styles.title, { color: colors.title }]} numberOfLines={2}>
        {entry.title}
      </Text>

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
  title: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 8,
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
