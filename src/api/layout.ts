/**
 * Represents how an element is laid out - that is, what sides of the element
 * are attached to the side of the parent container.
 */
export enum Anchor {
  none = 0,
  /* The order here matters because of the assumption that
     functions make in this module */
  left = 1 << 0,
  right = 1 << 1,
  top = 1 << 2,
  bottom = 1 << 3,

  all = left | right | top | bottom,

  topLeft = left | top,
  topRight = right | top,
  bottomLeft = left | bottom,
  bottomRight = right | bottom,
}

/**
 * Represents the position of an element with Anchor.all
 */
export class AnchoredBoundry {
  constructor(
    public left: number,
    public top: number,
    public right: number,
    public bottom: number,
  ) {}

  /**
   * Convert the boundaries to an object that can be assigned to an element.style.
   */
  public toStyle() {
    return {
      left: this.left + 'px',
      right: this.right + 'px',
      top: this.top + 'px',
      bottom: this.bottom + 'px',
    };
  }

  /**
   * Apply the given position information to the element.
   */
  public applyTo(element: HTMLElement) {
    let currentElementStyle = element.style;
    currentElementStyle.left = this.left + 'px';
    currentElementStyle.right = this.right + 'px';
    currentElementStyle.top = this.top + 'px';
    currentElementStyle.bottom = this.bottom + 'px';
  }
}

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
