import {
  dataXToSvgX,
  dataYToSvgY,
  useGraphDimensions,
  type GraphDimensions,
} from "@/features/emotional-arc/hooks/use-graph-dimensions";
import { getCubicBezierPath } from "@/features/emotional-arc/utils/curve-interpolation";
import type { ArcDataPoint } from "@/features/emotional-arc/utils/group-by-week";
import { SHEET_IDS } from "@/shared/constants/sheet-ids";
import { Pressable, Text, View } from "react-native";
import { SheetManager } from "react-native-actions-sheet";
import Svg, {
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { EmotionalArcPoint } from "./EmotionalArcPoint";

interface EmotionalArcGraphProps {
  data: ArcDataPoint[];
  customDimensions?: GraphDimensions;
  isShareable?: boolean;
}

export function EmotionalArcGraph({ data, customDimensions, isShareable = false }: EmotionalArcGraphProps) {
  const responsiveDimensions = useGraphDimensions();
  const dimensions = customDimensions || responsiveDimensions;

  if (data.length === 0) {
    return null;
  }

  const handlePointPress = (point: ArcDataPoint) => {
    // Open bottom sheet with entry details
    if (point.entryId) {
      // Single entry
      SheetManager.show(SHEET_IDS.ENTRY_DETAIL, {
        payload: { entryId: point.entryId },
      });
    } else if (point.entryIds && point.entryIds.length > 0) {
      // Multiple entries (grouped week)
      SheetManager.show(SHEET_IDS.ENTRY_DETAIL, {
        payload: { entryIds: point.entryIds },
      });
    }
  };

  // Transform data points to SVG coordinates
  const svgPoints = data.map((point) => ({
    ...point,
    svgX: dataXToSvgX(
      point.x,
      data.length,
      dimensions.graphWidth,
      dimensions.paddingX,
    ),
    svgY: dataYToSvgY(point.y, dimensions.graphHeight, dimensions.paddingY),
  }));

  // Generate smooth curve path
  const pathData = getCubicBezierPath(
    svgPoints.map((p) => ({ x: p.svgX, y: p.svgY })),
  );

  // Y-axis neutral line (y = 0)
  const neutralY = dataYToSvgY(0, dimensions.graphHeight, dimensions.paddingY);

  // Create filled area path (curve to neutral line)
  const firstPoint = svgPoints[0];
  const lastPoint = svgPoints[svgPoints.length - 1];
  const areaPath = `${pathData} L ${lastPoint.svgX} ${neutralY} L ${firstPoint.svgX} ${neutralY} Z`;

  // Format dates and determine which ones to show (skip duplicates)
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatDateRange = (startTimestamp: number, endTimestamp: number) => {
    const startDate = new Date(startTimestamp);
    const endDate = new Date(endTimestamp);
    const startMonth = startDate.toLocaleDateString("en-US", {
      month: "short",
    });
    const endMonth = endDate.toLocaleDateString("en-US", { month: "short" });
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();

    // If same month, show "Jul 1 - 7"
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}`;
    }
    // If different months, show "Jul 29 - Aug 4"
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
  };

  // Show all date labels with alternating top/bottom positioning
  const dateLabels = svgPoints.map((point, index) => {
    // For grouped points (with startDate/endDate), show date range
    const dateLabel =
      point.startDate && point.endDate
        ? formatDateRange(point.startDate, point.endDate)
        : formatDate(point.date);

    return {
      ...point,
      dateLabel,
      shouldShow: true, // Show all labels
      isAlternate: index % 2 === 1, // Alternate positioning
    };
  });

  return (
    <View className="items-center py-4 bg-card/30 rounded-2xl mx-2 mb-3">
      <Text className="text-xs font-medium uppercase tracking-widest text-muted/70 mb-2">
        Emotional Journey
      </Text>

      <View style={{ position: "relative" }}>
        <Svg width={dimensions.width} height={dimensions.height}>
          <Defs>
            {/* Gradient from positive (top/gold) to negative (bottom/red) */}
            <LinearGradient id="emotionalGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#D4A843" stopOpacity="0.25" />
              <Stop offset="0.5" stopColor="#8B5CF6" stopOpacity="0.1" />
              <Stop offset="1" stopColor="#8B2D3A" stopOpacity="0.25" />
            </LinearGradient>
          </Defs>

          {/* Filled area under/over curve */}
          <Path d={areaPath} fill="url(#emotionalGradient)" />

          {/* Background grid - neutral line */}
          <Line
            x1={dimensions.paddingX}
            y1={neutralY}
            x2={dimensions.width - dimensions.paddingX}
            y2={neutralY}
            stroke="#666"
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={0.3}
          />

          {/* Smooth curve */}
          <Path
            d={pathData}
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.6}
          />

          {/* Data points */}
          {svgPoints.map((point, index) => (
            <EmotionalArcPoint
              key={index}
              x={point.svgX}
              y={point.svgY}
              color={point.color}
              emoji={point.emoji}
              label={point.label}
              onPress={() => handlePointPress(data[index])}
            />
          ))}

          {/* Date label connector lines */}
          {dateLabels.map((point, index) =>
            point.shouldShow ? (
              <Line
                key={`line-${index}`}
                x1={point.svgX}
                y1={
                  point.isAlternate
                    ? dimensions.paddingY - 5
                    : dimensions.height - dimensions.paddingY + 5
                }
                x2={point.svgX}
                y2={point.isAlternate ? point.svgY - 15 : point.svgY + 15}
                stroke="#666"
                strokeWidth={1}
                strokeDasharray="2 2"
                opacity={0.25}
              />
            ) : null,
          )}

          {/* Date labels - alternating top/bottom */}
          {dateLabels.map((point, index) =>
            point.shouldShow ? (
              <SvgText
                key={`date-${index}`}
                x={point.svgX}
                y={
                  point.isAlternate
                    ? dimensions.paddingY - 10
                    : dimensions.height - dimensions.paddingY + 20
                }
                fontSize="11"
                fill="#666"
                opacity={0.6}
                textAnchor="middle"
              >
                {point.dateLabel}
              </SvgText>
            ) : null,
          )}
        </Svg>

        {/* Invisible clickable overlays for each point (only for interactive view) */}
        {!isShareable && svgPoints.map((point, index) => (
          <Pressable
            key={`press-${index}`}
            onPress={() => handlePointPress(data[index])}
            style={{
              position: "absolute",
              left: point.svgX - 15,
              top: point.svgY - 15,
              width: 30,
              height: 30,
            }}
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          />
        ))}
      </View>
    </View>
  );
}
