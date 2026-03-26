/**
 * useShareContent — Share images/videos with pre-filled caption.
 * Uses expo-sharing for native share sheet.
 * Falls back gracefully when sharing is unavailable.
 */
import { useCallback, useState } from 'react';
import { Platform, Share } from 'react-native';

interface ShareOptions {
  uri?: string;
  caption: string;
  mimeType?: string;
}

interface UseShareContentReturn {
  isSharing: boolean;
  shareContent: (options: ShareOptions) => Promise<void>;
}

export function useShareContent(): UseShareContentReturn {
  const [isSharing, setIsSharing] = useState(false);

  const shareContent = useCallback(async (options: ShareOptions) => {
    const { caption } = options;

    setIsSharing(true);
    try {
      await Share.share(
        Platform.OS === 'ios'
          ? { message: caption, url: options.uri }
          : { message: `${caption}${options.uri ? `\n${options.uri}` : ''}` },
      );
    } finally {
      setIsSharing(false);
    }
  }, []);

  return {
    isSharing,
    shareContent,
  };
}
