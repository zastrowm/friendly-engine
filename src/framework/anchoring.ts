/** How a control can be anchored horizontally. */
export const enum AnchorModeHorizontal {
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
}

/** The horizontal anchoring to use on a control */
export type AnchorHorizontal =
  | HorizontalAnchorNone
  | HorizontalAnchorLeft
  | HorizontalAnchorRight
  | HorizontalAnchorStretch;

export const enum AnchorModeVertical {
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
