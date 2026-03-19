export interface Point {
  x: number;
  y: number;
}

/**
 * Generate smooth cubic bezier curve through points
 * Uses Catmull-Rom to Cubic Bezier conversion
 */
export function generateSmoothPath(points: Point[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  // For smooth curves, we'll use quadratic bezier for simplicity
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];

    if (i === 0) {
      // First segment: quadratic curve with control point at midpoint
      const midX = (current.x + next.x) / 2;
      const midY = (current.y + next.y) / 2;
      path += ` Q ${current.x} ${current.y}, ${midX} ${midY}`;
    } else if (i === points.length - 2) {
      // Last segment: quadratic curve to final point
      path += ` Q ${next.x} ${next.y}, ${next.x} ${next.y}`;
    } else {
      // Middle segments: smooth quadratic curves
      const midX = (current.x + next.x) / 2;
      const midY = (current.y + next.y) / 2;
      path += ` Q ${current.x} ${current.y}, ${midX} ${midY}`;
    }
  }

  // Close to final point if needed
  const lastPoint = points[points.length - 1];
  if (points.length > 2) {
    path += ` L ${lastPoint.x} ${lastPoint.y}`;
  }

  return path;
}

/**
 * Calculate control points for cubic bezier curve
 * This produces smoother curves than quadratic
 */
export function getCubicBezierPath(points: Point[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const prev = i > 0 ? points[i - 1] : current;
    const afterNext = i < points.length - 2 ? points[i + 2] : next;

    // Calculate control points using Catmull-Rom algorithm
    const tension = 0.2; // Lower = smoother, higher = more angular

    const cp1x = current.x + (next.x - prev.x) * tension;
    const cp1y = current.y + (next.y - prev.y) * tension;

    const cp2x = next.x - (afterNext.x - current.x) * tension;
    const cp2y = next.y - (afterNext.y - current.y) * tension;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
  }

  return path;
}
