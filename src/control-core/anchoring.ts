/** How a control can be anchored horizontally. */
import { calculateSnapTo } from "../views/DesignCanvasMovementManager";

export enum AnchorModeHorizontal {
  /** None, the center of the control is anchored to the middle of the canvas */
  none = 0,
  /** The control maintains a fixed distance from the left of the canvas */
  left = 1,
  /** The control maintains a fixed distance from the right of the canvas */
  right = 2,
  /** The control maintains a fixed distance from the left & right of the canvas, changing the width as needed. */
  stretch = 3,
}

interface HorizontalAnchorStretch {
  mode: AnchorModeHorizontal.stretch;
  left: number;
  right: number;
}

interface HorizontalAnchorLeft {
  mode: AnchorModeHorizontal.left;
  left: number;
  width: number;
}

interface HorizontalAnchorRight {
  mode: AnchorModeHorizontal.right;
  right: number;
  width: number;
}

interface HorizontalAnchorNone {
  mode: AnchorModeHorizontal.none;
  center: number;
  width: number;
}

/** The horizontal anchoring to use on a control */
export type AnchorHorizontal =
  | HorizontalAnchorNone
  | HorizontalAnchorLeft
  | HorizontalAnchorRight
  | HorizontalAnchorStretch;

export enum AnchorModeVertical {
  /** None, the center of the control is anchored to the middle of the canvas */
  none = 0,
  /** The control maintains a fixed distance from the top of the canvas */
  top = 1,
  /** The control maintains a fixed distance from the bottom of the canvas */
  bottom = 2,
  /** The control maintains a fixed distance from the top & bottom of the canvas, changing the height as needed. */
  stretch = 3,
}

interface VerticalAnchorStretch {
  mode: AnchorModeVertical.stretch;
  top: number;
  bottom: number;
}

interface VerticalAnchorTop {
  mode: AnchorModeVertical.top;
  top: number;
  height: number;
}

interface VerticalAnchorBottom {
  mode: AnchorModeVertical.bottom;
  bottom: number;
  height: number;
}

interface VerticalAnchorNone {
  mode: AnchorModeVertical.none;
  center: number;
  height: number;
}

/** The vertical anchoring to use on a control */
export type AnchorVertical = VerticalAnchorNone | VerticalAnchorTop | VerticalAnchorBottom | VerticalAnchorStretch;

export function applyAnchorV(element: HTMLElement, anchor: AnchorVertical) {
  switch (anchor.mode) {
    case AnchorModeVertical.none:
      // TODO
      break;
    case AnchorModeVertical.top:
      element.style.top = anchor.top + 'px';
      element.style.height = anchor.height + 'px';
      break;
    case AnchorModeVertical.bottom:
      element.style.bottom = anchor.bottom + 'px';
      element.style.height = anchor.height + 'px';
      break;
    case AnchorModeVertical.stretch:
      element.style.bottom = anchor.bottom + 'px';
      element.style.top = anchor.top + 'px';
      break;
  }
}

export function applyAnchorH(element: HTMLElement, anchor: AnchorHorizontal) {
  switch (anchor.mode) {
    case AnchorModeHorizontal.none:
      // TODO
      break;
    case AnchorModeHorizontal.left:
      element.style.left = anchor.left + 'px';
      element.style.width = anchor.width + 'px';
      break;
    case AnchorModeHorizontal.right:
      element.style.right = anchor.right + 'px';
      element.style.width = anchor.width + 'px';
      break;
    case AnchorModeHorizontal.stretch:
      element.style.left = anchor.left + 'px';
      element.style.right = anchor.right + 'px';
      break;
  }
}


export enum AnchorModeBoth {
  /** None, the center of the control is anchored to the middle of the canvas */
  none = 0,
  /** The control maintains a fixed distance from the start of the container */
  start = 1,
  /** The control maintains a fixed distance from the end of the container */
  end = 2,
  /** The control maintains a fixed distance from the start & end of the canvas, changing the size as needed. */
  stretch = 3,
}

export interface AnchorData {
  start: number;
  end: number;
  size: number;
  parentSize: number;
}

interface AnchorStretch {
  mode: AnchorModeBoth.stretch;
  start: number;
  end: number;
}

interface AnchorStart {
  mode: AnchorModeBoth.start;
  start: number;
  size: number;
}

interface AnchorEnd {
  mode: AnchorModeBoth.end;
  end: number;
  size: number;
}

interface AnchorNone {
  mode: AnchorModeBoth.none;
  center: number;
  size: number;
}

export interface AnchorHV {
  horizontal: AnchorBoth;
  vertical: AnchorBoth;
}

export type AnchorBoth = AnchorStretch | AnchorStart | AnchorEnd | AnchorNone;

/**
 * Calculates what anchoring would be used if the given mode was set on the control.
 */
export function transformAnchor(info: AnchorData, mode: AnchorModeBoth): AnchorBoth {
  switch (mode) {
    case AnchorModeBoth.none:
      let mid = (info.start + info.end) / 2 / info.parentSize;
      return {
        mode: AnchorModeBoth.none,
        center: mid,
        size: info.size,
      };
    case AnchorModeBoth.start:
      return {
        mode: AnchorModeBoth.start,
        start: info.start,
        size: info.size,
      };
    case AnchorModeBoth.end:
      return {
        mode: AnchorModeBoth.end,
        end: info.end,
        size: info.size,
      };
    case AnchorModeBoth.stretch:
      return {
        mode: AnchorModeBoth.stretch,
        start: info.start,
        end: info.end,
      };
  }
}

export enum AdjustmentMode {
  none = 0 << 0,
  start = 1 << 0,
  end = 1 << 1,
  both = start | end,
}

/**
 * Transforms the given anchor to adjust for the given change given by `diff`.
 * @param data the existing anchor data
 * @param adjustmentMode what adjustment to the anchor is being made
 * @param diff the value of the difference to the anchor being made
 * @param gridSnap any grid snap that should be applied
 */
export function adjustAnchoredLayout(data: AnchorData, adjustmentMode: AdjustmentMode, diff: number, gridSnap: number): AnchorData {

  switch (adjustmentMode) {
    case AdjustmentMode.none: {
      return { ...data };
    }
    case AdjustmentMode.start: {
      let newStart = calculateSnapTo(data.start + diff, gridSnap);
      let startDiff = data.start - newStart;

      return {
        start: newStart,
        end: data.end,
        size: data.size + startDiff,
        parentSize: data.parentSize
      };
    }
    case AdjustmentMode.end: {
      let newEnd = calculateSnapTo(data.end - diff, gridSnap)
      let endDiff = data.end - newEnd;

      return {
        start: data.start,
        end: newEnd,
        size: data.size + endDiff,
        parentSize: data.parentSize,
      };
    }
    case AdjustmentMode.both: {
      // if we're moving start & end, then we want to snap in whichever direction we're moving
      // e.g. if we're moving end, snap end
      let diffValue;

      if (diff > 0) {
        diffValue = data.start - calculateSnapTo(data.start + diff, gridSnap);
        diffValue = -diffValue;
      } else {
        diffValue = data.end - calculateSnapTo(data.end - diff, gridSnap);
      }

      return {
        start: data.start + diffValue,
        end: data.end - diffValue,
        size: data.size,
        parentSize: data.parentSize,
      };
    }
  }

  throw new Error(`Unknown mode: ${adjustmentMode}`);
}

/**
 * Checks if two instances of `AnchorData` are equal
 */
export function areEqual(left: AnchorData, right: AnchorData): boolean {
  return (left === right
    || (left.end === right.end
      && left.start === right.end
      && left.size === right.size
      && left.parentSize === right.parentSize)
  )
}
