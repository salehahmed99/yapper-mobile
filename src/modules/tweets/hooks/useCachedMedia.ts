import { cleanOldCache, ensureCacheDirectory, getCachedFilePath } from '@/src/utils/mediaCache';
import { File } from 'expo-file-system';
import * as LegacyFileSystem from 'expo-file-system/legacy';
import { useEffect, useState } from 'react';

let hasCleanedCache = false;

export const useCachedMedia = (url: string, type: 'video' | 'image') => {
  const [cachedSource, setCachedSource] = useState<string>(url);

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

      try {
        await ensureCacheDirectory();
        const fileUri = getCachedFilePath(url);
        if (!fileUri) return;

        const file = new File(fileUri);

        if (file.exists) {
          setCachedSource(fileUri);
        } else {
          await LegacyFileSystem.downloadAsync(url, fileUri);
        }
      } catch (error) {
        console.warn('Error caching media:', error);
      }
    };

    cacheMedia();
  }, [url, type]);

  return cachedSource;
};
