import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

export interface GraphDimensions {
  width: number;
  height: number;
  paddingX: number;
  paddingY: number;
  graphWidth: number;
  graphHeight: number;
}

/**
 * Calculate responsive graph dimensions
 */
export function useGraphDimensions(): GraphDimensions {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  return useMemo(() => {
    const paddingX = 20;
    const paddingY = 60;
    const width = screenWidth - 32; // Account for screen padding
    const height = Math.min(screenHeight * 0.5, 400);

    return {
      width,
      height,
      paddingX,
      paddingY,
      graphWidth: width - paddingX * 2,
      graphHeight: height - paddingY * 2,
    };
  }, [screenWidth, screenHeight]);
}

/**
 * Convert data Y-value (-1 to 1) to SVG Y-coordinate
 */
export function dataYToSvgY(
  dataY: number,
  graphHeight: number,
  paddingY: number
): number {
  // dataY ranges from -1 (bottom) to +1 (top)
  // Normalize to 0-1 range
  const normalized = (dataY + 1) / 2;
  // Invert Y (SVG Y increases downward)
  return paddingY + graphHeight * (1 - normalized);
}

/**
 * Convert data X-index to SVG X-coordinate
 */
export function dataXToSvgX(
  dataX: number,
  totalPoints: number,
  graphWidth: number,
  paddingX: number
): number {
  if (totalPoints === 1) {
    return paddingX + graphWidth / 2;
  }
  return paddingX + (dataX / (totalPoints - 1)) * graphWidth;
}
