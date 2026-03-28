import { forwardRef } from 'react';
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { Entry } from '@/features/entries/types/entry';
import type { Emotion } from '@/features/entries/constants/emotions';
import { useThemeColors } from '@/shared';

// Utility to strip HTML tags (matching EntryContent pattern)
const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();

interface ShareableEntryViewProps {
  entry: Entry;
  book: {
    title: string;
    author?: string;
  };
  emotion?: Emotion;
}

export const ShareableEntryView = forwardRef<View, ShareableEntryViewProps>(
  ({ entry, book, emotion }, ref) => {
    const theme = useThemeColors();

    // Format date
    const formatDate = (timestamp: number) => {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    };

    // Build metadata string (ch/page/percent)
    const metadata: string[] = [];
    if (entry.chapter) metadata.push(`Ch. ${entry.chapter}`);
    if (entry.page) metadata.push(`Pg. ${entry.page}`);
    if (entry.percent) metadata.push(`${entry.percent}%`);
    const metadataString = metadata.join(' · ');

    // Determine content layout
    const hasSnippet = Boolean(entry.snippet && stripHtml(entry.snippet));
    const hasReflection = Boolean(entry.reflection && stripHtml(entry.reflection));
    const hasReflectionAudio = Boolean(entry.reflectionUri);

    const emotionColor = emotion?.color || 'hsl(20, 50%, 45%)';

    return (
      <View
        ref={ref}
        collapsable={false}
        style={{
          width: 1080,
          backgroundColor: 'transparent',
          position: 'relative',
        }}
      >
        {/* Content area: Snippet only */}
        <View>
          {/* Two-zone: snippet + reflection */}
          {hasSnippet && hasReflection && (
            <View
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                backgroundColor: theme.card || '#f9fafb',
              }}
            >
              {/* Top zone: Quote with emotion background */}
              <View
                style={{
                  backgroundColor: `${emotionColor}dd`,
                  padding: 24,
                }}
              >
                <Text
                  style={{
                    color: '#ffffff',
                    fontSize: 20,
                    fontStyle: 'italic',
                    lineHeight: 32,
                  }}
                >
                  {`"${stripHtml(entry.snippet!)}`}
                </Text>
              </View>

              {/* Speech bubble arrow connector */}
              <View
                style={{
                  backgroundColor: theme.card || '#f9fafb',
                  paddingLeft: 24,
                }}
              >
                <View
                  style={{
                    width: 0,
                    height: 0,
                    borderLeftWidth: 12,
                    borderRightWidth: 12,
                    borderTopWidth: 12,
                    borderLeftColor: 'transparent',
                    borderRightColor: 'transparent',
                    borderTopColor: `${emotionColor}dd`,
                  }}
                />
              </View>

              {/* Bottom zone: Reflection on neutral background */}
              <View style={{ padding: 24 }}>
                <Text
                  style={{
                    color: theme.foreground || '#000000',
                    fontSize: 18,
                    lineHeight: 30,
                  }}
                >
                  {stripHtml(entry.reflection!)}
                </Text>
                {entry.setting && (
                  <Text
                    style={{
                      color: theme.mutedForeground || '#6b7280',
                      fontSize: 14,
                      fontStyle: 'italic',
                      marginTop: 16,
                      opacity: 0.6,
                    }}
                  >
                    {entry.setting}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Quote-only card (snippet without reflection) */}
          {hasSnippet && !hasReflection && !hasReflectionAudio && (
            <>
              <View
                style={{
                  backgroundColor: `${emotionColor}dd`,
                  borderRadius: 32,
                  padding: 80,
                  minHeight: 600,
                  justifyContent: 'space-between',
                }}
              >
                {/* Top section: Quote icon + snippet */}
                <View>
                  {/* Quote icon */}
                  <View style={{ marginBottom: 32 }}>
                    <Svg width={60} height={60} viewBox="0 0 16 16">
                      <Path
                        fill="#ffffff"
                        fillOpacity={0.4}
                        d="M9 9v-7h7v7.1c0 4.8-4.5 5.4-4.5 5.4l-0.6-1.4c0 0 2-0.3 2.4-1.9 0.4-1.2-0.4-2.2-0.4-2.2h-3.9z"
                      />
                      <Path
                        fill="#ffffff"
                        fillOpacity={0.4}
                        d="M0 9v-7h7v7.1c0 4.8-4.5 5.4-4.5 5.4l-0.6-1.4c0 0 2-0.3 2.4-1.9 0.4-1.2-0.4-2.2-0.4-2.2h-3.9z"
                      />
                    </Svg>
                  </View>

                  <Text
                    style={{
                      color: '#ffffff',
                      fontSize: 48,
                      fontFamily: 'Lora-Italic',
                      lineHeight: 72,
                    }}
                  >
                    {stripHtml(entry.snippet!)}
                  </Text>
                </View>

                {/* Bottom section: Book info */}
                <View style={{ marginTop: 48 }}>
                  <Text
                    style={{
                      color: '#ffffff',
                      fontSize: 32,
                      fontFamily: 'Lora-Regular',
                      marginBottom: 12,
                    }}
                  >
                    {book.title}
                  </Text>
                  {book.author && (
                    <Text
                      style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: 24,
                        fontFamily: 'Lora-Italic',
                      }}
                    >
                      {book.author}
                    </Text>
                  )}
                </View>
              </View>

              {/* Branding at absolute bottom */}
              <Text
                style={{
                  position: 'absolute',
                  bottom: 60,
                  left: 0,
                  right: 0,
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: 20,
                  fontFamily: 'Lora-Italic',
                  textAlign: 'center',
                }}
              >
                Created with Bookfelt
              </Text>
            </>
          )}

          {/* Reflection-only: minimal with subtle background tint */}
          {!hasSnippet && hasReflection && (
            <View
              style={{
                backgroundColor: `${emotionColor}12`,
                borderRadius: 16,
                padding: 24,
              }}
            >
              <Text
                style={{
                  color: theme.foreground || '#000000',
                  fontSize: 18,
                  lineHeight: 30,
                }}
              >
                {stripHtml(entry.reflection!)}
              </Text>
              {entry.setting && (
                <Text
                  style={{
                    color: theme.mutedForeground || '#6b7280',
                    fontSize: 14,
                    fontStyle: 'italic',
                    marginTop: 16,
                    opacity: 0.6,
                  }}
                >
                  {entry.setting}
                </Text>
              )}
            </View>
          )}

          {/* Audio-only entry (no text content) */}
          {!hasSnippet && !hasReflection && hasReflectionAudio && (
            <View
              style={{
                backgroundColor: `${emotionColor}12`,
                borderRadius: 16,
                padding: 24,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: theme.mutedForeground || '#6b7280',
                  fontSize: 18,
                  fontStyle: 'italic',
                }}
              >
                Audio reflection
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }
);

ShareableEntryView.displayName = 'ShareableEntryView';
