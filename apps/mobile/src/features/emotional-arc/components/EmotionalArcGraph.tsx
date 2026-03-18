import { useState } from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Line, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { useGraphDimensions, dataYToSvgY, dataXToSvgX } from '../hooks/use-graph-dimensions';
import { getCubicBezierPath } from '../utils/curve-interpolation';
import { EmotionalArcPoint } from './EmotionalArcPoint';
import type { ArcDataPoint } from '../utils/group-by-week';

interface EmotionalArcGraphProps {
  data: ArcDataPoint[];
}

export function EmotionalArcGraph({ data }: EmotionalArcGraphProps) {
  const dimensions = useGraphDimensions();
  const [selectedPoint, setSelectedPoint] = useState<ArcDataPoint | null>(null);

  if (data.length === 0) {
    return null;
  }

  // Transform data points to SVG coordinates
  const svgPoints = data.map((point) => ({
    ...point,
    svgX: dataXToSvgX(point.x, data.length, dimensions.graphWidth, dimensions.paddingX),
    svgY: dataYToSvgY(point.y, dimensions.graphHeight, dimensions.paddingY),
  }));

  // Generate smooth curve path
  const pathData = getCubicBezierPath(
    svgPoints.map((p) => ({ x: p.svgX, y: p.svgY }))
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDateRange = (startTimestamp: number, endTimestamp: number) => {
    const startDate = new Date(startTimestamp);
    const endDate = new Date(endTimestamp);
    const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();

    // If same month, show "Jul 1 - 7"
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}`;
    }
    // If different months, show "Jul 29 - Aug 4"
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
  };

  const dateLabels = svgPoints.map((point, index) => {
    // For grouped points (with startDate/endDate), show date range
    const dateLabel = point.startDate && point.endDate
      ? formatDateRange(point.startDate, point.endDate)
      : formatDate(point.date);

    const prevDateLabel = index > 0
      ? (svgPoints[index - 1].startDate && svgPoints[index - 1].endDate
          ? formatDateRange(svgPoints[index - 1].startDate, svgPoints[index - 1].endDate)
          : formatDate(svgPoints[index - 1].date))
      : null;

    return {
      ...point,
      dateLabel,
      shouldShow: dateLabel !== prevDateLabel,
    };
  });

  return (
    <View className="items-center">
      <Svg
        width={dimensions.width}
        height={dimensions.height}
      >
        <Defs>
          {/* Gradient from positive (top/gold) to negative (bottom/red) */}
          <LinearGradient id="emotionalGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#D4A843" stopOpacity="0.25" />
            <Stop offset="0.5" stopColor="#8B5CF6" stopOpacity="0.1" />
            <Stop offset="1" stopColor="#8B2D3A" stopOpacity="0.25" />
          </LinearGradient>
        </Defs>

        {/* Filled area under/over curve */}
        <Path
          d={areaPath}
          fill="url(#emotionalGradient)"
        />

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
            onPress={() => setSelectedPoint(point)}
          />
        ))}

        {/* Date labels */}
        {dateLabels.map((point, index) =>
          point.shouldShow ? (
            <SvgText
              key={`date-${index}`}
              x={point.svgX}
              y={dimensions.height - dimensions.paddingY + 20}
              fontSize="11"
              fill="#666"
              opacity={0.6}
              textAnchor="middle"
            >
              {point.dateLabel}
            </SvgText>
          ) : null
        )}
      </Svg>

      {/* Selected point info */}
      {selectedPoint && (
        <View className="mt-4 p-4 bg-card rounded-2xl border border-border">
          <View className="flex-row items-center gap-2">
            <Text className="text-3xl">{selectedPoint.emoji}</Text>
            <View>
              <Text className="text-base font-semibold text-foreground">
                {selectedPoint.label}
              </Text>
              <Text className="text-sm text-muted-foreground">
                {new Date(selectedPoint.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
                {selectedPoint.entryCount && selectedPoint.entryCount > 1
                  ? ` • ${selectedPoint.entryCount} entries`
                  : ''}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
