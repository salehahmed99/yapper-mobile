import { cleanOldCache, ensureCacheDirectory, getCachedFilePath } from '@/src/utils/mediaCache';
import { File } from 'expo-file-system';
import { useEffect, useRef, useState } from 'react';

let hasCleanedCache = false;

export const useCachedMedia = (url: string, type: 'video' | 'image') => {
  const [cachedSource, setCachedSource] = useState<string>(url);
  const isDownloading = useRef(false);

  useEffect(() => {
    if (!hasCleanedCache) {
      cleanOldCache();
      hasCleanedCache = true;
    }
  }, []);

  useEffect(() => {
    const cacheMedia = async () => {
      if (type !== 'video') return;
      if (!url) return;
      if (isDownloading.current) return;

      try {
        await ensureCacheDirectory();
        const fileUri = getCachedFilePath(url);
        if (!fileUri) return;

        const file = new File(fileUri);

        if (file.exists) {
          setCachedSource(fileUri);
        } else {
          isDownloading.current = true;
          try {
            await File.downloadFileAsync(url, file);
            setCachedSource(fileUri);
          } finally {
            isDownloading.current = false;
          }
        }
      } catch (error) {
        console.warn('Error caching media:', error);
        isDownloading.current = false;
      }
    };

    cacheMedia();
  }, [url, type]);

  return cachedSource;
};
