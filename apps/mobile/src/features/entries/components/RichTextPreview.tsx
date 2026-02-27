import type { ReactNode } from "react";
import { Text, View } from "react-native";

type Segment = { text: string; bold?: boolean; italic?: boolean };

const parseInline = (html: string): Segment[] => {
  const segments: Segment[] = [];
  const regex = /<(strong|em)>(.*?)<\/\1>/g;
  let lastIndex = 0;
  let match;

  // Handle nested: <strong><em>text</em></strong> and <em><strong>text</strong></em>
  const fullRegex =
    /<strong><em>(.*?)<\/em><\/strong>|<em><strong>(.*?)<\/strong><\/em>|<strong>(.*?)<\/strong>|<em>(.*?)<\/em>/g;

  while ((match = fullRegex.exec(html)) !== null) {
    if (match.index > lastIndex) {
      const plain = html.slice(lastIndex, match.index).replace(/<[^>]*>/g, "");
      if (plain) segments.push({ text: plain });
    }
    if (match[1] != null) {
      segments.push({ text: match[1], bold: true, italic: true });
    } else if (match[2] != null) {
      segments.push({ text: match[2], bold: true, italic: true });
    } else if (match[3] != null) {
      segments.push({ text: match[3], bold: true });
    } else if (match[4] != null) {
      segments.push({ text: match[4], italic: true });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < html.length) {
    const plain = html.slice(lastIndex).replace(/<[^>]*>/g, "");
    if (plain) segments.push({ text: plain });
  }

  return segments;
};

const InlineText = ({ segments }: { segments: Segment[] }) => (
  <>
    {segments.map((seg, i) => (
      <Text
        key={i}
        className={`${seg.bold ? "font-bold" : ""} ${seg.italic ? "italic" : ""}`}
      >
        {seg.text}
      </Text>
    ))}
  </>
);

const RichTextPreview = ({ html }: { html: string }) => {
  // Split into block-level elements
  const blocks: ReactNode[] = [];
  const blockRegex = /<(p|blockquote)>(.*?)<\/\1>/gs;
  let match;
  let i = 0;

  while ((match = blockRegex.exec(html)) !== null) {
    const tag = match[1];
    const content = match[2];
    const segments = parseInline(content);

    if (tag === "blockquote") {
      // Blockquote may contain <p> tags inside
      const inner = content.replace(/<\/?p>/g, "");
      const innerSegments = parseInline(inner);
      blocks.push(
        <View key={i++} className="border-l-[3px] border-foreground pl-3 my-0.5">
          <Text className="text-sm text-foreground leading-relaxed">
            <InlineText segments={innerSegments} />
          </Text>
        </View>
      );
    } else {
      blocks.push(
        <Text key={i++} className="text-sm text-foreground leading-relaxed">
          <InlineText segments={segments} />
        </Text>
      );
    }
  }

  if (blocks.length === 0) {
    // Fallback: strip all tags
    const plain = html.replace(/<[^>]*>/g, "").trim();
    return (
      <Text className="text-sm text-foreground leading-relaxed">{plain}</Text>
    );
  }

  return <View>{blocks}</View>;
};

export default RichTextPreview;
