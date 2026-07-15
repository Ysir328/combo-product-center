import { useState, useCallback } from 'react';
import { uploadFile as storageUpload, deleteFile as storageDelete } from '../lib/storage';

type StorageBucket = 'product-images' | 'marketing-files' | 'internal-files';

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
}

export function useFileUpload() {
  const [state, setState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
  });

  const upload = useCallback(
    async (bucket: StorageBucket, folderPath: string, file: File): Promise<string | null> => {
      if (file.size > 50 * 1024 * 1024) {
        setState({ uploading: false, progress: 0, error: '文件大小不能超过 50MB' });
        return null;
      }

      setState({ uploading: true, progress: 0, error: null });

      // Simulate progress since Supabase upload doesn't emit progress natively
      const progressTimer = setInterval(() => {
        setState((prev) => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 85),
        }));
      }, 200);

      const { path, error } = await storageUpload(bucket, folderPath, file);

      clearInterval(progressTimer);

      if (error) {
        setState({ uploading: false, progress: 0, error });
        return null;
      }

      setState({ uploading: false, progress: 100, error: null });
      return path;
    },
    []
  );

  const remove = useCallback(async (bucket: StorageBucket, path: string): Promise<boolean> => {
    return storageDelete(bucket, path);
  }, []);

  const reset = useCallback(() => {
    setState({ uploading: false, progress: 0, error: null });
  }, []);

  return { ...state, upload, remove, reset };
}
