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
 * Snap all values of the position info to match the grid snap. This basically normalizes
 * the position information to the current grid.
 */
export function snapLayout(positionInfo: IStoredPositionInfo, gridSnap: number) {
  if (positionInfo.left != null) {
    positionInfo.left = calculateSnapTo(positionInfo.left, gridSnap);
  }

  if (positionInfo.top != null) {
    positionInfo.top = calculateSnapTo(positionInfo.top, gridSnap);
  }

  if (positionInfo.right != null) {
    positionInfo.right = calculateSnapTo(positionInfo.right, gridSnap);
  }

  if (positionInfo.bottom != null) {
    positionInfo.bottom = calculateSnapTo(positionInfo.bottom, gridSnap);
  }

  if (positionInfo.width != null) {
    positionInfo.width = calculateSnapTo(positionInfo.width, gridSnap);
  }

  if (positionInfo.height != null) {
    positionInfo.height = calculateSnapTo(positionInfo.height, gridSnap);
  }
}

export function calculateSnapTo(value: number, snapToDivider: number) {
  // if the snap is 4, then we want to determine if we're closest to the "next"
  // multiple of 4 or the "previous" multiple of 4

  // so get the remainder
  let distanceToNext = snapToDivider - (value % snapToDivider);

  // and compare that to half of the divider (in this case, instead we multiple since
  // multiplication is easier than dividing)
  if (distanceToNext * 2 < snapToDivider) {
    return value + distanceToNext;
  } else {
    return value - (value % snapToDivider);
  }
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


/**
 * Represents the position of an element with Anchor.all
 */
export class AnchoredBoundary {
  constructor(public left: number, public top: number, public right: number, public bottom: number) {}

  /**
   * Makes a copy of this boundary.
   */
  public clone(): AnchoredBoundary {
    return new AnchoredBoundary(this.left, this.top, this.right, this.bottom);
  }

  public equals(other: AnchoredBoundary | null) {
    if (other == null) {
      return false;
    }
    return this.left === other.left && this.right === other.right && this.bottom === other.bottom && this.top === other.top;
  }

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
    currentElementStyle.top = this.top + 'px';
    currentElementStyle.right = this.right + 'px';
    currentElementStyle.bottom = this.bottom + 'px';
  }
}
