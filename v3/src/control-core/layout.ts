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
