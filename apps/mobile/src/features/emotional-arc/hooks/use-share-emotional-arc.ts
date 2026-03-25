import { useState } from 'react';
import { Alert, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { useAnalytics } from '@/hooks/use-analytics';

export function useShareEmotionalArc() {
  const [isCapturing, setIsCapturing] = useState(false);
  const analytics = useAnalytics();

  const captureView = async (viewRef: React.RefObject<View>): Promise<string | null> => {
    try {
      if (!viewRef.current) {
        Alert.alert('Error', 'Unable to capture image. Please try again.');
        return null;
      }

      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1.0,
        result: 'tmpfile',
      });

      return uri;
    } catch (error) {
      console.error('Error capturing view:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
      return null;
    }
  };

  const share = async (viewRef: React.RefObject<View>, bookTitle?: string) => {
    setIsCapturing(true);

    try {
      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device.');
        return;
      }

      // Capture the view
      const uri = await captureView(viewRef);
      if (!uri) {
        return;
      }

      // Share the image
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: bookTitle
          ? `Share ${bookTitle} Emotional Arc`
          : 'Share Emotional Arc',
      });

      // Track successful share
      analytics.emotionalArcShared('share_sheet', bookTitle);
    } catch (error) {
      console.error('Error sharing:', error);

      // Track failed share
      analytics.emotionalArcShareFailed(
        'share_sheet',
        error instanceof Error ? error.message : 'Unknown error',
        bookTitle
      );

      Alert.alert('Error', 'Failed to share image. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const saveToPhotos = async (viewRef: React.RefObject<View>) => {
    setIsCapturing(true);

    try {
      // Request permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant photo library permission to save images.'
        );
        return;
      }

      // Capture the view
      const uri = await captureView(viewRef);
      if (!uri) {
        return;
      }

      // Save to photo library
      await MediaLibrary.createAssetAsync(uri);

      // Track successful save
      analytics.emotionalArcShared('save_to_photos');

      Alert.alert('Success', 'Image saved to your photo library!');
    } catch (error) {
      console.error('Error saving to photos:', error);

      // Track failed save
      analytics.emotionalArcShareFailed(
        'save_to_photos',
        error instanceof Error ? error.message : 'Unknown error'
      );

      Alert.alert('Error', 'Failed to save image. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  return {
    share,
    saveToPhotos,
    isCapturing,
  };
}
