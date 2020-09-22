/**
 * Represents the stored position information about an element.
 */
export interface IStoredPositionInfo {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;

  width?: number;
  height?: number;
}

/**
 * Represents how an element is laid out - that is, what sides of the element
 * are attached to the side of the parent container.
 */
export enum DragAnchor {
  none = 0,

  /* The values here are important; east & west must be a bitshift away; same for south & north */
  west = 1 << 0,
  east = 1 << 1,
  north = 1 << 2,
  south = 1 << 3,

  all = west | north | east | south,

  ne = north | east,
  se = south | east,
  sw = south | west,
  nw = north | west,
}

/**
 * X,Y coordinates
 */
export interface IPoint {
  x: number;
  y: number;
}

/**
 * X,Y coordinates
 */
export class Point implements IPoint {
  constructor(public x: number, public y: number) {}

  add(point: IPoint) {
    return new Point(this.x + point.x, this.y + point.y);
  }

  subtract(point: IPoint) {
    return new Point(this.x - point.x, this.y - point.y);
  }
}
