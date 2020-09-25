/** How a control can be anchored horizontally. */
import { calculateSnapTo } from "../views/DesignCanvasMovementManager";
import { assume } from "../util/util";
import { IStoredPositionInfo } from "./layout";

export enum AnchorAxisLayoutMode {
  /** None, the center of the control is anchored to the middle of the canvas */
  none = 0,
  /** The control maintains a fixed distance from the start of the container */
  start = 1,
  /** The control maintains a fixed distance from the end of the container */
  end = 2,
  /** The control maintains a fixed distance from the start & end of the canvas, changing the size as needed. */
  stretch = 3,
}

/**
 * Represents a snapshot of the state of something that owns a AnchorLayout.  Not directly updated, but can be transformed
 * back into an AnchorBoth by `convertToAnchorLayout`.
 */
export interface AnchorLayoutSnapshot {
  start: number;
  end: number;
  size: number;
  parentSize: number;
}

interface AnchorAxisLayoutStretch {
  mode: AnchorAxisLayoutMode.stretch;
  start: number;
  end: number;
}

interface AnchorAxisLayoutStart {
  mode: AnchorAxisLayoutMode.start;
  start: number;
  size: number;
}

interface AnchorAxisLayoutEnd {
  mode: AnchorAxisLayoutMode.end;
  end: number;
  size: number;
}

interface AnchorAxisLayoutNone {
  mode: AnchorAxisLayoutMode.none;
  center: number;
  size: number;
}

export type AnchorAxisLayout =
  AnchorAxisLayoutStretch
  | AnchorAxisLayoutStart
  | AnchorAxisLayoutEnd
  | AnchorAxisLayoutNone;

/**
 * Calculates what anchoring would be used if the given mode was set on the control.
 */
export function convertToAnchorLayout(data: AnchorLayoutSnapshot, mode: AnchorAxisLayoutMode): AnchorAxisLayout {
  switch (mode) {
    case AnchorAxisLayoutMode.none:
      let mid = (data.start + data.end) / 2 / data.parentSize;
      return {
        mode: AnchorAxisLayoutMode.none,
        center: mid,
        size: data.size,
      };
    case AnchorAxisLayoutMode.start:
      return {
        mode: AnchorAxisLayoutMode.start,
        start: data.start,
        size: data.size,
      };
    case AnchorAxisLayoutMode.end:
      return {
        mode: AnchorAxisLayoutMode.end,
        end: data.end,
        size: data.size,
      };
    case AnchorAxisLayoutMode.stretch:
      return {
        mode: AnchorAxisLayoutMode.stretch,
        start: data.start,
        end: data.end,
      };
  }
}

export enum AnchorAxisLayoutAdjustmentMode {
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
export function adjustAnchoredLayout(data: AnchorLayoutSnapshot, adjustmentMode: AnchorAxisLayoutAdjustmentMode, diff: number, gridSnap: number): AnchorLayoutSnapshot {

  switch (adjustmentMode) {
    case AnchorAxisLayoutAdjustmentMode.none: {
      return { ...data };
    }
    case AnchorAxisLayoutAdjustmentMode.start: {
      let newStart = calculateSnapTo(data.start + diff, gridSnap);
      let startDiff = data.start - newStart;

      return {
        start: newStart,
        end: data.end,
        size: data.size + startDiff,
        parentSize: data.parentSize
      };
    }
    case AnchorAxisLayoutAdjustmentMode.end: {
      let newEnd = calculateSnapTo(data.end - diff, gridSnap)
      let endDiff = data.end - newEnd;

      return {
        start: data.start,
        end: newEnd,
        size: data.size + endDiff,
        parentSize: data.parentSize,
      };
    }
    case AnchorAxisLayoutAdjustmentMode.both: {
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
export function areAnchorSnapshotsEqual(left: AnchorLayoutSnapshot, right: AnchorLayoutSnapshot): boolean {
  return (left === right
    || (left.end === right.end
      && left.start === right.start
      && left.size === right.size
      && left.parentSize === right.parentSize)
  )
}

export function areAnchorEqual(left: AnchorAxisLayout, right: AnchorAxisLayout): boolean {

  if (left === right) {
    return true;
  }

  if (left.mode !== right.mode) {
    return false;
  }

  switch (left.mode) {
    case AnchorAxisLayoutMode.stretch:
      assume<AnchorAxisLayoutStretch>(right);
      return left.start === right.start && left.end === right.end;
    case AnchorAxisLayoutMode.start:
      assume<AnchorAxisLayoutStart>(right);
      return left.start === right.start && left.size === right.size;
    case AnchorAxisLayoutMode.end:
      assume<AnchorAxisLayoutEnd>(right);
      return left.end === right.end && left.size === right.size;
    case AnchorAxisLayoutMode.none:
      assume<AnchorAxisLayoutNone>(right);
      return left.size === right.size && left.center === right.center;
  }
}

interface IAnchorOwner {
  onAnchorChanged(): void;
}

interface IAnchorOwner {
  readonly horizontal: AnchorLayoutSnapshot;
  readonly vertical: AnchorLayoutSnapshot;

  set(h: AnchorLayoutSnapshot, v: AnchorLayoutSnapshot): void;
}

export class AnchoredPosition {
  private _horizontal: AnchorAxisLayout;
  private _vertical: AnchorAxisLayout;
  private _owner: IAnchorOwner | null;

  constructor(h: AnchorAxisLayout, v: AnchorAxisLayout, owner?: IAnchorOwner) {
    this._horizontal = { ...h };
    this._vertical = { ...v };
    this._owner = owner ?? null;
  }

  public get horizontal(): AnchorAxisLayout {
    return this._horizontal;
  }

  public get vertical(): AnchorAxisLayout {
    return this._vertical;
  }

  public set(h: AnchorAxisLayout, v: AnchorAxisLayout): boolean {
    let didChange = false;

    if (!areAnchorEqual(this.horizontal, h)) {
      this._horizontal = h;
      didChange = true;
    }

    if (!areAnchorEqual(this.vertical, v)) {
      this._vertical = v;
      didChange = true;
    }

    if (didChange) {
      this._owner?.onAnchorChanged();
    }

    return didChange;
  }
}

export type BiAxis<T> = {
  horizontal: T;
  vertical: T;
}

export function fromStoredPositionInfo(position: IStoredPositionInfo): BiAxis<AnchorAxisLayout> {

  let horizontal: AnchorAxisLayout;
  let vertical: AnchorAxisLayout;

  if (position.width != null) {
    horizontal = {
      mode: AnchorAxisLayoutMode.start,
      start: position.left!,
      size: position.width
    };
  } else {
    horizontal = {
      mode: AnchorAxisLayoutMode.stretch,
      start: position.left!,
      end: position.right!
    }
  }

  if (position.height != null) {
    vertical = {
      mode: AnchorAxisLayoutMode.start,
      start: position.top!,
      size: position.height
    };
  } else {
    vertical = {
      mode: AnchorAxisLayoutMode.stretch,
      start: position.top!,
      end: position.bottom!
    }
  }

  return {
    horizontal,
    vertical
  };
}


export function serializeAxisLayout(layout: AnchorAxisLayout): SerializedAxisData {
  switch (layout.mode) {
    case AnchorAxisLayoutMode.stretch:
      return [AnchorAxisLayoutMode.stretch, layout.start, layout.end];
    case AnchorAxisLayoutMode.start:
      return [AnchorAxisLayoutMode.start, layout.start, layout.size];
    case AnchorAxisLayoutMode.end:
      return [AnchorAxisLayoutMode.end, layout.end, layout.size];
    case AnchorAxisLayoutMode.none:
      return [AnchorAxisLayoutMode.none, layout.center, layout.size];
  }
}

export function deserializeAxisLayout(data: SerializedAxisData): AnchorAxisLayout {
  switch (data[0]) {
    case AnchorAxisLayoutMode.none:
      return {
        mode: AnchorAxisLayoutMode.none,
        center: data[1],
        size: data[2],
      };
    case AnchorAxisLayoutMode.start:
      return {
        mode: AnchorAxisLayoutMode.start,
        start: data[1],
        size: data[2],
      };
    case AnchorAxisLayoutMode.end:
      return {
        mode: AnchorAxisLayoutMode.end,
        end: data[1],
        size: data[2],
      };
    case AnchorAxisLayoutMode.stretch:
      return {
        mode: AnchorAxisLayoutMode.stretch,
        start: data[1],
        end: data[2],
      };
  }
}

export type SerializedAxisData = [AnchorAxisLayoutMode, number, number];
export type SerializedBiAxisData = [AnchorAxisLayoutMode, number, number, AnchorAxisLayoutMode, number, number];

export function serializeBiAxisLayout(layout: BiAxis<AnchorAxisLayout>): SerializedBiAxisData {
  return [serializeAxisLayout(layout.horizontal), serializeAxisLayout(layout.vertical)].flat() as SerializedBiAxisData;
}

export function deserializeBiAxisLayout(serialized: SerializedBiAxisData): BiAxis<AnchorAxisLayout> {
  return {
    horizontal: deserializeAxisLayout([serialized[0], serialized[1], serialized[2]]),
    vertical: deserializeAxisLayout([serialized[3], serialized[4], serialized[5]]),
  }
}
