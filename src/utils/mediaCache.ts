import { Directory, File, Paths } from 'expo-file-system';

const CACHE_FOLDER_NAME = 'media_cache';
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000;
const MAX_CACHE_SIZE = 500 * 1024 * 1024;
const cacheDir = new Directory(Paths.cache, CACHE_FOLDER_NAME);

export const ensureCacheDirectory = async () => {
  if (!cacheDir.exists) {
    cacheDir.create();
  }
};

export const getCachedFilePath = (url: string) => {
  const filename = url.split('/').pop();
  if (!filename) return null;
  return new File(cacheDir, filename).uri;
};

export const cleanOldCache = async () => {
  try {
    await ensureCacheDirectory();
    const files = cacheDir.list();

    const fileStats = files
      .filter((file): file is File => file instanceof File)
      .map((file) => ({
        file,
        size: file.size ?? 0,
        modificationTime: file.modificationTime ?? 0,
      }));

    fileStats.sort((a, b) => a.modificationTime - b.modificationTime);

    let currentSize = fileStats.reduce((acc, item) => acc + item.size, 0);
    const now = Date.now() / 1000;

    for (const item of fileStats) {
      const age = now - item.modificationTime;
      const isTooOld = age > MAX_CACHE_AGE / 1000;
      const isTooBig = currentSize > MAX_CACHE_SIZE;

      if (isTooOld || isTooBig) {
        item.file.delete();
        currentSize -= item.size;
      }
    }
  } catch (error) {
    console.warn('Error cleaning cache:', error);
  }
};
