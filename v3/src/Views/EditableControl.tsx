import React, { useEffect, useRef } from 'react';

import { observer } from "mobx-react";

import "./EditableControl.css"
import { Anchor, AnchoredBoundary, IStoredPositionInfo, Point } from "../control-core/layout";
import { ControlInformationViewModel } from "../viewmodels/ControlInformationViewModel";

interface IProps {
  controlVm: ControlInformationViewModel;
}

/** Gets a point that represents the given mouse location. */
function getPosition(event: MouseEvent): Point {
  return new Point(event.clientX, event.clientY);
}

/**
 * An object that handles movement of a single control
 */
class EditControls {
  private readonly mouseUpListener: (MouseEvent: MouseEvent) => void;
  private readonly mouseMoveListener: (MouseEvent: MouseEvent) => void;
  private readonly mouseDownListener: (e: MouseEvent) => void;
  private readonly preventMouseClicksCallback: (e: MouseEvent) => boolean;

  private lastPosition: Point;

  private anchorAndBoundary: { anchor: number; boundaries: AnchoredBoundary } ;
  private sizeChange: Anchor  | null;
  private lastUpdatedBoundary: AnchoredBoundary | null;

  /**
   * The original position of the element that is now being moved
   */
  private originalPosition: AnchoredBoundary | null;

  constructor(private control: ControlInformationViewModel,
              private container: HTMLDivElement) {

    this.mouseUpListener = () => this.onMouseUp();
    this.mouseMoveListener = (mouseEvent) => this.onMouseMove(mouseEvent);
    this.mouseDownListener = (e) => this.doMouseDown(e);

    this.lastPosition = null as any;
    this.anchorAndBoundary = { anchor: 0, boundaries: new AnchoredBoundary(0, 0, 0, 0) };
    this.sizeChange = null;
    this.lastUpdatedBoundary = null;
    this.originalPosition = null;

    /* capture mouse clicks so that buttons don't get triggered */
    this.preventMouseClicksCallback = function(e: MouseEvent) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    this.container.addEventListener("mousedown", this.mouseDownListener);
    this.container.addEventListener("click", this.preventMouseClicksCallback, {capture: true});
  }

  public removeListeners() {
    this.container.removeEventListener("click", this.preventMouseClicksCallback);
    this.removeWindowListeners();
  }

  private doMouseDown(mouseEvent: MouseEvent) {
    this.control.isSelected = true;
    let controlContainer = this.container;

    if (controlContainer == null) {
      throw new Error("null control container - how?");
    }

    // if we selected a drag handle, then use the anchoring given by that element
    let selectedDragHandle = (mouseEvent.target as HTMLElement).closest('.drag-handle') as HTMLElement;
    if (selectedDragHandle != null) {
      this.sizeChange = Number(selectedDragHandle.dataset.drag) as Anchor;
    } else {
      // by default to resizing all of them (e.g. a move operation)
      this.sizeChange = Anchor.all;
    }

    this.lastUpdatedBoundary = null;
    this.anchorAndBoundary = determineEditStyle(this.control.positionInfo, controlContainer.parentElement!);
    this.originalPosition = this.anchorAndBoundary.boundaries.clone();

    window.addEventListener('mousemove', this.mouseMoveListener);
    window.addEventListener('mouseup', this.mouseUpListener);
    this.lastPosition = getPosition(mouseEvent);

    mouseEvent.preventDefault();
    mouseEvent.stopPropagation();
  }

  private onMouseMove(mouseEvent: MouseEvent) {
    const minimumChangeRequired = 1;

    let position = getPosition(mouseEvent);
    let diff = position.subtract(this.lastPosition);
    if (Math.abs(diff.x) < minimumChangeRequired && Math.abs(diff.y) < minimumChangeRequired) {
      return;
    }

    // and now move as we need to
    let boundaryInfo = this.anchorAndBoundary.boundaries.clone();

    // TODO grid snap
    const gridSnap = 8;

    let sizeChange = this.sizeChange!;

    // cache the values
    let isAdjustingWest = sizeChange & Anchor.west;
    let isAdjustingEast = sizeChange & Anchor.east;
    let isAdjustingNorth = sizeChange & Anchor.north;
    let isAdjustingSouth = sizeChange & Anchor.south;

    if (isAdjustingWest && isAdjustingEast) {
      // if we're moving left & right, then we want to snap in whichever direction we're moving
      // e.g. if we're moving right, snap right
      let diffValue;

      if (diff.x > 0) {
        diffValue = boundaryInfo.left - calculateSnapTo(boundaryInfo.left + diff.x, gridSnap);
        diffValue = -diffValue;
      } else {
        diffValue = boundaryInfo.right - calculateSnapTo(boundaryInfo.right - diff.x, gridSnap);
      }

      boundaryInfo.left += diffValue;
      boundaryInfo.right -= diffValue;
    } else if (isAdjustingWest) {
      boundaryInfo.left = calculateSnapTo(boundaryInfo.left + diff.x, gridSnap);
    } else if (isAdjustingEast) {
      boundaryInfo.right = calculateSnapTo(boundaryInfo.right - diff.x, gridSnap);
    }

    // same logic above as for left & right, but this time for up/down
    if (isAdjustingNorth && isAdjustingSouth) {
      let snapToValue;

      if (diff.y > 0) {
        snapToValue = boundaryInfo.top - calculateSnapTo(boundaryInfo.top + diff.y, gridSnap);
        snapToValue = -snapToValue;
      } else {
        snapToValue = boundaryInfo.bottom - calculateSnapTo(boundaryInfo.bottom - diff.y, gridSnap);
      }

      boundaryInfo.top += snapToValue;
      boundaryInfo.bottom -= snapToValue;
    } else if (isAdjustingNorth) {
      boundaryInfo.top = calculateSnapTo(boundaryInfo.top + diff.y, gridSnap);
    } else if (isAdjustingSouth) {
      boundaryInfo.bottom = calculateSnapTo(boundaryInfo.bottom - diff.y, gridSnap);
    }

    if (!boundaryInfo.equals(this.anchorAndBoundary.boundaries)) {
      // and apply it to the element

      boundaryInfo.applyTo(this.container);
      this.lastUpdatedBoundary = boundaryInfo;
    }
  }

  private removeWindowListeners() {
    window.removeEventListener('mousemove', this.mouseMoveListener);
    window.removeEventListener('mouseup', this.mouseUpListener);
  }

  private onMouseUp() {
    this.removeWindowListeners();

    if (this.lastUpdatedBoundary == null) {
      return;
    }

    this.anchorAndBoundary!.boundaries = this.lastUpdatedBoundary;
    let controlContainer = this.container
    this.control.positionInfo = this.lastUpdatedBoundary;

    // TODO undo/redo
    // moveUndoHandler.trigger(this, {
    //   id: controlContainer.control.id,
    //   startingPosition: this.originalPosition.clone(),
    //   endingPosition: this.lastUpdatedBoundary.clone(),
    // });
  }
}

/**
 * React element that wraps an existing control to handle edit controls and resizing
 */
export const EditableControl = observer(function EditableControl(props: IProps) {

  let controlVm = props.controlVm;
  let className = "editable-control " + controlVm.typeId;

  if (controlVm.isSelected) {
    className += " selected";
  }

  const parentContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let div = parentContainer.current!;
    let controlHtmlRoot = controlVm.control.htmlRoot;
    controlHtmlRoot.tabIndex = -1;
    div.appendChild(controlHtmlRoot);

    let editInfo = new EditControls(controlVm, div);

    let stuff = determineEditStyle(controlVm.control.layout, div.parentElement as HTMLElement);
    stuff.boundaries.applyTo(div);

    return function() {
      editInfo.removeListeners();
    }

  }, [parentContainer, controlVm])

  let child: React.ReactNode = null;

  if (controlVm.isSelected) {
    child = <ControlEditor />
  }

  return (
    <div className={className} ref={parentContainer}>
      {child}
    </div>
  );
});

/**
 * The edit controls/drag-handles of a selected control
 */
export function ControlEditor() {
  // noinspection HtmlUnknownAttribute
  return <div className="control-editor">
    <div className="drag-handle drag-handle-west" data-drag={Anchor.west} />
    <div className="drag-handle drag-handle-north" data-drag={Anchor.north}/>
    <div className="drag-handle drag-handle-east" data-drag={Anchor.east}/>
    <div className="drag-handle drag-handle-south" data-drag={Anchor.south}/>
    <div className="drag-handle drag-handle-nw" data-drag={Anchor.nw}/>
    <div className="drag-handle drag-handle-ne" data-drag={Anchor.ne}/>
    <div className="drag-handle drag-handle-se" data-drag={Anchor.se}/>
    <div className="drag-handle drag-handle-sw" data-drag={Anchor.sw}/>
  </div>
}

/**
 * Convert a controls' relative coordinates into absolute coordinates for easy editing
 * @param storedInfo the stored position information for the control
 * @param parent the parent container of the control
 */
export function determineEditStyle(storedInfo: IStoredPositionInfo, parent: HTMLElement)
    : {anchor: Anchor, boundaries: AnchoredBoundary} {
  let leftRightData = getAbsoluteOffsets(
    storedInfo.left!,
    storedInfo.right!,
    storedInfo.width!,
    parent.clientWidth,
    storedInfo,
    'horizontal',
    Anchor.west,
  );

  let topRightData = getAbsoluteOffsets(
    storedInfo.top!,
    storedInfo.bottom!,
    storedInfo.height!,
    parent.clientHeight,
    storedInfo,
    'vertical',
    Anchor.north,
  );

  return {
    anchor: leftRightData.anchor! | topRightData.anchor!,
    boundaries: new AnchoredBoundary(
      leftRightData.offsetA,
      topRightData.offsetA,
      leftRightData.offsetB,
      topRightData.offsetB,
    ),
  };
}

/**
 * Convert relative offset to absolute offsets
 * @param a the left or top relative size of the element
 * @param b the right or bottom relative size of the element
 * @param size the horizontal or vertical size of the element
 * @param parentSize the size of the parent container
 * @param data data structure used for logging when an error occurs
 * @param mode the human-readable mode used for logging when an error occurs
 * @param aFlag the anchor direction
 */
function getAbsoluteOffsets(
  a: number,
  b: number,
  size: number,
  parentSize: number,
  data: any,
  mode: string,
  aFlag: Anchor,
): {offsetA: number, offsetB: number, anchor: Anchor} {
  let offsetA;
  let offsetB;
  let anchor = Anchor.none;

  if (a == null && b == null) {
    console.error(`No ${mode} offsets stored`, data);
    offsetA = 0;
    offsetB = parentSize - 100;
    return { offsetA, offsetB, anchor };
  }

  if (a != null && b != null) {
    offsetA = a;
    offsetB = b;
    anchor = aFlag | (anchor << 1);
    return { offsetA, offsetB, anchor };
  }

  if (size == null) {
    console.error(`No ${mode} size stored`, data);
    size = 100;
  }

  if (a != null /* && b == null*/) {
    offsetA = a;
    offsetB = parentSize - (a + size);
    anchor = aFlag;
    return { offsetA, offsetB, anchor };
  } /* if (b != null && a == null) */ else {
    offsetB = b;
    offsetA = parentSize - b - size;
    anchor = aFlag << 1;
    return { offsetA, offsetB, anchor };
  }
}

/**
 * Snaps a grid value to the given divider
 */
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
