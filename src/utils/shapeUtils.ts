import type { Shape, ShapeType } from '../types/shape.types';

export const generateShapePath = (shape: Shape): string => {
  const { type, startX, startY, endX, endY } = shape;

  switch (type) {
    case 'line':
      return `M ${startX} ${startY} L ${endX} ${endY}`;

    case 'arrow': {
      const angle = Math.atan2(endY - startY, endX - startX);
      const arrowLen = 20;
      const arrowAngle = Math.PI / 6;
      const ax1 = endX - arrowLen * Math.cos(angle - arrowAngle);
      const ay1 = endY - arrowLen * Math.sin(angle - arrowAngle);
      const ax2 = endX - arrowLen * Math.cos(angle + arrowAngle);
      const ay2 = endY - arrowLen * Math.sin(angle + arrowAngle);
      return `M ${startX} ${startY} L ${endX} ${endY} M ${endX} ${endY} L ${ax1} ${ay1} M ${endX} ${endY} L ${ax2} ${ay2}`;
    }

    case 'rectangle': {
      const w = endX - startX;
      const h = endY - startY;
      return `M ${startX} ${startY} h ${w} v ${h} h ${-w} Z`;
    }

    case 'circle': {
      const cx = (startX + endX) / 2;
      const cy = (startY + endY) / 2;
      const rx = Math.abs(endX - startX) / 2;
      const ry = Math.abs(endY - startY) / 2;
      return `M ${cx - rx} ${cy} a ${rx} ${ry} 0 1 0 ${rx * 2} 0 a ${rx} ${ry} 0 1 0 ${-rx * 2} 0`;
    }

    case 'triangle': {
      const mx = (startX + endX) / 2;
      return `M ${mx} ${startY} L ${endX} ${endY} L ${startX} ${endY} Z`;
    }

    default:
      return '';
  }
};
