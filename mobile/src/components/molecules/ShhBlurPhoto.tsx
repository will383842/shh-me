/**
 * ShhBlurPhoto — Image component that renders a blurred photo.
 * Uses expo-image with disk caching. blurLevel controls blur radius.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../../theme/colors';

interface ShhBlurPhotoProps {
  url: string;
  blurLevel: number;
  size?: number;
}

export default function ShhBlurPhoto({
  url,
  blurLevel,
  size = 200,
}: ShhBlurPhotoProps) {
  if (!url) {
    return (
      <View
        style={[
          styles.placeholder,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      />
    );
  }

  return (
    <Image
      source={{ uri: url }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
      }}
      cachePolicy="disk"
      blurRadius={blurLevel}
      contentFit="cover"
      transition={300}
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.borderDark,
  },
});
