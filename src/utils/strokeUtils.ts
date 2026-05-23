import type { Point } from '../types/canvas.types';

export const generateId = (): string =>
  `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const pointsToSvgPath = (points: Point[]): string => {
  if (points.length === 0) return '';
  if (points.length === 1) {
    const { x, y } = points[0];
    return `M ${x} ${y} L ${x + 0.1} ${y + 0.1}`;
  }
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const cpX = points[i].x;
    const cpY = points[i].y;
    const endX = (points[i].x + points[i + 1].x) / 2;
    const endY = (points[i].y + points[i + 1].y) / 2;
    path += ` Q ${cpX} ${cpY} ${endX} ${endY}`;
  }
  const last = points[points.length - 1];
  path += ` L ${last.x} ${last.y}`;
  return path;
};

export const simplifyPoints = (points: Point[], minDist = 2): Point[] => {
  if (points.length <= 2) return points;
  const result: Point[] = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = result[result.length - 1];
    const dx = points[i].x - prev.x;
    const dy = points[i].y - prev.y;
    if (Math.sqrt(dx * dx + dy * dy) >= minDist) {
      result.push(points[i]);
    }
  }
  result.push(points[points.length - 1]);
  return result;
};
