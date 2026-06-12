import React from 'react';
import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ArxivEntry } from '../types/arxiv';
import { formatDate } from '../services/arxivApi';
import { useTheme } from '../contexts/ThemeContext';

interface PaperModalProps {
  visible: boolean;
  entry: ArxivEntry | null;
  onClose: () => void;
}

export default function PaperModal({ visible, entry, onClose }: PaperModalProps) {
  const { colors, isDark } = useTheme();

  if (!entry) return null;

  const authorText = entry.authors.join(', ');
  const handleOpenLink = () => {
    Linking.openURL(entry.link).catch(() => {});
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        {/* header bar */}
        <View style={[styles.header, { borderBottomColor: colors.headerBorder }]}>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={[styles.closeText, { color: colors.accent }]}>关闭</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.subtitle }]}>论文详情</Text>
          <View style={styles.closeBtn} />
        </View>

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          {/* title */}
          <Text style={[styles.title, { color: colors.title }]}>{entry.title}</Text>

          {/* meta */}
          <View style={styles.metaRow}>
            <Text style={[styles.meta, { color: colors.meta }]}>
              {formatDate(entry.published)}
            </Text>
            <Text style={[styles.meta, { color: colors.meta }]}>
              {entry.authors.length} 位作者
            </Text>
          </View>

          {/* authors */}
          <Text style={[styles.sectionLabel, { color: colors.subtitle }]}>作者</Text>
          <Text style={[styles.authors, { color: colors.summary }]}>{authorText}</Text>

          {/* arxiv id */}
          <Text style={[styles.sectionLabel, { color: colors.subtitle }]}>arXiv ID</Text>
          <Text style={[styles.id, { color: colors.summary }]}>
            {entry.id.replace('http://arxiv.org/abs/', '')}
          </Text>

          {/* abstract */}
          <Text style={[styles.sectionLabel, { color: colors.subtitle }]}>摘要</Text>
          <Text style={[styles.abstract, { color: colors.modalSummary }]}>{entry.summary}</Text>
        </ScrollView>

        {/* bottom button */}
        <View style={[styles.footer, { borderTopColor: colors.headerBorder }]}>
          <Pressable
            style={[styles.linkBtn, { backgroundColor: colors.accent }]}
            onPress={handleOpenLink}
          >
            <Text style={styles.linkBtnText}>在 arXiv 中打开</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeBtn: {
    width: 60,
  },
  closeText: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  meta: {
    fontSize: 13,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  authors: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  id: {
    fontSize: 14,
    fontFamily: 'monospace',
    marginBottom: 20,
  },
  abstract: {
    fontSize: 14,
    lineHeight: 22,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  linkBtn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  linkBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
