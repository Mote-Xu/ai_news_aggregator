import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookmarkItem } from '../types/bookmark';
import { ArxivEntry } from '../types/arxiv';
import { RedditPost } from '../types/news';

const BOOKMARKS_KEY = '@bookmarks';

interface BookmarkContextValue {
  bookmarks: BookmarkItem[];
  isBookmarked: (id: string) => boolean;
  toggleBookmark: (item: BookmarkItem) => void;
}

const BookmarkContext = createContext<BookmarkContextValue>({
  bookmarks: [],
  isBookmarked: () => false,
  toggleBookmark: () => {},
});

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  // 启动时从 AsyncStorage 恢复
  useEffect(() => {
    AsyncStorage.getItem(BOOKMARKS_KEY)
      .then((data) => {
        if (data) {
          try {
            setBookmarks(JSON.parse(data));
          } catch {
            // 数据损坏，重置
            AsyncStorage.removeItem(BOOKMARKS_KEY);
          }
        }
      })
      .catch(() => {}); // AsyncStorage 不可用时静默
  }, []);

  const getId = useCallback((item: BookmarkItem): string => {
    if (item.type === 'paper') return (item.data as ArxivEntry).id;
    return (item.data as RedditPost).id;
  }, []);

  const isBookmarked = useCallback(
    (id: string) => bookmarks.some((b) => getId(b) === id),
    [bookmarks, getId]
  );

  const toggleBookmark = useCallback(
    (item: BookmarkItem) => {
      const id = getId(item);
      setBookmarks((prev) => {
        const exists = prev.some((b) => getId(b) === id);
        const next = exists
          ? prev.filter((b) => getId(b) !== id)
          : [...prev, item];
        AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
        return next;
      });
    },
    [getId]
  );

  return (
    <BookmarkContext.Provider value={{ bookmarks, isBookmarked, toggleBookmark }}>
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  return useContext(BookmarkContext);
}
