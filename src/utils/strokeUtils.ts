// Fast ID generation
let counter = 0;
export const generateId = (): string => {
  counter = (counter + 1) % 999999;
  return `${Date.now()}_${counter}`;
};

// Optimized SVG path - no unnecessary calculations
export const pointsToSvgPath = (points: { x: number; y: number }[]): string => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M${points[0].x},${points[0].y}`;
  if (points.length === 2) {
    return `M${points[0].x},${points[0].y} L${points[1].x},${points[1].y}`;
  }

  // Smooth bezier curve
  let path = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;
    path += ` Q${points[i].x},${points[i].y} ${midX},${midY}`;
  }
  const last = points[points.length - 1];
  path += ` L${last.x},${last.y}`;
  return path;
};

export const simplifyPoints = (points: { x: number; y: number }[], tolerance = 1.5) => {
  if (points.length <= 2) return points;
  const result = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = result[result.length - 1];
    const curr = points[i];
    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;
    if (dx * dx + dy * dy >= tolerance * tolerance) {
      result.push(curr);
    }
  }
  result.push(points[points.length - 1]);
  return result;
};
